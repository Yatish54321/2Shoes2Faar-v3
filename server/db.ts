import fs from 'fs';
import path from 'path';
import { Supporter, MosaicCell, BookOrder, GoogleSubmission, AuditLog, DeletedSupporterRecord } from '../src/types';
import { generateIndiaMosaicGrid, distributeSupportersByState, getRegionForLocation } from '../src/data/indiaGrid';
import { resolveIndianState } from '../src/utils/stateUtils';

const DB_FILE_PATH = path.join(process.cwd(), 'server_data_store.json');

const DUMMY_SEED_NAMES = new Set([
  'aarav sharma',
  'ananya deshmukh',
  'rohan banerjee',
  'kavya nair',
  'vikramjit singh',
  'pooja hegde',
  'tenzin dorjee',
  'meera sengupta',
  'aditya patel',
  'siddharth rao',
  'zoya khan',
  'harpreet singh sandhu',
  'priyanka ghosh',
  'nitin kulkarni',
  'shalini sundaram',
  'lobsang thapa',
  'divya bharathi',
  'gaurav mishra',
  'farhan akhtar',
  'ananya roy',
  'abhishek choudhury',
  'sneha fernandes',
  'rajeshwar varma',
  'tanvi joshi',
  'kunal chauhan'
]);

const DUMMY_SEED_EMAILS = new Set([
  'aarav.sharma@gmail.com',
  'ananya.d@outlook.com',
  'rohan.banerjee@gmail.com',
  'kavya.nair@gmail.com',
  'vikram.singh@yahoo.com',
  'pooja.hegde@gmail.com',
  'tenzin.dorjee@gmail.com',
  'meera.sengupta@gmail.com',
  'aditya.patel@gmail.com',
  'sid.rao@gmail.com',
  'zoya.khan@gmail.com',
  'harpreet.sandhu@gmail.com',
  'priyanka.ghosh@gmail.com',
  'nitin.kulkarni@gmail.com',
  'shalini.s@gmail.com',
  'lobsang.t@gmail.com',
  'divya.b@gmail.com',
  'gaurav.mishra@gmail.com',
  'farhan.s@gmail.com',
  'ananya.roy@gmail.com',
  'abhi.c@gmail.com',
  'sneha.f@gmail.com',
  'rajeshwar.varma@gmail.com',
  'tanvi.joshi@gmail.com',
  'kunal.c@gmail.com',
  'supporter.test@example.com'
]);

export interface InstagramConfig {
  targetInput: string;
  targetUsername: string;
  autoRefreshIntervalMinutes: number;
  lastAttemptAt: string | null;
}

import { NormalizedInstagramPost } from './instagramProvider';

export interface InstagramProfile {
  status: 'SUCCESS' | 'NOT_CONFIGURED' | 'ERROR' | 'CACHED';
  configured: boolean;
  username: string;
  handle: string;
  url: string;
  fullName: string | null;
  followerCount: number | null;
  followerCountFormatted: string | null;
  followingCount: number | null;
  postsCount: number | null;
  bio: string | null;
  avatarUrl: string | null;
  externalUrl?: string | null;
  verified: boolean;
  posts?: NormalizedInstagramPost[];
  lastUpdatedAt: string | null;
  lastSuccessAt: string | null;
  errorMessage: string | null;
  message?: string;
  provider: string;
}

export interface InstagramStats {
  followerCount: number | null;
  followerCountFormatted: string | null;
  postsCount: number | null;
  followingCount?: number | null;
  fullName?: string | null;
  username: string;
  handle: string;
  url: string;
  bio: string | null;
  avatarUrl: string | null;
  externalUrl?: string | null;
  posts?: NormalizedInstagramPost[];
  lastUpdated: string;
  updatedBy: string;
  isManual: boolean;
  status?: string;
  provider?: string;
}

export function formatFollowerCount(count: number | null | undefined): string | null {
  if (count === null || count === undefined || isNaN(count)) return null;
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return count.toLocaleString('en-IN');
}

export function cleanInstagramHandle(raw: any): string {
  if (!raw) return '';
  let str = String(raw).trim();
  if (!str) return '';

  const lower = str.toLowerCase();
  if (
    lower === 'not yet' ||
    lower === 'no' ||
    lower === 'n/a' ||
    lower === 'na' ||
    lower === 'none' ||
    lower === 'nil' ||
    lower === '-' ||
    lower === '--' ||
    lower === 'null' ||
    lower === 'undefined' ||
    lower.includes("don't have") ||
    lower.includes('dont have') ||
    lower.includes('not have') ||
    lower.includes('no instagram') ||
    lower.includes('not yet')
  ) {
    return '';
  }

  // If it's a URL like https://www.instagram.com/hastehaste145?igsh=c254MXlxbDhtNWdw or https://instagram.com/barelykabir/?utm_source=...
  if (str.includes('instagram.com/')) {
    const after = str.split('instagram.com/')[1] || '';
    const extracted = after.split('?')[0].split('/')[0].split('#')[0].trim();
    if (extracted && extracted.length > 1) {
      return `@${extracted.replace(/^@+/, '')}`;
    }
  }

  // Remove any https:// or http:// or www.
  str = str.replace(/^https?:\/\/(www\.)?instagram\.com\/?/i, '');
  // Remove query params
  str = str.split('?')[0].split('/')[0].trim();
  // Remove leading @ symbols
  str = str.replace(/^@+/, '').trim();

  if (!str || str.length < 2 || ['not yet', 'none', 'no', 'n/a', 'na', '@not yet', '@no', '@none', '@n/a'].includes(str.toLowerCase())) {
    return '';
  }

  return `@${str}`;
}

/**
 * Strict and robust parser for Google Form / Sheet featured preference answers.
 * Accurately detects positive ("Yes", "Feature me") vs negative ("No", "Just want the book", "Book only").
 */
export function parseFeaturedPreference(prefRaw?: string | boolean | null): boolean {
  if (prefRaw === undefined || prefRaw === null) return true;
  if (typeof prefRaw === 'boolean') return prefRaw;
  
  const text = String(prefRaw).trim().toLowerCase();
  if (!text) return true;

  // Check explicit negatives FIRST
  if (
    text.includes('just want the book') ||
    text.includes('only pre-order') ||
    text.includes('pre-order only') ||
    text.includes('book only') ||
    text.includes('only book') ||
    text.startsWith('no') ||
    text.includes("don't") ||
    text.includes('dont') ||
    text.includes('not feature') ||
    text.includes('do not feature') ||
    text.includes('decline') ||
    text.includes('opt out') ||
    text === 'false' ||
    text === '0'
  ) {
    return false;
  }

  // Check positives
  if (
    text.startsWith('yes') ||
    text.includes('yes,') ||
    text.includes('yes ') ||
    text === 'yes' ||
    text.includes('feature me') ||
    text.includes('want to be featured') ||
    text.includes('yes, feature') ||
    text.includes('map') ||
    text.includes('mosaic') ||
    text === 'true' ||
    text === '1'
  ) {
    return true;
  }

  // If text contains the word "no"
  if (/\bno\b/i.test(text)) {
    return false;
  }

  return true;
}

export interface DatabaseSchema {
  version: number;
  environment: 'production' | 'demo';
  supporters: Supporter[];
  recycleBin?: DeletedSupporterRecord[];
  mosaicCells: MosaicCell[];
  mosaicFeaturedSupporterIds?: string[];
  submissions: GoogleSubmission[];
  orders: BookOrder[];
  auditLogs: AuditLog[];
  instagramStats?: InstagramStats;
  instagramConfig?: InstagramConfig;
  instagramProfile?: InstagramProfile;
  settings: {
    maxFeaturedSlots: number;
    webhookSecret: string;
    lastSyncedAt: string | null;
  };
}

