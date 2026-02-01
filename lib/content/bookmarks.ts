/**
 * Bookmark Parser
 * 
 * Parses bookmark export files from:
 * - Chrome/Chromium (HTML)
 * - Firefox (HTML or JSON)
 * - Safari (HTML)
 * - Standard Netscape bookmark format
 */

export interface ParsedBookmark {
  title: string;
  url: string;
  addDate?: Date;
  folder?: string;
}

export interface BookmarkParseResult {
  success: boolean;
  bookmarks: ParsedBookmark[];
  totalFound: number;
  errors: string[];
}

/**
 * Parse HTML bookmark file (Netscape format)
 * Used by Chrome, Firefox, Safari
 */
export function parseHtmlBookmarks(html: string): BookmarkParseResult {
  const bookmarks: ParsedBookmark[] = [];
  const errors: string[] = [];
  let currentFolder = '';
  
  try {
    // Match all <A> tags with HREF
    const linkPattern = /<A\s+[^>]*HREF="([^"]+)"[^>]*>([^<]*)<\/A>/gi;
    const folderPattern = /<H3[^>]*>([^<]*)<\/H3>/gi;
    
    // Extract folder names
    const folderMatches = [...html.matchAll(folderPattern)];
    const folderPositions = folderMatches.map(m => ({
      name: m[1],
      position: m.index ?? 0,
    }));
    
    // Extract links
    let match;
    while ((match = linkPattern.exec(html)) !== null) {
      const url = match[1];
      const title = match[2].trim();
      
      // Skip empty or invalid URLs
      if (!url || !isValidUrl(url)) {
        continue;
      }
      
      // Skip internal browser URLs
      if (url.startsWith('chrome://') || 
          url.startsWith('about:') ||
          url.startsWith('javascript:') ||
          url.startsWith('file://')) {
        continue;
      }
      
      // Find the folder this bookmark is in
      const position = match.index ?? 0;
      let folder = '';
      for (const f of folderPositions) {
        if (f.position < position) {
          folder = f.name;
        }
      }
      
      // Extract ADD_DATE if present
      const addDateMatch = match[0].match(/ADD_DATE="(\d+)"/i);
      const addDate = addDateMatch 
        ? new Date(parseInt(addDateMatch[1]) * 1000)
        : undefined;
      
      bookmarks.push({
        title: title || new URL(url).hostname,
        url,
        addDate,
        folder: folder || undefined,
      });
    }
  } catch (error) {
    errors.push(`Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  return {
    success: errors.length === 0,
    bookmarks,
    totalFound: bookmarks.length,
    errors,
  };
}

/**
 * Parse Firefox JSON bookmark export
 */
export function parseJsonBookmarks(json: string): BookmarkParseResult {
  const bookmarks: ParsedBookmark[] = [];
  const errors: string[] = [];
  
  try {
    const data = JSON.parse(json);
    
    // Firefox JSON format has nested children
    function processNode(node: any, folderPath: string = '') {
      if (node.type === 'text/x-moz-place' && node.uri) {
        // It's a bookmark
        if (isValidUrl(node.uri)) {
          bookmarks.push({
            title: node.title || new URL(node.uri).hostname,
            url: node.uri,
            addDate: node.dateAdded ? new Date(node.dateAdded / 1000) : undefined,
            folder: folderPath || undefined,
          });
        }
      }
      
      // Process children
      if (node.children) {
        const newPath = node.title 
          ? (folderPath ? `${folderPath}/${node.title}` : node.title)
          : folderPath;
        
        for (const child of node.children) {
          processNode(child, newPath);
        }
      }
    }
    
    processNode(data);
  } catch (error) {
    errors.push(`JSON parse error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  return {
    success: errors.length === 0,
    bookmarks,
    totalFound: bookmarks.length,
    errors,
  };
}

/**
 * Detect format and parse bookmarks
 */
export function parseBookmarks(content: string): BookmarkParseResult {
  const trimmed = content.trim();
  
  // Check if it's JSON
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return parseJsonBookmarks(content);
  }
  
  // Otherwise treat as HTML
  return parseHtmlBookmarks(content);
}

/**
 * Filter bookmarks to only content we can process
 */
export function filterProcessableBookmarks(bookmarks: ParsedBookmark[]): ParsedBookmark[] {
  return bookmarks.filter(b => {
    // Keep YouTube links
    if (isYouTubeUrl(b.url)) return true;
    
    // Keep PDF links
    if (b.url.toLowerCase().endsWith('.pdf')) return true;
    
    // Keep blog/article links (filter out likely non-content)
    const nonContentPatterns = [
      /\/login/i,
      /\/signin/i,
      /\/signup/i,
      /\/cart/i,
      /\/checkout/i,
      /\/account/i,
      /\/search/i,
      /google\.com\/search/i,
      /facebook\.com/i,
      /twitter\.com/i,
      /instagram\.com/i,
      /linkedin\.com/i,
    ];
    
    if (nonContentPatterns.some(p => p.test(b.url))) {
      return false;
    }
    
    return true;
  });
}

/**
 * URL validation helpers
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
}

function isYouTubeUrl(url: string): boolean {
  return /youtube\.com|youtu\.be/i.test(url);
}

/**
 * Deduplicate bookmarks by URL
 */
export function deduplicateBookmarks(bookmarks: ParsedBookmark[]): ParsedBookmark[] {
  const seen = new Set<string>();
  return bookmarks.filter(b => {
    const normalized = normalizeUrl(b.url);
    if (seen.has(normalized)) {
      return false;
    }
    seen.add(normalized);
    return true;
  });
}

function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Remove www, trailing slash, and common tracking params
    let normalized = parsed.hostname.replace(/^www\./, '') + parsed.pathname.replace(/\/$/, '');
    return normalized.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}
