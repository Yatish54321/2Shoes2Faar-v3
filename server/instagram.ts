/**
 * Instagram Public Profile Synchronization Engine
 * 
 * Modular Third-Party Integration Architecture:
 * - Uses configured third-party scraper (Apify / ApifyInstagramProvider)
 * - Requires ONLY the public username or Instagram URL (no Meta Developer App or tokens needed)
 * - APIFY_API_TOKEN stays exclusively in backend environment variables
 * - Saves latest successful profile results into persistent database
 * - Periodic background scheduled job refreshes metrics automatically
 * - Fallback to last successful cache if provider fails or rate-limits
 * - Clear NOT_CONFIGURED status if API token is missing, without fake followers
 */

import { serverDb, InstagramProfile, InstagramConfig } from './db';
import { defaultInstagramScraperProvider, normalizeInstagramUsername, NormalizedInstagramPost } from './instagramProvider';

export interface InstagramPublicProfile {
  status: 'SUCCESS' | 'NOT_CONFIGURED' | 'ERROR' | 'CACHED';
  configured: boolean;
  username: string;
  handle: string;
  url: string;
  fullName: string | null;
  profilePicture: string | null;
  avatarUrl: string | null;
  biography: string | null;
  bio: string | null;
  followersCount: number | null;
  followerCount: number | null;
  followerCountFormatted: string | null;
  followsCount: number | null;
  followingCount: number | null;
  postsCount: number | null;
  externalUrl: string | null;
  verified: boolean;
  posts: NormalizedInstagramPost[];
  lastUpdated: string | null;
  lastUpdatedAt: string | null;
  lastSuccessAt: string | null;
  errorMessage: string | null;
  provider: string;
  message: string;
}

let schedulerTimer: NodeJS.Timeout | null = null;
let isFetchingInProgress = false;

/**
 * Formats public-facing message based on profile status and timestamp
 */
function generateStatusMessage(profile: InstagramProfile, configured: boolean): string {
  if (!configured) {
    if (profile.followerCount !== null) {
      return `Showing cached profile. Add APIFY_API_TOKEN in backend environment to enable automatic background sync.`;
    }
    return `Instagram integration is not configured. Add APIFY_API_TOKEN in Settings to enable automatic follower tracking.`;
  }

  if (profile.status === 'SUCCESS') {
    const dateStr = profile.lastUpdatedAt ? new Date(profile.lastUpdatedAt).toLocaleString('en-IN') : 'recently';
    return `Profile synchronized with Apify on ${dateStr}.`;
  }

  if (profile.status === 'ERROR') {
    return profile.errorMessage || 'Failed to fetch latest profile data from scraper provider.';
  }

  return `Profile data loaded from persistent cache.`;
}

/**
 * Returns the currently stored public Instagram profile
 */
export function getInstagramProfile(): InstagramPublicProfile {
  const stored: InstagramProfile = serverDb.getInstagramProfile();
  const configured = defaultInstagramScraperProvider.isConfigured();

  // If token is missing, reflect NOT_CONFIGURED status unless there's a previous success
  let effectiveStatus: 'SUCCESS' | 'NOT_CONFIGURED' | 'ERROR' | 'CACHED' = stored.status;
  if (!configured) {
    effectiveStatus = stored.followerCount !== null ? 'CACHED' : 'NOT_CONFIGURED';
  }

  return {
    status: effectiveStatus,
    configured,
    username: stored.username || '2shoes2faar',
    handle: stored.handle || `@${stored.username || '2shoes2faar'}`,
    url: stored.url || `https://www.instagram.com/${stored.username || '2shoes2faar'}`,
    fullName: stored.fullName,
    profilePicture: stored.avatarUrl,
    avatarUrl: stored.avatarUrl,
    biography: stored.bio,
    bio: stored.bio,
    followersCount: stored.followerCount,
    followerCount: stored.followerCount,
    followerCountFormatted: stored.followerCountFormatted,
    followsCount: stored.followingCount,
    followingCount: stored.followingCount,
    postsCount: stored.postsCount,
    externalUrl: stored.externalUrl || null,
    verified: stored.verified || false,
    posts: stored.posts || [],
    lastUpdated: stored.lastUpdatedAt,
    lastUpdatedAt: stored.lastUpdatedAt,
    lastSuccessAt: stored.lastSuccessAt,
    errorMessage: stored.errorMessage,
    provider: stored.provider || 'apify',
    message: generateStatusMessage(stored, configured)
  };
}

/**
 * Fetches real Instagram profile from Apify and saves into database
 */
