import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import YoutubePlayer, { YoutubeIframeRef } from 'react-native-youtube-iframe';
import { extractYouTubeVideoId } from '../../lib/content/extractor';
import { telemetryTracker } from '../../lib/telemetry/tracker';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIDEO_HEIGHT = (SCREEN_WIDTH * 9) / 16; // 16:9 aspect ratio

interface YouTubePlayerProps {
  content: {
    id: string;
    url: string;
    title: string;
    author?: string;
    description?: string;
    publishedAt?: string;
    videoPosition: number;
  };
  isActive: boolean;
}

export default function YouTubePlayer({ content, isActive }: YouTubePlayerProps) {
  // All hooks must be called unconditionally and in the same order every render
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const playerRef = useRef<YoutubeIframeRef>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playerReady, setPlayerReady] = useState(false);

  // Memoize video ID extraction to avoid recalculation
  const videoId = useMemo(() => {
    try {
      return extractYouTubeVideoId(content.url);
    } catch {
      return null;
    }
  }, [content.url]);

  // Resume from saved position
  useEffect(() => {
    if (isActive && content.videoPosition > 0 && playerRef.current && playerReady) {
      try {
        playerRef.current.seekTo(content.videoPosition, true);
      } catch (err) {
        console.warn('Failed to seek to saved position:', err);
      }
    }
  }, [isActive, content.videoPosition, playerReady]);

  // Auto-pause when not active
  useEffect(() => {
    if (!isActive && isPlaying) {
      setIsPlaying(false);
    }
  }, [isActive, isPlaying]);

  // Track video progress for telemetry
  useEffect(() => {
    if (!isPlaying || !playerReady) return;

    const interval = setInterval(async () => {
      try {
        if (playerRef.current) {
          const time = await playerRef.current.getCurrentTime();
          setCurrentTime(time);
          
          if (duration > 0) {
            const completionRate = time / duration;
            telemetryTracker.updateVideoCompletion(completionRate);
          }
        }
      } catch (err) {
        // Player might not be ready, ignore error
        console.warn('Failed to get current time:', err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, duration, playerReady]);

  const handleStateChange = useCallback((state: string) => {
    if (state === 'playing') {
      setIsPlaying(true);
    } else if (state === 'paused') {
      setIsPlaying(false);
      telemetryTracker.recordVideoPause();
    } else if (state === 'ended') {
      setIsPlaying(false);
      telemetryTracker.updateVideoCompletion(1);
    }
  }, []);

  const handleReady = useCallback(async () => {
    setPlayerReady(true);
    try {
      if (playerRef.current) {
        const dur = await playerRef.current.getDuration();
        setDuration(dur);
      }
    } catch (err) {
      console.warn('Failed to get video duration:', err);
    }
  }, []);

  const handleError = useCallback((error: string) => {
    console.warn('YouTube player error:', error);
    setIsPlaying(false);
  }, []);

  // All hooks called above - now safe to do early returns
  if (!videoId) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <Text style={[styles.errorText, isDark && styles.errorTextDark]}>
          Invalid YouTube URL
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, isDark && styles.containerDark]}
      contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top, paddingBottom: insets.bottom + 40 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Video Player */}
      <View style={styles.playerContainer}>
        <YoutubePlayer
          ref={playerRef}
          height={VIDEO_HEIGHT}
          width={SCREEN_WIDTH}
          videoId={videoId}
          play={isPlaying && isActive && playerReady}
          onChangeState={handleStateChange}
          onReady={handleReady}
          onError={handleError}
          webViewProps={{
            allowsInlineMediaPlayback: true,
            mediaPlaybackRequiresUserAction: false,
          }}
          // Disable YouTube UI elements we don't want
          initialPlayerParams={{
            controls: true,
            modestbranding: true,
            rel: false, // Don't show related videos
            showClosedCaptions: false,
          }}
        />
      </View>

      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={[styles.title, isDark && styles.titleDark]}>
          {content.title}
        </Text>
        
        {content.author && (
          <Text style={[styles.author, isDark && styles.authorDark]}>
            {content.author}
          </Text>
        )}

        {content.publishedAt && (
          <Text style={[styles.date, isDark && styles.dateDark]}>
            {new Date(content.publishedAt).toLocaleDateString()}
          </Text>
        )}
      </View>

      {/* Description */}
      {content.description && (
        <View style={styles.descriptionContainer}>
          <Text style={[styles.description, isDark && styles.descriptionDark]}>
            {content.description}
          </Text>
        </View>
      )}

      {/* Progress indicator */}
      {duration > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(currentTime / duration) * 100}%` }
              ]} 
            />
          </View>
          <Text style={[styles.progressText, isDark && styles.progressTextDark]}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </Text>
        </View>
      )}

    </ScrollView>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  containerDark: {
    backgroundColor: '#0A0A0A',
  },
  scrollContent: {},
  playerContainer: {
    width: SCREEN_WIDTH,
    height: VIDEO_HEIGHT,
    backgroundColor: '#000',
  },
  titleContainer: {
    padding: 20,
    paddingTop: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    lineHeight: 28,
  },
  titleDark: {
    color: '#FFFFFF',
  },
  author: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginTop: 8,
  },
  authorDark: {
    color: '#AAA',
  },
  date: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  dateDark: {
    color: '#666',
  },
  descriptionContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  description: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  descriptionDark: {
    color: '#CCC',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF0000',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
    textAlign: 'right',
  },
  progressTextDark: {
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 100,
  },
  errorTextDark: {
    color: '#AAA',
  },
});
