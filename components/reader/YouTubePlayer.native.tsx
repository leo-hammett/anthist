import React, { useCallback, useRef, useState, useEffect } from 'react';
import { StyleSheet, View, Text, useColorScheme, ScrollView, Dimensions } from 'react-native';
import YoutubePlayer, { YoutubeIframeRef } from 'react-native-youtube-iframe';
import { Content } from '../../lib/store/feedStore';
import { telemetryTracker } from '../../lib/telemetry/tracker';
import { extractYouTubeVideoId } from '../../lib/content/extractor';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIDEO_HEIGHT = (SCREEN_WIDTH * 9) / 16; // 16:9 aspect ratio

interface YouTubePlayerProps {
  content: Content;
  isActive: boolean;
}

export default function YouTubePlayer({ content, isActive }: YouTubePlayerProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const playerRef = useRef<YoutubeIframeRef>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const videoId = extractYouTubeVideoId(content.url);

  // Resume from saved position
  useEffect(() => {
    if (isActive && content.videoPosition > 0 && playerRef.current) {
      playerRef.current.seekTo(content.videoPosition, true);
    }
  }, [isActive, content.videoPosition]);

  // Auto-pause when not active
  useEffect(() => {
    if (!isActive && isPlaying) {
      setIsPlaying(false);
    }
  }, [isActive, isPlaying]);

  // Track video progress for telemetry
  useEffect(() => {
    const interval = setInterval(async () => {
      if (isPlaying && playerRef.current) {
        const time = await playerRef.current.getCurrentTime();
        setCurrentTime(time);
        
        if (duration > 0) {
          const completionRate = time / duration;
          telemetryTracker.updateVideoCompletion(completionRate);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, duration]);

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
    if (playerRef.current) {
      const dur = await playerRef.current.getDuration();
      setDuration(dur);
    }
  }, []);

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
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Video Player */}
      <View style={styles.playerContainer}>
        <YoutubePlayer
          ref={playerRef}
          height={VIDEO_HEIGHT}
          width={SCREEN_WIDTH}
          videoId={videoId}
          play={isPlaying && isActive}
          onChangeState={handleStateChange}
          onReady={handleReady}
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

      {/* Spacer for comfortable scrolling */}
      <View style={{ height: 100 }} />
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
  scrollContent: {
    paddingBottom: 40,
  },
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
