import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, StatusBar, useColorScheme, Modal, Pressable, Text, Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../lib/store/authStore';
import { useFeedStore } from '../../lib/store/feedStore';
import { telemetryTracker } from '../../lib/telemetry/tracker';
import SwipeContainer from '../../components/feed/SwipeContainer';
import OnboardingOverlay from '../../components/tutorial/OnboardingOverlay';

export default function FeedScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { fetchContents, isLoading: feedLoading, getCurrentContent } = useFeedStore();
  
  const [showTutorial, setShowTutorial] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Initialize feed and telemetry
  useEffect(() => {
    if (user?.cognitoId) {
      telemetryTracker.setUserId(user.cognitoId);
      fetchContents(user.cognitoId);
      
      // Show tutorial for new users
      if (!user.hasSeenTutorial) {
        setShowTutorial(true);
      }
    }
  }, [user?.cognitoId, user?.hasSeenTutorial]);

  // Setup gyroscope for engagement tracking (native only)
  useEffect(() => {
    // Skip on web - gyroscope APIs not available
    if (Platform.OS === 'web') {
      return;
    }
    
    let subscription: { remove: () => void } | null = null;
    let mounted = true;

    const startGyro = async () => {
      try {
        // Dynamic import to avoid web bundling issues
        const { Gyroscope: GyroModule } = await import('expo-sensors');
        if (!mounted) return;
        
        const available = await GyroModule.isAvailableAsync();
        if (available && mounted) {
          GyroModule.setUpdateInterval(100);
          subscription = GyroModule.addListener(({ x, y, z }) => {
            telemetryTracker.recordGyro(x, y, z);
          });
        }
      } catch (error) {
        // Gyroscope not available on this device/platform
        console.log('Gyroscope not available:', error);
      }
    };

    startGyro();

    return () => {
      mounted = false;
      subscription?.remove();
    };
  }, []);

  // Start session for current content
  useEffect(() => {
    const current = getCurrentContent();
    if (current) {
      telemetryTracker.startSession(current.id);
    }
  }, [getCurrentContent]);

  // Handle double tap to show menu
  const handleDoubleTap = useCallback(() => {
    setShowMenu(true);
  }, []);

  // Navigation handlers
  const navigateToSettings = () => {
    setShowMenu(false);
    router.push('/(main)/settings');
  };

  const navigateToContentList = () => {
    setShowMenu(false);
    router.push('/(main)/content-list');
  };

  const navigateToAddContent = () => {
    setShowMenu(false);
    router.push('/(main)/add-content');
  };

  const handleCopySourceLink = async () => {
    const current = getCurrentContent();
    if (current) {
      // Copy to clipboard
      const { setStringAsync } = await import('expo-clipboard');
      await setStringAsync(current.url);
      setShowMenu(false);
      // TODO: Show toast
    }
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor="transparent"
        translucent
      />

      {/* Main Feed */}
      <SwipeContainer onDoubleTap={handleDoubleTap} />

      {/* Onboarding Tutorial */}
      {showTutorial && (
        <OnboardingOverlay onDismiss={() => setShowTutorial(false)} />
      )}

      {/* Quick Menu Modal */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <Pressable style={styles.menuBackdrop} onPress={() => setShowMenu(false)}>
          <View style={[styles.menuContainer, isDark && styles.menuContainerDark]}>
            <View style={styles.menuHeader}>
              <View style={styles.menuHandle} />
            </View>

            <MenuItem 
              icon="⚙️" 
              label="Settings" 
              onPress={navigateToSettings}
              isDark={isDark}
            />
            <MenuItem 
              icon="📚" 
              label="My Content" 
              onPress={navigateToContentList}
              isDark={isDark}
            />
            <MenuItem 
              icon="➕" 
              label="Add Content" 
              onPress={navigateToAddContent}
              isDark={isDark}
            />
            <MenuItem 
              icon="📋" 
              label="Copy Source Link" 
              onPress={handleCopySourceLink}
              isDark={isDark}
              disabled={!getCurrentContent()}
            />
            
            <View style={styles.menuDivider} />
            
            <Pressable 
              style={styles.menuCancel} 
              onPress={() => setShowMenu(false)}
            >
              <Text style={[styles.menuCancelText, isDark && styles.menuCancelTextDark]}>
                Cancel
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

interface MenuItemProps {
  icon: string;
  label: string;
  onPress: () => void;
  isDark: boolean;
  disabled?: boolean;
}

function MenuItem({ icon, label, onPress, isDark, disabled }: MenuItemProps) {
  return (
    <Pressable 
      style={[styles.menuItem, disabled && styles.menuItemDisabled]} 
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.menuItemIcon}>{icon}</Text>
      <Text style={[
        styles.menuItemLabel, 
        isDark && styles.menuItemLabelDark,
        disabled && styles.menuItemLabelDisabled,
      ]}>
        {label}
      </Text>
    </Pressable>
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
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34, // Safe area
  },
  menuContainerDark: {
    backgroundColor: '#1A1A1A',
  },
  menuHeader: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  menuItemDisabled: {
    opacity: 0.5,
  },
  menuItemIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  menuItemLabel: {
    fontSize: 18,
    color: '#1F2937',
  },
  menuItemLabelDark: {
    color: '#F3F4F6',
  },
  menuItemLabelDisabled: {
    color: '#9CA3AF',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
    marginHorizontal: 24,
  },
  menuCancel: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  menuCancelText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
  },
  menuCancelTextDark: {
    color: '#9CA3AF',
  },
});
