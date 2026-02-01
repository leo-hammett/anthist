import React from 'react';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { IconSymbol } from '../ui/icon-symbol';

interface EmptyFeedProps {
  onDoubleTap: () => void;
}

export default function EmptyFeed({ onDoubleTap }: EmptyFeedProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Pressable style={[styles.container, isDark && styles.containerDark]} onPress={onDoubleTap}>
      <View style={styles.content}>
        {/* Animated illustration placeholder */}
        <View style={[styles.illustration, isDark && styles.illustrationDark]}>
          <IconSymbol name="books.vertical.fill" size={48} color={isDark ? '#888' : '#666'} />
        </View>

        <Text style={[styles.title, isDark && styles.titleDark]}>
          Your anthology is empty
        </Text>
        
        <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
          Start adding blogs, YouTube videos, and more to build your personal collection.
        </Text>

        <View style={styles.instructionsContainer}>
          <View style={styles.instruction}>
            <View style={[styles.instructionIcon, isDark && styles.instructionIconDark]}>
              <IconSymbol name="square.and.arrow.up" size={24} color={isDark ? '#AAA' : '#666'} />
            </View>
            <View style={styles.instructionText}>
              <Text style={[styles.instructionTitle, isDark && styles.instructionTitleDark]}>
                Share to Anthist
              </Text>
              <Text style={[styles.instructionDescription, isDark && styles.instructionDescriptionDark]}>
                Use the share button in any app to send content here
              </Text>
            </View>
          </View>

          <View style={styles.instruction}>
            <View style={[styles.instructionIcon, isDark && styles.instructionIconDark]}>
              <IconSymbol name="envelope.fill" size={24} color={isDark ? '#AAA' : '#666'} />
            </View>
            <View style={styles.instructionText}>
              <Text style={[styles.instructionTitle, isDark && styles.instructionTitleDark]}>
                Email links
              </Text>
              <Text style={[styles.instructionDescription, isDark && styles.instructionDescriptionDark]}>
                Forward links to your personal import email
              </Text>
            </View>
          </View>

          <View style={styles.instruction}>
            <View style={[styles.instructionIcon, isDark && styles.instructionIconDark]}>
              <IconSymbol name="bookmark.fill" size={24} color={isDark ? '#AAA' : '#666'} />
            </View>
            <View style={styles.instructionText}>
              <Text style={[styles.instructionTitle, isDark && styles.instructionTitleDark]}>
                Import bookmarks
              </Text>
              <Text style={[styles.instructionDescription, isDark && styles.instructionDescriptionDark]}>
                Bulk import from your browser bookmarks
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.tapHint}>
          <Text style={[styles.tapHintText, isDark && styles.tapHintTextDark]}>
            Double-tap anywhere for options
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  containerDark: {
    backgroundColor: '#0A0A0A',
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  illustration: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  illustrationDark: {
    backgroundColor: '#1A1A1A',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  titleDark: {
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  subtitleDark: {
    color: '#999',
  },
  instructionsContainer: {
    width: '100%',
    gap: 20,
    marginBottom: 40,
  },
  instruction: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  instructionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionIconDark: {
    backgroundColor: '#1A1A1A',
  },
  instructionText: {
    flex: 1,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  instructionTitleDark: {
    color: '#FFFFFF',
  },
  instructionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  instructionDescriptionDark: {
    color: '#888',
  },
  tapHint: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 20,
  },
  tapHintText: {
    fontSize: 14,
    color: '#666',
  },
  tapHintTextDark: {
    color: '#888',
  },
});
