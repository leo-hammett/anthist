import React, { useCallback, useMemo, useRef } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { GestureType } from 'react-native-gesture-handler';
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
  // All hooks must be called unconditionally and in the same order every render
  const carouselRef = useRef<ICarouselInstance>(null);
  const lastTapRef = useRef<number>(0);
  // Track the previous index for telemetry (using ref to avoid stale closure issues)
  const previousIndexRef = useRef<number>(0);
  
  // Use separate selectors to minimize re-renders and ensure stable references
  const contents = useFeedStore(state => state.contents);
  const rankedContentIds = useFeedStore(state => state.rankedContentIds);
  const currentIndex = useFeedStore(state => state.currentIndex);
  const goToIndex = useFeedStore(state => state.goToIndex);

  // Memoize ordered content to prevent unnecessary recalculations
  // This ensures stable reference when dependencies haven't changed
  const orderedContent = useMemo(() => {
    return rankedContentIds
      .map(id => contents.find(c => c.id === id))
      .filter((c): c is Content => c !== null && c.status === 'ACTIVE');
  }, [rankedContentIds, contents]);

  // Memoize content IDs for stable dependency in callbacks
  const orderedContentIds = useMemo(() => {
    return orderedContent.map(c => c.id);
  }, [orderedContent]);

  // Handle snap with stable callback - uses refs to avoid stale closures
  const handleSnapToItem = useCallback((index: number) => {
    const previousIndex = previousIndexRef.current;
    
    // End previous session and start new one
    if (previousIndex !== index && orderedContentIds.length > 0) {
      const direction = index > previousIndex ? 'NEXT' : 'BACK';
      telemetryTracker.endSession(direction);
      
      // Start new session with the content at new index
      const newContentId = orderedContentIds[index];
      if (newContentId) {
        telemetryTracker.startSession(newContentId);
      }
    }
    
    // Update the ref for next comparison
    previousIndexRef.current = index;
    goToIndex(index);
  }, [orderedContentIds, goToIndex]);

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
  // Empty dependency array since this uses only constants
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

  // Configure pan gesture to allow vertical scrolling to pass through
  // Empty dependency array since this uses only constants
  const configurePanGesture = useCallback((gesture: GestureType) => {
    'worklet';
    // Only activate horizontal carousel gesture after significant horizontal movement
    // This allows vertical scrolling to work naturally within content cards
    gesture.activeOffsetX([-15, 15]);
    // Fail the carousel gesture if user moves vertically first
    // This passes control to the inner ScrollView for vertical scrolling
    gesture.failOffsetY([-5, 5]);
  }, []);

  // Memoize the render function to prevent unnecessary re-renders of carousel items
  const renderItem = useCallback(({ item, index }: { item: Content; index: number }) => (
    <ContentCard
      content={item}
      isActive={index === currentIndex}
      onTap={handleTap}
    />
  ), [currentIndex, handleTap]);

  // Show empty state if no content
  // Note: All hooks have been called above, so this early return is safe
  if (orderedContent.length === 0) {
    return <EmptyFeed onDoubleTap={onDoubleTap} />;
  }

  // Ensure currentIndex is within bounds to prevent crashes
  const safeDefaultIndex = Math.min(
    Math.max(0, currentIndex),
    orderedContent.length - 1
  );

  return (
    <View style={styles.container}>
      <Carousel
        ref={carouselRef}
        data={orderedContent}
        width={SCREEN_WIDTH}
        height={SCREEN_HEIGHT}
        loop={false}
        defaultIndex={safeDefaultIndex}
        onSnapToItem={handleSnapToItem}
        onConfigurePanGesture={configurePanGesture}
        renderItem={renderItem}
        // Smooth animation - fullscreen content with subtle swipe effect
        scrollAnimationDuration={300}
        customAnimation={customAnimation}
        // Performance optimizations
        windowSize={3}
        maxRenderPerBatch={3}
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
