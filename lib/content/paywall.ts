/**
 * Paywall Detection and Handling
 * 
 * Detects paywalled content and provides fallback options:
 * 1. Check for common paywall indicators
 * 2. Attempt to extract available content
 * 3. Offer alternatives (hide, render as website, etc.)
 */

export type PaywallStatus = 
  | 'free'           // No paywall detected
  | 'soft-paywall'   // Some content visible
  | 'hard-paywall'   // Content fully blocked
  | 'login-required' // Needs login but might be free
  | 'unknown';       // Unable to determine

export interface PaywallCheckResult {
  status: PaywallStatus;
  provider?: string;        // e.g., 'medium', 'nytimes', 'substack'
  hasPartialContent: boolean;
  contentPreview?: string;  // First ~200 chars if available
  suggestions: PaywallSuggestion[];
}

export interface PaywallSuggestion {
  type: 'hide' | 'render-website' | 'archive' | 'login' | 'subscribe';
  label: string;
  description: string;
}

// Known paywall providers and their detection patterns
const PAYWALL_PROVIDERS: Record<string, {
  name: string;
  patterns: RegExp[];
  type: PaywallStatus;
}> = {
  medium: {
    name: 'Medium',
    patterns: [
      /medium\.com/i,
      /\/membership\?source=/i,
      /metered-paywall/i,
    ],
    type: 'soft-paywall',
  },
  substack: {
    name: 'Substack',
    patterns: [
      /substack\.com/i,
      /\.substack\.com/i,
      /paywall-content/i,
    ],
    type: 'soft-paywall',
  },
  nytimes: {
    name: 'New York Times',
    patterns: [
      /nytimes\.com/i,
      /gateway\.nytimes/i,
    ],
    type: 'hard-paywall',
  },
  wsj: {
    name: 'Wall Street Journal',
    patterns: [
      /wsj\.com/i,
    ],
    type: 'hard-paywall',
  },
  bloomberg: {
    name: 'Bloomberg',
    patterns: [
      /bloomberg\.com/i,
    ],
    type: 'soft-paywall',
  },
  washingtonpost: {
    name: 'Washington Post',
    patterns: [
      /washingtonpost\.com/i,
    ],
    type: 'soft-paywall',
  },
  theathletic: {
    name: 'The Athletic',
    patterns: [
      /theathletic\.com/i,
    ],
    type: 'hard-paywall',
  },
};

// Generic paywall detection patterns
const PAYWALL_INDICATORS = [
  /subscribe to (continue|read|access)/i,
  /paywall/i,
  /subscription required/i,
  /members only/i,
  /premium (content|article)/i,
  /sign up to (continue|read)/i,
  /this article is for (subscribers|members)/i,
  /unlock this article/i,
  /get unlimited access/i,
];

const LOGIN_INDICATORS = [
  /sign in to continue/i,
  /log in to read/i,
  /create an account/i,
  /register to access/i,
];

/**
 * Check URL for known paywall providers
 */
export function detectPaywallProvider(url: string): { name: string; type: PaywallStatus } | null {
  for (const [, provider] of Object.entries(PAYWALL_PROVIDERS)) {
    if (provider.patterns.some(p => p.test(url))) {
      return { name: provider.name, type: provider.type };
    }
  }
  return null;
}

/**
 * Analyze HTML content for paywall indicators
 */
export function analyzeContentForPaywall(html: string): PaywallCheckResult {
  const lowerHtml = html.toLowerCase();
  
  // Check for login requirement
  const needsLogin = LOGIN_INDICATORS.some(p => p.test(html));
  
  // Check for paywall indicators
  const hasPaywall = PAYWALL_INDICATORS.some(p => p.test(html));
  
  // Check content length (very short = likely blocked)
  const textContent = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  const wordCount = textContent.split(/\s+/).length;
  const isShort = wordCount < 200;
  
  // Determine status
  let status: PaywallStatus = 'free';
  if (needsLogin && !hasPaywall) {
    status = 'login-required';
  } else if (hasPaywall && isShort) {
    status = 'hard-paywall';
  } else if (hasPaywall) {
    status = 'soft-paywall';
  }
  
  // Extract preview
  const contentPreview = textContent.length > 200 
    ? textContent.substring(0, 200) + '...'
    : textContent;
  
  // Generate suggestions
  const suggestions = generateSuggestions(status, needsLogin);
  
  return {
    status,
    hasPartialContent: wordCount > 100,
    contentPreview: contentPreview.length > 50 ? contentPreview : undefined,
    suggestions,
  };
}

/**
 * Check URL and content for paywall status
 */
export function checkPaywall(url: string, html?: string): PaywallCheckResult {
  // First check known providers
  const provider = detectPaywallProvider(url);
  
  if (provider && !html) {
    // Known provider without content analysis
    return {
      status: provider.type,
      provider: provider.name,
      hasPartialContent: provider.type === 'soft-paywall',
      suggestions: generateSuggestions(provider.type, false),
    };
  }
  
  if (html) {
    const analysis = analyzeContentForPaywall(html);
    if (provider) {
      analysis.provider = provider.name;
    }
    return analysis;
  }
  
  return {
    status: 'unknown',
    hasPartialContent: false,
    suggestions: generateSuggestions('unknown', false),
  };
}

/**
 * Generate suggestions based on paywall status
 */
function generateSuggestions(status: PaywallStatus, needsLogin: boolean): PaywallSuggestion[] {
  const suggestions: PaywallSuggestion[] = [];
  
  if (status === 'login-required' || needsLogin) {
    suggestions.push({
      type: 'login',
      label: 'Log in to access',
      description: 'Open the website to log in with your existing account',
    });
  }
  
  if (status === 'soft-paywall') {
    suggestions.push({
      type: 'render-website',
      label: 'View as website',
      description: 'Open in browser view to read available content',
    });
  }
  
  if (status === 'hard-paywall') {
    suggestions.push({
      type: 'archive',
      label: 'Try archive',
      description: 'Check if an archived version is available',
    });
    suggestions.push({
      type: 'subscribe',
      label: 'Subscribe',
      description: 'Visit the website to subscribe for full access',
    });
  }
  
  // Always offer hide as fallback
  suggestions.push({
    type: 'hide',
    label: 'Hide from feed',
    description: 'Remove this content from your feed',
  });
  
  return suggestions;
}

/**
 * Generate archive.org URL for potential cached version
 */
export function getArchiveUrl(url: string): string {
  return `https://web.archive.org/web/${encodeURIComponent(url)}`;
}

/**
 * Generate Google cache URL
 */
export function getGoogleCacheUrl(url: string): string {
  return `https://webcache.googleusercontent.com/search?q=cache:${encodeURIComponent(url)}`;
}

/**
 * Check if URL is from a known free content provider
 */
export function isKnownFreeProvider(url: string): boolean {
  const freeProviders = [
    /github\.com/i,
    /gitlab\.com/i,
    /stackoverflow\.com/i,
    /developer\.mozilla\.org/i,
    /docs\.google\.com/i,
    /wikipedia\.org/i,
    /hackernews/i,
    /reddit\.com/i,
    /dev\.to/i,
    /hashnode\.com/i,
    /freecodecamp\.org/i,
  ];
  
  return freeProviders.some(p => p.test(url));
}
