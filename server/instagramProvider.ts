/**
 * Modular Third-Party Instagram Data Provider Service
 * 
 * Primary Provider: Apify (e.g., apify/instagram-profile-scraper)
 * - Exclusively executed on the server-side.
 * - APIFY_API_TOKEN is stored securely in environment variables and NEVER exposed to frontend.
 * - Extracts and normalizes username from handles or public URLs.
 * - Pluggable architecture allowing seamless swap with other providers in the future.
 */

export interface NormalizedInstagramPost {
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

export interface NormalizedProfileData {
  username: string;
  fullName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  followerCount: number | null;
  followingCount: number | null;
  postsCount: number | null;
  url: string;
  externalUrl?: string | null;
  verified: boolean;
  posts: NormalizedInstagramPost[];
}

export interface ProviderFetchResult {
  success: boolean;
  provider: string;
  configured: boolean;
  data?: NormalizedProfileData;
  error?: string;
  statusCode?: number;
  rawResponseSnippet?: string;
}

/**
 * Parses an individual Instagram post from various Apify scraper schemas
 */
function normalizePostItem(raw: any, defaultUsername: string): NormalizedInstagramPost | null {
  if (!raw || typeof raw !== 'object') return null;
  const node = raw.node || raw;

  const shortCode = node.shortCode || node.shortcode || node.code || (node.url ? node.url.match(/\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/)?.[1] : null);
  const id = String(node.id || shortCode || Math.random().toString(36).substring(2));

  // Extract caption safely
  let caption = '';
  if (typeof node.caption === 'string') {
    caption = node.caption;
  } else if (node.caption && typeof node.caption.text === 'string') {
    caption = node.caption.text;
  } else if (typeof node.text === 'string') {
    caption = node.text;
  } else if (typeof node.title === 'string') {
    caption = node.title;
  } else if (node.edge_media_to_caption?.edges?.[0]?.node?.text) {
    caption = node.edge_media_to_caption.edges[0].node.text;
  }

  // Gather all potential media URLs (highest quality first)
  const candidateMediaUrls: string[] = [];
  
  if (Array.isArray(node.display_resources) && node.display_resources.length > 0) {
    // Sorted by resolution descending
    const sorted = [...node.display_resources].sort((a, b) => (b.config_width || 0) - (a.config_width || 0));
    sorted.forEach(r => { if (r?.src) candidateMediaUrls.push(r.src); });
  }

  if (node.displayUrl) candidateMediaUrls.push(node.displayUrl);
  if (node.display_url) candidateMediaUrls.push(node.display_url);
  if (node.imageUrl) candidateMediaUrls.push(node.imageUrl);
  if (node.image_url) candidateMediaUrls.push(node.image_url);

  if (Array.isArray(node.images) && node.images.length > 0) {
    node.images.forEach((img: any) => {
      const u = typeof img === 'string' ? img : img?.url;
      if (u) candidateMediaUrls.push(u);
    });
  }

  if (node.thumbnail_src) candidateMediaUrls.push(node.thumbnail_src);
  if (node.thumbnailUrl) candidateMediaUrls.push(node.thumbnailUrl);
  if (node.mediaUrl) candidateMediaUrls.push(node.mediaUrl);

  const uniqueMediaUrls = Array.from(new Set(candidateMediaUrls.filter(Boolean)));
  const primaryMediaUrl = uniqueMediaUrls[0] || node.videoUrl || node.video_url || '';

  // Extract video URL if available
  const videoUrl = node.videoUrl || 
    node.video_url || 
    (Array.isArray(node.video_versions) && node.video_versions.length > 0 ? node.video_versions[0]?.url : null) ||
    null;

  // Construct valid Instagram permalink
  const permalink = node.url ||
    node.permalink ||
    node.postUrl ||
    (shortCode ? `https://www.instagram.com/p/${shortCode}/` : `https://www.instagram.com/${defaultUsername}/`);

  // Detect media type and video/reel indicators
  const isVideo = Boolean(
    node.isVideo ||
    node.is_video ||
    node.type === 'Video' ||
    node.type === 'video' ||
    node.productType === 'clips' ||
    videoUrl ||
    node.__typename === 'GraphVideo' ||
    (typeof node.url === 'string' && node.url.includes('/reel/'))
  );

  let mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | 'REEL' | string = isVideo ? 'VIDEO' : 'IMAGE';
  if (node.type === 'Sidecar' || node.type === 'Carousel' || node.__typename === 'GraphSidecar' || (Array.isArray(node.images) && node.images.length > 1)) {
    mediaType = 'CAROUSEL_ALBUM';
  } else if (isVideo || node.type === 'Video' || node.productType === 'clips' || (typeof node.url === 'string' && node.url.includes('/reel/'))) {
    mediaType = 'REEL';
  }

  // Extract interaction counters if available
  const likesRaw = node.likesCount ?? node.likes ?? node.edge_media_preview_like?.count ?? node.edge_liked_by?.count;
  const likesCount = typeof likesRaw === 'number' ? likesRaw : (likesRaw ? parseInt(String(likesRaw), 10) : null);

  const commentsRaw = node.commentsCount ?? node.comments ?? node.edge_media_to_comment?.count;
  const commentsCount = typeof commentsRaw === 'number' ? commentsRaw : (commentsRaw ? parseInt(String(commentsRaw), 10) : null);

  // Extract timestamp
  let timestamp: string | null = null;
  if (node.timestamp) {
    timestamp = typeof node.timestamp === 'string' ? node.timestamp : new Date(node.timestamp).toISOString();
  } else if (node.taken_at_timestamp) {
    timestamp = new Date(node.taken_at_timestamp * 1000).toISOString();
  } else if (node.takenAt) {
    timestamp = new Date(node.takenAt).toISOString();
  }

  if (!primaryMediaUrl && !permalink && !videoUrl) return null;

  return {
    id,
    caption: String(caption).trim(),
    mediaUrl: String(primaryMediaUrl),
    permalink: String(permalink),
    thumbnailUrl: node.thumbnailUrl || node.thumbnail_src || primaryMediaUrl,
    videoUrl: videoUrl ? String(videoUrl) : null,
    alternateMediaUrls: uniqueMediaUrls.slice(1),
    likesCount,
    commentsCount,
    timestamp,
    mediaType,
    isVideo,
    shortCode: shortCode || null
  };
}

/**
 * Robust Instagram username extractor and normalizer.
 * Supports:
 * - "2shoes2faar"
 * - "@2shoes2faar"
 * - "https://www.instagram.com/2shoes2faar/"
 * - "https://instagram.com/2shoes2faar?igsh=..."
 * - "instagram.com/2shoes2faar"
 */
export function normalizeInstagramUsername(input: string): string {
  if (!input) return '2shoes2faar';
  let cleaned = input.trim();

  // Strip query parameters and anchors
  cleaned = cleaned.split('?')[0].split('#')[0];

  // Check URL patterns
  const urlMatch = cleaned.match(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9._]+)/i);
  if (urlMatch && urlMatch[1]) {
    cleaned = urlMatch[1];
  }

  // Strip leading '@' or slashes
  cleaned = cleaned.replace(/^[@/]+/, '').replace(/[/]+$/, '');

  // Keep valid Instagram username characters (letters, numbers, periods, underscores)
  cleaned = cleaned.toLowerCase().trim();
  return cleaned || '2shoes2faar';
}

