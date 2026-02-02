import * as DocumentPicker from 'expo-document-picker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    useColorScheme,
    View,
} from 'react-native';
import { IconSymbol } from '../../components/ui/icon-symbol';
import { detectContentType, isValidUrl } from '../../lib/content/extractor';
import { useAuthStore } from '../../lib/store/authStore';

export default function AddContentScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const { user } = useAuthStore();
  
  // Get URL from share extension or deep link
  const { url: sharedUrl } = useLocalSearchParams<{ url?: string }>();

  const [url, setUrl] = useState('');
  
  // Auto-populate and process URL from deep link (legacy support)
  // Note: Share extension now goes directly to processing screen
  useEffect(() => {
    if (sharedUrl && isValidUrl(sharedUrl)) {
      setUrl(sharedUrl);
      // Auto-process if URL came from deep link
      const detected = detectContentType(sharedUrl);
      if (detected.type !== 'youtube_playlist' && user) {
        // Small delay to let the UI render first
        setTimeout(() => {
          // Use replace so add-content doesn't stay in the navigation stack
          router.replace({
            pathname: '/(main)/processing',
            params: { url: sharedUrl },
          });
        }, 100);
      }
    }
  }, [sharedUrl, user]);
  const [error, setError] = useState<string | null>(null);

  const handleAddUrl = () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    if (!isValidUrl(url.trim())) {
      setError('Please enter a valid URL');
      return;
    }

    if (!user) {
      setError('Not authenticated');
      return;
    }

    // Check for playlist (not supported yet)
    const detected = detectContentType(url.trim());
    if (detected.type === 'youtube_playlist') {
      setError('Playlist import coming soon! For now, add individual videos.');
      return;
    }

    setError(null);

    // Navigate to processing screen with URL
    router.push({
      pathname: '/(main)/processing',
      params: { url: url.trim() },
    });
  };

  const handleImportBookmarks = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/html', 'application/json'],
      });

      if (!result.canceled && result.assets[0]) {
        // TODO: Parse bookmark file and import
        setError('Bookmark import coming soon!');
      }
    } catch (err) {
      setError('Failed to open file picker');
    }
  };

  const handleImportPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
      });

      if (!result.canceled && result.assets[0]) {
        // TODO: Upload PDF to S3 and create content entry
        setError('PDF import coming soon!');
      }
    } catch (err) {
      setError('Failed to open file picker');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, isDark && styles.containerDark]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerButton}>
          <Text style={[styles.headerButtonText, isDark && styles.headerButtonTextDark]}>
            Cancel
          </Text>
        </Pressable>
        <Text style={[styles.title, isDark && styles.titleDark]}>Add Content</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* URL Input */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            Add from URL
          </Text>
          
          <View style={[styles.inputContainer, isDark && styles.inputContainerDark]}>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="Paste a link to a blog or YouTube video"
              placeholderTextColor={isDark ? '#666' : '#999'}
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          </View>

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <Pressable
            style={styles.button}
            onPress={handleAddUrl}
          >
            <Text style={styles.buttonText}>Process URL</Text>
          </Pressable>
        </View>

        {/* Other import options */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            Import
          </Text>

          <Pressable 
            style={[styles.importOption, isDark && styles.importOptionDark]}
            onPress={handleImportBookmarks}
          >
            <View style={styles.importIconContainer}>
              <IconSymbol name="bookmark.fill" size={28} color={isDark ? '#60A5FA' : '#3B82F6'} />
            </View>
            <View style={styles.importContent}>
              <Text style={[styles.importTitle, isDark && styles.importTitleDark]}>
                Import Bookmarks
              </Text>
              <Text style={[styles.importDescription, isDark && styles.importDescriptionDark]}>
                Import from Chrome, Firefox, or Safari
              </Text>
            </View>
          </Pressable>

          <Pressable 
            style={[styles.importOption, isDark && styles.importOptionDark]}
            onPress={handleImportPDF}
          >
            <View style={styles.importIconContainer}>
              <IconSymbol name="doc.fill" size={28} color={isDark ? '#60A5FA' : '#3B82F6'} />
            </View>
            <View style={styles.importContent}>
              <Text style={[styles.importTitle, isDark && styles.importTitleDark]}>
                Upload PDF
              </Text>
              <Text style={[styles.importDescription, isDark && styles.importDescriptionDark]}>
                Add a PDF document to your feed
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Email import hint */}
        <View style={styles.section}>
          <View style={[styles.hintCard, isDark && styles.hintCardDark]}>
            <View style={styles.hintIconContainer}>
              <IconSymbol name="lightbulb.fill" size={24} color={isDark ? '#FCD34D' : '#F59E0B'} />
            </View>
            <View style={styles.hintContent}>
              <Text style={[styles.hintTitle, isDark && styles.hintTitleDark]}>
                Pro tip: Email links
              </Text>
              <Text style={[styles.hintDescription, isDark && styles.hintDescriptionDark]}>
                Forward links to your import email address to add them automatically.
                Find your address in Settings.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  containerDark: {
    backgroundColor: '#0A0A0A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerButton: {
    width: 70,
  },
  headerButtonText: {
    fontSize: 17,
    color: '#3B82F6',
  },
  headerButtonTextDark: {
    color: '#60A5FA',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
  },
  titleDark: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  sectionTitleDark: {
    color: '#9CA3AF',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  inputContainerDark: {
    backgroundColor: '#1A1A1A',
  },
  input: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1F2937',
  },
  inputDark: {
    color: '#FFFFFF',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    marginTop: 8,
  },
  button: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  importOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  importOptionDark: {
    backgroundColor: '#1A1A1A',
  },
  importIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  importContent: {
    flex: 1,
  },
  importTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  importTitleDark: {
    color: '#F3F4F6',
  },
  importDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  importDescriptionDark: {
    color: '#9CA3AF',
  },
  hintCard: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
  },
  hintCardDark: {
    backgroundColor: '#422006',
  },
  hintIconContainer: {
    marginRight: 12,
  },
  hintContent: {
    flex: 1,
  },
  hintTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  hintTitleDark: {
    color: '#FCD34D',
  },
  hintDescription: {
    fontSize: 14,
    color: '#A16207',
    lineHeight: 20,
  },
  hintDescriptionDark: {
    color: '#FBBF24',
  },
});
