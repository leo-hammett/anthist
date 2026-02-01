import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Readability } from '@mozilla/readability';
import { parseHTML } from 'linkedom';

// Input arguments from GraphQL mutation
interface ProcessContentArgs {
  contentId: string;
  url: string;
  type: string;
  userId: string;
}

// Response type matching the ProcessedContentResponse custom type in schema
interface ProcessedContentResponse {
  title: string | null;
  description: string | null;
  author: string | null;
  thumbnail: string | null;
  publishedAt: string | null;
  wordCount: number | null;
  readingTimeMinutes: number | null;
  semanticTags: (string | null)[] | null;
  s3Key: string | null;
  extractedHtml: string | null;
}

// S3 client for storing extracted content
const s3Client = new S3Client({});
const BUCKET_NAME = process.env.STORAGE_BUCKET_NAME ?? '';

/**
 * Anthist Content Processor Lambda
 * 
 * Processes content URLs to extract:
 * - Metadata (title, author, date, thumbnail)
 * - Blog content via Readability
 * - YouTube video info via yt-dlp
 * - Semantic tags for theme matching
 * - OpenAI embeddings for recommendation algorithm
 */
export const handler = async (event: { arguments: ProcessContentArgs }): Promise<ProcessedContentResponse> => {
  console.log('Processing content:', event.arguments);

  const { url, type, contentId, userId } = event.arguments;

  try {
    switch (type) {
      case 'YOUTUBE':
        return await processYouTube(url);
      case 'BLOG':
        return await processBlog(url, contentId, userId);
      case 'PDF':
        return await processPDF(url);
      default:
        throw new Error(`Unknown content type: ${type}`);
    }
  } catch (error) {
    console.error('Error processing content:', error);
    throw error;
  }
};

async function processYouTube(url: string): Promise<ProcessedContentResponse> {
  // Extract video ID
  const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  const videoId = videoIdMatch?.[1];

  if (!videoId) {
    throw new Error('Invalid YouTube URL');
  }

  // Use YouTube oEmbed API for basic metadata (no API key needed)
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
  
  try {
    const response = await fetch(oembedUrl);
    const data = await response.json();

    // Generate semantic tags from title
    const semanticTags = generateSemanticTags(data.title, 'video');

    return {
      title: data.title,
      description: null,
      author: data.author_name ?? null,
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      publishedAt: null,
      wordCount: null,
      readingTimeMinutes: null,
      semanticTags,
      s3Key: null,
      extractedHtml: null,
    };
  } catch (error) {
    console.error('Error fetching YouTube metadata:', error);
    return {
      title: url,
      description: null,
      author: null,
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      publishedAt: null,
      wordCount: null,
      readingTimeMinutes: null,
      semanticTags: ['video'],
      s3Key: null,
      extractedHtml: null,
    };
  }
}

async function processBlog(url: string, contentId: string, userId: string): Promise<ProcessedContentResponse> {
  // Fetch the page HTML
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();

  // Parse HTML with linkedom (lightweight, bundles well with esbuild)
  const { document } = parseHTML(html);

  // Extract metadata from HTML head
  const metaTitle = document.querySelector('title')?.textContent?.trim();
  const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') ||
                          document.querySelector('meta[property="og:description"]')?.getAttribute('content');
  const metaAuthor = document.querySelector('meta[name="author"]')?.getAttribute('content') ||
                     document.querySelector('meta[property="article:author"]')?.getAttribute('content');
  const metaThumbnail = document.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
                        document.querySelector('meta[name="twitter:image"]')?.getAttribute('content');
  const metaPublished = document.querySelector('meta[property="article:published_time"]')?.getAttribute('content') ||
                        document.querySelector('time[datetime]')?.getAttribute('datetime');

  // Use Readability to extract clean article content
  const reader = new Readability(document);
  const article = reader.parse();

  if (!article) {
    // Readability failed, fallback to basic extraction
    console.warn('Readability extraction failed for:', url);
    return {
      title: metaTitle ?? url,
      description: metaDescription ?? null,
      author: metaAuthor ?? null,
      thumbnail: metaThumbnail ?? null,
      publishedAt: metaPublished ?? null,
      wordCount: null,
      readingTimeMinutes: null,
      semanticTags: generateSemanticTags(metaTitle ?? '', 'article'),
      s3Key: null,
      extractedHtml: null,
    };
  }

  // Calculate reading metrics
  const wordCount = article.textContent?.split(/\s+/).length ?? 0;
  const readingTimeMinutes = Math.ceil(wordCount / 200); // ~200 WPM average

  // Generate semantic tags from content
  const semanticTags = generateSemanticTags(
    `${article.title} ${article.excerpt ?? ''} ${metaDescription ?? ''}`,
    'article'
  );

  // Clean up the extracted HTML for storage
  const extractedHtml = wrapContentInHtml(article.title ?? '', article.content ?? '', {
    author: article.byline ?? metaAuthor ?? undefined,
    siteName: article.siteName ?? undefined,
    excerpt: article.excerpt ?? undefined,
  });

  // Upload to S3
  // Use content ID based path (not userId) so any authenticated user can read
  // Lambda writes via IAM role, client reads via storage access rules
  let s3Key: string | null = null;
  if (BUCKET_NAME && extractedHtml) {
    s3Key = `blogs/content/${contentId}.html`;
    
    try {
      await s3Client.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: extractedHtml,
        ContentType: 'text/html; charset=utf-8',
        Metadata: {
          title: article.title ?? '',
          url: url,
          wordCount: wordCount.toString(),
        },
      }));
      console.log('Uploaded blog content to S3:', s3Key);
    } catch (error) {
      console.error('Failed to upload to S3:', error);
      // Continue without S3 storage
      s3Key = null;
    }
  }

  return {
    title: article.title ?? metaTitle ?? url,
    description: article.excerpt ?? metaDescription ?? null,
    author: article.byline ?? metaAuthor ?? null,
    thumbnail: metaThumbnail ?? null,
    publishedAt: metaPublished ?? null,
    wordCount,
    readingTimeMinutes,
    semanticTags,
    extractedHtml: s3Key ? null : extractedHtml, // Don't return HTML if stored in S3
    s3Key,
  };
}