class ServerDatabase {
  private db: DatabaseSchema;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.db = this.loadDatabase();
  }

  private getDefaultDatabase(environment: 'production' | 'demo' = 'production'): DatabaseSchema {
    const cells = generateIndiaMosaicGrid();

    return {
      version: 1,
      environment,
      supporters: [],
      recycleBin: [],
      mosaicCells: cells,
      submissions: [],
      orders: [],
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          action: 'DATABASE_INITIALIZED',
          details: `Production database initialized for Google Form real supporter submissions.`,
          performedBy: 'System',
          timestamp: new Date().toISOString()
        }
      ],
      instagramStats: {
        followerCount: null,
        followerCountFormatted: null,
        postsCount: null,
        followingCount: null,
        username: '2shoes2faar',
        handle: '@2shoes2faar',
        url: 'https://www.instagram.com/2shoes2faar',
        bio: 'Solo traveller across 28 Indian States in 28 Weeks 🇮🇳 • Author of "India - 28 States in 28 Weeks" 📖',
        avatarUrl: null,
        posts: [],
        lastUpdated: new Date().toISOString(),
        updatedBy: 'System',
        isManual: false
      },
      settings: {
        maxFeaturedSlots: 1000,
        webhookSecret: process.env.GOOGLE_FORM_WEBHOOK_SECRET || 'veer_2shoes2faar_secret_2026',
        lastSyncedAt: null
      }
    };
  }

  public isDummyRecord(name?: string, email?: string): boolean {
    const normName = (name || '').trim().toLowerCase();
    const normEmail = (email || '').trim().toLowerCase();
    if (normName && DUMMY_SEED_NAMES.has(normName)) return true;
    if (normEmail && DUMMY_SEED_EMAILS.has(normEmail)) return true;
    return false;
  }

  public isDeletedSupporter(name?: string, email?: string, sourceSubmissionId?: string): boolean {
    const normName = (name || '').trim().toLowerCase();
    const normEmail = (email || '').trim().toLowerCase();
    const subId = (sourceSubmissionId || '').trim();

    if (!Array.isArray(this.db?.recycleBin)) return false;

    return this.db.recycleBin.some(record => {
      const sup = record.supporter;
      if (!sup) return false;
      if (subId && (sup.sourceSubmissionId === subId || record.id === subId || sup.id === subId)) return true;
      if (normEmail && sup.email && sup.email.trim().toLowerCase() === normEmail) return true;
      if (normName && sup.fullName && sup.fullName.trim().toLowerCase() === normName) return true;
      return false;
    });
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.mosaicCells)) {
          const freshCells = generateIndiaMosaicGrid();
          
          parsed.recycleBin = Array.isArray(parsed.recycleBin) ? parsed.recycleBin : [];

          // Create quick lookup set of deleted IDs and emails from recycle bin
          const deletedIds = new Set(parsed.recycleBin.map((r: any) => r.supporter?.id).filter(Boolean));
          const deletedEmails = new Set(parsed.recycleBin.map((r: any) => r.supporter?.email?.trim().toLowerCase()).filter(Boolean));
          const deletedNames = new Set(parsed.recycleBin.map((r: any) => r.supporter?.fullName?.trim().toLowerCase()).filter(Boolean));

          // Purge all dummy/mock supporters and any soft-deleted supporters
          const rawSupporters: Supporter[] = Array.isArray(parsed.supporters) ? parsed.supporters : [];
          const realSupporters = rawSupporters.filter(s => {
            if (this.isDummyRecord(s.fullName, s.email)) return false;
            if (deletedIds.has(s.id)) return false;
            if (s.email && deletedEmails.has(s.email.trim().toLowerCase())) return false;
            if (s.fullName && deletedNames.has(s.fullName.trim().toLowerCase())) return false;
            return true;
          });

          // Clean dummy submissions and orders first
          if (Array.isArray(parsed.submissions)) {
            parsed.submissions = parsed.submissions.filter((s: GoogleSubmission) => !this.isDummyRecord(s.fullName, s.email));
            // Sanitize existing submissions
            parsed.submissions.forEach((sub: GoogleSubmission) => {
              sub.instagramHandle = cleanInstagramHandle(sub.instagramHandle);
              if (
                deletedEmails.has(sub.email?.trim().toLowerCase()) ||
                deletedNames.has(sub.fullName?.trim().toLowerCase())
              ) {
                sub.syncStatus = 'deleted_by_admin';
              }
            });
          }
          if (Array.isArray(parsed.orders)) {
            parsed.orders = parsed.orders.filter((o: BookOrder) => !this.isDummyRecord(o.customerName, o.email));
          }

          // Re-index real supporters sequentially starting from Slot #1
          realSupporters.forEach((sup: Supporter, idx: number) => {
            sup.supporterNumber = idx + 1;
            sup.instagramHandle = cleanInstagramHandle(sup.instagramHandle);
            // Default paymentVerified to false (pending) unless explicitly true
            sup.paymentVerified = sup.paymentVerified === true;
            // Resolve accurate state from city, state, pinCode, or deliveryAddress
            sup.state = resolveIndianState({
              state: sup.state,
              city: sup.city,
              pinCode: sup.pinCode,
              deliveryAddress: sup.deliveryAddress
            });

            // Match against source submission to check explicit featured choice
            const matchingSub = Array.isArray(parsed.submissions)
              ? parsed.submissions.find((sub: GoogleSubmission) => 
                  (sup.sourceSubmissionId && sub.id === sup.sourceSubmissionId) ||
                  (sup.email && sub.email && sub.email.toLowerCase() === sup.email.toLowerCase()) ||
                  (sup.fullName && sub.fullName && sub.fullName.toLowerCase() === sup.fullName.toLowerCase())
                )
              : undefined;

            if (matchingSub) {
              sup.featured = parseFeaturedPreference(matchingSub.featuredPreference);
            } else if (sup.featured === undefined) {
              sup.featured = true;
            }

            if (!sup.featured) {
              sup.mapCellId = undefined;
              sup.mapX = undefined;
              sup.mapY = undefined;
            }
          });

          const { cells: mappedCells, supporters: mappedSupporters } = distributeSupportersByState(realSupporters, freshCells);
          parsed.supporters = mappedSupporters;
          parsed.mosaicCells = mappedCells;

          if (!parsed.instagramStats) {
            parsed.instagramStats = {
              followerCount: 38400,
              followerCountFormatted: '38.4K',
              postsCount: 142,
              username: '2shoes2faar',
              handle: '@2shoes2faar',
              url: 'https://www.instagram.com/2shoes2faar',
              bio: 'Solo traveller across 28 Indian States in 28 Weeks 🇮🇳 • Author of "India - 28 States in 28 Weeks" 📖',
              avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
              lastUpdated: new Date().toISOString(),
              updatedBy: 'Owner (Veer)',
              isManual: true
            };
          }

          this.persistSync(parsed);
          return parsed;
        }
      }
    } catch (err) {
      console.error('[Server DB] Error reading database file:', err);
    }
    const defaultDb = this.getDefaultDatabase('production');
    this.persistSync(defaultDb);
    return defaultDb;
  }

  private persistSync(data: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Server DB] Failed to persist database:', err);
    }
  }

  private scheduleSave() {
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      this.persistSync(this.db);
    }, 150);
  }

  // ==========================================
  // READ OPERATIONS (PUBLIC & ADMIN)
  // ==========================================

  public getEnvironment(): 'production' | 'demo' {
    return this.db.environment || 'production';
  }

  public getSupporters(): Supporter[] {
    return this.db.supporters;
  }

  public getAllSupporters(): Supporter[] {
    return this.db.supporters;
  }

  public getPublicSupporters(): Supporter[] {
    return this.db.supporters.filter(s => s.approved && !this.isDummyRecord(s.fullName, s.email));
  }

  public getMosaicCells(): MosaicCell[] {
    return this.db.mosaicCells;
  }

  public getPublicMosaic(): MosaicCell[] {
    const supporterMap = new Map(this.getPublicSupporters().map(s => [s.id, s]));
    return this.db.mosaicCells.map(cell => {
      if (cell.supporterId && supporterMap.has(cell.supporterId)) {
        return {
          ...cell,
          supporter: supporterMap.get(cell.supporterId)
        };
      }
      return cell;
    });
  }

  public getPublicStats() {
    const approvedSupporters = this.db.supporters.filter(s => s.approved && !this.isDummyRecord(s.fullName, s.email));
    const approvedFeatured = approvedSupporters.filter(s => s.featured).length;
    const maxCapacity = this.db.settings?.maxFeaturedSlots || 1000;
    const remainingSlots = Math.max(0, maxCapacity - approvedFeatured);
    return {
      approvedFeaturedCount: approvedFeatured,
      totalSupportersCount: approvedSupporters.length,
      maxCapacity,
      remainingSlots,
      percentageFilled: ((approvedFeatured / maxCapacity) * 100).toFixed(1)
    };
  }

  public getSubmissions(): GoogleSubmission[] {
    return this.db.submissions;
  }

  public getAllSubmissions(): GoogleSubmission[] {
    return this.db.submissions;
  }

  public getOrders(): BookOrder[] {
    return this.db.orders;
  }

  public getAllOrders(): BookOrder[] {
    return this.db.orders;
  }

  public getAuditLogs(): AuditLog[] {
    return this.db.auditLogs;
  }

  public getInstagramStats(): InstagramStats {
    return this.db.instagramStats || {
      followerCount: null,
      followerCountFormatted: null,
      postsCount: null,
      username: '2shoes2faar',
      handle: '@2shoes2faar',
      url: 'https://www.instagram.com/2shoes2faar',
      bio: 'Solo traveller across 28 Indian States in 28 Weeks 🇮🇳',
      avatarUrl: null,
      posts: [],
      lastUpdated: new Date().toISOString(),
      updatedBy: 'System',
      isManual: false
    };
  }

  public getInstagramConfig(): InstagramConfig {
    return this.db.instagramConfig || {
      targetInput: 'https://www.instagram.com/2shoes2faar',
      targetUsername: '2shoes2faar',
      autoRefreshIntervalMinutes: 360,
      lastAttemptAt: null
    };
  }

  public getInstagramProfile(): InstagramProfile {
    if (!this.db.instagramProfile) {
      this.db.instagramProfile = {
        status: 'NOT_CONFIGURED',
        configured: false,
        username: '2shoes2faar',
        handle: '@2shoes2faar',
        url: 'https://www.instagram.com/2shoes2faar',
        fullName: 'Channveer Shankad (Veer)',
        followerCount: null,
        followerCountFormatted: null,
        followingCount: null,
        postsCount: null,
        bio: 'Solo traveller across 28 Indian States in 28 Weeks 🇮🇳 • Author of "India - 28 States in 28 Weeks" 📖',
        avatarUrl: null,
        verified: false,
        posts: [],
        lastUpdatedAt: null,
        lastSuccessAt: null,
        errorMessage: null,
        provider: 'apify'
      };
    }
    return this.db.instagramProfile;
  }

  public getSettings() {
    return this.db.settings || {
      maxFeaturedSlots: 1000,
      webhookSecret: process.env.GOOGLE_FORM_WEBHOOK_SECRET || 'veer_2shoes2faar_secret_2026',
      lastSyncedAt: null
    };
  }

  // ==========================================
  // WRITE OPERATIONS
  // ==========================================

  public addAudit(action: string, details: string, performedBy: string = 'Admin', entityId?: string) {
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      action,
      details,
      performedBy,
      timestamp: new Date().toISOString(),
      entityId
    };
    this.db.auditLogs.unshift(log);
    if (this.db.auditLogs.length > 500) {
      this.db.auditLogs = this.db.auditLogs.slice(0, 500);
    }
    this.scheduleSave();
  }

  public cleanInstagramHandle(raw: any): string {
    return cleanInstagramHandle(raw);
  }

  public normalizeMediaUrl(url?: string): string {
    if (!url || typeof url !== 'string') return '';
    let trimmed = url.trim();
    if (!trimmed) return '';

    // If multiple comma-separated URLs exist (e.g. user submitted multiple pics), pick the first valid one
    if (trimmed.includes(',')) {
      const parts = trimmed.split(',').map(p => p.trim()).filter(Boolean);
      trimmed = parts[0] || '';
    }

    if (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com')) {
      const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (idMatch && idMatch[1]) {
        return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w1000`;
      }
      const fileDMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (fileDMatch && fileDMatch[1]) {
        return `https://drive.google.com/thumbnail?id=${fileDMatch[1]}&sz=w1000`;
      }
      const openMatch = trimmed.match(/\/open\?id=([a-zA-Z0-9_-]+)/);
      if (openMatch && openMatch[1]) {
        return `https://drive.google.com/thumbnail?id=${openMatch[1]}&sz=w1000`;
      }
    }
    return trimmed;
  }

  public ingestGoogleSubmission(rawPayload: any): { 
    success: boolean; 
    isNew?: boolean; 
    isDuplicate?: boolean; 
    action?: 'imported' | 'updated' | 'ignored_deleted'; 
    submission: GoogleSubmission; 
    order?: BookOrder; 
    supporter?: Supporter;
    message?: string;
  } {
    if (!rawPayload || typeof rawPayload !== 'object') {
      throw new Error('Invalid payload object');
    }

    // Flexible extraction from any header style (camelCase, Title Case, Google Form questions)
    const findField = (keys: string[]): string => {
      for (const k of keys) {
        if (rawPayload[k] !== undefined && rawPayload[k] !== null && String(rawPayload[k]).trim()) {
          return String(rawPayload[k]).trim();
        }
      }
      // Case-insensitive fallback
      for (const rawKey of Object.keys(rawPayload)) {
        const normKey = rawKey.toLowerCase().replace(/[^a-z0-9]/g, '');
        for (const k of keys) {
          const normTarget = k.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (normKey === normTarget || normKey.includes(normTarget)) {
            const val = rawPayload[rawKey];
            if (val !== undefined && val !== null && String(val).trim()) {
              return String(val).trim();
            }
          }
        }
      }
      return '';
    };

    const payload = {
      fullName: findField(['fullName', 'Your Full Name', 'Full Name', 'Name', 'Customer Name', 'Supporter Name']),
      email: findField(['email', 'Email Address', 'Email', 'Email ID']),
      whatsappNumber: findField(['whatsappNumber', 'WhatsApp Number', 'WhatsApp', 'Phone Number', 'Phone', 'Mobile']),
      instagramHandle: findField(['instagramHandle', 'Instagram Profile / Handle', 'Insta Handle', 'Instagram Handle', 'Instagram', 'Handle']),
      city: findField(['city', 'Your City', 'City', 'Town']),
      state: findField(['state', 'State', 'Province']),
      pinCode: findField(['pinCode', 'PIN Code', 'Pin Code', 'Pincode', 'Postal Code', 'ZIP']),
      deliveryAddress: findField(['deliveryAddress', 'Complete Address For Book Delivery with Area, City, State, PIN Code', 'Full Delivery Address (with House/Flat No, Landmark & PIN Code)', 'Complete Address (House No, Street, Area, Landmark)', 'Complete Address', 'Delivery Address', 'Address']),
      travelPhilosophy: findField(['travelPhilosophy', 'What Makes you "TRAVEL"', 'What Makes you TRAVEL', 'What Makes you "TRAVEL" / Share your Travel Quote / Memory', 'Share a line or memory about what travel means to you', 'Travel Quote', 'Quote', 'Travel Philosophy', 'Memory']),
      photoUrl: findField(['photoUrl', 'Add your Best Travel Pic Featuring You', 'Add your Best Travel Pic (or Profile Photo)', 'Travel Photo', 'Photo', 'Best Travel Pic', 'Pic']),
      paymentProofUrl: findField(['paymentProofUrl', 'PAYMENT PROOF', 'PAYMENT PROOF (₹499 pre-order confirmation screenshot)', 'Upload Screenshot of Payment', 'Payment Proof', 'Screenshot', 'Payment']),
      paymentRefNumber: findField(['paymentRefNumber', 'UTR', 'UTR Number', 'UPI Ref', 'Transaction ID', 'UPI Transaction ID', 'Reference Number', 'Ref No', 'UPI Ref No', 'Payment Ref']),
      featuredPreference: findField(['featuredPreference', 'Would you like to Get Featured in the book?', 'Would you like to Get Featured in the book? (Free with Pre-order)', 'Featured Preference', 'Featured']),
      timestamp: findField(['timestamp', 'Timestamp', 'Date', 'Time']) || new Date().toISOString()
    };

    const submissionId = `gform-sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    
    const cleanPhotoUrl = this.normalizeMediaUrl(payload.photoUrl);
    const cleanPaymentProofUrl = this.normalizeMediaUrl(payload.paymentProofUrl);

    // Sanitize and resolve accurate state
    const cleanState = resolveIndianState({
      state: payload.state,
      city: payload.city,
      pinCode: payload.pinCode,
      deliveryAddress: payload.deliveryAddress
    });

    const isFeaturedPref = parseFeaturedPreference(payload.featuredPreference);

    const cleanHandle = cleanInstagramHandle(payload.instagramHandle);

    let cleanName = payload.fullName?.trim() || 'Supporter';
    if (cleanName.includes('@') && cleanName.toLowerCase().includes('srilakshmi')) {
      cleanName = 'Srilakshmi Mohan';
    }

    const cleanSubmission: GoogleSubmission = {
      id: submissionId,
      timestamp: payload.timestamp || new Date().toISOString(),
      email: payload.email?.trim() || '',
      fullName: cleanName,
      whatsappNumber: payload.whatsappNumber?.trim() || '',
      instagramHandle: cleanHandle,
      city: payload.city?.trim() || '',
      state: cleanState,
      pinCode: payload.pinCode?.trim() || '',
      featuredPreference: payload.featuredPreference || (isFeaturedPref ? 'Yes, feature me on India map' : 'No, only pre-order book'),
      travelPhilosophy: payload.travelPhilosophy?.trim() || '',
      deliveryAddress: payload.deliveryAddress?.trim() || '',
      photoUrl: cleanPhotoUrl,
      paymentProofUrl: cleanPaymentProofUrl,
      syncStatus: 'processed',
      ...(payload.paymentRefNumber ? { paymentRefNumber: String(payload.paymentRefNumber).trim() } : {})
    };

    // Duplicate & Recycle Bin check
    if (this.isDeletedSupporter(cleanSubmission.fullName, cleanSubmission.email, cleanSubmission.id)) {
      cleanSubmission.syncStatus = 'deleted_by_admin';
      const existingSubIndex = this.db.submissions.findIndex(
        s => (cleanSubmission.email && s.email.toLowerCase() === cleanSubmission.email.toLowerCase()) ||
             (s.fullName.toLowerCase() === cleanSubmission.fullName.toLowerCase() && cleanSubmission.fullName.length > 2 && s.timestamp === cleanSubmission.timestamp)
      );
      if (existingSubIndex >= 0) {
        this.db.submissions[existingSubIndex] = { ...this.db.submissions[existingSubIndex], ...cleanSubmission };
      } else {
        this.db.submissions.unshift(cleanSubmission);
      }
      this.persistSync(this.db);
      return {
        success: false,
        isNew: false,
        isDuplicate: false,
        action: 'ignored_deleted',
        message: `Supporter ${cleanSubmission.fullName} is currently in the Admin Recycle Bin. To restore them, use the Recycle Bin tab in Admin.`,
        submission: cleanSubmission
      };
    }

    const existingSubIndex = this.db.submissions.findIndex(
      s => (cleanSubmission.email && s.email.toLowerCase() === cleanSubmission.email.toLowerCase()) ||
           (s.fullName.toLowerCase() === cleanSubmission.fullName.toLowerCase() && cleanSubmission.fullName.length > 2 && s.timestamp === cleanSubmission.timestamp)
    );

    if (existingSubIndex >= 0) {
      this.db.submissions[existingSubIndex] = { ...this.db.submissions[existingSubIndex], ...cleanSubmission, id: this.db.submissions[existingSubIndex].id };
    } else {
      this.db.submissions.unshift(cleanSubmission);
    }

    // Automatically create or update the Supporter record so it immediately appears on the Supporters page & Mosaic
    let existingSupporter = this.db.supporters.find(
      s => (cleanSubmission.email && s.email?.toLowerCase() === cleanSubmission.email.toLowerCase()) ||
           (s.fullName.toLowerCase() === cleanSubmission.fullName.toLowerCase() && cleanSubmission.fullName.length > 2)
    );

    let isNew = false;
    let createdOrUpdatedSupporter: Supporter;

    if (existingSupporter) {
      isNew = false;
      existingSupporter.fullName = cleanSubmission.fullName;
      existingSupporter.email = cleanSubmission.email || existingSupporter.email;
      existingSupporter.whatsappNumber = cleanSubmission.whatsappNumber || existingSupporter.whatsappNumber;
      existingSupporter.instagramHandle = cleanSubmission.instagramHandle || existingSupporter.instagramHandle;
      existingSupporter.city = cleanSubmission.city || existingSupporter.city;
      existingSupporter.state = cleanSubmission.state || existingSupporter.state;
      existingSupporter.region = getRegionForLocation(existingSupporter.city, existingSupporter.state);
      existingSupporter.pinCode = cleanSubmission.pinCode || existingSupporter.pinCode;
      existingSupporter.deliveryAddress = cleanSubmission.deliveryAddress || existingSupporter.deliveryAddress;
      if (cleanSubmission.travelPhilosophy) existingSupporter.travelComment = cleanSubmission.travelPhilosophy;
      if (cleanSubmission.photoUrl) existingSupporter.photoUrl = cleanSubmission.photoUrl;
      if (cleanSubmission.paymentProofUrl) existingSupporter.paymentProofUrl = cleanSubmission.paymentProofUrl;
      existingSupporter.approved = true;
      existingSupporter.featured = isFeaturedPref;
      existingSupporter.status = 'approved';
      existingSupporter.sourceSubmissionId = submissionId;

      if (isFeaturedPref) {
        if (!existingSupporter.mapCellId) {
          const vacantCell = this.db.mosaicCells.find(c => c.valid && !c.supporterId);
          if (vacantCell) {
            existingSupporter.mapCellId = vacantCell.cellId;
            existingSupporter.mapX = vacantCell.x;
            existingSupporter.mapY = vacantCell.y;
            vacantCell.supporterId = existingSupporter.id;
            vacantCell.supporter = existingSupporter;
          }
        } else {
          const cell = this.db.mosaicCells.find(c => c.cellId === existingSupporter?.mapCellId);
          if (cell) {
            cell.supporter = existingSupporter;
          }
        }
      } else {
        // If opted out of featured map, clear cell
        if (existingSupporter.mapCellId) {
          const oldCell = this.db.mosaicCells.find(c => c.cellId === existingSupporter?.mapCellId);
          if (oldCell) {
            oldCell.supporterId = undefined;
            oldCell.supporter = undefined;
          }
          existingSupporter.mapCellId = undefined;
          existingSupporter.mapX = undefined;
          existingSupporter.mapY = undefined;
        }
      }

      createdOrUpdatedSupporter = existingSupporter;
    } else {
      isNew = true;
      const nextSupporterNumber = this.db.supporters.length + 1;
      const supporterId = `sup-${String(nextSupporterNumber).padStart(3, '0')}-${Date.now().toString().slice(-4)}`;

      // Find an available vacant mosaic cell only if they opted to be featured
      const vacantCell = isFeaturedPref ? this.db.mosaicCells.find(c => c.valid && !c.supporterId) : undefined;

      createdOrUpdatedSupporter = {
        id: supporterId,
        supporterNumber: nextSupporterNumber,
        fullName: cleanSubmission.fullName,
        email: cleanSubmission.email,
        whatsappNumber: cleanSubmission.whatsappNumber,
        instagramHandle: cleanSubmission.instagramHandle,
        city: cleanSubmission.city,
        state: cleanSubmission.state,
        region: getRegionForLocation(cleanSubmission.city, cleanSubmission.state),
        pinCode: cleanSubmission.pinCode,
        deliveryAddress: cleanSubmission.deliveryAddress,
        travelComment: cleanSubmission.travelPhilosophy,
        photoUrl: cleanSubmission.photoUrl,
        paymentProofUrl: cleanSubmission.paymentProofUrl,
        featured: isFeaturedPref,
        approved: true,
        status: 'approved',
        paymentVerified: false, // Default to pending for all upcoming supporters
        createdAt: cleanSubmission.timestamp,
        source: 'google_form',
        sourceSubmissionId: submissionId,
        orderStatus: 'pending',
        amountPaid: 499,
        mapCellId: vacantCell?.cellId,
        mapX: vacantCell?.x,
        mapY: vacantCell?.y
      };

      if (vacantCell) {
        vacantCell.supporterId = createdOrUpdatedSupporter.id;
        vacantCell.supporter = createdOrUpdatedSupporter;
      }

      this.db.supporters.push(createdOrUpdatedSupporter);
    }

    // Deduplicate or create corresponding order record
    const existingOrderIndex = this.db.orders.findIndex(
      o => (cleanSubmission.email && o.email?.toLowerCase() === cleanSubmission.email.toLowerCase()) ||
           (cleanSubmission.fullName && o.customerName?.toLowerCase() === cleanSubmission.fullName.toLowerCase() && o.createdAt === cleanSubmission.timestamp)
    );

    let order: BookOrder;
    if (existingOrderIndex >= 0) {
      this.db.orders[existingOrderIndex] = {
        ...this.db.orders[existingOrderIndex],
        customerName: cleanSubmission.fullName,
        email: cleanSubmission.email,
        whatsappNumber: cleanSubmission.whatsappNumber,
        city: cleanSubmission.city,
        state: cleanSubmission.state,
        pinCode: cleanSubmission.pinCode,
        deliveryAddress: cleanSubmission.deliveryAddress,
        instagramHandle: cleanSubmission.instagramHandle,
        travelComment: cleanSubmission.travelPhilosophy,
        photoUrl: cleanSubmission.photoUrl,
        paymentProofUrl: cleanSubmission.paymentProofUrl,
        paymentRefNumber: payload.paymentRefNumber || this.db.orders[existingOrderIndex].paymentRefNumber,
        supporterId: createdOrUpdatedSupporter.id
      };
      order = this.db.orders[existingOrderIndex];
    } else {
      const orderId = `ord-gform-${String(this.db.orders.length + 1).padStart(3, '0')}`;
      order = {
        id: orderId,
        supporterId: createdOrUpdatedSupporter.id,
        customerName: cleanSubmission.fullName,
        email: cleanSubmission.email,
        whatsappNumber: cleanSubmission.whatsappNumber,
        city: cleanSubmission.city,
        state: cleanSubmission.state,
        pinCode: cleanSubmission.pinCode,
        deliveryAddress: cleanSubmission.deliveryAddress,
        instagramHandle: cleanSubmission.instagramHandle,
        featuredPreference: true,
        travelComment: cleanSubmission.travelPhilosophy,
        photoUrl: cleanSubmission.photoUrl,
        paymentProofUrl: cleanSubmission.paymentProofUrl,
        paymentRefNumber: payload.paymentRefNumber,
        amount: 499,
        paymentStatus: cleanSubmission.paymentProofUrl ? 'submitted' : 'pending',
        orderStatus: 'payment_verified',
        createdAt: cleanSubmission.timestamp
      };
      this.db.orders.unshift(order);
    }

    cleanSubmission.assignedSupporterId = createdOrUpdatedSupporter.id;

    this.addAudit(
      isNew ? 'GOOGLE_FORM_SUPPORTER_SAVED' : 'GOOGLE_FORM_SUPPORTER_UPDATED',
      `${isNew ? 'Saved new' : 'Updated existing'} supporter ${cleanSubmission.fullName} (#${createdOrUpdatedSupporter.supporterNumber}) from Google Form submission into database and supporters directory.`,
      'Google Apps Script Webhook',
      submissionId
    );

    this.persistSync(this.db);

    return { 
      success: true, 
      isNew,
      isDuplicate: !isNew,
      action: isNew ? 'imported' : 'updated',
      submission: cleanSubmission, 
      order,
      supporter: createdOrUpdatedSupporter
    };
  }

  public ingestGoogleSubmissionsBatch(items: Array<any>): {
    totalReceived: number;
    totalProcessed: number;
    supporters: Supporter[];
  } {
    let processed = 0;
    const supporters: Supporter[] = [];

    for (const item of items) {
      if (!item || typeof item !== 'object') continue;

      // Extract name or email using flexible check
      const rawName = item.fullName || item['Your Full Name'] || item['Full Name'] || item['Name'] || '';
      const rawEmail = item.email || item['Email Address'] || item['Email'] || '';
      
      if (!rawName && !rawEmail) {
        // Fallback search through keys
        const anyVal = Object.values(item).some(v => v && String(v).trim().length > 0);
        if (!anyVal) continue;
      }

      // Skip dummy test data during batch import
      if (this.isDummyRecord(rawName, rawEmail)) continue;

      const res = this.ingestGoogleSubmission(item);
      if (res.success && res.supporter) {
        processed++;
        supporters.push(res.supporter);
      }
    }

    return {
      totalReceived: items.length,
      totalProcessed: processed,
      supporters
    };
  }

  public approveSubmission(
    submissionId: string,
    options?: { customComment?: string; customPhotoUrl?: string; assignedCellId?: string; overrideCapacity?: boolean }
  ): { success: boolean; supporter?: Supporter; message?: string } {
    const sub = this.db.submissions.find(s => s.id === submissionId);
    if (!sub) return { success: false, message: 'Submission not found' };

    sub.syncStatus = 'approved';

    let supporter = this.db.supporters.find(s => s.sourceSubmissionId === submissionId || (sub.email && s.email?.toLowerCase() === sub.email.toLowerCase()));
    if (!supporter) {
      const nextSupporterNumber = this.db.supporters.length + 1;
      const targetCell = options?.assignedCellId
        ? this.db.mosaicCells.find(c => c.cellId === options.assignedCellId && c.valid)
        : this.db.mosaicCells.find(c => c.valid && !c.supporterId);

      supporter = {
        id: `sup-${String(nextSupporterNumber).padStart(3, '0')}-${Date.now().toString().slice(-4)}`,
        supporterNumber: nextSupporterNumber,
        fullName: sub.fullName,
        email: sub.email,
        whatsappNumber: sub.whatsappNumber,
        instagramHandle: sub.instagramHandle,
        city: sub.city,
        state: sub.state,
        pinCode: sub.pinCode,
        deliveryAddress: sub.deliveryAddress,
        travelComment: options?.customComment || sub.travelPhilosophy,
        photoUrl: options?.customPhotoUrl || sub.photoUrl,
        paymentProofUrl: sub.paymentProofUrl,
        featured: true,
        approved: true,
        status: 'approved',
        paymentVerified: false, // Default to pending until admin verification
        createdAt: sub.timestamp,
        source: 'google_form',
        sourceSubmissionId: sub.id,
        orderStatus: 'pending',
        amountPaid: 499,
        mapCellId: targetCell?.cellId,
        mapX: targetCell?.x,
        mapY: targetCell?.y
      };

      if (targetCell) {
        targetCell.supporterId = supporter.id;
        targetCell.supporter = supporter;
      }

      this.db.supporters.push(supporter);
    } else {
      if (options?.customComment) supporter.travelComment = options.customComment;
      if (options?.customPhotoUrl) supporter.photoUrl = options.customPhotoUrl;
      supporter.approved = true;
      supporter.status = 'approved';
    }

    sub.assignedSupporterId = supporter.id;
    this.addAudit('SUBMISSION_APPROVED', `Approved submission from ${sub.fullName} (#${supporter.supporterNumber}).`, 'Admin', submissionId);
    this.persistSync(this.db);
    return { success: true, supporter };
  }

  public rejectSubmission(submissionId: string, reason?: string): { success: boolean; message: string } {
    const sub = this.db.submissions.find(s => s.id === submissionId);
    if (!sub) return { success: false, message: 'Submission not found' };

    sub.syncStatus = 'rejected';
    this.addAudit('SUBMISSION_REJECTED', `Rejected submission for ${sub.fullName}. Reason: ${reason || 'Payment unverified/incomplete'}.`, 'Admin', submissionId);
    this.scheduleSave();
    return { success: true, message: `Submission for ${sub.fullName} marked as rejected.` };
  }

  public updateSupporter(id: string, updates: Partial<Supporter>): { success: boolean; supporter?: Supporter } {
    const supporter = this.db.supporters.find(s => s.id === id);
    if (!supporter) return { success: false };

    // Security & Data Integrity Isolation:
    // Admin is permitted to curate: instagramHandle, photoUrl, supporterNumber, paymentVerified, adminNote, orderStatus
    // Immutable user-submitted fields (fullName, email, whatsapp, deliveryAddress, pinCode, city, state, travelComment, paymentProofUrl, featured) are protected.
    if (updates.instagramHandle !== undefined) {
      supporter.instagramHandle = cleanInstagramHandle(updates.instagramHandle);
    }
    if (updates.photoUrl !== undefined) {
      supporter.photoUrl = updates.photoUrl.trim();
    }
    if (updates.supporterNumber !== undefined && typeof updates.supporterNumber === 'number') {
      supporter.supporterNumber = updates.supporterNumber;
    }
    if (updates.paymentVerified !== undefined) {
      supporter.paymentVerified = Boolean(updates.paymentVerified);
      supporter.paymentVerifiedAt = supporter.paymentVerified ? new Date().toISOString() : undefined;
      if (supporter.paymentVerified && supporter.orderStatus === 'pending') {
        supporter.orderStatus = 'payment_verified';
      }
    }
    if (updates.adminNote !== undefined) {
      supporter.adminNote = updates.adminNote;
    }
    if (updates.orderStatus !== undefined) {
      supporter.orderStatus = updates.orderStatus;
    }

    supporter.updatedAt = new Date().toISOString();

    // If photo changed, update cell's embedded supporter
    if (supporter.mapCellId) {
      const cell = this.db.mosaicCells.find(c => c.cellId === supporter.mapCellId);
      if (cell) cell.supporter = supporter;
    }

    this.addAudit('SUPPORTER_CURATED', `Admin curated supporter record for ${supporter.fullName} (#${supporter.supporterNumber}).`, 'Admin', id);
    this.scheduleSave();
    return { success: true, supporter };
  }

  public toggleSupporterPaymentVerified(id: string, verified?: boolean): { success: boolean; supporter?: Supporter } {
    const supporter = this.db.supporters.find(s => s.id === id);
    if (!supporter) return { success: false };

    const newStatus = verified !== undefined ? verified : !supporter.paymentVerified;
    supporter.paymentVerified = newStatus;
    supporter.paymentVerifiedAt = newStatus ? new Date().toISOString() : undefined;
    if (newStatus && (!supporter.orderStatus || supporter.orderStatus === 'pending')) {
      supporter.orderStatus = 'payment_verified';
    }
    supporter.updatedAt = new Date().toISOString();

    this.addAudit(
      newStatus ? 'PAYMENT_VERIFIED' : 'PAYMENT_UNVERIFIED',
      `Payment status marked as ${newStatus ? 'VERIFIED' : 'UNVERIFIED'} for ${supporter.fullName} (#${supporter.supporterNumber}).`,
      'Admin',
      id
    );
    this.scheduleSave();
    return { success: true, supporter };
  }

  public moveSupporterCell(supporterId: string, targetCellId: string): { success: boolean; message: string } {
    const supporter = this.db.supporters.find(s => s.id === supporterId);
    const targetCell = this.db.mosaicCells.find(c => c.cellId === targetCellId && c.valid);

    if (!supporter) return { success: false, message: 'Supporter not found' };
    if (!targetCell) return { success: false, message: 'Target cell not valid' };
    if (targetCell.supporterId && targetCell.supporterId !== supporterId) {
      return { success: false, message: 'Target cell is already occupied' };
    }

    // Clear old cell
    if (supporter.mapCellId) {
      const oldCell = this.db.mosaicCells.find(c => c.cellId === supporter.mapCellId);
      if (oldCell) {
        oldCell.supporterId = undefined;
        oldCell.supporter = undefined;
      }
    }

    // Assign new cell
    targetCell.supporterId = supporter.id;
    targetCell.supporter = supporter;
    supporter.mapCellId = targetCell.cellId;
    supporter.mapX = targetCell.x;
    supporter.mapY = targetCell.y;

    this.addAudit('MOSAIC_CELL_MOVED', `Moved supporter #${supporter.supporterNumber} to cell ${targetCell.cellId} (${targetCell.x}, ${targetCell.y}).`, 'Admin', supporterId);
    this.scheduleSave();

    return { success: true, message: `Moved to cell ${targetCell.cellId}` };
  }

  public removeSupporterFromMap(supporterId: string): { success: boolean; message: string } {
    const supporter = this.db.supporters.find(s => s.id === supporterId);
    if (!supporter) return { success: false, message: 'Supporter not found' };

    if (supporter.mapCellId) {
      const oldCell = this.db.mosaicCells.find(c => c.cellId === supporter.mapCellId);
      if (oldCell) {
        oldCell.supporterId = undefined;
        oldCell.supporter = undefined;
      }
      supporter.mapCellId = undefined;
      supporter.mapX = undefined;
      supporter.mapY = undefined;
    }
    supporter.featured = false;

    this.addAudit('SUPPORTER_REMOVED_FROM_MAP', `Removed supporter #${supporter.supporterNumber} (${supporter.fullName}) from mosaic map.`, 'Admin', supporterId);
    this.scheduleSave();
    return { success: true, message: `Removed from mosaic map` };
  }

  public getRecycleBin(): DeletedSupporterRecord[] {
    return Array.isArray(this.db.recycleBin) ? this.db.recycleBin : [];
  }

  public deleteSupporter(
    supporterId: string,
    resequence: boolean = true,
    reason: string = 'Deleted by admin',
    deletedBy: string = 'Admin'
  ): { success: boolean; message: string; deletedItem?: DeletedSupporterRecord } {
    const supporterIndex = this.db.supporters.findIndex(s => s.id === supporterId);
    if (supporterIndex === -1) return { success: false, message: 'Supporter not found' };

    const supporter = this.db.supporters[supporterIndex];
    const origNumber = supporter.supporterNumber;
    const origCellId = supporter.mapCellId;

    // Vacate mosaic cell if occupied
    if (supporter.mapCellId) {
      const cell = this.db.mosaicCells.find(c => c.cellId === supporter.mapCellId);
      if (cell) {
        cell.supporterId = undefined;
        cell.supporter = undefined;
      }
    }

    // Initialize recycle bin if not present
    if (!Array.isArray(this.db.recycleBin)) {
      this.db.recycleBin = [];
    }

    const deletedRecord: DeletedSupporterRecord = {
      id: `del-${supporter.id}-${Date.now()}`,
      supporter: { ...supporter },
      deletedAt: new Date().toISOString(),
      deletedBy: deletedBy || 'Admin',
      reason: reason || 'Deleted by admin',
      originalSupporterNumber: origNumber,
      originalMapCellId: origCellId
    };

    // Remove any existing duplicate record for this supporter in recycle bin and unshift
    this.db.recycleBin = this.db.recycleBin.filter(r => r.supporter?.id !== supporter.id);
    this.db.recycleBin.unshift(deletedRecord);

    // If there is a matching submission in submissions list, mark syncStatus = 'deleted_by_admin'
    if (Array.isArray(this.db.submissions)) {
      this.db.submissions.forEach(sub => {
        if (
          (supporter.sourceSubmissionId && sub.id === supporter.sourceSubmissionId) ||
          (supporter.email && sub.email && sub.email.toLowerCase() === supporter.email.toLowerCase()) ||
          (supporter.fullName && sub.fullName && sub.fullName.toLowerCase() === supporter.fullName.toLowerCase())
        ) {
          sub.syncStatus = 'deleted_by_admin';
        }
      });
    }

    // Remove from active supporters array
    this.db.supporters.splice(supporterIndex, 1);

    // Resequence remaining supporters to maintain clean 1..N order and geographic state-based mosaic mapping
    if (resequence) {
      this.db.supporters.forEach((s, idx) => {
        s.supporterNumber = idx + 1;
      });
      const { cells: mappedCells, supporters: mappedSupporters } = distributeSupportersByState(this.db.supporters, this.db.mosaicCells);
      this.db.supporters = mappedSupporters;
      this.db.mosaicCells = mappedCells;
    }

    this.addAudit('SUPPORTER_MOVED_TO_RECYCLE_BIN', `Moved supporter #${origNumber} (${supporter.fullName}) to Recycle Bin.`, deletedBy, supporterId);
    this.persistSync(this.db);
    return {
      success: true,
      message: `Supporter ${supporter.fullName} (#${origNumber}) moved to Recycle Bin. You can restore them anytime from the Recycle Bin tab.`,
      deletedItem: deletedRecord
    };
  }

  public restoreSupporter(deletedRecordId: string): { success: boolean; message: string; supporter?: Supporter } {
    if (!Array.isArray(this.db.recycleBin)) {
      this.db.recycleBin = [];
      return { success: false, message: 'Recycle bin is empty' };
    }

    const index = this.db.recycleBin.findIndex(r => r.id === deletedRecordId || r.supporter?.id === deletedRecordId);
    if (index === -1) {
      return { success: false, message: 'Record not found in Recycle Bin' };
    }

    const [deletedRecord] = this.db.recycleBin.splice(index, 1);
    const restoredSupporter = deletedRecord.supporter;

    // Check if supporter ID already exists in supporters
    const exists = this.db.supporters.some(s => s.id === restoredSupporter.id);
    if (!exists) {
      restoredSupporter.updatedAt = new Date().toISOString();
      restoredSupporter.approved = true;
      restoredSupporter.status = 'approved';
      this.db.supporters.push(restoredSupporter);
    }

    // Reset matching submission status if found
    if (Array.isArray(this.db.submissions)) {
      this.db.submissions.forEach(sub => {
        if (
          (restoredSupporter.sourceSubmissionId && sub.id === restoredSupporter.sourceSubmissionId) ||
          (restoredSupporter.email && sub.email && sub.email.toLowerCase() === restoredSupporter.email.toLowerCase()) ||
          (restoredSupporter.fullName && sub.fullName && sub.fullName.toLowerCase() === restoredSupporter.fullName.toLowerCase())
        ) {
          sub.syncStatus = 'processed';
          sub.assignedSupporterId = restoredSupporter.id;
        }
      });
    }

    // Resequence all supporters to maintain clean 1..N order and geographic state-based mosaic mapping
    this.db.supporters.forEach((s, idx) => {
      s.supporterNumber = idx + 1;
    });
    const { cells: mappedCells, supporters: mappedSupporters } = distributeSupportersByState(this.db.supporters, this.db.mosaicCells);
    this.db.supporters = mappedSupporters;
    this.db.mosaicCells = mappedCells;

    this.addAudit('SUPPORTER_RESTORED', `Restored supporter ${restoredSupporter.fullName} from Recycle Bin to active directory.`, 'Admin', restoredSupporter.id);
    this.persistSync(this.db);

    return {
      success: true,
      message: `Supporter ${restoredSupporter.fullName} restored successfully to Active Supporters (#${restoredSupporter.supporterNumber}).`,
      supporter: restoredSupporter
    };
  }

  public purgeDeletedRecord(deletedRecordId: string): { success: boolean; message: string } {
    if (!Array.isArray(this.db.recycleBin)) {
      this.db.recycleBin = [];
      return { success: false, message: 'Recycle bin is empty' };
    }

    const index = this.db.recycleBin.findIndex(r => r.id === deletedRecordId || r.supporter?.id === deletedRecordId);
    if (index === -1) {
      return { success: false, message: 'Record not found in Recycle Bin' };
    }

    const [deletedRecord] = this.db.recycleBin.splice(index, 1);

    // Also remove from submissions completely if permanently purged
    if (Array.isArray(this.db.submissions)) {
      this.db.submissions = this.db.submissions.filter(sub => {
        if (deletedRecord.supporter.sourceSubmissionId && sub.id === deletedRecord.supporter.sourceSubmissionId) {
          return false;
        }
        if (deletedRecord.supporter.email && sub.email && sub.email.toLowerCase() === deletedRecord.supporter.email.toLowerCase()) {
          return false;
        }
        return true;
      });
    }

    this.addAudit('RECORD_PERMANENTLY_PURGED', `Permanently purged ${deletedRecord.supporter.fullName} from Recycle Bin.`, 'Admin', deletedRecord.id);
    this.persistSync(this.db);
    return { success: true, message: `Permanently purged ${deletedRecord.supporter.fullName}.` };
  }

  public emptyRecycleBin(): { success: boolean; message: string; count: number } {
    const count = Array.isArray(this.db.recycleBin) ? this.db.recycleBin.length : 0;
    this.db.recycleBin = [];
    this.addAudit('RECYCLE_BIN_EMPTIED', `Permanently emptied all ${count} records from Recycle Bin.`, 'Admin');
    this.persistSync(this.db);
    return { success: true, message: `Emptied ${count} records from Recycle Bin.`, count };
  }

  public deleteSubmission(submissionId: string): { success: boolean; message: string } {
    const index = this.db.submissions.findIndex(s => s.id === submissionId);
    if (index === -1) return { success: false, message: 'Submission not found' };

    const sub = this.db.submissions[index];
    this.db.submissions.splice(index, 1);

    this.addAudit('SUBMISSION_DELETED', `Deleted submission from ${sub.fullName} (${sub.email}).`, 'Admin', submissionId);
    this.scheduleSave();
    return { success: true, message: `Submission deleted successfully.` };
  }

  public reorderSupporters(orderedIds: string[]): { success: boolean; supporters: Supporter[] } {
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return { success: false, supporters: this.db.supporters };
    }

    const reordered: Supporter[] = [];
    const remaining = [...this.db.supporters];

    for (const id of orderedIds) {
      const idx = remaining.findIndex(s => s.id === id);
      if (idx !== -1) {
        reordered.push(remaining.splice(idx, 1)[0]);
      }
    }
    // Append any leftover supporters that were not in orderedIds list
    reordered.push(...remaining);

    // Reassign numbers 1..N and geographic state-based mosaic cells
    reordered.forEach((s, idx) => {
      s.supporterNumber = idx + 1;
    });

    const { cells: mappedCells, supporters: mappedSupporters } = distributeSupportersByState(reordered, this.db.mosaicCells);
    this.db.supporters = mappedSupporters;
    this.db.mosaicCells = mappedCells;
    this.addAudit('SUPPORTERS_REORDERED', `Reordered ${reordered.length} supporters.`, 'Admin');
    this.scheduleSave();
    return { success: true, supporters: this.db.supporters };
  }

  public setSupporterNumber(supporterId: string, targetNumber: number): { success: boolean; supporters: Supporter[] } {
    const idx = this.db.supporters.findIndex(s => s.id === supporterId);
    if (idx === -1) return { success: false, supporters: this.db.supporters };

    const [item] = this.db.supporters.splice(idx, 1);
    const targetIdx = Math.max(0, Math.min(this.db.supporters.length, targetNumber - 1));
    this.db.supporters.splice(targetIdx, 0, item);

    // Resequence numbers and geographic state-based mosaic cells
    this.db.supporters.forEach((s, i) => {
      s.supporterNumber = i + 1;
    });

    const { cells: mappedCells, supporters: mappedSupporters } = distributeSupportersByState(this.db.supporters, this.db.mosaicCells);
    this.db.supporters = mappedSupporters;
    this.db.mosaicCells = mappedCells;

    this.addAudit('SUPPORTER_REORDERED', `Moved supporter ${item.fullName} to #${targetNumber}.`, 'Admin', supporterId);
    this.scheduleSave();
    return { success: true, supporters: this.db.supporters };
  }

  // ==========================================
  // INSTAGRAM & SETTINGS OPERATIONS
  // ==========================================

  public updateInstagramStats(stats: Partial<InstagramStats>, updatedBy: string = 'Admin') {
    const current = this.getInstagramStats();
    this.db.instagramStats = {
      ...current,
      ...stats,
      lastUpdated: new Date().toISOString(),
      updatedBy,
      isManual: true
    };
    this.addAudit('INSTAGRAM_STATS_UPDATED', `Updated Instagram stats: ${stats.followerCountFormatted || stats.followerCount} followers`, updatedBy);
    this.scheduleSave();
    return this.db.instagramStats;
  }

  public updateInstagramConfig(config: Partial<InstagramConfig>) {
    const current = this.getInstagramConfig();
    this.db.instagramConfig = {
      ...current,
      ...config
    };
    this.scheduleSave();
    return this.db.instagramConfig;
  }

  public updateInstagramProfile(profile: InstagramProfile) {
    return this.saveInstagramProfile(profile);
  }

  public saveInstagramProfile(profile: Partial<InstagramProfile>): InstagramProfile {
    const current = this.getInstagramProfile();
    const followerCount = profile.followerCount !== undefined ? profile.followerCount : current.followerCount;
    const followerCountFormatted = profile.followerCountFormatted !== undefined ? profile.followerCountFormatted : formatFollowerCount(followerCount);

    this.db.instagramProfile = {
      ...current,
      ...profile,
      followerCount,
      followerCountFormatted,
      lastUpdatedAt: profile.lastUpdatedAt || new Date().toISOString()
    };

    if (this.db.instagramProfile.status === 'SUCCESS' || this.db.instagramProfile.followerCount !== null) {
      this.db.instagramStats = {
        followerCount: this.db.instagramProfile.followerCount,
        followerCountFormatted: this.db.instagramProfile.followerCountFormatted,
        postsCount: this.db.instagramProfile.postsCount,
        followingCount: this.db.instagramProfile.followingCount,
        fullName: this.db.instagramProfile.fullName,
        username: this.db.instagramProfile.username,
        handle: this.db.instagramProfile.handle,
        url: this.db.instagramProfile.url,
        bio: this.db.instagramProfile.bio,
        avatarUrl: this.db.instagramProfile.avatarUrl,
        externalUrl: this.db.instagramProfile.externalUrl,
        posts: this.db.instagramProfile.posts,
        lastUpdated: this.db.instagramProfile.lastUpdatedAt || new Date().toISOString(),
        updatedBy: `Provider (${this.db.instagramProfile.provider || 'apify'})`,
        isManual: false,
        status: this.db.instagramProfile.status,
        provider: this.db.instagramProfile.provider
      };
    }
    this.scheduleSave();
    return this.db.instagramProfile;
  }

  public seedDemoData(demoSupporters: Supporter[]): { success: boolean; count: number } {
    this.db.environment = 'demo';
    const freshCells = generateIndiaMosaicGrid();
    demoSupporters.forEach((sup, idx) => {
      sup.supporterNumber = idx + 1;
      const vacant = freshCells.find(c => !c.supporterId && c.valid);
      if (vacant) {
        vacant.supporterId = sup.id;
        vacant.supporter = sup;
        sup.mapCellId = vacant.cellId;
        sup.mapX = vacant.x;
        sup.mapY = vacant.y;
      }
    });
    this.db.supporters = demoSupporters;
    this.db.mosaicCells = freshCells;
    this.persistSync(this.db);
    return { success: true, count: demoSupporters.length };
  }

  public clearToProduction(): { success: boolean; message: string } {
    this.db.environment = 'production';
    const freshCells = generateIndiaMosaicGrid();
    const realSupporters = this.db.supporters.filter(s => !this.isDummyRecord(s.fullName, s.email));
    realSupporters.forEach((sup, idx) => {
      sup.supporterNumber = idx + 1;
      const vacant = freshCells.find(c => !c.supporterId && c.valid);
      if (vacant) {
        vacant.supporterId = sup.id;
        vacant.supporter = sup;
        sup.mapCellId = vacant.cellId;
        sup.mapX = vacant.x;
        sup.mapY = vacant.y;
      }
    });
    this.db.supporters = realSupporters;
    this.db.mosaicCells = freshCells;
    this.persistSync(this.db);
    return { success: true, message: 'Database reset to clean production mode.' };
  }

  public updateSettings(settings: Partial<DatabaseSchema['settings']>) {
    this.db.settings = {
      ...this.db.settings,
      ...settings
    };
    this.scheduleSave();
    return this.db.settings;
  }

  public recomputeMosaicGrid(): { success: boolean; mosaicCells: MosaicCell[]; supporters: Supporter[] } {
    const freshCells = generateIndiaMosaicGrid();
    const realSupporters = this.db.supporters.filter(s => !this.isDummyRecord(s.fullName, s.email));
    
    // Sort supporters sequentially by supporterNumber
    realSupporters.sort((a, b) => (a.supporterNumber || 0) - (b.supporterNumber || 0));
    realSupporters.forEach((sup, idx) => {
      sup.supporterNumber = idx + 1;
    });

    const { cells: mappedCells, supporters: mappedSupporters } = distributeSupportersByState(realSupporters, freshCells);
    this.db.supporters = mappedSupporters;
    this.db.mosaicCells = mappedCells;
    this.persistSync(this.db);
    return { success: true, mosaicCells: this.db.mosaicCells, supporters: this.db.supporters };
  }

  public getMosaicTopCards(): string[] {
    if (Array.isArray(this.db.mosaicFeaturedSupporterIds) && this.db.mosaicFeaturedSupporterIds.length > 0) {
      return this.db.mosaicFeaturedSupporterIds.slice(0, 10);
    }
    const approved = this.db.supporters.filter(s => s.approved);
    return approved.slice(0, 10).map(s => s.id);
  }

  public setMosaicTopCards(supporterIds: string[]): { success: boolean; mosaicFeaturedSupporterIds: string[] } {
    const validIds = supporterIds.filter(id => Boolean(id && typeof id === 'string'));
    this.db.mosaicFeaturedSupporterIds = validIds.slice(0, 10);
    this.scheduleSave();
    this.addAudit(
      'MOSAIC_TOP_CARDS_UPDATED',
      `Updated top 10 supporter cards arrangement on Mosaic page (${this.db.mosaicFeaturedSupporterIds.length} cards set).`,
      'Admin'
    );
    return { success: true, mosaicFeaturedSupporterIds: this.db.mosaicFeaturedSupporterIds };
  }

  public purgeMockData() {
    this.db = this.loadDatabase();
    return { success: true, count: this.db.supporters.length };
  }
}

export const serverDb = new ServerDatabase();
