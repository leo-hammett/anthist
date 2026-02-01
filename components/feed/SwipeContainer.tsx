import React, { useCallback, useRef } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { interpolate } from 'react-native-reanimated';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';
import { Content, useFeedStore } from '../../lib/store/feedStore';
import { telemetryTracker } from '../../lib/telemetry/tracker';
import ContentCard from './ContentCard';
import EmptyFeed from './EmptyFeed';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SwipeContainerProps {
  onDoubleTap: () => void;
}

export default function SwipeContainer({ onDoubleTap }: SwipeContainerProps) {
  const carouselRef = useRef<ICarouselInstance>(null);
  const lastTapRef = useRef<number>(0);
  
  const {
    contents,
    rankedContentIds,
    currentIndex,
    goToNext,
    goToPrevious,
    goToIndex,
    getContentById,
  } = useFeedStore();

  // Get ordered content based on rankings
  const orderedContent = rankedContentIds
    .map(id => getContentById(id))
    .filter((c): c is Content => c !== null);

  const handleSnapToItem = useCallback((index: number) => {
    const previousIndex = currentIndex;
    
    // End previous session
    if (previousIndex !== index) {
      const direction = index > previousIndex ? 'NEXT' : 'BACK';
      telemetryTracker.endSession(direction);
      
      // Start new session
      const newContent = orderedContent[index];
      if (newContent) {
        telemetryTracker.startSession(newContent.id);
      }
    }
    
    goToIndex(index);
  }, [currentIndex, orderedContent, goToIndex]);

  const handleTap = useCallback(() => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      onDoubleTap();
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
    
    // Record touch for telemetry
    telemetryTracker.recordTouch();
  }, [onDoubleTap]);

  // Custom animation: fullscreen at rest, subtle scale during swipe
  // NOTE: Must be defined before early return to maintain hooks order
  const customAnimation = useCallback((value: number) => {
    'worklet';
    const scale = interpolate(
      value,
      [-1, 0, 1],
      [0.95, 1, 0.95]
    );
    const opacity = interpolate(
      value,
      [-1, 0, 1],
      [0.5, 1, 0.5]
    );
    const translateX = interpolate(
      value,
      [-1, 0, 1],
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH]
    );

    return {
      transform: [
        { translateX },
        { scale },
      ],
      opacity,
    };
  }, []);

  // Show empty state if no content
  if (orderedContent.length === 0) {
    return <EmptyFeed onDoubleTap={onDoubleTap} />;
  }

  return (
    <View style={styles.container}>
      <Carousel
        ref={carouselRef}
        data={orderedContent}
        width={SCREEN_WIDTH}
        height={SCREEN_HEIGHT}
        loop={false}
        defaultIndex={currentIndex}
        onSnapToItem={handleSnapToItem}
        renderItem={({ item, index }) => (
          <ContentCard
            content={item}
            isActive={index === currentIndex}
            onTap={handleTap}
          />
        )}
        // Smooth animation - fullscreen content with subtle swipe effect
        scrollAnimationDuration={300}
        customAnimation={customAnimation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
