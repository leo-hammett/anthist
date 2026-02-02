/**
 * Anthist Share Extension
 * 
 * This component is the root of the iOS share sheet extension.
 * It allows users to share URLs from Safari and other apps directly to Anthist.
 * 
 * Note: Text and TextInput must use allowFontScaling={false} or import from expo-share-extension
 */
import { close, openHostApp, Text } from 'expo-share-extension';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    View,
} from 'react-native';
import { detectContentType, isValidUrl } from '../lib/content/extractor';

// Initial props passed from the share extension
interface ShareExtensionProps {
  url?: string;
  text?: string;
  title?: string;
}

export default function ShareExtension({ url, text, title }: ShareExtensionProps) {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [detectedUrl, setDetectedUrl] = useState<string | null>(null);
  const [contentType, setContentType] = useState<string>('');

  // Extract URL from shared content
  useEffect(() => {
    let extractedUrl: string | null = null;

    if (url && isValidUrl(url)) {
      extractedUrl = url;
    } else if (text) {
      // Try to find a URL in the text
      const urlPattern = /https?:\/\/[^\s<>"']+/gi;
      const matches = text.match(urlPattern);
      if (matches && matches.length > 0) {
        extractedUrl = matches[0].replace(/[.,;:!?)]+$/, '');
      }
    }

    if (extractedUrl) {
      setDetectedUrl(extractedUrl);
      const detected = detectContentType(extractedUrl);
      if (detected.type === 'youtube') {
        setContentType('YouTube Video');
      } else if (detected.type === 'pdf') {
        setContentType('PDF Document');
      } else if (detected.type === 'youtube_playlist') {
        setContentType('YouTube Playlist');
      } else {
        setContentType('Article');
      }
    }
  }, [url, text]);

  const handleAddToAnthist = async () => {
    if (!detectedUrl) {
      setStatus('error');
      setMessage('No valid URL found');
      return;
    }

    setStatus('processing');
    setMessage('Adding to Anthist...');

    // Open the main app and go directly to processing screen
    // This bypasses the add-content screen for a smoother flow
    openHostApp(`processing?url=${encodeURIComponent(detectedUrl)}`);
    
    // Brief delay before closing to ensure the deep link is processed
    setTimeout(() => {
      close();
    }, 500);
  };

  const handleCancel = () => {
    close();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleCancel} style={styles.cancelButton}>
          <Text style={styles.cancelText} allowFontScaling={false}>Cancel</Text>
        </Pressable>
        <Text style={styles.title} allowFontScaling={false}>Add to Anthist</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content Preview */}
      <View style={styles.content}>
        {detectedUrl ? (
          <>
            <View style={styles.typeTag}>
              <Text style={styles.typeText} allowFontScaling={false}>{contentType}</Text>
            </View>
            <Text style={styles.urlPreview} numberOfLines={2} allowFontScaling={false}>
              {title || detectedUrl}
            </Text>
            {title && (
              <Text style={styles.urlSmall} numberOfLines={1} allowFontScaling={false}>
                {detectedUrl}
              </Text>
            )}
          </>
        ) : (
          <Text style={styles.noContent} allowFontScaling={false}>
            No valid URL found in shared content
          </Text>
        )}
      </View>

      {/* Action Button */}
      <View style={styles.actions}>
        {status === 'processing' ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#FFFFFF" />
            <Text style={styles.loadingText} allowFontScaling={false}>{message}</Text>
          </View>
        ) : (
          <Pressable
            style={[
              styles.addButton,
              !detectedUrl && styles.addButtonDisabled,
            ]}
            onPress={handleAddToAnthist}
            disabled={!detectedUrl}
          >
            <Text style={styles.addButtonText} allowFontScaling={false}>
              Add to Feed
            </Text>
          </Pressable>
        )}
      </View>

      {/* Status Message */}
      {status === 'error' && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText} allowFontScaling={false}>{message}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  cancelButton: {
    padding: 8,
  },
  cancelText: {
    color: '#888888',
    fontSize: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    paddingVertical: 16,
  },
  typeTag: {
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  typeText: {
    color: '#4ECDC4',
    fontSize: 13,
    fontWeight: '600',
  },
  urlPreview: {
    color: '#FFFFFF',
    fontSize: 17,
    lineHeight: 24,
    marginBottom: 8,
  },
  urlSmall: {
    color: '#666666',
    fontSize: 13,
  },
  noContent: {
    color: '#888888',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  actions: {
    paddingVertical: 16,
  },
  addButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#333333',
  },
  addButtonText: {
    color: '#000000',
    fontSize: 17,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 100, 100, 0.15)',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  errorText: {
    color: '#FF6464',
    fontSize: 14,
    textAlign: 'center',
  },
});
