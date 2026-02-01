import React, { memo } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Content } from '../../lib/store/feedStore';
import BlogReader from '../reader/BlogReader';
import YouTubePlayer from '../reader/YouTubePlayer';
import PDFViewer from '../reader/PDFViewer';

interface ContentCardProps {
  content: Content;
  isActive: boolean;
  onTap: () => void;
}

function ContentCard({ content, isActive, onTap }: ContentCardProps) {
  const renderContent = () => {
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
        return (
          <BlogReader
            content={content}
            isActive={isActive}
          />
        );
    }
  };

  return (
    <Pressable style={styles.container} onPress={onTap}>
      <View style={styles.content}>
        {renderContent()}
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
});

// Memoize to prevent unnecessary re-renders during swipe
export default memo(ContentCard, (prev, next) => {
  return prev.content.id === next.content.id && prev.isActive === next.isActive;
});
