/**
 * Content Extractor
 * 
 * Handles URL parsing and content type detection.
 * Actual content extraction (Readability) happens server-side via Lambda
 * to avoid CORS issues.
 */

export type DetectedContentType = 'youtube' | 'youtube_playlist' | 'blog' | 'pdf' | 'unknown';

interface ContentMetadata {
  type: DetectedContentType;
  url: string;
  videoId?: string;
  playlistId?: string;
  cleanUrl: string;
}

// YouTube URL patterns
const YOUTUBE_VIDEO_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
];

const YOUTUBE_PLAYLIST_PATTERN = /youtube\.com\/playlist\?list=([a-zA-Z0-9_-]+)/;
const YOUTUBE_VIDEO_WITH_PLAYLIST = /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11}).*[&?]list=([a-zA-Z0-9_-]+)/;

const PDF_PATTERN = /\.pdf(\?.*)?$/i;

/**
 * Detect content type and extract metadata from URL
 */
export function detectContentType(url: string): ContentMetadata {
  try {
    const cleanUrl = url.trim();
    
    // Check for PDF
    if (PDF_PATTERN.test(cleanUrl)) {
      return {
        type: 'pdf',
        url: cleanUrl,
        cleanUrl,
      };
    }

    // Check for YouTube video with playlist
    const videoWithPlaylistMatch = cleanUrl.match(YOUTUBE_VIDEO_WITH_PLAYLIST);
    if (videoWithPlaylistMatch) {
      return {
        type: 'youtube',
        url: cleanUrl,
        videoId: videoWithPlaylistMatch[1],
        playlistId: videoWithPlaylistMatch[2],
        cleanUrl: `https://www.youtube.com/watch?v=${videoWithPlaylistMatch[1]}`,
      };
    }

    // Check for YouTube playlist
    const playlistMatch = cleanUrl.match(YOUTUBE_PLAYLIST_PATTERN);
    if (playlistMatch) {
      return {
        type: 'youtube_playlist',
        url: cleanUrl,
        playlistId: playlistMatch[1],
        cleanUrl,
      };
    }

    // Check for YouTube video
    for (const pattern of YOUTUBE_VIDEO_PATTERNS) {
      const match = cleanUrl.match(pattern);
      if (match) {
        return {
          type: 'youtube',
          url: cleanUrl,
          videoId: match[1],
          cleanUrl: `https://www.youtube.com/watch?v=${match[1]}`,
        };
      }
    }

    // Default to blog
    return {
      type: 'blog',
      url: cleanUrl,
      cleanUrl,
    };
  } catch (error) {
    return {
      type: 'unknown',
      url,
      cleanUrl: url,
    };
  }
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract YouTube video ID from various URL formats
 */
export function extractYouTubeVideoId(url: string): string | null {
  for (const pattern of YOUTUBE_VIDEO_PATTERNS) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
}

/**
 * Generate YouTube thumbnail URL
 */
export function getYouTubeThumbnail(videoId: string, quality: 'default' | 'medium' | 'high' | 'maxres' = 'high'): string {
  const qualityMap = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault',
    maxres: 'maxresdefault',
  };
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

/**
 * Estimate reading time for blog content
 * Assumes average reading speed of 200 words per minute
 */
export function estimateReadingTime(wordCount: number): number {
  const wordsPerMinute = 200;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Clean and normalize URL
 */
export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    
    // Remove tracking parameters
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref', 'source'];
    trackingParams.forEach(param => parsed.searchParams.delete(param));
    
    // Remove trailing slash
    let cleanPath = parsed.pathname.replace(/\/+$/, '');
    if (cleanPath === '') cleanPath = '/';
    
    return `${parsed.protocol}//${parsed.host}${cleanPath}${parsed.search}`;
  } catch {
    return url;
  }
}
