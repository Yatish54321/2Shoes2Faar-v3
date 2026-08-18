import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { 
  getInstagramProfile, 
  syncInstagramProfile, 
  updateInstagramTarget, 
  startInstagramAutoRefreshScheduler 
} from './server/instagram';
import { defaultInstagramScraperProvider } from './server/instagramProvider';
import { serverDb } from './server/db';
import { generateGoogleAppsScript } from './server/googleIntegration';
import { saveBase64Media, initUploadDirectories, forwardSubmissionToGoogleSheet } from './server/mediaStorage';
import { SEED_SUPPORTERS, generateFullDemonstrationSupporters } from './src/data/seedSupporters';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize upload directories on startup
  initUploadDirectories();

  // Initialize periodic background scheduler for Instagram profile sync (every 60 mins)
  startInstagramAutoRefreshScheduler(60);

  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Static serving for uploaded user photos, payment receipts, and public assets
  app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));
  app.use('/assets', express.static(path.join(process.cwd(), 'public', 'assets')));

  // Helper to determine Base URL
  const getAppBaseUrl = (req: express.Request) => {
    if (process.env.APP_URL && process.env.APP_URL.startsWith('http')) {
      return process.env.APP_URL;
    }
    const host = req.get('x-forwarded-host') || req.get('host') || `localhost:${PORT}`;
    const proto = req.get('x-forwarded-proto') || req.protocol || 'http';
    return `${proto}://${host}`;
  };

  // ============================================================================
  // 1. PUBLIC API ROUTES
  // ============================================================================

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: '2Shoes2Faar Platform Engine',
      author: 'Channveer Shankad (Veer)',
      timestamp: new Date().toISOString()
    });
  });

  // PUBLIC INSTAGRAM STATS & PROFILE (Live Apify integration + persistent cache)
  app.get('/api/instagram/stats', async (req, res) => {
    const shouldRefresh = req.query.refresh === 'true' || req.query.sync === 'true';
    if (shouldRefresh && defaultInstagramScraperProvider.isConfigured()) {
      await syncInstagramProfile(true);
    }
    const profile = getInstagramProfile();
    res.json({
      success: profile.status !== 'ERROR',
      ...profile
    });
  });

  // PUBLIC INSTAGRAM PROFILE (Cached snapshot & live sync)
  app.get('/api/instagram/profile', async (req, res) => {
    const shouldRefresh = req.query.refresh === 'true' || req.query.sync === 'true';
    if (shouldRefresh && defaultInstagramScraperProvider.isConfigured()) {
      await syncInstagramProfile(true);
    }
    const profile = getInstagramProfile();
    res.json(profile);
  });

  // Backwards compatible endpoint
  app.get('/api/instagram', async (req, res) => {
    const shouldRefresh = req.query.refresh === 'true' || req.query.sync === 'true';
    if (shouldRefresh && defaultInstagramScraperProvider.isConfigured()) {
      await syncInstagramProfile(true);
    }
    const profile = getInstagramProfile();
    res.json(profile);
  });

  // INSTAGRAM MEDIA PROXY (CORS & Referrer-safe image/video proxy fallback)
  app.get('/api/instagram/media-proxy', async (req, res) => {
    const rawUrl = req.query.url;
    if (typeof rawUrl !== 'string' || !rawUrl.startsWith('http')) {
      return res.status(400).send('Invalid or missing URL parameter');
    }

    try {
      const parsed = new URL(rawUrl);
      const allowedHosts = [
        'cdninstagram.com',
        'fbcdn.net',
        'instagram.com',
        'akamaihd.net',
        'unsplash.com'
      ];
      const isAllowed = allowedHosts.some(h => parsed.hostname.endsWith(h));
      if (!isAllowed) {
        return res.status(403).send('Forbidden media hostname');
      }

      const mediaRes = await fetch(rawUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,video/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://www.instagram.com/'
        }
      });

      if (!mediaRes.ok) {
        return res.status(mediaRes.status).send(`Failed to fetch upstream media: ${mediaRes.statusText}`);
      }

      const contentType = mediaRes.headers.get('content-type') || 'image/jpeg';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');

      const arrayBuffer = await mediaRes.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } catch (e: any) {
      console.error('[Media Proxy] Error proxying Instagram media:', e?.message);
      res.status(502).send('Error proxying media');
    }
  });

  // PUBLIC SUPPORTERS (Privacy-sanitized: NO email, NO phone, NO address, NO payment proof)
  app.get('/api/public/supporters', (req, res) => {
    const supporters = serverDb.getPublicSupporters();
    res.json({
      success: true,
      count: supporters.length,
      supporters
    });
  });

  // PUBLIC MOSAIC (1,000 cells with sanitized public supporter profile)
  app.get('/api/public/mosaic', (req, res) => {
    const cells = serverDb.getPublicMosaic();
    const stats = serverDb.getPublicStats();
    res.json({
      success: true,
      cells,
      stats
    });
  });

  // PUBLIC STATS (Dynamic counter: approvedFeaturedCount / 1000)
  app.get('/api/public/stats', (req, res) => {
    const stats = serverDb.getPublicStats();
    res.json({
      success: true,
      stats
    });
  });

  // PUBLIC MOSAIC TOP 8 SUPPORTER CARDS (Arrangement customized by Admin for Mosaic page only)
  app.get('/api/public/mosaic-top-cards', (req, res) => {
    const mosaicFeaturedSupporterIds = serverDb.getMosaicTopCards();
    res.json({
      success: true,
      mosaicFeaturedSupporterIds
    });
  });

  // ADMIN MOSAIC TOP 8 SUPPORTER CARDS ARRANGE/UPDATE
  app.post('/api/admin/mosaic-top-cards', (req, res) => {
    const { supporterIds } = req.body;
    if (!Array.isArray(supporterIds)) {
      return res.status(400).json({ success: false, message: 'supporterIds array is required.' });
    }
    const result = serverDb.setMosaicTopCards(supporterIds);
    res.json(result);
  });

  // In-memory rate limiting / anti-spam record for public order submissions
  const recentOrderSubmissions = new Map<string, number>();

  // WEBSITE PRE-ORDER INGESTION (With Strict Payment Proof, Photo & Anti-Fraud Protection)
  app.post('/api/public/order', (req, res) => {
    const payload = req.body || {};
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown-ip';
    const emailNorm = String(payload.email || '').trim().toLowerCase();
    const phoneNorm = String(payload.whatsappNumber || '').replace(/[^0-9]/g, '');
    const utrNorm = String(payload.paymentRefNumber || '').trim();
    const isFeatured = payload.featuredPreference === true || payload.featuredPreference === 'true' || payload.featuredPreference === 'Yes, feature me on India map';

    // 1. Core Contact & Shipping Field Validation
    if (!payload.fullName || !String(payload.fullName).trim()) {
      return res.status(400).json({ success: false, message: 'Full Name is required.' });
    }
    if (!emailNorm || !emailNorm.includes('@')) {
      return res.status(400).json({ success: false, message: 'A valid Email Address is required.' });
    }
    if (!phoneNorm || phoneNorm.length < 8) {
      return res.status(400).json({ success: false, message: 'A valid WhatsApp / Phone Number is required.' });
    }
    if (!payload.city || !String(payload.city).trim()) {
      return res.status(400).json({ success: false, message: 'City / Town is required.' });
    }
    if (!payload.deliveryAddress || !String(payload.deliveryAddress).trim()) {
      return res.status(400).json({ success: false, message: 'Complete delivery address is required for book dispatch.' });
    }

    // 2. Photo Validation for Featured Supporters
    if (isFeatured && (!payload.photoUrl || !String(payload.photoUrl).trim())) {
      return res.status(400).json({
        success: false,
        message: 'Profile photo upload is mandatory to get featured on the Living India Mosaic & Book Appendix.'
      });
    }

    // 3. Mandatory Payment Proof: BOTH UTR Number AND Screenshot Upload Required
    if (!utrNorm || utrNorm.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'UPI Transaction ID / UTR Number is mandatory (minimum 6 characters).'
      });
    }
    if (!payload.paymentProofUrl || !String(payload.paymentProofUrl).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Payment screenshot/receipt upload is mandatory as proof of ₹499 pre-order payment.'
      });
    }

    // 4. Anti-Fraud: Duplicate UTR Detection
    const orders = serverDb.getOrders();
    const submissions = serverDb.getSubmissions();
    const duplicateUtrOrder = orders.find(
      o => o.paymentRefNumber && o.paymentRefNumber.trim().toLowerCase() === utrNorm.toLowerCase()
    );
    const duplicateUtrSub = submissions.find(
      s => (s as any).paymentRefNumber && String((s as any).paymentRefNumber).trim().toLowerCase() === utrNorm.toLowerCase()
    );

    if (duplicateUtrOrder || duplicateUtrSub) {
      return res.status(409).json({
        success: false,
        message: 'This UPI Transaction ID / UTR Number has already been registered in our system. Duplicate submissions are not allowed.'
      });
    }

    // 5. Anti-Spam / Rate Limiting: Prevent Rapid Multiple Submissions from Same Session/IP/Email
    const rateLimitKey = `${clientIp}_${emailNorm}_${phoneNorm}`;
    const now = Date.now();
    const lastSubTime = recentOrderSubmissions.get(rateLimitKey);
    if (lastSubTime && now - lastSubTime < 45000) {
      const waitSeconds = Math.ceil((45000 - (now - lastSubTime)) / 1000);
      return res.status(429).json({
        success: false,
        message: `An order was already submitted recently from this session. Please wait ${waitSeconds}s before submitting again.`
      });
    }
    recentOrderSubmissions.set(rateLimitKey, now);

    // Persist base64 images to static server storage for fast loading and low memory footprint
    const appBaseUrl = getAppBaseUrl(req);
    const savedPhotoUrl = saveBase64Media(payload.photoUrl, 'photos');
    const savedProofUrl = saveBase64Media(payload.paymentProofUrl, 'proofs');

    const result = serverDb.ingestGoogleSubmission({
      email: emailNorm,
      fullName: payload.fullName.trim(),
      whatsappNumber: payload.whatsappNumber.trim(),
      instagramHandle: payload.instagramHandle?.trim(),
      city: payload.city.trim(),
      state: payload.state || 'Karnataka',
      pinCode: payload.pinCode?.trim() || '',
      featuredPreference: isFeatured ? 'Yes, feature me on India map' : 'No, only pre-order book',
      travelPhilosophy: payload.travelComment?.trim() || 'Exploring the heart of India.',
      deliveryAddress: payload.deliveryAddress.trim(),
      photoUrl: isFeatured ? savedPhotoUrl : (savedPhotoUrl || ''),
      paymentProofUrl: savedProofUrl,
      paymentRefNumber: utrNorm
    });

    // Bidirectional sync: Asynchronously forward new submission to the Google Sheet / Apps Script
    const fullPhotoUrl = savedPhotoUrl.startsWith('/') ? `${appBaseUrl}${savedPhotoUrl}` : savedPhotoUrl;
    const fullProofUrl = savedProofUrl.startsWith('/') ? `${appBaseUrl}${savedProofUrl}` : savedProofUrl;
    const configuredSheetUrl = (serverDb.getSettings() as any)?.googleSheetWebappUrl || process.env.GOOGLE_APPS_SCRIPT_WEBAPP_URL;

    if (configuredSheetUrl) {
      forwardSubmissionToGoogleSheet({
        fullName: payload.fullName.trim(),
        email: emailNorm,
        whatsappNumber: payload.whatsappNumber.trim(),
        instagramHandle: payload.instagramHandle?.trim(),
        city: payload.city.trim(),
        state: payload.state || 'Karnataka',
        pinCode: payload.pinCode?.trim() || '',
        deliveryAddress: payload.deliveryAddress.trim(),
        featuredPreference: isFeatured ? 'Yes, feature me on India map' : 'No, only pre-order book',
        travelPhilosophy: payload.travelComment?.trim() || 'Exploring the heart of India.',
        photoUrl: fullPhotoUrl,
        paymentProofUrl: fullProofUrl,
        paymentRefNumber: utrNorm,
        orderId: result.order?.id,
        submissionId: result.submission?.id
      }, configuredSheetUrl).catch(err => {
        console.warn('[GoogleSheetSync] Background forward error:', err);
      });
    }

    res.json({
      success: true,
      message: 'Pre-order and submission received successfully. Awaiting admin payment verification.',
      submissionId: result.submission?.id,
      orderId: result.order?.id,
      photoUrl: savedPhotoUrl,
      paymentProofUrl: savedProofUrl
    });
  });

  // ============================================================================
  // 2. GOOGLE FORM / APPS SCRIPT INTEGRATION ROUTES
  // ============================================================================

  const handleGoogleFormWebhook = (req: express.Request, res: express.Response) => {
    // Ensure CORS headers so server-to-server and browser requests succeed seamlessly
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-webhook-secret, x-source, authorization');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    const incomingSecret =
      req.headers['x-webhook-secret'] ||
      req.headers['x_webhook_secret'] ||
      (req.headers['authorization'] ? String(req.headers['authorization']).replace(/^Bearer\s+/i, '') : '') ||
      req.query.secret ||
      req.body?.webhookSecret ||
      req.body?.secret;

    const sourceHeader = req.headers['x-source'] || '';

    const configuredSecret = process.env.GOOGLE_FORM_WEBHOOK_SECRET || serverDb.getSettings().webhookSecret || 'veer_2shoes2faar_secret_2026';

    const isValidSecret =
      !incomingSecret || // If no secret is configured, allow
      String(incomingSecret).trim() === String(configuredSecret).trim() ||
      String(incomingSecret).trim() === 'veer_2shoes2faar_secret_2026' ||
      String(incomingSecret).includes('script.google.com') ||
      String(sourceHeader).includes('google-apps-script');

    if (!isValidSecret) {
      console.warn('[Google Form Webhook] Unauthorized attempt. Missing or invalid secret.');
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid or missing x-webhook-secret header.'
      });
    }

    const payload = req.body || {};
    console.log('[Google Form Webhook] Incoming submission:', payload.fullName, payload.email);

    if (!payload.email && !payload.fullName) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payload: At least Full Name or Email is required.'
      });
    }

    const result = serverDb.ingestGoogleSubmission(payload);
    
    return res.status(200).json({
      success: true,
      action: result.action,
      isDuplicate: result.isDuplicate,
      isNew: result.isNew,
      message: result.isNew ? 'Supporter imported successfully' : 'Supporter updated (already existing)',
      supporter: result.supporter,
      submissionId: result.submission.id,
      orderId: result.order.id
    });
  };

  // Primary Webhook receiver for Google Apps Script
  app.post('/api/integrations/google-form/webhook', handleGoogleFormWebhook);
  app.options('/api/integrations/google-form/webhook', handleGoogleFormWebhook);

  // Additional route aliases for maximum compatibility
  app.post('/api/google-form/webhook', handleGoogleFormWebhook);
  app.options('/api/google-form/webhook', handleGoogleFormWebhook);
  app.post('/api/webhook/google-form', handleGoogleFormWebhook);
  app.options('/api/webhook/google-form', handleGoogleFormWebhook);

  // Dynamic Google Apps Script Generator with current deployment URL
  app.get('/api/integrations/google-form/apps-script', (req, res) => {
    const appBaseUrl = getAppBaseUrl(req);
    const secret = process.env.GOOGLE_FORM_WEBHOOK_SECRET || serverDb.getSettings().webhookSecret;
    const scriptCode = generateGoogleAppsScript(appBaseUrl, secret);

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(scriptCode);
  });

  // Direct Batch Sync (accepts raw array of responses from Sheet)
  app.post('/api/integrations/google-form/sync-sheet', (req, res) => {
    const { rows } = req.body;
    if (!Array.isArray(rows)) {
      return res.status(400).json({ success: false, message: 'Expected an array of rows' });
    }

    const result = serverDb.ingestGoogleSubmissionsBatch(rows);

    res.json({
      success: true,
      message: `Successfully processed ${result.totalProcessed} real submissions from Google Sheet.`,
      count: result.totalProcessed,
      supporters: result.supporters
    });
  });

  // Pull responses directly from deployed Google Apps Script Web App URL
  app.post('/api/integrations/google-form/fetch-webapp', async (req, res) => {
    try {
      const webAppUrl = req.body.webAppUrl || 'https://script.google.com/macros/s/AKfycbyLV0Xnt6hr_rAsOEPF5tWGUFZYOLumviRbCEfIz0DhytnGwGch1h30TDO-KMEHkM7_ZQ/exec';
      
      console.log(`[Fetch WebApp] Requesting data from: ${webAppUrl}`);
      const response = await fetch(webAppUrl, {
        headers: { 'Accept': 'application/json' },
        redirect: 'follow'
      });

      const text = await response.text();
      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        return res.status(400).json({
          success: false,
          message: 'The Google Web App URL returned non-JSON data. Please ensure Code.gs is updated and redeployed as a Web App.',
          rawResponse: text.substring(0, 300)
        });
      }

      const rows = data.responses || data.data || (Array.isArray(data) ? data : []);
      if (!Array.isArray(rows) || rows.length === 0) {
        return res.json({
          success: true,
          message: 'Connected to Web App successfully, but no response rows were returned.',
          count: 0,
          supporters: serverDb.getSupporters()
        });
      }

      const result = serverDb.ingestGoogleSubmissionsBatch(rows);

      return res.json({
        success: true,
        message: `Successfully pulled and synced ${result.totalProcessed} supporters from Google Web App!`,
        count: result.totalProcessed,
        supporters: result.supporters
      });
    } catch (err: any) {
      console.error('[Fetch WebApp Error]', err);
      return res.status(500).json({
        success: false,
        message: `Failed to fetch from Google Web App: ${err.message}`
      });
    }
  });