export async function syncInstagramProfile(force: boolean = false): Promise<{ success: boolean; profile: InstagramPublicProfile; message: string }> {
  if (isFetchingInProgress) {
    const current = getInstagramProfile();
    return {
      success: false,
      profile: current,
      message: 'A profile synchronization is already in progress. Please wait a moment.'
    };
  }

  const config: InstagramConfig = serverDb.getInstagramConfig();
  const targetUsername = config.targetUsername || normalizeInstagramUsername(config.targetInput || '2shoes2faar');
  const isConfigured = defaultInstagramScraperProvider.isConfigured();

  if (!isConfigured) {
    const profile = getInstagramProfile();
    return {
      success: false,
      profile,
      message: 'APIFY_API_TOKEN is not configured in backend environment variables. Please add APIFY_API_TOKEN in Settings.'
    };
  }

  isFetchingInProgress = true;

  try {
    console.log(`[Instagram Sync] Fetching public profile for @${targetUsername} via Apify...`);
    const result = await defaultInstagramScraperProvider.fetchProfile(targetUsername);

    if (result.success && result.data) {
      const data = result.data;
      const updated = serverDb.saveInstagramProfile({
        status: 'SUCCESS',
        configured: true,
        username: data.username,
        fullName: data.fullName,
        bio: data.bio,
        avatarUrl: data.avatarUrl,
        externalUrl: data.externalUrl || null,
        followerCount: data.followerCount,
        followingCount: data.followingCount,
        postsCount: data.postsCount,
        verified: data.verified,
        posts: data.posts || [],
        provider: 'apify',
        errorMessage: null,
        lastUpdatedAt: new Date().toISOString()
      });

      console.log(`[Instagram Sync] Successfully updated profile for @${data.username} (${data.followerCount} followers).`);

      return {
        success: true,
        profile: getInstagramProfile(),
        message: `Successfully synchronized @${data.username} from Apify (${data.followerCount !== null ? data.followerCount.toLocaleString('en-IN') : 'N/A'} followers).`
      };
    } else {
      console.warn(`[Instagram Sync] Scraper provider error: ${result.error}`);
      // Preserve existing cached profile but record error state
      serverDb.saveInstagramProfile({
        status: 'ERROR',
        errorMessage: result.error || 'Failed to fetch Instagram profile data.',
        lastUpdatedAt: new Date().toISOString()
      });

      return {
        success: false,
        profile: getInstagramProfile(),
        message: result.error || 'Failed to synchronize with Instagram provider.'
      };
    }
  } catch (err: any) {
    console.error('[Instagram Sync] Exception during sync:', err);
    serverDb.saveInstagramProfile({
      status: 'ERROR',
      errorMessage: err.message || String(err),
      lastUpdatedAt: new Date().toISOString()
    });

    return {
      success: false,
      profile: getInstagramProfile(),
      message: err.message || 'An unexpected error occurred during Instagram sync.'
    };
  } finally {
    isFetchingInProgress = false;
  }
}

/**
 * Updates the target Instagram username or public URL and immediately triggers a refresh
 */
export async function updateInstagramTarget(input: string): Promise<{ success: boolean; profile: InstagramPublicProfile; message: string }> {
  if (!input || !input.trim()) {
    return {
      success: false,
      profile: getInstagramProfile(),
      message: 'Please provide a valid Instagram username or profile URL.'
    };
  }

  const normalized = normalizeInstagramUsername(input);
  serverDb.updateInstagramConfig({
    targetInput: input.trim(),
    targetUsername: normalized
  });

  // Automatically update the base profile username
  serverDb.saveInstagramProfile({
    username: normalized,
    handle: `@${normalized}`,
    url: `https://www.instagram.com/${normalized}`
  });

  // If Apify is configured, immediately trigger a fresh fetch
  if (defaultInstagramScraperProvider.isConfigured()) {
    return await syncInstagramProfile(true);
  }

  return {
    success: true,
    profile: getInstagramProfile(),
    message: `Instagram target updated to @${normalized}. To enable automatic live metric fetching, configure APIFY_API_TOKEN in Settings.`
  };
}

/**
 * Starts periodic background scheduler (runs every N minutes)
 */
export function startInstagramAutoRefreshScheduler(intervalMinutes: number = 60) {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
  }

  const intervalMs = Math.max(5, intervalMinutes) * 60 * 1000;
  console.log(`[Instagram Scheduler] Periodic sync scheduled every ${intervalMinutes} minutes.`);

  // Trigger initial fetch on startup if configured and stale (older than interval)
  setTimeout(() => {
    if (defaultInstagramScraperProvider.isConfigured()) {
      const profile = serverDb.getInstagramProfile();
      const lastSuccess = profile.lastSuccessAt ? new Date(profile.lastSuccessAt).getTime() : 0;
      const isStale = (Date.now() - lastSuccess) > intervalMs;
      
      if (isStale) {
        console.log('[Instagram Scheduler] Initial background sync triggering...');
        syncInstagramProfile().catch(e => console.error('[Instagram Scheduler] Initial sync failed:', e));
      }
    }
  }, 3000);

  // Set recurring timer
  schedulerTimer = setInterval(() => {
    if (defaultInstagramScraperProvider.isConfigured()) {
      console.log('[Instagram Scheduler] Periodic background sync starting...');
      syncInstagramProfile().catch(e => console.error('[Instagram Scheduler] Recurring sync error:', e));
    }
  }, intervalMs);
}