/**
 * Wrap extracted content in a clean HTML document for storage
 */
function wrapContentInHtml(
  title: string,
  content: string,
  meta: { author?: string; siteName?: string; excerpt?: string }
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  ${meta.author ? `<meta name="author" content="${escapeHtml(meta.author)}">` : ''}
  ${meta.excerpt ? `<meta name="description" content="${escapeHtml(meta.excerpt)}">` : ''}
</head>
<body>
  <article>
    <header>
      <h1>${escapeHtml(title)}</h1>
      ${meta.author ? `<p class="byline">By ${escapeHtml(meta.author)}</p>` : ''}
      ${meta.siteName ? `<p class="source">From ${escapeHtml(meta.siteName)}</p>` : ''}
    </header>
    <div class="content">
      ${content}
    </div>
  </article>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function processPDF(url: string): Promise<ProcessedContentResponse> {
  // For PDFs, we can extract the filename as title
  const urlParts = new URL(url);
  const filename = urlParts.pathname.split('/').pop() ?? 'Document';
  const title = decodeURIComponent(filename.replace(/\.pdf$/i, '').replace(/[-_]/g, ' '));

  return {
    title,
    description: null,
    author: null,
    thumbnail: null,
    publishedAt: null,
    wordCount: null,
    readingTimeMinutes: null,
    semanticTags: ['document', 'pdf'],
    s3Key: null,
    extractedHtml: null,
  };
}

/**
 * Generate semantic tags based on content
 * These are used for theme matching
 */
function generateSemanticTags(text: string, contentType: string): string[] {
  const tags: string[] = [contentType];
  const lowerText = text.toLowerCase();

  // Tech/Programming
  if (/\b(javascript|python|react|node|api|code|programming|developer|software|github|typescript)\b/.test(lowerText)) {
    tags.push('tech', 'programming');
  }

  // Design/Art
  if (/\b(design|ui|ux|figma|creative|art|typography|color|illustration)\b/.test(lowerText)) {
    tags.push('design', 'creative');
  }

  // Science/Research
  if (/\b(research|study|science|data|analysis|experiment|academic|university)\b/.test(lowerText)) {
    tags.push('science', 'research');
  }

  // Business/Finance
  if (/\b(business|startup|entrepreneur|marketing|finance|money|investing|stock)\b/.test(lowerText)) {
    tags.push('business', 'finance');
  }

  // Health/Wellness
  if (/\b(health|fitness|wellness|exercise|diet|nutrition|mental|meditation)\b/.test(lowerText)) {
    tags.push('health', 'wellness');
  }

  // Cooking/Food
  if (/\b(recipe|cooking|food|restaurant|chef|kitchen|baking|meal)\b/.test(lowerText)) {
    tags.push('cooking', 'food');
  }

  // Philosophy/Literature
  if (/\b(philosophy|book|literature|writing|author|story|novel|essay)\b/.test(lowerText)) {
    tags.push('philosophy', 'literature');
  }

  // News/Politics
  if (/\b(news|politics|government|election|policy|world|breaking)\b/.test(lowerText)) {
    tags.push('news', 'politics');
  }

  // Entertainment
  if (/\b(movie|film|music|game|gaming|entertainment|review|celebrity)\b/.test(lowerText)) {
    tags.push('entertainment', 'music');
  }

  // Default to general if no specific matches
  if (tags.length === 1) {
    tags.push('general');
  }

  return [...new Set(tags)]; // Remove duplicates
}