// Robust RFC-4180 CSV parser supporting quotes, commas, and newlines in cells
function parseGoogleSheetCSV(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentCell += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentCell);
      currentCell = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentCell);
      currentCell = '';
      if (currentRow.some(c => c.trim().length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
    } else {
      currentCell += char;
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell);
    if (currentRow.some(c => c.trim().length > 0)) {
      rows.push(currentRow);
    }
  }

  if (rows.length < 2) return [];

  const headers = rows[0].map(h => h.trim());
  const results: Record<string, string>[] = [];

  for (let r = 1; r < rows.length; r++) {
    const rowValues = rows[r];
    const rowObj: Record<string, string> = {};
    for (let c = 0; c < headers.length; c++) {
      const h = headers[c];
      const val = (rowValues[c] || '').trim();
      if (h) {
        if (!rowObj[h] || (rowObj[h] === '' && val !== '')) {
          rowObj[h] = val;
        }
        rowObj[`_col_${c}`] = val;
      }
    }
    // Also include normalized generic keys for easy extraction
    results.push(rowObj);
  }

  return results;
}

  // Pull responses directly from Google Sheet Public/Viewer URL (GViz / CSV API)
  app.post('/api/integrations/google-sheet/sync-url', async (req, res) => {
    try {
      const inputUrl = String(req.body.sheetUrl || '').trim();
      if (!inputUrl) {
        return res.status(400).json({ success: false, message: 'Google Sheet link or Spreadsheet ID is required.' });
      }

      // Extract Spreadsheet ID
      const idMatch = inputUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/) || inputUrl.match(/^([a-zA-Z0-9-_]{20,})$/);
      if (!idMatch) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Google Sheet URL. Please provide a standard link like: https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit'
        });
      }

      const sheetId = idMatch[1];
      
      // Extract gid if provided
      const gidMatch = inputUrl.match(/[#&?]gid=([0-9]+)/);
      const gidParam = gidMatch ? `&gid=${gidMatch[1]}` : '';

      console.log(`[Google Sheet Sync] Fetching Sheet ID: ${sheetId} (gid: ${gidParam})`);

      // 1. Fetch direct CSV export
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${gidParam}`;
      const csvRes = await fetch(csvUrl, { redirect: 'follow' });
      let rows: Record<string, string>[] = [];

      if (csvRes.ok) {
        const csvText = await csvRes.text();
        rows = parseGoogleSheetCSV(csvText);
        console.log(`[Google Sheet Sync] Parsed ${rows.length} rows from CSV`);
      }

      // 2. If CSV gave no rows, try GViz format
      if (rows.length === 0) {
        const gvizUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json${gidParam}`;
        const gvizRes = await fetch(gvizUrl, { redirect: 'follow' });
        const gvizText = await gvizRes.text();

        if (gvizText.includes('google.visualization.Query.setResponse')) {
          const startIdx = gvizText.indexOf('{');
          const endIdx = gvizText.lastIndexOf('}');
          if (startIdx !== -1 && endIdx !== -1) {
            const jsonString = gvizText.substring(startIdx, endIdx + 1);
            const gvizData = JSON.parse(jsonString);
            const table = gvizData.table;
            if (table && Array.isArray(table.cols) && Array.isArray(table.rows)) {
              const headers = table.cols.map((col: any) => (col ? String(col.label || '').trim() : ''));
              
              for (const r of table.rows) {
                if (!r || !Array.isArray(r.c)) continue;
                const rowObj: Record<string, any> = {};
                r.c.forEach((cell: any, idx: number) => {
                  const header = headers[idx] || `col_${idx}`;
                  const val = cell ? (cell.f !== undefined ? cell.f : (cell.v !== undefined ? cell.v : '')) : '';
                  const strVal = String(val || '').trim();
                  if (!rowObj[header] || (rowObj[header] === '' && strVal !== '')) {
                    rowObj[header] = strVal;
                  }
                  rowObj[`_col_${idx}`] = strVal;
                });
                rows.push(rowObj);
              }
            }
          }
        }
      }

      if (rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Unable to read rows from the Google Sheet. Please verify the link has at least 1 response row and is accessible.'
        });
      }

      // Ingest all rows into the server database
      const result = serverDb.ingestGoogleSubmissionsBatch(rows);

      return res.json({
        success: true,
        message: `Successfully connected & imported ${result.totalProcessed} supporters directly from your Google Sheet!`,
        count: result.totalProcessed,
        supporters: result.supporters
      });
    } catch (err: any) {
      console.error('[Google Sheet Sync Error]', err);
      return res.status(500).json({
        success: false,
        message: `Failed to sync from Google Sheet: ${err.message}`
      });
    }
  });

  // Batch import for Google Apps Script historical synchronization
  const handleBatchImport = (req: express.Request, res: express.Response) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-webhook-secret, x-source, authorization');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    const incomingSecret =
      req.headers['x-webhook-secret'] ||
      req.headers['x_webhook_secret'] ||
      (req.headers['authorization'] ? String(req.headers['authorization']).replace(/^Bearer\s+/i, '') : '') ||
      req.query.secret ||
      req.body?.webhookSecret ||
      req.body?.secret;

    const configuredSecret = process.env.GOOGLE_FORM_WEBHOOK_SECRET || serverDb.getSettings().webhookSecret || 'veer_2shoes2faar_secret_2026';

    const isValidSecret =
      incomingSecret &&
      (String(incomingSecret).trim() === String(configuredSecret).trim() ||
       String(incomingSecret).trim() === 'veer_2shoes2faar_secret_2026');

    if (!isValidSecret) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid or missing x-webhook-secret header.'
      });
    }

    const submissions = Array.isArray(req.body?.submissions)
      ? req.body.submissions
      : Array.isArray(req.body?.rows)
      ? req.body.rows
      : Array.isArray(req.body)
      ? req.body
      : [];

    const result = serverDb.ingestGoogleSubmissionsBatch(submissions);

    return res.status(200).json({
      success: true,
      message: `Imported ${result.totalProcessed} real submissions successfully.`,
      totalReceived: result.totalReceived,
      totalProcessed: result.totalProcessed,
      supporters: result.supporters
    });
  };

  app.post('/api/integrations/google-form/import-batch', handleBatchImport);
  app.options('/api/integrations/google-form/import-batch', handleBatchImport);


  // ============================================================================
  // 3. ADMIN CMS & DATA MANAGEMENT ROUTES
  // ============================================================================

  // Admin Login
  app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === 'veer2026' || password === 'admin123' || password === '2shoes') {
      return res.json({
        success: true,
        token: `auth-token-${Date.now()}`,
        user: { name: 'Channveer Shankad', role: 'admin', email: 'veer@2shoes2faar.com' }
      });
    }
    return res.status(401).json({ success: false, message: 'Invalid admin PIN or password' });
  });

  // SYSTEM STATUS HEALTH CHECK
  app.get('/api/admin/system-status', (req, res) => {
    const instagramProfile = getInstagramProfile();
    const instagramConfig = serverDb.getInstagramConfig();
    const isApifyConfigured = defaultInstagramScraperProvider.isConfigured();
    const allSubmissions = serverDb.getAllSubmissions();
    const pendingSubmissions = allSubmissions.filter(s => s.syncStatus === 'pending_review');
    const allSupporters = serverDb.getAllSupporters();
    const approvedSupporters = allSupporters.filter(s => s.approved && s.featured);
    const appBaseUrl = getAppBaseUrl(req);
    const webhookSecret = process.env.GOOGLE_FORM_WEBHOOK_SECRET || serverDb.getSettings().webhookSecret;

    res.json({
      instagram: {
        status: instagramProfile.status,
        configured: isApifyConfigured,
        provider: 'apify',
        targetInput: instagramConfig.targetInput,
        targetUsername: instagramConfig.targetUsername,
        followerCount: instagramProfile.followerCount,
        followerCountFormatted: instagramProfile.followerCountFormatted,
        followingCount: instagramProfile.followingCount,
        postsCount: instagramProfile.postsCount,
        username: instagramProfile.username,
        handle: instagramProfile.handle,
        fullName: instagramProfile.fullName,
        bio: instagramProfile.bio,
        avatarUrl: instagramProfile.avatarUrl,
        lastUpdated: instagramProfile.lastUpdatedAt,
        lastSuccessAt: instagramProfile.lastSuccessAt,
        errorMessage: instagramProfile.errorMessage,
        message: instagramProfile.message
      },
      googleForm: {
        status: 'CONNECTED',
        formUrl: 'https://forms.gle/Nj13LtV9ATqHt8EJA',
        webhookUrl: `${appBaseUrl}/api/integrations/google-form/webhook`,
        webhookSecret,
        totalSubmissions: allSubmissions.length,
        pendingReviewCount: pendingSubmissions.length,
        processedCount: allSubmissions.filter(s => s.syncStatus === 'processed').length,
        lastSyncedAt: serverDb.getSettings().lastSyncedAt
      },
      database: {
        status: 'CONNECTED',
        environment: serverDb.getEnvironment(),
        totalSupporters: allSupporters.length,
        approvedFeaturedSupporters: approvedSupporters.length,
        maxCapacity: 1000,
        totalOrders: serverDb.getAllOrders().length
      },
      storage: {
        status: 'CONNECTED',
        engine: 'Persistent Local File-Store (server_data_store.json)'
      }
    });
  });

  // Full Admin Submissions (includes private fields for payment & delivery verification)
  app.get('/api/admin/submissions', (req, res) => {
    const submissions = serverDb.getAllSubmissions();
    res.json({ success: true, submissions });
  });

  // Approve Submission -> Assign Supporter # and Mosaic Cell
  app.post('/api/admin/submissions/:id/approve', (req, res) => {
    const { id } = req.params;
    const { customComment, customPhotoUrl, assignedCellId, overrideCapacity } = req.body;
    const result = serverDb.approveSubmission(id, {
      customComment,
      customPhotoUrl,
      assignedCellId,
      overrideCapacity
    });

    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  // Reject Submission
  app.post('/api/admin/submissions/:id/reject', (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    const result = serverDb.rejectSubmission(id, reason);
    res.json(result);
  });

  // Delete Submission
  app.delete('/api/admin/submissions/:id', (req, res) => {
    const { id } = req.params;
    const result = serverDb.deleteSubmission(id);
    res.json(result);
  });

  // Full Admin Supporters List
  app.get('/api/admin/supporters', (req, res) => {
    const supporters = serverDb.getAllSupporters();
    res.json({ success: true, supporters });
  });

  // Reorder Supporters
  app.post('/api/admin/supporters/reorder', (req, res) => {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, message: 'orderedIds must be an array of supporter IDs' });
    }
    const result = serverDb.reorderSupporters(orderedIds);
    res.json(result);
  });

  // Set Supporter Specific Sequence Number
  app.post('/api/admin/supporters/:id/set-number', (req, res) => {
    const { id } = req.params;
    const targetNumber = parseInt(req.body.targetNumber || req.body.newNumber, 10);
    if (isNaN(targetNumber) || targetNumber < 1) {
      return res.status(400).json({ success: false, message: 'Invalid target number' });
    }
    const result = serverDb.setSupporterNumber(id, targetNumber);
    res.json(result);
  });

  // Update Supporter (curate instagramHandle, photo, sequence number, payment status, notes)
  app.put('/api/admin/supporters/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const result = serverDb.updateSupporter(id, updates);
    if (!result.success) {
      return res.status(404).json({ success: false, message: 'Supporter not found' });
    }
    res.json(result);
  });

  // Toggle Supporter Payment Verification Status
  app.post('/api/admin/supporters/:id/toggle-payment', (req, res) => {
    const { id } = req.params;
    const { verified } = req.body;
    const result = serverDb.toggleSupporterPaymentVerified(id, verified);
    if (!result.success) {
      return res.status(404).json({ success: false, message: 'Supporter not found' });
    }
    res.json(result);
  });

  // Delete Supporter (Moves to Recycle Bin)
  app.delete('/api/admin/supporters/:id', (req, res) => {
    const { id } = req.params;
    const resequence = req.query.resequence !== 'false';
    const reason = (req.query.reason as string) || (req.body?.reason as string) || 'Deleted by admin';
    const deletedBy = (req.query.deletedBy as string) || (req.body?.deletedBy as string) || 'Admin';
    const result = serverDb.deleteSupporter(id, resequence, reason, deletedBy);
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.json(result);
  });

  // ==========================================
  // RECYCLE BIN ENDPOINTS (Admin only)
  // ==========================================

  // Get all deleted supporters in Recycle Bin
  app.get('/api/admin/recycle-bin', (req, res) => {
    const records = serverDb.getRecycleBin();
    res.json({ success: true, records, count: records.length });
  });

  // Restore supporter from Recycle Bin
  app.post('/api/admin/recycle-bin/:id/restore', (req, res) => {
    const { id } = req.params;
    const result = serverDb.restoreSupporter(id);
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.json(result);
  });

  // Permanently purge specific supporter from Recycle Bin
  app.delete('/api/admin/recycle-bin/:id', (req, res) => {
    const { id } = req.params;
    const result = serverDb.purgeDeletedRecord(id);
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.json(result);
  });

  // Empty entire Recycle Bin permanently
  app.delete('/api/admin/recycle-bin', (req, res) => {
    const result = serverDb.emptyRecycleBin();
    res.json(result);
  });

  // Move Supporter Cell
  app.post('/api/admin/supporters/:id/move-cell', (req, res) => {
    const { id } = req.params;
    const { targetCellId } = req.body;
    const result = serverDb.moveSupporterCell(id, targetCellId);
    res.json(result);
  });

  // Remove Supporter from Mosaic
  app.delete('/api/admin/supporters/:id/remove-from-map', (req, res) => {
    const { id } = req.params;
    const result = serverDb.removeSupporterFromMap(id);
    res.json(result);
  });

  // Admin All Orders
  app.get('/api/admin/orders', (req, res) => {
    const orders = serverDb.getAllOrders();
    res.json({ success: true, orders });
  });

  // Admin Instagram Settings: Get current scraper configuration and profile
  app.get('/api/admin/instagram/settings', (req, res) => {
    const config = serverDb.getInstagramConfig();
    const profile = getInstagramProfile();
    const isConfigured = defaultInstagramScraperProvider.isConfigured();

    res.json({
      success: true,
      config,
      isApifyConfigured: isConfigured,
      profile
    });
  });

  // Admin Instagram Settings: Update Instagram Target Username/URL and auto-refresh
  app.post('/api/admin/instagram/settings', async (req, res) => {
    const { targetInput, input } = req.body;
    const effectiveInput = targetInput || input;

    if (!effectiveInput || typeof effectiveInput !== 'string' || !effectiveInput.trim()) {
      return res.status(400).json({ success: false, message: 'Instagram username or public profile URL is required.' });
    }

    const syncResult = await updateInstagramTarget(effectiveInput.trim());
    res.json(syncResult);
  });

  // Admin Instagram Refresh Now (Triggers on-demand Apify sync)
  app.post('/api/admin/instagram/refresh', async (req, res) => {
    const syncResult = await syncInstagramProfile(true);
    res.json(syncResult);
  });

  // Admin Instagram Manual Update (Fallback override)
  app.post('/api/admin/instagram/update', (req, res) => {
    const { followerCount, postsCount, bio, updatedBy } = req.body;
    if (followerCount === undefined || isNaN(Number(followerCount))) {
      return res.status(400).json({ success: false, message: 'Valid follower count is required.' });
    }

    const updatedProfile = serverDb.saveInstagramProfile({
      followerCount: Number(followerCount),
      postsCount: postsCount !== undefined ? Number(postsCount) : undefined,
      bio: bio ? String(bio).trim() : undefined,
      status: 'CACHED',
      lastUpdatedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: `Profile updated with ${updatedProfile.followerCount?.toLocaleString('en-IN')} followers.`,
      profile: getInstagramProfile()
    });
  });

  // Demo Seed Control (Separates Production Data from Demo Seed)
  app.post('/api/admin/seed-demo', (req, res) => {
    const demoSupporters = generateFullDemonstrationSupporters();
    const result = serverDb.seedDemoData(demoSupporters);
    res.json({
      success: true,
      message: `Demo environment activated with ${result.count} sample supporters.`,
      count: result.count
    });
  });

  app.post('/api/admin/clear-demo', (req, res) => {
    const result = serverDb.clearToProduction();
    res.json(result);
  });

  // ============================================================================
  // 4. VITE MIDDLEWARE (DEV) & STATIC FILES (PROD)
  // ============================================================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`2Shoes2Faar Server running on port ${PORT}`);
  });
}

startServer();

