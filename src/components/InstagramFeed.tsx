import React, { useState, useEffect } from 'react';
import {
  Instagram,
  Heart,
  MessageCircle,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  Globe,
  Film,
  Play,
  Pause,
  Sparkles,
  Calendar,
  Clock,
  AlertCircle
} from 'lucide-react';
import { SiteContent } from '../types';
import { api, InstagramState, InstagramPost } from '../services/api';

interface InstagramFeedProps {
  instagram?: SiteContent['instagram'];
}

/**
 * Individual Instagram Post Card with multi-tiered media loading,
 * CORS/Referrer-safe direct CDN rendering, proxy failover, video playback,
 * and graceful fallback to the branded card if all sources fail.
 */
interface InstagramPostCardProps {
  post: InstagramPost;
  index: number;
  profileUrl: string;
}

const InstagramPostCard: React.FC<InstagramPostCardProps> = ({ post, index, profileUrl }) => {
  // Build ordered list of candidate URLs
  const candidateUrls: string[] = React.useMemo(() => {
    const list: string[] = [];
    if (post.mediaUrl) list.push(post.mediaUrl);
    if (post.thumbnailUrl && post.thumbnailUrl !== post.mediaUrl) list.push(post.thumbnailUrl);
    if (Array.isArray(post.alternateMediaUrls)) {
      post.alternateMediaUrls.forEach((u) => {
        if (u && !list.includes(u)) list.push(u);
      });
    }
    return list.filter(Boolean);
  }, [post.mediaUrl, post.thumbnailUrl, post.alternateMediaUrls]);

  const [urlIndex, setUrlIndex] = useState<number>(0);
  const [triedProxy, setTriedProxy] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasFailedAll, setHasFailedAll] = useState<boolean>(candidateUrls.length === 0);
  const [isPlayingVideo, setIsPlayingVideo] = useState<boolean>(false);

  // Compute active image source URL (direct CDN or server media proxy)
  const currentMediaUrl = React.useMemo(() => {
    if (hasFailedAll || candidateUrls.length === 0) return null;
    const base = candidateUrls[urlIndex] || candidateUrls[0];
    if (triedProxy) {
      return `/api/instagram/media-proxy?url=${encodeURIComponent(base)}`;
    }
    return base;
  }, [candidateUrls, urlIndex, triedProxy, hasFailedAll]);

  // Failover mechanism: direct URL -> proxy URL -> next candidate -> fallback
  const handleMediaError = () => {
    if (!triedProxy && candidateUrls[urlIndex]) {
      // Step 1: Retry current URL via server-side media proxy
      setTriedProxy(true);
      return;
    }

    if (urlIndex + 1 < candidateUrls.length) {
      // Step 2: Try next candidate URL directly
      setUrlIndex((prev) => prev + 1);
      setTriedProxy(false);
      return;
    }

    // Step 3: All media URLs and proxies exhausted; show graceful fallback
    setHasFailedAll(true);
  };

  const isVideo = Boolean(
    post.isVideo ||
    post.mediaType === 'VIDEO' ||
    post.mediaType === 'REEL' ||
    Boolean(post.videoUrl)
  );

  const formattedDate = React.useMemo(() => {
    if (!post.timestamp) return null;
    try {
      return new Date(post.timestamp).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return null;
    }
  }, [post.timestamp]);

  const targetLink = post.permalink || profileUrl;

  const handleVideoCardClick = (e: React.MouseEvent) => {
    if (isVideo && post.videoUrl) {
      e.preventDefault();
      setIsPlayingVideo((prev) => !prev);
    }
  };

  return (
    <div
      id={`instagram-post-${post.id}`}
      className="group relative bg-white dark:bg-stone-900 rounded-2xl border border-[#E7E2DA] dark:border-stone-800 hover:border-[#dc2743]/40 dark:hover:border-[#dc2743]/60 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col"
    >
      {/* Square Media Container */}
      <div className="relative aspect-square overflow-hidden bg-[#FAF8F5] dark:bg-stone-950">
        {/* Active Real Media Rendering */}
        {!hasFailedAll && currentMediaUrl ? (
          <>
            {/* Shimmer / Skeleton Placeholder while media loads */}
            {!isLoaded && !isPlayingVideo && (
              <div className="absolute inset-0 bg-[#EAE4D9]/60 dark:bg-stone-800/60 animate-pulse flex items-center justify-center">
                <Instagram className="w-8 h-8 text-[#D6CEBF] dark:text-stone-600 animate-pulse" />
              </div>
            )}

            {/* Video Player when active */}
            {isPlayingVideo && post.videoUrl ? (
              <video
                src={post.videoUrl}
                poster={currentMediaUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                onError={() => setIsPlayingVideo(false)}
              />
            ) : (
              /* Real Instagram Image / Poster */
              <img
                src={currentMediaUrl}
                alt={post.caption || 'Instagram field moment by 2shoes2faar'}
                referrerPolicy="no-referrer"
                decoding="async"
                loading={index < 4 ? 'eager' : 'lazy'}
                onLoad={() => setIsLoaded(true)}
                onError={handleMediaError}
                className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${
                  isLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
            )}
          </>
        ) : (
          /* Graceful Fallback Card */
          <div className="w-full h-full bg-gradient-to-tr from-[#f09433]/15 via-[#dc2743]/15 to-[#bc1888]/15 dark:from-[#f09433]/25 dark:via-[#dc2743]/25 dark:to-[#bc1888]/25 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-white dark:bg-stone-800 shadow-sm flex items-center justify-center text-[#dc2743] mb-3 group-hover:scale-110 transition-transform">
              <Instagram className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-[#1C1917] dark:text-stone-200 line-clamp-3 leading-relaxed">
              {post.caption || 'Explore journey moments on Instagram'}
            </span>
          </div>
        )}

        {/* Video / Reel Indicator Badge */}
        {isVideo && !isPlayingVideo && (
          <div
            onClick={handleVideoCardClick}
            className="absolute top-2.5 right-2.5 bg-black/65 backdrop-blur-xs text-white px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-sm cursor-pointer hover:bg-black/85 transition-colors z-10"
            title={post.videoUrl ? 'Click to preview reel video' : 'Reel on Instagram'}
          >
            <Play className="w-2.5 h-2.5 fill-white text-white" />
            <span>Reel</span>
          </div>
        )}

        {/* Floating Date Badge (if available) */}
        {formattedDate && (
          <div className="absolute top-2.5 left-2.5 bg-white/85 dark:bg-stone-900/85 backdrop-blur-xs text-[#44403C] dark:text-stone-200 px-2 py-0.5 rounded-full text-[9px] font-semibold flex items-center gap-1 shadow-2xs pointer-events-none">
            <Calendar className="w-2.5 h-2.5 text-[#78716C] dark:text-stone-400" />
            <span>{formattedDate}</span>
          </div>
        )}

        {/* Hover Gradient Overlay with Real Metrics & Actions */}
        {!isPlayingVideo && (
          <a
            href={targetLink}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between p-4 text-white z-10"
          >
            <div className="flex justify-end">
              <span className="p-1.5 rounded-full bg-white/20 backdrop-blur-xs text-white shadow-xs">
                <ExternalLink className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="space-y-2">
              {(post.likesCount !== undefined || post.commentsCount !== undefined) && (
                <div className="flex items-center gap-4 text-xs font-bold">
                  {post.likesCount !== undefined && post.likesCount !== null && (
                    <span className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 fill-[#dc2743] text-[#dc2743]" />
                      {post.likesCount.toLocaleString('en-IN')}
                    </span>
                  )}
                  {post.commentsCount !== undefined && post.commentsCount !== null && (
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5 fill-white" />
                      {post.commentsCount.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              )}
              <span className="text-[11px] font-medium text-white/90 line-clamp-2 leading-tight">
                {post.caption || 'View full story on Instagram'}
              </span>
            </div>
          </a>
        )}
      </div>

      {/* Caption Card Bottom Preview */}
      <a
        href={targetLink}
        target="_blank"
        rel="noopener noreferrer"
        className="p-3.5 flex-1 flex flex-col justify-between bg-white dark:bg-stone-900 hover:bg-[#FAF8F5] dark:hover:bg-stone-800/80 transition-colors"
      >
        <p className="text-xs text-[#292524] dark:text-stone-200 line-clamp-2 leading-relaxed">
          {post.caption || 'Field log and travel chronicles across India.'}
        </p>

        <div className="mt-3 pt-2.5 border-t border-[#F2ECE1] dark:border-stone-800 flex items-center justify-between text-[11px] font-semibold text-[#78716C] dark:text-stone-400 group-hover:text-[#dc2743] dark:group-hover:text-[#dc2743] transition-colors">
          <span className="flex items-center gap-1.5">
            <Instagram className="w-3 h-3 text-[#dc2743]" />
            View on Instagram
          </span>
          <ExternalLink className="w-3 h-3 text-[#dc2743]" />
        </div>
      </a>
    </div>
  );
};

export const InstagramFeed: React.FC<InstagramFeedProps> = ({ instagram }) => {
  const [liveState, setLiveState] = useState<InstagramState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [avatarError, setAvatarError] = useState<boolean>(false);
  const [avatarTriedProxy, setAvatarTriedProxy] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  const loadData = async (force: boolean = false) => {
    if (force) {
      setRefreshing(true);
      setFeedbackMsg(null);
    }
    try {
      const data = await api.getInstagramStats(force);
      // Keep previous valid cached posts/profile if new fetch didn't return any
      setLiveState((prev) => {
        if (!data) return prev;
        if ((!data.posts || data.posts.length === 0) && prev?.posts && prev.posts.length > 0) {
          return {
            ...data,
            posts: prev.posts,
            followerCount: data.followerCount ?? prev.followerCount,
            followerCountFormatted: data.followerCountFormatted ?? prev.followerCountFormatted,
            followingCount: data.followingCount ?? prev.followingCount,
            postsCount: data.postsCount ?? prev.postsCount,
            avatarUrl: data.avatarUrl || prev.avatarUrl
          };
        }
        return data;
      });

      if (force) {
        if (data?.status === 'SUCCESS') {
          setFeedbackMsg({
            type: 'success',
            text: `Successfully synced latest profile & posts for @${data.username || '2shoes2faar'} via Apify!`
          });
        } else if (data?.status === 'NOT_CONFIGURED') {
          setFeedbackMsg({
            type: 'info',
            text: 'Displaying cached profile. Add APIFY_API_TOKEN in backend environment to trigger live scraping.'
          });
        } else if (data?.errorMessage) {
          setFeedbackMsg({
            type: 'error',
            text: data.errorMessage
          });
        }
      }
    } catch (e: any) {
      console.error('[InstagramFeed] Error fetching stats:', e);
      if (force) {
        setFeedbackMsg({
          type: 'error',
          text: e?.message || 'Network error refreshing Instagram metrics.'
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(false);
  }, []);

  // Profile fields derived strictly from live backend state
  const username = liveState?.username || '2shoes2faar';
  const handle = liveState?.handle || `@${username}`;
  const profileUrl = liveState?.url || `https://www.instagram.com/${username}`;
  const fullName = liveState?.fullName || 'Architect Veer | Backpacking Traveller';
  const bio = liveState?.bio || liveState?.biography || instagram?.bio || '🇮🇳 From 28states in 28weeks hitchhiking → 🌍 🇲🇾🇹🇭\n🎒 Raw journeys, real people, soulful places\n✍🏽 Pre-order my travel book 👇';
  const rawAvatarUrl = liveState?.profilePicture || liveState?.avatarUrl || instagram?.avatarUrl;
  const externalUrl = liveState?.externalUrl;
  const lastUpdated = liveState?.lastUpdated || liveState?.lastUpdatedAt;
  const posts: InstagramPost[] = liveState?.posts || [];

  // Compute active avatar source with proxy failover
  const currentAvatarSrc = React.useMemo(() => {
    if (!rawAvatarUrl || avatarError) return null;
    if (avatarTriedProxy) {
      return `/api/instagram/media-proxy?url=${encodeURIComponent(rawAvatarUrl)}`;
    }
    return rawAvatarUrl;
  }, [rawAvatarUrl, avatarTriedProxy, avatarError]);

  const handleAvatarError = () => {
    if (!avatarTriedProxy && rawAvatarUrl) {
      setAvatarTriedProxy(true);
    } else {
      setAvatarError(true);
    }
  };

  return (
    <div id="instagram-feed-section" className="space-y-8">
      {/* ========================================================================= */}
      {/* MAIN INSTAGRAM PROFILE HERO CARD WITH INSTAGRAM GRADIENT ACCENT           */}
      {/* ========================================================================= */}
      <div className="relative bg-white/95 dark:bg-stone-900/95 backdrop-blur-md rounded-3xl border border-[#E7E2DA] dark:border-stone-800 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
        {/* Top Instagram Color Ribbon */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888]" />

        <div className="p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          {/* Left: Avatar & Bio Details */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left flex-1">
            {/* Circular Profile Avatar with Instagram Gradient Ring */}
            <div className="relative shrink-0 group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-[3.5px] bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] shadow-md group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-stone-950 border-2 border-white dark:border-stone-800 flex items-center justify-center">
                  {!avatarError && currentAvatarSrc ? (
                    <img
                      src={currentAvatarSrc}
                      alt={handle}
                      referrerPolicy="no-referrer"
                      decoding="async"
                      onError={handleAvatarError}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-[#f09433]/20 via-[#dc2743]/20 to-[#bc1888]/20 flex items-center justify-center text-[#dc2743]">
                      <Instagram className="w-8 h-8" />
                    </div>
                  )}
                </div>
              </div>

              {/* Verified Badge */}
              <div
                className="absolute -bottom-1 -right-1 bg-gradient-to-tr from-[#f09433] to-[#dc2743] text-white p-1.5 rounded-full shadow-sm"
                title="Verified Instagram Creator"
              >
                <CheckCircle2 className="w-4 h-4 fill-white text-[#dc2743]" />
              </div>
            </div>

            {/* Profile Bio & Title Info */}
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2.5 justify-center sm:justify-start">
                <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1C1917] dark:text-stone-100 tracking-tight">
                  {handle}
                </h3>

                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#f09433]/10 via-[#dc2743]/10 to-[#bc1888]/10 dark:from-[#f09433]/20 dark:via-[#dc2743]/20 dark:to-[#bc1888]/20 text-[#dc2743] border border-[#dc2743]/20 dark:border-[#dc2743]/40">
                  <Sparkles className="w-3 h-3" />
                  Live Travel Stories
                </span>
              </div>

              {fullName && (
                <p className="text-sm font-semibold text-[#57534E] dark:text-stone-300">
                  {fullName}
                </p>
              )}

              <p className="text-xs sm:text-sm text-[#44403C] dark:text-stone-300 max-w-xl leading-relaxed font-normal whitespace-pre-line">
                {bio}
              </p>

              {externalUrl && (
                <div>
                  <a
                    href={externalUrl.startsWith('http') ? externalUrl : `https://${externalUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-[#dc2743] hover:text-[#bc1888] font-medium hover:underline transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>{externalUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
                  </a>
                </div>
              )}

              {/* Real Metrics Row from Apify */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-1 text-xs sm:text-sm justify-center sm:justify-start">
                {loading ? (
                  <span className="text-[#A8A29E] animate-pulse flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#dc2743]" />
                    Fetching real-time profile from Apify...
                  </span>
                ) : (
                  <>
                    {liveState?.followerCount !== null && liveState?.followerCount !== undefined && (
                      <div className="flex items-baseline gap-1">
                        <span className="font-bold text-[#1C1917] dark:text-stone-100 text-base sm:text-lg">
                          {liveState.followerCountFormatted || liveState.followerCount.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[#78716C] dark:text-stone-400 font-medium">followers</span>
                      </div>
                    )}

                    {liveState?.followingCount !== null && liveState?.followingCount !== undefined && (
                      <div className="flex items-baseline gap-1">
                        <span className="font-bold text-[#1C1917] dark:text-stone-100 text-base sm:text-lg">
                          {liveState.followingCount.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[#78716C] dark:text-stone-400 font-medium">following</span>
                      </div>
                    )}

                    {liveState?.postsCount !== null && liveState?.postsCount !== undefined && (
                      <div className="flex items-baseline gap-1">
                        <span className="font-bold text-[#1C1917] dark:text-stone-100 text-base sm:text-lg">
                          {liveState.postsCount.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[#78716C] dark:text-stone-400 font-medium">posts</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-[11px] text-[#78716C] dark:text-stone-400 bg-[#FAF8F5] dark:bg-stone-800 px-2.5 py-1 rounded-full border border-[#E7E2DA] dark:border-stone-700">
                      <Clock className="w-3 h-3 text-[#A8A29E] dark:text-stone-400" />
                      <span>
                        {liveState?.status === 'SUCCESS' ? 'Synced via Apify' : 'Cached'}{' '}
                        {lastUpdated ? `(${new Date(lastUpdated).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })})` : ''}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: Premium Interactive CTA Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch gap-3 w-full lg:w-auto shrink-0">
            <a
              id="instagram-follow-cta-button"
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative px-6 py-3 rounded-full bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2.5 active:scale-95 cursor-pointer text-center"
            >
              <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Follow {handle}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>

            <button
              id="instagram-refresh-stats-button"
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="px-5 py-2.5 bg-[#FAF8F5] dark:bg-stone-800 hover:bg-[#F2ECE1] dark:hover:bg-stone-700 text-[#292524] dark:text-stone-200 font-semibold text-xs rounded-full border border-[#D6CEBF] dark:border-stone-700 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95 shadow-2xs"
              title="Synchronize latest Instagram metrics and media from Apify"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#dc2743] ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Syncing Apify...' : 'Refresh Stats'}</span>
            </button>
          </div>
        </div>

        {/* Feedback message banner after refresh */}
        {feedbackMsg && (
          <div
            className={`px-6 py-2.5 border-t text-xs flex items-center justify-between ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : feedbackMsg.type === 'info'
                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                : 'bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedbackMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              )}
              <span>{feedbackMsg.text}</span>
            </div>
            <button
              onClick={() => setFeedbackMsg(null)}
              className="font-bold underline text-[11px] hover:opacity-75 cursor-pointer ml-2"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* REAL INSTAGRAM MEDIA GRID                                                 */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#f09433] to-[#dc2743]" />
            <h4 className="font-editorial text-xl font-bold text-[#1C1917] dark:text-stone-100">
              Recent Field Highlights
            </h4>
          </div>

          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-[#dc2743] hover:text-[#bc1888] flex items-center gap-1 transition-colors group"
          >
            <span>View all on Instagram</span>
            <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((idx) => (
              <div
                key={`skel-${idx}`}
                className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E7E2DA] dark:border-stone-800 overflow-hidden animate-pulse shadow-xs"
              >
                <div className="aspect-square bg-[#EAE4D9]/60 dark:bg-stone-800" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-[#EAE4D9] dark:bg-stone-800 rounded w-3/4" />
                  <div className="h-2.5 bg-[#EAE4D9] dark:bg-stone-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Real Posts Grid */}
        {!loading && posts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {posts.map((post, idx) => (
              <InstagramPostCard
                key={post.id || `ig-post-${idx}`}
                post={post}
                index={idx}
                profileUrl={profileUrl}
              />
            ))}
          </div>
        )}

        {/* Fallback state if no posts returned yet */}
        {!loading && posts.length === 0 && (
          <div className="bg-white/80 dark:bg-stone-900/80 rounded-2xl border border-[#E7E2DA] dark:border-stone-800 p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#f09433]/15 via-[#dc2743]/15 to-[#bc1888]/15 dark:from-[#f09433]/25 dark:via-[#dc2743]/25 dark:to-[#bc1888]/25 flex items-center justify-center text-[#dc2743] mx-auto">
              <Instagram className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h5 className="font-editorial text-lg font-bold text-[#1C1917] dark:text-stone-100">
                Connect to @{username} on Instagram
              </h5>
              <p className="text-xs text-[#57534E] dark:text-stone-300">
                Follow Veer's daily journey across 28 states with field dispatches, photography reels, and travel updates.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] text-white font-bold text-xs rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-2"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>Visit @{username} on Instagram</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                onClick={() => loadData(true)}
                className="px-4 py-2.5 bg-[#FAF8F5] dark:bg-stone-800 text-[#1C1917] dark:text-stone-200 font-semibold text-xs rounded-full border border-[#D6CEBF] dark:border-stone-700 hover:bg-[#F2ECE1] dark:hover:bg-stone-700 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#dc2743]" />
                <span>Sync with Apify</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
