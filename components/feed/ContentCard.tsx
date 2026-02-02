import React, { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Content } from '../../lib/store/feedStore';
import { ErrorBoundary } from '../ErrorBoundary';
import BlogReader from '../reader/BlogReader';
import PDFViewer from '../reader/PDFViewer';
import YouTubePlayer from '../reader/YouTubePlayer';

interface ContentCardProps {
  content: Content;
  isActive: boolean;
  onTap: () => void;
}

// Fallback component for when a reader fails
function ContentErrorFallback() {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorEmoji}>📄</Text>
      <Text style={styles.errorTitle}>Unable to display content</Text>
      <Text style={styles.errorMessage}>
        There was a problem loading this content. Try swiping to the next item.
      </Text>
    </View>
  );
}

function ContentCard({ content, isActive, onTap }: ContentCardProps) {
  // Memoize the content renderer based on content type
  const renderedContent = useMemo(() => {
    // Validate content has required fields
    if (!content || !content.id || !content.type) {
      return <ContentErrorFallback />;
    }

    switch (content.type) {
      case 'BLOG':
        return (
          <BlogReader
            content={content}
            isActive={isActive}
          />
        );
      case 'YOUTUBE':
      case 'PLAYLIST_VIDEO':
        return (
          <YouTubePlayer
            content={content}
            isActive={isActive}
          />
        );
      case 'PDF':
        return (
          <PDFViewer
            content={content}
            isActive={isActive}
          />
        );
      default:
        // Default to BlogReader for unknown types
        return (
          <BlogReader
            content={content}
            isActive={isActive}
          />
        );
    }
  }, [content, isActive]);

  return (
    <Pressable style={styles.container} onPress={onTap}>
      <View style={styles.content}>
        <ErrorBoundary fallback={<ContentErrorFallback />}>
          {renderedContent}
        </ErrorBoundary>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
});

// Memoize to prevent unnecessary re-renders during swipe
export default memo(ContentCard, (prev, next) => {
  // Deep compare critical fields to avoid unnecessary re-renders
  return (
    prev.content.id === next.content.id && 
    prev.isActive === next.isActive &&
    prev.content.type === next.content.type
  );
});
