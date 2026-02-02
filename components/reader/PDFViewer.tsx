import { getUrl } from 'aws-amplify/storage';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, Linking, Platform, Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { IconSymbol } from '../ui/icon-symbol';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PDFViewerProps {
  content: {
    id: string;
    url: string;
    title: string;
    s3Key?: string;
  };
  isActive: boolean;
}

export default function PDFViewer({ content, isActive }: PDFViewerProps) {
  // All hooks must be called unconditionally and in the same order every render
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfSource, setPdfSource] = useState<string | null>(null);

  // Handle WebView errors
  const handleWebViewError = useCallback((errorMessage: string) => {
    console.error('WebView error:', errorMessage);
    setError('Failed to display PDF');
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadPDF() {
      if (!isMounted) return;
      
      setIsLoading(true);
      setError(null);

      try {
        if (content.s3Key) {
          // Get presigned URL from S3
          try {
            const result = await getUrl({ path: content.s3Key });
            if (isMounted) {
              setPdfSource(result.url.toString());
            }
          } catch (s3Error) {
            console.warn('S3 URL generation failed:', s3Error);
            // Fall back to direct URL if available
            if (isMounted) {
              if (content.url) {
                setPdfSource(content.url);
              } else {
                setError('Failed to load PDF from storage');
              }
            }
          }
        } else if (content.url) {
          // Direct URL to PDF
          if (isMounted) {
            setPdfSource(content.url);
          }
        } else {
          if (isMounted) {
            setError('No PDF source available');
          }
        }
      } catch (err) {
        console.error('Error loading PDF:', err);
        if (isMounted) {
          setError('Failed to load PDF');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadPDF();

    return () => {
      isMounted = false;
    };
  }, [content.id, content.s3Key, content.url]);

  // Memoize the PDF viewer URL
  const pdfViewerUrl = useMemo(() => {
    if (!pdfSource) return null;
    return Platform.OS === 'web' 
      ? pdfSource // Web browsers can render PDFs natively
      : `https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(pdfSource)}`;
  }, [pdfSource]);

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
  const openExternally = useCallback(() => {
    if (pdfSource) {
      Linking.openURL(pdfSource).catch(err => {
        console.warn('Failed to open URL:', err);
      });
    }
  }, [pdfSource]);

  // Render loading state for WebView
  const renderLoading = useCallback(() => (
    <View style={styles.loadingOverlay}>
      <ActivityIndicator size="large" color={isDark ? '#FFF' : '#000'} />
    </View>
  ), [isDark]);

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Title bar */}
      <View style={[styles.titleBar, isDark && styles.titleBarDark, { paddingTop: insets.top + 8 }]}>
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
            src={pdfSource ?? ''}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title={content.title}
          />
        </View>
      ) : (
        // Native: Use WebView with Google Docs viewer
        pdfViewerUrl && (
          <WebView
            source={{ uri: pdfViewerUrl }}
            style={styles.webview}
            startInLoadingState
            renderLoading={renderLoading}
            onError={(event) => handleWebViewError(event.nativeEvent.description ?? 'Unknown error')}
          />
        )
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
