/**
 * Anthist Share Handler
 * 
 * Handles incoming shared content from:
 * - iOS Share Sheet
 * - Android Share Intent
 * - Deep links (anthist://add?url=...)
 * 
 * Note: Full share extension requires native code and dev build.
 * This module handles the processing once content is received.
 */

import * as Linking from 'expo-linking';
import { detectContentType, isValidUrl } from './extractor';
import { useFeedStore } from '../store/feedStore';
import { useAuthStore } from '../store/authStore';

export interface SharedContent {
  url?: string;
  text?: string;
  title?: string;
  source: 'share' | 'clipboard' | 'deeplink';
}

/**
 * Extract URL from shared text
 * Handles cases where text contains a URL among other content
 */
export function extractUrlFromText(text: string): string | null {
  // Try to find a URL in the text
  const urlPattern = /https?:\/\/[^\s<>"']+/gi;
  const matches = text.match(urlPattern);
  
  if (matches && matches.length > 0) {
    // Clean up the URL (remove trailing punctuation)
    return matches[0].replace(/[.,;:!?)]+$/, '');
  }
  
  // Check if the entire text is a URL
  const trimmed = text.trim();
  if (isValidUrl(trimmed)) {
    return trimmed;
  }
  
  return null;
}

/**
 * Process shared content and add to feed
 */
export async function processSharedContent(
  shared: SharedContent,
  userId: string
): Promise<{ success: boolean; message: string; contentId?: string }> {
  // Extract URL from shared content
  let url: string | null = null;
  
  if (shared.url && isValidUrl(shared.url)) {
    url = shared.url;
  } else if (shared.text) {
    url = extractUrlFromText(shared.text);
  }
  
  if (!url) {
    return {
      success: false,
      message: 'No valid URL found in shared content',
    };
  }
  
  // Detect content type
  const detected = detectContentType(url);
  
  if (detected.type === 'unknown') {
    return {
      success: false,
      message: 'Unable to process this type of content',
    };
  }
  
  if (detected.type === 'youtube_playlist') {
    return {
      success: false,
      message: 'Playlist import coming soon! Please share individual videos for now.',
    };
  }
  
  // Map to content type
  let contentType: 'BLOG' | 'YOUTUBE' | 'PDF' = 'BLOG';
  if (detected.type === 'youtube') contentType = 'YOUTUBE';
  if (detected.type === 'pdf') contentType = 'PDF';
  
  // Get the store action (can't use hooks outside React)
  const { addContent } = useFeedStore.getState();
  
  try {
    const content = await addContent({
      userId,
      url: detected.cleanUrl,
      type: contentType,
      title: shared.title ?? detected.cleanUrl,
      status: 'ACTIVE',
    });
    
    if (content) {
      return {
        success: true,
        message: `Added ${contentType.toLowerCase()} to your feed`,
        contentId: content.id,
      };
    }
    
    return {
      success: false,
      message: 'Failed to add content',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to add content',
    };
  }
}

/**
 * Parse deep link URL
 */
export function parseDeepLink(url: string): SharedContent | null {
  try {
    const parsed = Linking.parse(url);
    
    // Handle anthist://add?url=xxx
    if (parsed.path === 'add' && parsed.queryParams?.url) {
      return {
        url: parsed.queryParams.url as string,
        source: 'deeplink',
      };
    }
    
    // Handle anthist://share?text=xxx
    if (parsed.path === 'share' && parsed.queryParams?.text) {
      return {
        text: parsed.queryParams.text as string,
        source: 'deeplink',
      };
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Setup deep link listener
 */
export function setupDeepLinkHandler(onShare: (content: SharedContent) => void) {
  // Handle initial URL (app opened via deep link)
  Linking.getInitialURL().then((url) => {
    if (url) {
      const content = parseDeepLink(url);
      if (content) {
        onShare(content);
      }
    }
  });
  
  // Handle deep links while app is running
  const subscription = Linking.addEventListener('url', (event) => {
    const content = parseDeepLink(event.url);
    if (content) {
      onShare(content);
    }
  });
  
  return () => {
    subscription.remove();
  };
}

/**
 * Create a shareable link to add content
 * Used for browser extensions or web sharing
 */
export function createAddContentUrl(url: string): string {
  return `anthist://add?url=${encodeURIComponent(url)}`;
}
