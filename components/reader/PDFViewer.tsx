import { getUrl } from 'aws-amplify/storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Linking, Platform, Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { Content } from '../../lib/store/feedStore';
import { IconSymbol } from '../ui/icon-symbol';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PDFViewerProps {
  content: Content;
  isActive: boolean;
}

export default function PDFViewer({ content, isActive }: PDFViewerProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfSource, setPdfSource] = useState<string | null>(null);

  useEffect(() => {
    async function loadPDF() {
      setIsLoading(true);
      setError(null);

      try {
        if (content.s3Key) {
          // Get presigned URL from S3
          try {
            const result = await getUrl({ path: content.s3Key });
            setPdfSource(result.url.toString());
          } catch (s3Error) {
            console.warn('S3 URL generation failed:', s3Error);
            // Fall back to direct URL if available
            if (content.url) {
              setPdfSource(content.url);
            } else {
              setError('Failed to load PDF from storage');
            }
          }
        } else if (content.url) {
          // Direct URL to PDF
          setPdfSource(content.url);
        } else {
          setError('No PDF source available');
        }
      } catch (err) {
        setError('Failed to load PDF');
        console.error('Error loading PDF:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadPDF();
  }, [content.id, content.s3Key, content.url]);

  if (isLoading) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <ActivityIndicator size="large" color={isDark ? '#FFF' : '#000'} />
        <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>
          Loading PDF...
        </Text>
      </View>
    );
  }

  if (error || !pdfSource) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <View style={styles.errorContainer}>
          <View style={[styles.errorIconContainer, isDark && styles.errorIconContainerDark]}>
            <IconSymbol name="doc.fill" size={48} color={isDark ? '#888' : '#666'} />
          </View>
          <Text style={[styles.title, isDark && styles.titleDark]}>
            {content.title}
          </Text>
          <Text style={[styles.errorText, isDark && styles.errorTextDark]}>
            {error ?? 'PDF viewer is being set up. The PDF will be available soon.'}
          </Text>
          {content.url && (
            <Text style={[styles.urlText, isDark && styles.urlTextDark]}>
              Source: {content.url}
            </Text>
          )}
        </View>
      </View>
    );
  }

  // Open PDF externally (fallback)
  const openExternally = () => {
    if (pdfSource) {
      Linking.openURL(pdfSource);
    }
  };

  // Render PDF using WebView with Google Docs viewer for web compatibility
  // On native, react-native-pdf would be better but requires native build
  const pdfViewerUrl = Platform.OS === 'web' 
    ? pdfSource // Web browsers can render PDFs natively
    : `https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(pdfSource)}`;

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Title bar */}
      <View style={[styles.titleBar, isDark && styles.titleBarDark]}>
        <Text style={[styles.pdfTitle, isDark && styles.pdfTitleDark]} numberOfLines={1}>
          {content.title}
        </Text>
        <Pressable style={styles.externalButton} onPress={openExternally}>
          <Text style={styles.externalButtonText}>Open ↗</Text>
        </Pressable>
      </View>
      
      {/* PDF Content */}
      {Platform.OS === 'web' ? (
        // Web: Use native iframe
        <View style={styles.webContainer}>
          <iframe
            src={pdfSource}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title={content.title}
          />
        </View>
      ) : (
        // Native: Use WebView with Google Docs viewer
        <WebView
          source={{ uri: pdfViewerUrl }}
          style={styles.webview}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={isDark ? '#FFF' : '#000'} />
            </View>
          )}
          onError={(event) => {
            console.error('WebView error:', event.nativeEvent);
            setError('Failed to display PDF');
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  containerDark: {
    backgroundColor: '#0A0A0A',
  },
  titleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50, // Account for status bar
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  titleBarDark: {
    backgroundColor: '#1A1A1A',
    borderBottomColor: '#333',
  },
  pdfTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
    marginRight: 12,
  },
  pdfTitleDark: {
    color: '#FFFFFF',
  },
  externalButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E5E5E5',
    borderRadius: 6,
  },
  externalButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  webContainer: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  loadingTextDark: {
    color: '#AAA',
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  errorIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  errorIconContainerDark: {
    backgroundColor: '#1A1A1A',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 16,
  },
  titleDark: {
    color: '#FFFFFF',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  errorTextDark: {
    color: '#AAA',
  },
  urlText: {
    fontSize: 12,
    color: '#888',
    marginTop: 20,
    textAlign: 'center',
  },
  urlTextDark: {
    color: '#666',
  },
});