export interface IInstagramScraperProvider {
  name: string;
  isConfigured(): boolean;
  fetchProfile(username: string): Promise<ProviderFetchResult>;
}

/**
 * Apify Instagram Scraper Provider
 * Calls Apify actor (default: apify/instagram-profile-scraper or customizable via APIFY_ACTOR_ID)
 */
export class ApifyInstagramProvider implements IInstagramScraperProvider {
  public name = 'apify';

  public isConfigured(): boolean {
    const token = process.env.APIFY_API_TOKEN?.trim();
    return Boolean(token && token.length > 5);
  }

  public async fetchProfile(rawInput: string): Promise<ProviderFetchResult> {
    const token = process.env.APIFY_API_TOKEN?.trim();
    const rawActorId = process.env.APIFY_ACTOR_ID?.trim() || 'apify/instagram-scraper';
    // Normalize apify/instagram-scraper to apify~instagram-scraper for Apify REST API
    const actorId = rawActorId.includes('/') ? rawActorId.replace('/', '~') : rawActorId;
    const username = normalizeInstagramUsername(rawInput);

    if (!token) {
      return {
        success: false,
        provider: this.name,
        configured: false,
        error: 'APIFY_API_TOKEN is not configured in backend environment variables. Please add APIFY_API_TOKEN in Settings.'
      };
    }

    console.log(`[Apify Provider] Initiating profile fetch for Instagram user: @${username} using actor: ${actorId}...`);

    try {
      // Use synchronous run & dataset retrieval endpoint with 45s timeout
      const endpoint = `https://api.apify.com/v2/acts/${encodeURIComponent(actorId)}/run-sync-get-dataset-items?token=${encodeURIComponent(token)}&timeout=45`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 50000);

      const requestBody = {
        usernames: [username],
        profiles: [username],
        directUrls: [`https://www.instagram.com/${username}/`],
        resultsType: 'details',
        resultsLimit: 12
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error(`[Apify Provider] HTTP ${response.status} Error:`, errorText);
        return {
          success: false,
          provider: this.name,
          configured: true,
          statusCode: response.status,
          error: `Apify API returned HTTP ${response.status}: ${errorText.slice(0, 200)}`,
          rawResponseSnippet: errorText.slice(0, 300)
        };
      }

      const json: any = await response.json();
      const items: any[] = Array.isArray(json) ? json : (json.items || [json]);

      if (!items || items.length === 0 || !items[0]) {
        return {
          success: false,
          provider: this.name,
          configured: true,
          error: `No profile data returned for Instagram user @${username}. Profile may be private or username does not exist.`
        };
      }

      // Find the main profile object (either item 0 or item with followersCount / biography)
      const profileItem = items.find(it => it && (it.followersCount !== undefined || it.followers !== undefined || it.biography !== undefined || it.bio !== undefined)) || items[0];

      // Extract follower count with resilient fallback field checking
      const followersRaw = profileItem.followersCount ?? profileItem.followers ?? profileItem.edge_followed_by?.count ?? profileItem.followerCount ?? profileItem.subscribersCount;
      const followers = typeof followersRaw === 'number' ? followersRaw : (followersRaw ? parseInt(String(followersRaw), 10) : null);

      const followingRaw = profileItem.followsCount ?? profileItem.follows ?? profileItem.edge_follow?.count ?? profileItem.followingCount;
      const following = typeof followingRaw === 'number' ? followingRaw : (followingRaw ? parseInt(String(followingRaw), 10) : null);

      const postsRaw = profileItem.postsCount ?? profileItem.mediaCount ?? profileItem.postsCount ?? profileItem.posts?.length ?? profileItem.edge_owner_to_timeline_media?.count;
      const posts = typeof postsRaw === 'number' ? postsRaw : (postsRaw ? parseInt(String(postsRaw), 10) : null);

      const bio = profileItem.biography || profileItem.bio || profileItem.description || null;
      const fullName = profileItem.fullName || profileItem.name || null;
      
      // Highest quality available profile image
      const avatarUrl = profileItem.profilePicUrlHD ||
        profileItem.profilePicUrl ||
        profileItem.profile_pic_url_hd ||
        profileItem.profile_pic_url ||
        profileItem.hdProfilePicUrlInfo?.url ||
        profileItem.avatar ||
        profileItem.ownerProfilePicUrl ||
        profileItem.owner?.profile_pic_url ||
        null;

      const externalUrl = profileItem.externalUrl || profileItem.external_url || profileItem.website || profileItem.externalLink || null;
      const verified = Boolean(profileItem.verified || profileItem.isVerified || profileItem.is_verified);

      // Extract real Instagram posts
      const extractedPosts: NormalizedInstagramPost[] = [];
      const seenIds = new Set<string>();

      const addPostIfValid = (rawPost: any) => {
        const post = normalizePostItem(rawPost, username);
        if (post && !seenIds.has(post.id) && !seenIds.has(post.permalink)) {
          seenIds.add(post.id);
          seenIds.add(post.permalink);
          extractedPosts.push(post);
        }
      };

      // 1. Check profileItem.latestPosts
      if (Array.isArray(profileItem.latestPosts)) {
        for (const p of profileItem.latestPosts) addPostIfValid(p);
      }

      // 2. Check profileItem.posts
      if (Array.isArray(profileItem.posts)) {
        for (const p of profileItem.posts) addPostIfValid(p);
      }

      // 3. Check profileItem.topPosts
      if (Array.isArray(profileItem.topPosts)) {
        for (const p of profileItem.topPosts) addPostIfValid(p);
      }

      // 4. Check timeline media edges
      if (Array.isArray(profileItem.edge_owner_to_timeline_media?.edges)) {
        for (const edge of profileItem.edge_owner_to_timeline_media.edges) {
          addPostIfValid(edge);
        }
      }

      // 5. Check if other dataset items in items array are individual post objects
      for (const it of items) {
        if (it && (it.displayUrl || it.imageUrl || it.shortCode || (it.url && it.url.includes('/p/')) || (it.url && it.url.includes('/reel/')))) {
          addPostIfValid(it);
        }
      }

      const profileData: NormalizedProfileData = {
        username: profileItem.username || username,
        fullName,
        bio,
        avatarUrl,
        followerCount: followers,
        followingCount: following,
        postsCount: posts,
        url: `https://www.instagram.com/${profileItem.username || username}`,
        externalUrl,
        verified,
        posts: extractedPosts
      };

      console.log(`[Apify Provider] Successfully fetched profile for @${username}: ${followers !== null ? followers.toLocaleString() : 'N/A'} followers, ${extractedPosts.length} posts.`);

      return {
        success: true,
        provider: this.name,
        configured: true,
        data: profileData
      };
    } catch (err: any) {
      const isAbort = err.name === 'AbortError';
      const msg = isAbort ? 'Apify request timed out after 45 seconds' : (err.message || String(err));
      console.error('[Apify Provider] Fetch exception:', msg);
      return {
        success: false,
        provider: this.name,
        configured: true,
        error: msg
      };
    }
  }
}

// Singleton default provider
export const defaultInstagramScraperProvider: IInstagramScraperProvider = new ApifyInstagramProvider();
