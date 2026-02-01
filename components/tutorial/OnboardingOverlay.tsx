import React, { useState } from 'react';
import {
    Animated,
    Dimensions,
    Pressable,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from 'react-native';
import { useAuthStore } from '../../lib/store/authStore';
import { IconSymbol } from '../ui/icon-symbol';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingOverlayProps {
  onDismiss: () => void;
}

export default function OnboardingOverlay({ onDismiss }: OnboardingOverlayProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { markTutorialSeen } = useAuthStore();
  const [fadeAnim] = useState(new Animated.Value(1));

  const handleDismiss = async () => {
    // Fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(async () => {
      await markTutorialSeen();
      onDismiss();
    });
  };

  return (
    <Animated.View 
      style={[
        styles.overlay, 
        { opacity: fadeAnim },
      ]}
    >
      <Pressable style={styles.backdrop} onPress={handleDismiss}>
        <View style={[styles.content, isDark && styles.contentDark]}>
          {/* Header */}
          <Text style={[styles.title, isDark && styles.titleDark]}>
            Welcome to Anthist
          </Text>
          <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
            Your personal anthology
          </Text>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            {/* Swipe instruction */}
            <View style={styles.instruction}>
              <View style={styles.gestureDemo}>
                <View style={[styles.hand, isDark && styles.handDark]}>
                  <IconSymbol name="hand.point.up.fill" size={28} color="#3B82F6" />
                </View>
                <View style={styles.swipeArrow}>
                  <IconSymbol name="arrow.left" size={28} color="#3B82F6" />
                </View>
              </View>
              <Text style={[styles.instructionText, isDark && styles.instructionTextDark]}>
                Swipe left for next content
              </Text>
              <Text style={[styles.instructionSubtext, isDark && styles.instructionSubtextDark]}>
                Swipe right to go back
              </Text>
            </View>

            {/* Double tap instruction */}
            <View style={styles.instruction}>
              <View style={styles.gestureDemo}>
                <View style={[styles.tapCircle, isDark && styles.tapCircleDark]}>
                  <Text style={styles.tapText}>TAP</Text>
                  <Text style={styles.tapText}>TAP</Text>
                </View>
              </View>
              <Text style={[styles.instructionText, isDark && styles.instructionTextDark]}>
                Double-tap for options
              </Text>
              <Text style={[styles.instructionSubtext, isDark && styles.instructionSubtextDark]}>
                Settings, import, and more
              </Text>
            </View>
          </View>

          {/* Dismiss button */}
          <Pressable style={[styles.button, isDark && styles.buttonDark]} onPress={handleDismiss}>
            <Text style={[styles.buttonText, isDark && styles.buttonTextDark]}>
              Got it
            </Text>
          </Pressable>

          <Text style={[styles.hint, isDark && styles.hintDark]}>
            Tap anywhere to dismiss
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
  },
  contentDark: {
    backgroundColor: '#1A1A1A',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  titleDark: {
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  subtitleDark: {
    color: '#AAA',
  },
  instructionsContainer: {
    width: '100%',
    gap: 28,
    marginBottom: 32,
  },
  instruction: {
    alignItems: 'center',
  },
  gestureDemo: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  hand: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  handDark: {
    backgroundColor: '#333',
  },
  swipeArrow: {
    position: 'absolute',
    left: -10,
  },
  tapCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
  },
  tapCircleDark: {
    backgroundColor: '#333',
  },
  tapText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#3B82F6',
  },
  instructionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  instructionTextDark: {
    color: '#FFFFFF',
  },
  instructionSubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 4,
  },
  instructionSubtextDark: {
    color: '#666',
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDark: {
    backgroundColor: '#2563EB',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonTextDark: {
    color: '#FFFFFF',
  },
  hint: {
    fontSize: 12,
    color: '#AAA',
  },
  hintDark: {
    color: '#666',
  },
});
