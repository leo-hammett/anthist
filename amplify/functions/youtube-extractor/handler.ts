import type { Handler } from 'aws-lambda';

interface PlaylistExtractionRequest {
  playlistUrl: string;
  userId: string;
}

interface VideoInfo {
  videoId: string;
  title: string;
  description?: string;
  thumbnail: string;
  duration?: number;
  author?: string;
  publishedAt?: string;
  playlistIndex: number;
}

interface PlaylistExtractionResult {
  success: boolean;
  playlistId: string;
  playlistTitle?: string;
  videos: VideoInfo[];
  error?: string;
}

/**
 * YouTube Playlist Extractor Lambda
 * 
 * Extracts all videos from a YouTube playlist:
 * 1. Parses playlist URL to get playlist ID
 * 2. Uses YouTube oEmbed and page scraping for metadata
 * 3. Returns list of videos with metadata
 * 
 * Note: For production, consider using YouTube Data API
 * or running yt-dlp in a container.
 */
export const handler: Handler<PlaylistExtractionRequest, PlaylistExtractionResult> = async (event) => {
  console.log('Extracting playlist:', event.playlistUrl);

  const { playlistUrl } = event;

  // Extract playlist ID
  const playlistIdMatch = playlistUrl.match(/[&?]list=([a-zA-Z0-9_-]+)/);
  if (!playlistIdMatch) {
    return {
      success: false,
      playlistId: '',
      videos: [],
      error: 'Invalid playlist URL',
    };
  }

  const playlistId = playlistIdMatch[1];

  try {
    // Fetch playlist page
    const playlistPageUrl = `https://www.youtube.com/playlist?list=${playlistId}`;
    const response = await fetch(playlistPageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const html = await response.text();

    // Extract playlist title
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    const playlistTitle = titleMatch?.[1]?.replace(' - YouTube', '').trim();

    // Extract video IDs from the page
    // This is a simplified extraction - production would use proper parsing
    const videoIdPattern = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
    const videoIds: string[] = [];
    let match;
    
    while ((match = videoIdPattern.exec(html)) !== null) {
      if (!videoIds.includes(match[1])) {
        videoIds.push(match[1]);
      }
    }

    // Limit to first 50 videos to avoid timeout
    const limitedVideoIds = videoIds.slice(0, 50);

    // Fetch metadata for each video
    const videos: VideoInfo[] = await Promise.all(
      limitedVideoIds.map(async (videoId, index) => {
        const metadata = await fetchVideoMetadata(videoId);
        return {
          videoId,
          title: metadata.title ?? `Video ${index + 1}`,
          description: metadata.description,
          thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          author: metadata.author,
          playlistIndex: index,
        };
      })
    );

    return {
      success: true,
      playlistId,
      playlistTitle,
      videos,
    };
  } catch (error) {
    console.error('Error extracting playlist:', error);
    return {
      success: false,
      playlistId,
      videos: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

async function fetchVideoMetadata(videoId: string): Promise<{
  title?: string;
  description?: string;
  author?: string;
}> {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(oembedUrl);
    
    if (!response.ok) {
      return {};
    }
    
    const data = await response.json();
    
    return {
      title: data.title,
      author: data.author_name,
    };
  } catch (error) {
    console.error(`Error fetching metadata for ${videoId}:`, error);
    return {};
  }
}
