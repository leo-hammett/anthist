import { downloadData } from 'aws-amplify/storage';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, NativeScrollEvent, NativeSyntheticEvent, Pressable, StyleSheet, Text, useColorScheme, useWindowDimensions, View } from 'react-native';
// Use ScrollView from gesture-handler for proper gesture coordination with carousel
import { ScrollView } from 'react-native-gesture-handler';
import RenderHtml from 'react-native-render-html';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../lib/store/authStore';
import { Content, useFeedStore } from '../../lib/store/feedStore';
import { telemetryTracker } from '../../lib/telemetry/tracker';
import { getAllThemes, getDefaultTheme, getThemeForContent, ReaderTheme } from '../themes';

interface BlogReaderProps {
  content: Content;
  isActive: boolean;
}

export default function BlogReader({ content, isActive }: BlogReaderProps) {
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const isDark = colorScheme === 'dark';
  
  const { user } = useAuthStore();
  const { reprocessContent, isReprocessing, getThemeOverride } = useFeedStore();
  const isThisReprocessing = isReprocessing === content.id;
  
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsReprocessing, setNeedsReprocessing] = useState(false);

  // Scroll tracking
  const scrollStartTime = useRef<number>(0);
  const lastScrollY = useRef<number>(0);
  const scrollPauseTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentHeight = useRef<number>(1);

  // Get theme - use store override or smart matching
  const getActiveTheme = useCallback((): ReaderTheme => {
    const themeOverride = getThemeOverride(content.id);
    if (themeOverride) {
      const overrideTheme = getAllThemes().find(t => t.id === themeOverride);
      if (overrideTheme) return overrideTheme;
    }
    
    // Use smart matching based on content semantic tags
    if (content.semanticTags?.length) {
      return getThemeForContent(content.semanticTags, isDark);
    }
    
    return getDefaultTheme(isDark);
  }, [content.id, content.semanticTags, isDark, getThemeOverride]);

  const theme = getActiveTheme();

  // Load content from S3 or show placeholder
  useEffect(() => {
    async function loadContent() {
      setIsLoading(true);
      setError(null);
      setNeedsReprocessing(false);

      try {
        if (content.s3Key) {
          // Fetch from S3 using Amplify Storage
          try {
            const result = await downloadData({ 
              path: content.s3Key,
            }).result;
            const text = await result.body.text();
            setHtmlContent(text);
          } catch (s3Error) {
            console.warn('S3 fetch failed, needs reprocessing:', s3Error);
            // Content exists in DB but S3 failed - needs reprocessing
            setHtmlContent(createPlaceholderHtml(content, 'Content needs to be re-extracted.'));
            setNeedsReprocessing(true);
          }
        } else {
          // No stored content yet - needs processing
          const isStillProcessing = content.title === 'Processing...';
          if (isStillProcessing) {
            setHtmlContent(createPlaceholderHtml(content, 'Processing failed. Tap to retry.'));
          } else {
            setHtmlContent(createPlaceholderHtml(content, 'Content not extracted yet.'));
          }
          setNeedsReprocessing(true);
        }
      } catch (err) {
        setError('Failed to load content');
        console.error('Error loading blog content:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadContent();
  }, [content.id, content.s3Key, content.title]);

  // Handle reprocessing
  const handleReprocess = useCallback(async () => {
    if (!user || isThisReprocessing) return;
    
    const success = await reprocessContent(content.id, user.cognitoId);
    if (success) {
      // Content will be updated in store, trigger re-render
      setNeedsReprocessing(false);
    }
  }, [content.id, user, reprocessContent, isThisReprocessing]);

  // Create placeholder HTML when content isn't available
  function createPlaceholderHtml(content: Content, _message: string): string {
    return `
      <article>
        <h1>${escapeHtml(content.title)}</h1>
        ${content.author ? `<p class="byline">By ${escapeHtml(content.author)}</p>` : ''}
        ${content.description ? `<p class="excerpt">${escapeHtml(content.description)}</p>` : ''}
      </article>
    `;
  }

  function escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Resume scroll position
  useEffect(() => {
    if (isActive && content.scrollPosition > 0 && scrollViewRef.current) {
      const targetY = content.scrollPosition * contentHeight.current;
      scrollViewRef.current.scrollTo({ y: targetY, animated: false });
    }
  }, [isActive, content.scrollPosition]);

  // Handle scroll events for telemetry
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const currentY = contentOffset.y;
    const maxScroll = contentSize.height - layoutMeasurement.height;
    
    contentHeight.current = contentSize.height;

    // Calculate scroll depth (0-1)
    const scrollDepth = maxScroll > 0 ? Math.min(1, currentY / maxScroll) : 0;

    // Calculate scroll speed
    const now = Date.now();
    const timeDelta = now - scrollStartTime.current;
    const scrollDelta = Math.abs(currentY - lastScrollY.current);
    const scrollSpeed = timeDelta > 0 ? scrollDelta / timeDelta : 0;

    scrollStartTime.current = now;
    lastScrollY.current = currentY;

    // Update telemetry
    telemetryTracker.updateScrollMetrics(scrollDepth, scrollSpeed);

    // Detect scroll pauses (reading indicator)
    if (scrollPauseTimeout.current) {
      clearTimeout(scrollPauseTimeout.current);
    }
    scrollPauseTimeout.current = setTimeout(() => {
      telemetryTracker.recordScrollPause();
    }, 1500); // 1.5s pause = reading
  }, []);

  // Cleanup pause timeout
  useEffect(() => {
    return () => {
      if (scrollPauseTimeout.current) {
        clearTimeout(scrollPauseTimeout.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
        <ActivityIndicator size="large" color={theme.textColor} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
        <Text style={[styles.errorText, { color: theme.textColor }]}>{error}</Text>
      </View>
    );
  }

  return (
    // collapsable={false} is required on iOS for proper ScrollView behavior
    // This prevents text clipping issues at the top of the screen
    <View 
      style={[styles.container, { backgroundColor: theme.backgroundColor }]} 
      collapsable={false}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 60 },
        ]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        // Ensure content is never clipped on iOS
        contentInsetAdjustmentBehavior="never"
        // Allow scroll view to handle gestures properly with the carousel
        keyboardShouldPersistTaps="handled"
      >
      {htmlContent && (
        <RenderHtml
          contentWidth={width - 48}
          source={{ html: htmlContent }}
          baseStyle={{
            color: theme.textColor,
            fontFamily: theme.fontFamily,
            fontSize: theme.fontSize,
            lineHeight: theme.lineHeight,
          }}
          tagsStyles={{
            h1: {
              fontSize: theme.fontSize * 1.8,
              fontWeight: '700',
              marginBottom: 16,
              color: theme.headingColor ?? theme.textColor,
            },
            h2: {
              fontSize: theme.fontSize * 1.4,
              fontWeight: '600',
              marginTop: 24,
              marginBottom: 12,
              color: theme.headingColor ?? theme.textColor,
            },
            h3: {
              fontSize: theme.fontSize * 1.2,
              fontWeight: '600',
              marginTop: 20,
              marginBottom: 10,
              color: theme.headingColor ?? theme.textColor,
            },
            p: {
              marginBottom: 16,
            },
            a: {
              color: theme.linkColor,
              textDecorationLine: 'underline',
            },
            blockquote: {
              borderLeftWidth: 4,
              borderLeftColor: theme.accentColor,
              paddingLeft: 16,
              marginVertical: 16,
              fontStyle: 'italic',
              opacity: 0.9,
            },
            code: {
              fontFamily: 'monospace',
              backgroundColor: theme.codeBackgroundColor ?? 'rgba(0,0,0,0.1)',
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 4,
              fontSize: theme.fontSize * 0.9,
            },
            pre: {
              backgroundColor: theme.codeBackgroundColor ?? 'rgba(0,0,0,0.1)',
              padding: 16,
              borderRadius: 8,
              overflow: 'hidden',
            },
            img: {
              maxWidth: '100%',
              borderRadius: 8,
              marginVertical: 16,
            },
          }}
        />
      )}
      
      {/* Content not extracted notice */}
      {needsReprocessing && (
        <View style={[styles.notExtractedContainer, { borderColor: theme.accentColor + '40' }]}>
          <View style={[styles.notExtractedIconContainer, { backgroundColor: theme.accentColor + '20' }]}>
            <Text style={styles.notExtractedIcon}>📄</Text>
          </View>
          
          <Text style={[styles.notExtractedTitle, { color: theme.textColor }]}>
            Content Not Yet Extracted
          </Text>
          
          <Text style={[styles.notExtractedMessage, { color: theme.textColor, opacity: 0.7 }]}>
            {isThisReprocessing 
              ? 'Extracting the article content...\nThis may take a moment.'
              : 'The full article hasn\'t been extracted yet.\nTry re-visiting this content in a moment, or tap below to extract now.'
            }
          </Text>
          
          <Pressable 
            style={[
              styles.forceExtractButton, 
              { backgroundColor: theme.accentColor },
              isThisReprocessing && styles.forceExtractButtonDisabled,
            ]}
            onPress={handleReprocess}
            disabled={isThisReprocessing}
          >
            {isThisReprocessing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.forceExtractButtonText}>Force Extract Content</Text>
            )}
          </Pressable>
          
          <Pressable 
            style={styles.visitOriginalLink}
            onPress={() => Linking.openURL(content.url)}
          >
            <Text style={[styles.visitOriginalText, { color: theme.linkColor }]}>
              Or visit the original site →
            </Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
  notExtractedContainer: {
    alignItems: 'center',
    marginTop: 32,
    marginHorizontal: 8,
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  notExtractedIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  notExtractedIcon: {
    fontSize: 28,
  },
  notExtractedTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  notExtractedMessage: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  forceExtractButton: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  forceExtractButtonDisabled: {
    opacity: 0.7,
  },
  forceExtractButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  visitOriginalLink: {
    marginTop: 16,
    paddingVertical: 8,
  },
  visitOriginalText: {
    fontSize: 14,
  },
});
