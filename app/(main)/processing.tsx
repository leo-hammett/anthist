import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Animated,
    Pressable,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from 'react-native';
import { getDefaultTheme, getThemeForContent } from '../../components/themes';
import { detectContentType, getYouTubeThumbnail } from '../../lib/content/extractor';
import { useAuthStore } from '../../lib/store/authStore';
import { useFeedStore } from '../../lib/store/feedStore';

type ProcessingState = 'processing' | 'saving' | 'success' | 'error';

interface ProcessedContent {
  title: string;
  description: string | null;
  author: string | null;
  thumbnail: string | null;
  wordCount: number | null;
  readingTimeMinutes: number | null;
  semanticTags: string[];
  extractedHtml: string | null;
  s3Key: string | null;
}

export default function ProcessingScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const params = useLocalSearchParams<{ url: string }>();
  const url = params.url ?? '';
  
  const { user } = useAuthStore();
  const { addContent, processContent, updateContent } = useFeedStore();

  const [state, setState] = useState<ProcessingState>('processing');
  const [error, setError] = useState<string | null>(null);
  const [processed, setProcessed] = useState<ProcessedContent | null>(null);
  const [contentId, setContentId] = useState<string | null>(null);

  // Animation values
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  // Pulse animation for loading state
  useEffect(() => {
    if (state === 'processing' || state === 'saving') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [state, pulseAnim]);

  // Process the URL when screen loads - auto-save when done (no confirmation needed)
  const processUrl = useCallback(async () => {
    if (!url || !user) {
      setError('Missing URL or not authenticated');
      setState('error');
      return;
    }

    try {
      setState('processing');
      setError(null);

      // Detect content type
      const detected = detectContentType(url);
      
      if (detected.type === 'youtube_playlist') {
        setError('Playlist import coming soon! For now, add individual videos.');
        setState('error');
        return;
      }

      // Map detected type
      let contentType: 'BLOG' | 'YOUTUBE' | 'PDF' = 'BLOG';
      if (detected.type === 'youtube') contentType = 'YOUTUBE';
      if (detected.type === 'pdf') contentType = 'PDF';

      // First, create the content entry in DB
      const content = await addContent({
        userId: user.cognitoId,
        url: detected.cleanUrl,
        type: contentType,
        title: 'Processing...', // Placeholder
        description: undefined,
        thumbnail: detected.videoId ? getYouTubeThumbnail(detected.videoId) : undefined,
        status: 'ACTIVE',
      });

      if (!content) {
        throw new Error('Failed to create content entry');
      }

      setContentId(content.id);

      // Now invoke the Lambda to process the content
      const result = await processContent({
        contentId: content.id,
        url: detected.cleanUrl,
        type: contentType,
        userId: user.cognitoId,
      });

      if (!result) {
        throw new Error('Content processing failed');
      }

      const processedData = {
        title: result.title ?? detected.cleanUrl,
        description: result.description ?? null,
        author: result.author ?? null,
        thumbnail: result.thumbnail ?? (detected.videoId ? getYouTubeThumbnail(detected.videoId) : null),
        wordCount: result.wordCount ?? null,
        readingTimeMinutes: result.readingTimeMinutes ?? null,
        semanticTags: result.semanticTags?.filter((t): t is string => t !== null) ?? [],
        extractedHtml: result.extractedHtml ?? null,
        s3Key: result.s3Key ?? null,
      };

      setProcessed(processedData);

      // Auto-save without requiring confirmation (simplified flow)
      setState('saving');
      
      await updateContent(content.id, {
        title: processedData.title,
        description: processedData.description ?? undefined,
        author: processedData.author ?? undefined,
        thumbnail: processedData.thumbnail ?? undefined,
        wordCount: processedData.wordCount ?? undefined,
        semanticTags: processedData.semanticTags,
        s3Key: processedData.s3Key ?? undefined,
      });

      // Show success briefly then navigate back
      setState('success');
      setTimeout(() => {
        router.back();
      }, 800);
    } catch (err: any) {
      console.error('Processing error:', err);
      setError(err.message || 'Failed to process content');
      setState('error');
    }
  }, [url, user, addContent, processContent, updateContent]);

  useEffect(() => {
    processUrl();
  }, [processUrl]);

  // Cancel and delete the pending content
  const handleCancel = async () => {
    if (contentId) {
      try {
        await useFeedStore.getState().deleteContent(contentId);
      } catch (err) {
        // Ignore deletion errors
      }
    }
    router.back();
  };

  // Retry processing
  const handleRetry = () => {
    processUrl();
  };

  // Get theme based on semantic tags
  const theme = processed?.semanticTags?.length
    ? getThemeForContent(processed.semanticTags, isDark)
    : getDefaultTheme(isDark);

  // Extract domain for display
  const domain = (() => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  })();

  // Render success state (shown briefly before navigating back)
  if (state === 'success') {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
        <View style={styles.loadingContainer}>
          <View style={[styles.successCircle, { backgroundColor: '#22C55E' }]}>
            <Text style={styles.successCheck}>✓</Text>
          </View>
          <Text style={[styles.loadingTitle, { color: theme.textColor }]}>
            Added to Feed
          </Text>
          <Text style={[styles.loadingSubtitle, { color: theme.textColor, opacity: 0.7 }]}>
            {processed?.title ?? domain}
          </Text>
        </View>
      </View>
    );
  }

  // Render loading state
  if (state === 'processing' || state === 'saving') {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
        <View style={styles.loadingContainer}>
          <Animated.View 
            style={[
              styles.loadingCircle,
              { 
                backgroundColor: theme.accentColor,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />
          <Text style={[styles.loadingTitle, { color: theme.textColor }]}>
            {state === 'saving' ? 'Adding to Feed...' : 'Extracting Content...'}
          </Text>
          <Text style={[styles.loadingSubtitle, { color: theme.textColor, opacity: 0.7 }]}>
            {domain}
          </Text>
          
          <View style={styles.loadingSteps}>
            <LoadingStep 
              label="Fetching page" 
              done={true} 
              theme={theme} 
            />
            <LoadingStep 
              label="Extracting content" 
              done={state === 'saving'} 
              active={state === 'processing'}
              theme={theme} 
            />
            <LoadingStep 
              label="Adding to feed" 
              done={false} 
              active={state === 'saving'}
              theme={theme} 
            />
          </View>
        </View>

        <Pressable style={styles.cancelButton} onPress={handleCancel}>
          <Text style={[styles.cancelButtonText, { color: theme.linkColor }]}>Cancel</Text>
        </Pressable>
      </View>
    );
  }

  // Render error state
  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0A0A0A' : '#F3F4F6' }]}>
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={[styles.errorTitle, { color: isDark ? '#F87171' : '#DC2626' }]}>
          Processing Failed
        </Text>
        <Text style={[styles.errorMessage, { color: isDark ? '#D1D5DB' : '#4B5563' }]}>
          {error || 'Something went wrong'}
        </Text>
        
        <View style={styles.errorActions}>
          <Pressable 
            style={[styles.retryButton, { backgroundColor: '#3B82F6' }]} 
            onPress={handleRetry}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>
          <Pressable style={styles.cancelButton} onPress={handleCancel}>
            <Text style={[styles.cancelButtonText, { color: '#3B82F6' }]}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// Loading step component
function LoadingStep({ 
  label, 
  done, 
  active, 
  theme 
}: { 
  label: string; 
  done: boolean; 
  active?: boolean;
  theme: any;
}) {
  return (
    <View style={styles.loadingStep}>
      <View style={[
        styles.stepDot, 
        { 
          backgroundColor: done ? theme.accentColor : 'transparent',
          borderColor: active ? theme.accentColor : theme.textColor + '30',
        }
      ]}>
        {done && <Text style={styles.stepCheck}>✓</Text>}
      </View>
      <Text style={[
        styles.stepLabel, 
        { 
          color: theme.textColor,
          opacity: done ? 1 : active ? 0.8 : 0.5,
        }
      ]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 24,
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCheck: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '700',
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 15,
    marginBottom: 40,
    textAlign: 'center',
  },
  loadingSteps: {
    alignSelf: 'stretch',
  },
  loadingStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCheck: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  stepLabel: {
    fontSize: 16,
  },
  
  // Error state
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
  },
  errorActions: {
    alignItems: 'center',
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  
  // Cancel button (shared)
  cancelButton: {
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 17,
  },
});
