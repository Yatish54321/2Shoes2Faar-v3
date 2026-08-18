import { Supporter, MosaicCell, BookOrder, GoogleSubmission, SiteContent, AuditLog, DeletedSupporterRecord } from '../types';
import { generateIndiaMosaicGrid, distributeSupportersByState } from '../data/indiaGrid';
import { INITIAL_SITE_CONTENT } from '../data/initialContent';

const STORAGE_KEYS = {
  SUPPORTERS: '2shoes_supporters_v2',
  MOSAIC_CELLS: '2shoes_mosaic_cells_v2',
  ORDERS: '2shoes_orders_v2',
  SUBMISSIONS: '2shoes_submissions_v2',
  CONTENT: '2shoes_content_v2',
  AUDIT_LOGS: '2shoes_audit_logs_v2',
  ADMIN_AUTH: '2shoes_admin_auth_token',
  ENV_MODE: '2shoes_env_mode_v2' // 'production' | 'demo'
};

const DUMMY_NAMES_SET = new Set([
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

export interface InstagramPost {
  id: string;
  caption: string;
  mediaUrl: string;
  permalink: string;
  thumbnailUrl?: string | null;
  videoUrl?: string | null;
  alternateMediaUrls?: string[];
  likesCount?: number | null;
  commentsCount?: number | null;
  timestamp?: string | null;
  mediaType?: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | 'REEL' | string;
  isVideo?: boolean;
  shortCode?: string | null;
}

export interface InstagramState {
  status: 'SUCCESS' | 'NOT_CONFIGURED' | 'ERROR' | 'CACHED' | string;
  configured?: boolean;
  username: string;
  handle: string;
  url: string;
  fullName?: string | null;
  profilePicture?: string | null;
  avatarUrl: string | null;
  biography?: string | null;
  bio: string | null;
  followersCount?: number | null;
  followerCount: number | null;
  followerCountFormatted: string | null;
  followsCount?: number | null;
  followingCount?: number | null;
  postsCount: number | null;
  externalUrl?: string | null;
  verified?: boolean;
  posts?: InstagramPost[];
  lastUpdated?: string | null;
  lastUpdatedAt?: string | null;
  lastSuccessAt?: string | null;
  updatedBy?: string;
  isManual?: boolean;
  errorMessage?: string | null;
  provider?: string;
  message?: string;
}

export interface InstagramSettingsResponse {
  success: boolean;
  config: {
    targetInput: string;
    targetUsername: string;
    autoRefreshIntervalMinutes: number;
    lastAttemptAt: string | null;
  };
  isApifyConfigured: boolean;
  profile: InstagramState;
}

export interface SystemStatusData {
  instagram: {
    status: string;
    configured?: boolean;
    provider?: string;
    targetInput?: string;
    targetUsername?: string;
    followerCount: number | null;
    followerCountFormatted: string | null;
    followingCount?: number | null;
    postsCount: number | null;
    username: string;
    handle: string;
    fullName?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
    lastUpdated?: string | null;
    lastSuccessAt?: string | null;
    errorMessage?: string | null;
    updatedBy?: string;
    isManual?: boolean;
    message?: string;
  };
  googleForm: {
    status: string;
    formUrl: string;
    webhookUrl: string;
    webhookSecret: string;
    totalSubmissions: number;
    pendingReviewCount: number;
    processedCount: number;
    lastSyncedAt: string | null;
  };
  database: {
    status: string;
    environment: 'production' | 'demo';
    totalSupporters: number;
    approvedFeaturedSupporters: number;
    maxCapacity: number;
    totalOrders: number;
  };
  storage: {
    status: string;
    engine: string;
  };
}

class DataService {
  private supporters: Supporter[] = [];
  private mosaicCells: MosaicCell[] = [];
  private orders: BookOrder[] = [];
  private submissions: GoogleSubmission[] = [];
  private content: SiteContent = INITIAL_SITE_CONTENT;
  private auditLogs: AuditLog[] = [];
  private envMode: 'production' | 'demo' = 'production';
  private instagramState: InstagramState | null = null;
  private initialized: boolean = false;

  constructor() {
    this.init();
  }

  private async init() {
    if (this.initialized) return;

    // Load content
    try {
      const storedContent = localStorage.getItem(STORAGE_KEYS.CONTENT);
      this.content = storedContent ? JSON.parse(storedContent) : INITIAL_SITE_CONTENT;
    } catch {
      this.content = INITIAL_SITE_CONTENT;
    }

    // Load environment mode
    try {
      const storedMode = localStorage.getItem(STORAGE_KEYS.ENV_MODE);
      if (storedMode === 'demo' || storedMode === 'production') {
        this.envMode = storedMode;
      }
    } catch {
      this.envMode = 'production';
    }

    // Initialize 1,000 Mosaic Grid
    this.mosaicCells = generateIndiaMosaicGrid();

    // Try fetching live data from backend
    await this.syncWithBackend();

    this.initialized = true;
  }

  /**
   * Syncs with backend API
   */
  public async syncWithBackend(): Promise<void> {
    try {
      const [mosaicRes, supportersRes, instaRes] = await Promise.allSettled([
        fetch('/api/public/mosaic'),
        fetch('/api/public/supporters'),
        fetch('/api/instagram/profile')
      ]);

      if (mosaicRes.status === 'fulfilled' && mosaicRes.value.ok) {
        const json = await mosaicRes.value.json();
        if (json.cells && Array.isArray(json.cells)) {
          this.mosaicCells = json.cells;
          this.saveMosaicCells();
        }
      }

      if (supportersRes.status === 'fulfilled' && supportersRes.value.ok) {
        const json = await supportersRes.value.json();
        if (json.supporters && Array.isArray(json.supporters)) {
          this.supporters = json.supporters;
          this.saveSupporters();
        }
      }

      // Ensure every cell with a supporterId has its supporter object attached
      if (this.supporters.length > 0 && this.mosaicCells.length > 0) {
        const supMap = new Map(this.supporters.map(s => [s.id, s]));
        this.mosaicCells.forEach(cell => {
          if (cell.supporterId && !cell.supporter && supMap.has(cell.supporterId)) {
            cell.supporter = supMap.get(cell.supporterId);
          }
        });
      }

      if (instaRes.status === 'fulfilled' && instaRes.value.ok) {
        const json: InstagramState = await instaRes.value.json();
        this.instagramState = json;
      }
    } catch (err) {
      console.warn('[DataService] Offline or fallback to local store:', err);
      this.loadFromLocalStorage();
    }
  }

  private loadFromLocalStorage() {
    try {
      const storedSupporters = localStorage.getItem(STORAGE_KEYS.SUPPORTERS);
      if (storedSupporters) {
        const parsed = JSON.parse(storedSupporters);
        if (Array.isArray(parsed)) {
          // Filter out dummy names
          this.supporters = parsed.filter(s => {
            const norm = (s.fullName || '').trim().toLowerCase();
            return !DUMMY_NAMES_SET.has(norm);
          });
        }
      } else {
        this.supporters = [];
      }

      const storedCells = localStorage.getItem(STORAGE_KEYS.MOSAIC_CELLS);
      const expectedFresh = generateIndiaMosaicGrid();
      if (storedCells) {
        try {
          const parsed = JSON.parse(storedCells);
          if (Array.isArray(parsed) && parsed.length === expectedFresh.length) {
            this.mosaicCells = parsed;
          } else {
            this.mosaicCells = expectedFresh;
          }
        } catch {
          this.mosaicCells = expectedFresh;
        }
      } else {
        this.mosaicCells = expectedFresh;
      }

      const storedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
      this.orders = storedOrders ? JSON.parse(storedOrders) : [];

      const storedSubmissions = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
      this.submissions = storedSubmissions ? JSON.parse(storedSubmissions) : [];

      const storedLogs = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      this.auditLogs = storedLogs ? JSON.parse(storedLogs) : [];
    } catch (e) {
      console.error('[DataService] Error loading local storage:', e);
    }
  }

  private distributeSupportersToGrid() {
    const { cells, supporters } = distributeSupportersByState(this.supporters, this.mosaicCells);
    this.mosaicCells = cells;
    this.supporters = supporters;
  }

  // ============================================================================
  // PUBLIC GETTERS
  // ============================================================================

  public getSupporters(): Supporter[] {
    return this.supporters;
  }

  public getMosaicCells(): MosaicCell[] {
    return this.mosaicCells;
  }

  public getOrders(): BookOrder[] {
    return this.orders;
  }

  public getSubmissions(): GoogleSubmission[] {
    return this.submissions;
  }

  public getContent(): SiteContent {
    return this.content;
  }

  public getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }

  public getEnvironmentMode(): 'production' | 'demo' {
    return this.envMode;
  }

  public getApprovedFeaturedCount(): number {
    return this.supporters.filter(s => s.approved && s.featured).length;
  }

  // ============================================================================
  // INSTAGRAM INTEGRATION API (MODULAR APIFY / THIRD-PARTY SCRAPER)
  // ============================================================================

  public async getInstagramStats(forceRefresh: boolean = false): Promise<InstagramState> {
    return this.getInstagramProfile(forceRefresh);
  }

  public async getInstagramProfile(forceRefresh: boolean = false): Promise<InstagramState> {
    try {
      const res = await fetch(`/api/instagram/stats${forceRefresh ? '?refresh=true' : ''}`);
      if (res.ok) {
        const data: InstagramState = await res.json();
        this.instagramState = data;
        return data;
      }
    } catch (e) {
      console.error('[DataService] Instagram profile fetch error:', e);
    }

    if (this.instagramState) return this.instagramState;

    return {
      status: 'NOT_CONFIGURED',
      configured: false,
      username: '2shoes2faar',
      handle: '@2shoes2faar',
      url: 'https://www.instagram.com/2shoes2faar',
      followerCount: null,
      followerCountFormatted: null,
      postsCount: null,
      bio: null,
      avatarUrl: null,
      lastUpdated: null,
      provider: 'apify',
      message: 'Instagram integration is not configured. Set APIFY_API_TOKEN in backend environment.'
    };
  }

  public async getInstagramSettings(): Promise<InstagramSettingsResponse | null> {
    try {
      const res = await fetch('/api/admin/instagram/settings');
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error('[DataService] Error fetching Instagram settings:', e);
    }
    return null;
  }

  public async updateInstagramTarget(targetInput: string): Promise<{ success: boolean; profile?: InstagramState; message: string }> {
    try {
      const res = await fetch('/api/admin/instagram/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetInput })
      });
      const json = await res.json();
      if (json.profile) {
        this.instagramState = json.profile;
      }
      return json;
    } catch (e: any) {
      console.error('[DataService] Error updating Instagram target:', e);
      return { success: false, message: e.message || 'Network error updating target' };
    }
  }

  public async refreshInstagramNow(): Promise<{ success: boolean; profile?: InstagramState; message: string }> {
    try {
      const res = await fetch('/api/admin/instagram/refresh', {
        method: 'POST'
      });
      const json = await res.json();
      if (json.profile) {
        this.instagramState = json.profile;
      }
      return json;
    } catch (e: any) {
      console.error('[DataService] Error refreshing Instagram:', e);
      return { success: false, message: e.message || 'Network error refreshing profile' };
    }
  }

  public async updateInstagramFollowers(followerCount: number, options?: { postsCount?: number; bio?: string; updatedBy?: string }): Promise<{ success: boolean; profile?: InstagramState; message: string }> {
    try {
      const res = await fetch('/api/admin/instagram/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          followerCount,
          postsCount: options?.postsCount,
          bio: options?.bio,
          updatedBy: options?.updatedBy || 'Owner (Veer)'
        })
      });

      const json = await res.json();
      if (res.ok && json.profile) {
        this.instagramState = json.profile;
        return { success: true, profile: json.profile, message: json.message };
      }
      return { success: false, message: json.message || 'Failed to update follower count' };
    } catch (e: any) {
      console.error('[DataService] Error updating Instagram followers:', e);
      return { success: false, message: e.message || 'Network error' };
    }
  }

  // ============================================================================
  // SYSTEM STATUS HEALTH CHECK
  // ============================================================================

  public async getSystemStatus(): Promise<SystemStatusData> {
    try {
      const res = await fetch('/api/admin/system-status');
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error('[DataService] System status fetch error:', e);
    }

    const approved = this.getApprovedFeaturedCount();
    return {
      instagram: this.instagramState || {
        status: 'NOT_CONFIGURED',
        username: '2shoes2faar',
        handle: '@2shoes2faar',
        url: 'https://www.instagram.com/2shoes2faar',
        followerCount: null,
        followerCountFormatted: null,
        postsCount: null,
        bio: 'Solo traveller across 28 Indian States in 28 Weeks 🇮🇳 • Author of "India - 28 States in 28 Weeks" 📖',
        avatarUrl: null,
        lastUpdated: new Date().toISOString(),
        updatedBy: 'System',
        isManual: false,
        message: 'Instagram integration connected via Apify.'
      },
      googleForm: {
        status: 'CONNECTED',
        formUrl: 'https://forms.gle/Nj13LtV9ATqHt8EJA',
        webhookUrl: `${window.location.origin}/api/integrations/google-form/webhook`,
        webhookSecret: 'veer_2shoes2faar_secret_2026',
        totalSubmissions: this.submissions.length,
        pendingReviewCount: this.submissions.filter(s => s.syncStatus === 'pending_review').length,
        processedCount: this.submissions.filter(s => s.syncStatus === 'processed').length,
        lastSyncedAt: new Date().toISOString()
      },
      database: {
        status: 'CONNECTED',
        environment: this.envMode,
        totalSupporters: this.supporters.length,
        approvedFeaturedSupporters: approved,
        maxCapacity: 1000,
        totalOrders: this.orders.length
      },
      storage: {
        status: 'CONNECTED',
        engine: 'Local Persistent Store'
      }
    };
  }

  public async fetchAdminSubmissions(): Promise<GoogleSubmission[]> {
    try {
      const res = await fetch('/api/admin/submissions');
      if (res.ok) {
        const json = await res.json();
        if (json.submissions) {
          this.submissions = json.submissions;
          this.saveSubmissions();
          return this.submissions;
        }
      }
    } catch (e) {
      console.error('[DataService] Error fetching admin submissions:', e);
    }
    return this.submissions;
  }

  public async syncFromGoogleWebApp(webAppUrl?: string): Promise<{ success: boolean; message: string; count?: number }> {
    try {
      const res = await fetch('/api/integrations/google-form/fetch-webapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webAppUrl })
      });
      const data = await res.json();
      if (data.success) {
        await this.syncWithBackend();
        return { success: true, message: data.message, count: data.count };
      } else {
        return { success: false, message: data.message || 'Failed to pull from Google Web App.' };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error connecting to backend.' };
    }
  }

  public async importGoogleSheetBatch(rows: any[]): Promise<{ success: boolean; message: string; count?: number; supporters?: Supporter[] }> {
    try {
      const res = await fetch('/api/integrations/google-form/sync-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows })
      });
      const data = await res.json();
      if (data.success) {
        await this.syncWithBackend();
        return { success: true, message: data.message, count: data.count, supporters: data.supporters };
      } else {
        return { success: false, message: data.message || 'Failed to import sheet rows.' };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error connecting to backend.' };
    }
  }

  public async syncGoogleSheetByUrl(sheetUrl: string): Promise<{ success: boolean; message: string; count?: number; supporters?: Supporter[] }> {
    try {
      const res = await fetch('/api/integrations/google-sheet/sync-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheetUrl })
      });
      const data = await res.json();
      if (data.success) {
        await this.syncWithBackend();
        return { success: true, message: data.message, count: data.count, supporters: data.supporters };
      } else {
        return { success: false, message: data.message || 'Failed to sync Google Sheet URL.' };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error connecting to backend.' };
    }
  }

  // ============================================================================
  // PRE-ORDER & SUBMISSION PROCESSING
  // ============================================================================

  public async submitPreOrder(formData: {
    fullName: string;
    email: string;
    whatsappNumber: string;
    city: string;
    state: string;
    pinCode: string;
    deliveryAddress: string;
    instagramHandle?: string;
    featuredPreference: boolean;
    travelComment?: string;
    photoUrl?: string;
    paymentProofUrl?: string;
    paymentRefNumber?: string;
  }): Promise<{ success: boolean; submissionId?: string; orderId?: string; message?: string }> {
    try {
      const res = await fetch('/api/public/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.success) {
        await this.syncWithBackend();
        return { success: true, submissionId: json.submissionId, orderId: json.orderId };
      } else {
        return {
          success: false,
          message: json?.message || 'Failed to submit pre-order. Please verify all details and try again.'
        };
      }
    } catch (e: any) {
      console.error('[DataService] Submit pre-order fetch error:', e);
      return {
        success: false,
        message: e?.message || 'Network error connecting to server. Please try again.'
      };
    }
  }

  public async approveSubmission(submissionId: string, options?: {
    customComment?: string;
    customPhotoUrl?: string;
    assignedCellId?: string;
  }): Promise<{ success: boolean; message: string; supporter?: Supporter }> {
    try {
      const res = await fetch(`/api/admin/submissions/${submissionId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options || {})
      });
      const json = await res.json();
      if (res.ok) {
        await this.syncWithBackend();
        await this.fetchAdminSubmissions();
        return json;
      }
      return { success: false, message: json.message || 'Failed to approve submission' };
    } catch (e: any) {
      console.error('[DataService] Approve submission error:', e);
      return { success: false, message: e.message || 'Error communicating with server' };
    }
  }

  public async rejectSubmission(submissionId: string, reason?: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`/api/admin/submissions/${submissionId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      const json = await res.json();
      if (res.ok) {
        await this.fetchAdminSubmissions();
        return json;
      }
      return { success: false, message: json.message || 'Failed to reject' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Error rejecting submission' };
    }
  }

  public async updateSupporter(id: string, updates: Partial<Supporter>): Promise<{ success: boolean; supporter?: Supporter }> {
    try {
      const res = await fetch(`/api/admin/supporters/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const json = await res.json();
        await this.syncWithBackend();
        return json;
      }
    } catch (e) {
      console.error('[DataService] Update supporter error:', e);
    }

    const sup = this.supporters.find(s => s.id === id);
    if (sup) {
      Object.assign(sup, updates);
      this.saveSupporters();
      return { success: true, supporter: sup };
    }
    return { success: false };
  }

  public async toggleSupporterPaymentVerified(id: string, verified?: boolean): Promise<{ success: boolean; supporter?: Supporter; message?: string }> {
    try {
      const res = await fetch(`/api/admin/supporters/${id}/toggle-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified })
      });
      if (res.ok) {
        const json = await res.json();
        await this.syncWithBackend();
        return json;
      }
    } catch (e) {
      console.error('[DataService] Toggle payment error:', e);
    }

    const sup = this.supporters.find(s => s.id === id);
    if (sup) {
      sup.paymentVerified = verified !== undefined ? verified : !sup.paymentVerified;
      sup.paymentVerifiedAt = sup.paymentVerified ? new Date().toISOString() : undefined;
      this.saveSupporters();
      return { success: true, supporter: sup };
    }
    return { success: false, message: 'Supporter not found' };
  }

  public async moveSupporterCell(supporterId: string, targetCellId: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`/api/admin/supporters/${supporterId}/move-cell`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetCellId })
      });
      const json = await res.json();
      if (res.ok) {
        await this.syncWithBackend();
        return json;
      }
    } catch (e) {
      console.error('[DataService] Move cell error:', e);
    }
    return { success: false, message: 'Failed to move cell' };
  }

  public async deleteSupporter(supporterId: string, resequence: boolean = true): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`/api/admin/supporters/${supporterId}?resequence=${resequence}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      if (res.ok) {
        await this.syncWithBackend();
        return json;
      }
      return { success: false, message: json.message || 'Failed to delete supporter' };
    } catch (e: any) {
      console.error('[DataService] Delete supporter error:', e);
      return { success: false, message: e.message || 'Error communicating with server' };
    }
  }

  public async deleteSubmission(submissionId: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`/api/admin/submissions/${submissionId}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      if (res.ok) {
        await this.fetchAdminSubmissions();
        return json;
      }
      return { success: false, message: json.message || 'Failed to delete submission' };
    } catch (e: any) {
      console.error('[DataService] Delete submission error:', e);
      return { success: false, message: e.message || 'Error communicating with server' };
    }
  }

  public async reorderSupporters(orderedIds: string[]): Promise<{ success: boolean; supporters?: Supporter[]; message?: string }> {
    try {
      const res = await fetch('/api/admin/supporters/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds })
      });
      const json = await res.json();
      if (res.ok) {
        await this.syncWithBackend();
        return json;
      }
      return { success: false, message: json.message || 'Failed to reorder supporters' };
    } catch (e: any) {
      console.error('[DataService] Reorder supporters error:', e);
      return { success: false, message: e.message || 'Error communicating with server' };
    }
  }

  public async setSupporterNumber(supporterId: string, newNumber: number): Promise<{ success: boolean; supporters?: Supporter[]; message?: string }> {
    try {
      const res = await fetch(`/api/admin/supporters/${supporterId}/set-number`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newNumber })
      });
      const json = await res.json();
      if (res.ok) {
        await this.syncWithBackend();
        return json;
      }
      return { success: false, message: json.message || 'Failed to change supporter sequence' };
    } catch (e: any) {
      console.error('[DataService] Set supporter number error:', e);
      return { success: false, message: e.message || 'Error communicating with server' };
    }
  }

  public async removeSupporterFromMap(supporterId: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`/api/admin/supporters/${supporterId}/remove-from-map`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await this.syncWithBackend();
        return { success: true, message: 'Removed from map' };
      }
    } catch (e) {
      console.error('[DataService] Remove from map error:', e);
    }
    return { success: false, message: 'Failed to remove from map' };
  }

  // ============================================================================
  // RECYCLE BIN OPERATIONS
  // ============================================================================

  public async getRecycleBin(): Promise<DeletedSupporterRecord[]> {
    try {
      const res = await fetch('/api/admin/recycle-bin');
      if (res.ok) {
        const json = await res.json();
        return Array.isArray(json.records) ? json.records : [];
      }
    } catch (e) {
      console.error('[DataService] Get recycle bin error:', e);
    }
    return [];
  }

  public async restoreSupporter(deletedRecordIdOrSupporterId: string): Promise<{ success: boolean; message: string; supporter?: Supporter }> {
    try {
      const res = await fetch(`/api/admin/recycle-bin/${deletedRecordIdOrSupporterId}/restore`, {
        method: 'POST'
      });
      const json = await res.json();
      if (res.ok) {
        await this.syncWithBackend();
        await this.fetchAdminSubmissions();
        return json;
      }
      return { success: false, message: json.message || 'Failed to restore supporter' };
    } catch (e: any) {
      console.error('[DataService] Restore supporter error:', e);
      return { success: false, message: e.message || 'Error communicating with server' };
    }
  }

  public async purgeDeletedRecord(deletedRecordId: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`/api/admin/recycle-bin/${deletedRecordId}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      if (res.ok) {
        await this.syncWithBackend();
        return json;
      }
      return { success: false, message: json.message || 'Failed to purge record' };
    } catch (e: any) {
      console.error('[DataService] Purge deleted record error:', e);
      return { success: false, message: e.message || 'Error communicating with server' };
    }
  }

  public async emptyRecycleBin(): Promise<{ success: boolean; message: string; count?: number }> {
    try {
      const res = await fetch('/api/admin/recycle-bin', {
        method: 'DELETE'
      });
      const json = await res.json();
      if (res.ok) {
        await this.syncWithBackend();
        return json;
      }
      return { success: false, message: json.message || 'Failed to empty recycle bin' };
    } catch (e: any) {
      console.error('[DataService] Empty recycle bin error:', e);
      return { success: false, message: e.message || 'Error communicating with server' };
    }
  }

  public async toggleEnvironmentMode(mode: 'production' | 'demo'): Promise<{ success: boolean; count?: number }> {
    this.envMode = mode;
    localStorage.setItem(STORAGE_KEYS.ENV_MODE, mode);

    try {
      const url = mode === 'demo' ? '/api/admin/seed-demo' : '/api/admin/clear-demo';
      const res = await fetch(url, { method: 'POST' });
      if (res.ok) {
        await this.syncWithBackend();
        await this.fetchAdminSubmissions();
        return { success: true };
      }
    } catch (e) {
      console.error('[DataService] Toggle env mode error:', e);
    }

    this.supporters = [];
    this.mosaicCells = generateIndiaMosaicGrid();

    this.saveSupporters();
    this.saveMosaicCells();
    return { success: true };
  }

  public async getGoogleAppsScriptCode(): Promise<string> {
    try {
      const res = await fetch('/api/integrations/google-form/apps-script');
      if (res.ok) {
        return await res.text();
      }
    } catch (e) {
      console.error('[DataService] Apps script fetch error:', e);
    }
    return `// Failed to load live script. Check backend connection.`;
  }

  public async sendTestWebhookSubmission(testData?: Partial<GoogleSubmission>): Promise<any> {
    const payload = {
      timestamp: new Date().toISOString(),
      email: testData?.email || 'veer.supporter@gmail.com',
      fullName: testData?.fullName || 'Aarav Sharma',
      whatsappNumber: testData?.whatsappNumber || '+91 98450 12345',
      instagramHandle: testData?.instagramHandle || '@aarav_roads',
      city: testData?.city || 'Jaipur',
      state: testData?.state || 'Rajasthan',
      pinCode: testData?.pinCode || '302001',
      featuredPreference: testData?.featuredPreference || 'Yes, feature me on India map',
      travelPhilosophy: testData?.travelPhilosophy || 'Rajasthan’s desert forts taught me timeless endurance.',
      deliveryAddress: testData?.deliveryAddress || 'C-14, Civil Lines, Jaipur, Rajasthan 302001',
      photoUrl: testData?.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      paymentProofUrl: testData?.paymentProofUrl || 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=400&q=80'
    };

    const res = await fetch('/api/integrations/google-form/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': 'veer_2shoes2faar_secret_2026'
      },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    await this.fetchAdminSubmissions();
    await this.syncWithBackend();
    return json;
  }

  // ============================================================================
  // ADMIN AUTHENTICATION STATE (Shared across session & pages)
  // ============================================================================

  public isAdminAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return (
      sessionStorage.getItem('veer_admin_auth') === 'true' ||
      localStorage.getItem('veer_admin_auth') === 'true'
    );
  }

  public setAdminAuthenticated(auth: boolean) {
    if (typeof window === 'undefined') return;
    if (auth) {
      sessionStorage.setItem('veer_admin_auth', 'true');
      localStorage.setItem('veer_admin_auth', 'true');
    } else {
      sessionStorage.removeItem('veer_admin_auth');
      localStorage.removeItem('veer_admin_auth');
    }
    // Dispatch custom event for instant reactivity across components
    window.dispatchEvent(new CustomEvent('admin_auth_changed', { detail: { isAuthenticated: auth } }));
  }

  // ============================================================================
  // MOSAIC TOP 10 SUPPORTER CARDS (Mosaic Page Community Section Only)
  // ============================================================================

  public async getMosaicTopCards(): Promise<string[]> {
    try {
      const res = await fetch('/api/public/mosaic-top-cards');
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.mosaicFeaturedSupporterIds)) {
          return json.mosaicFeaturedSupporterIds.slice(0, 10);
        }
      }
    } catch (e) {
      console.warn('[DataService] Failed to fetch custom mosaic top cards:', e);
    }
    // Fallback: Return first 10 approved supporters
    return this.supporters.filter(s => s.approved).slice(0, 10).map(s => s.id);
  }

  public async setMosaicTopCards(supporterIds: string[]): Promise<{ success: boolean; mosaicFeaturedSupporterIds: string[] }> {
    const res = await fetch('/api/admin/mosaic-top-cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ supporterIds })
    });
    if (!res.ok) {
      throw new Error('Failed to save mosaic top cards arrangement.');
    }
    const json = await res.json();
    return json;
  }

  // ============================================================================
  // LOCAL STORAGE PERSISTENCE
  // ============================================================================

  public saveSupporters() {
    try {
      localStorage.setItem(STORAGE_KEYS.SUPPORTERS, JSON.stringify(this.supporters));
    } catch (e) {
      console.warn('[DataService] Storage quota error saving supporters', e);
    }
  }

  public saveMosaicCells() {
    try {
      localStorage.setItem(STORAGE_KEYS.MOSAIC_CELLS, JSON.stringify(this.mosaicCells));
    } catch (e) {
      console.warn('[DataService] Storage quota error saving mosaic cells', e);
    }
  }

  public saveOrders() {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(this.orders));
    } catch (e) {
      console.warn('[DataService] Storage quota error saving orders', e);
    }
  }

  public saveSubmissions() {
    try {
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(this.submissions));
    } catch (e) {
      console.warn('[DataService] Storage quota error saving submissions', e);
    }
  }

  public saveContent(content: SiteContent) {
    this.content = content;
    try {
      localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(this.content));
    } catch (e) {
      console.warn('[DataService] Storage quota error saving content', e);
    }
  }

  public addAudit(action: string, details: string, performedBy: string = 'Admin', targetId?: string) {
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      action,
      details,
      performedBy,
      timestamp: new Date().toISOString(),
      targetId
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 200) this.auditLogs.pop();
    try {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(this.auditLogs));
    } catch (e) {
      console.warn('[DataService] Storage quota error saving audit logs', e);
    }
  }
}

export const api = new DataService();
