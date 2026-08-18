import fs from 'fs';
import path from 'path';

const UPLOADS_ROOT = path.join(process.cwd(), 'public', 'uploads');
const PHOTOS_DIR = path.join(UPLOADS_ROOT, 'photos');
const PROOFS_DIR = path.join(UPLOADS_ROOT, 'proofs');

// Ensure upload directories exist
export function initUploadDirectories() {
  try {
    if (!fs.existsSync(UPLOADS_ROOT)) {
      fs.mkdirSync(UPLOADS_ROOT, { recursive: true });
    }
    if (!fs.existsSync(PHOTOS_DIR)) {
      fs.mkdirSync(PHOTOS_DIR, { recursive: true });
    }
    if (!fs.existsSync(PROOFS_DIR)) {
      fs.mkdirSync(PROOFS_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('[MediaStorage] Failed to initialize upload directories:', err);
  }
}

/**
 * Saves a base64 Data URL or buffer to disk in public/uploads/{folder}/
 * and returns the static relative URL e.g. /uploads/photos/photo_1710000000_abc123.jpg
 */
export function saveBase64Media(
  rawInput?: string,
  folder: 'photos' | 'proofs' = 'photos'
): string {
  if (!rawInput || typeof rawInput !== 'string') return '';
  const trimmed = rawInput.trim();
  if (!trimmed) return '';

  // If it is already a regular HTTP(S) URL or local static path, preserve as is
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/uploads/') ||
    trimmed.startsWith('/assets/')
  ) {
    return trimmed;
  }

  // Check if it is a base64 Data URL
  const match = trimmed.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
  if (!match) {
    // If not a data URL and not http, return trimmed
    return trimmed;
  }

  try {
    initUploadDirectories();
    let ext = match[1].toLowerCase();
    if (ext === 'jpeg') ext = 'jpg';
    if (ext === 'svg+xml') ext = 'svg';

    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, 'base64');
    
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const filename = `${folder === 'photos' ? 'photo' : 'proof'}_${Date.now()}_${randomSuffix}.${ext}`;
    const targetDir = folder === 'photos' ? PHOTOS_DIR : PROOFS_DIR;
    const targetPath = path.join(targetDir, filename);

    fs.writeFileSync(targetPath, buffer);
    console.log(`[MediaStorage] Successfully saved ${folder} file to ${targetPath}`);

    return `/uploads/${folder}/${filename}`;
  } catch (err) {
    console.error('[MediaStorage] Error saving base64 media:', err);
    return trimmed; // Fallback to raw if saving fails
  }
}

/**
 * Forwards a new pre-order / supporter submission to the configured Google Sheet / Apps Script Web App
 */
export async function forwardSubmissionToGoogleSheet(
  payload: {
    fullName: string;
    email: string;
    whatsappNumber: string;
    instagramHandle?: string;
    city: string;
    state: string;
    pinCode: string;
    deliveryAddress: string;
    featuredPreference: string | boolean;
    travelPhilosophy?: string;
    photoUrl?: string;
    paymentProofUrl?: string;
    paymentRefNumber?: string;
    orderId?: string;
    submissionId?: string;
  },
  webappUrl?: string
): Promise<{ success: boolean; message?: string }> {
  const targetUrl = webappUrl || process.env.GOOGLE_APPS_SCRIPT_WEBAPP_URL;
  if (!targetUrl || !targetUrl.startsWith('http')) {
    return { success: false, message: 'No Google Apps Script Web App URL configured.' };
  }

  try {
    console.log(`[GoogleSheetForwarder] Forwarding submission for ${payload.fullName} to ${targetUrl}`);
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'append_submission',
        timestamp: new Date().toISOString(),
        ...payload
      })
    });

    const text = await res.text();
    console.log(`[GoogleSheetForwarder] Response (${res.status}):`, text.slice(0, 200));
    return { success: res.ok, message: text };
  } catch (err: any) {
    console.error('[GoogleSheetForwarder] Error posting to Google Sheet Web App:', err);
    return { success: false, message: err?.message || 'Network error' };
  }
}
