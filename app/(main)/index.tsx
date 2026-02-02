import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Modal, Platform, Pressable, StatusBar, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import SwipeContainer from '../../components/feed/SwipeContainer';
import { getAllThemes, getDefaultTheme, getThemeForContent, getThemesByCategory, ReaderTheme } from '../../components/themes';
import OnboardingOverlay from '../../components/tutorial/OnboardingOverlay';
import { IconSymbol, IconSymbolName } from '../../components/ui/icon-symbol';
import { useAuthStore } from '../../lib/store/authStore';
import { useFeedStore } from '../../lib/store/feedStore';
import { telemetryTracker } from '../../lib/telemetry/tracker';

export default function FeedScreen() {
  // All hooks must be called unconditionally and in the same order every render
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Use individual selectors for better performance and stability
  const user = useAuthStore(state => state.user);
  const fetchContents = useFeedStore(state => state.fetchContents);
  const getCurrentContent = useFeedStore(state => state.getCurrentContent);
  const setThemeOverride = useFeedStore(state => state.setThemeOverride);
  const getThemeOverride = useFeedStore(state => state.getThemeOverride);
  
  const [showTutorial, setShowTutorial] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'dark' | 'light' | 'specialty'>(isDark ? 'dark' : 'light');
  
  // Memoize current theme to prevent unnecessary recalculations
  const currentTheme = useMemo((): ReaderTheme => {
    try {
      const current = getCurrentContent();
      if (!current) return getDefaultTheme(isDark);
      
      const override = getThemeOverride(current.id);
      if (override) {
        const theme = getAllThemes().find(t => t.id === override);
        if (theme) return theme;
      }
      
      if (current.semanticTags?.length) {
        return getThemeForContent(current.semanticTags, isDark);
      }
      
      return getDefaultTheme(isDark);
    } catch {
      // Fallback to default theme on any error
      return getDefaultTheme(isDark);
    }
  }, [getCurrentContent, getThemeOverride, isDark]);

  // Memoize user ID for stable effect dependencies
  const userId = useMemo(() => user?.cognitoId ?? null, [user?.cognitoId]);
  const hasSeenTutorial = useMemo(() => user?.hasSeenTutorial ?? true, [user?.hasSeenTutorial]);

  // Initialize feed and telemetry
  useEffect(() => {
    if (userId) {
      telemetryTracker.setUserId(userId);
      fetchContents(userId).catch(err => {
        console.warn('Failed to fetch contents:', err);
      });
      
      // Show tutorial for new users
      if (!hasSeenTutorial) {
        setShowTutorial(true);
      }
    }
  }, [userId, hasSeenTutorial, fetchContents]);

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
      if (subscription) {
        try {
          subscription.remove();
        } catch {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  // Start session for current content - use stable reference check
  useEffect(() => {
    try {
      const current = getCurrentContent();
      if (current?.id) {
        telemetryTracker.startSession(current.id);
      }
    } catch (err) {
      console.warn('Failed to start telemetry session:', err);
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

  const handleOpenThemeSelector = () => {
    setShowMenu(false);
    setSelectedCategory(isDark ? 'dark' : 'light');
    setShowThemeSelector(true);
  };

  const handleSelectTheme = (themeId: string) => {
    const current = getCurrentContent();
    if (current) {
      setThemeOverride(current.id, themeId);
    }
    setShowThemeSelector(false);
  };

  const handleResetTheme = () => {
    const current = getCurrentContent();
    if (current) {
      setThemeOverride(current.id, null);
    }
    setShowThemeSelector(false);
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor="transparent"
        translucent
      />

      {/* Main Feed - wrapped in error boundary for stability */}
      <ErrorBoundary>
        <SwipeContainer onDoubleTap={handleDoubleTap} />
      </ErrorBoundary>

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
              icon="gearshape.fill" 
              label="Settings" 
              onPress={navigateToSettings}
              isDark={isDark}
            />
            <MenuItem 
              icon="books.vertical.fill" 
              label="My Content" 
              onPress={navigateToContentList}
              isDark={isDark}
            />
            <MenuItem 
              icon="plus.circle.fill" 
              label="Add Content" 
              onPress={navigateToAddContent}
              isDark={isDark}
            />
            <MenuItem 
              icon="doc.on.clipboard.fill" 
              label="Copy Source Link" 
              onPress={handleCopySourceLink}
              isDark={isDark}
              disabled={!getCurrentContent()}
            />
            <MenuItem 
              icon="paintpalette.fill" 
              label="Change Theme" 
              onPress={handleOpenThemeSelector}
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

      {/* Theme Selector Modal */}
      <Modal
        visible={showThemeSelector}
        transparent
        animationType="slide"
        onRequestClose={() => setShowThemeSelector(false)}
      >
        <Pressable 
          style={styles.themeSelectorBackdrop} 
          onPress={() => setShowThemeSelector(false)}
        >
          <View 
            style={[styles.themeSelectorContainer, isDark && styles.themeSelectorContainerDark]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.themeSelectorHeader}>
              <View style={styles.themeSelectorHandle} />
              <Text style={[styles.themeSelectorTitle, isDark && styles.themeSelectorTitleDark]}>
                Choose Theme
              </Text>
              <Text style={[styles.themeSelectorSubtitle, isDark && styles.themeSelectorSubtitleDark]}>
                Current: {currentTheme.name}
              </Text>
            </View>

            {/* Category Tabs */}
            <View style={styles.categoryTabs}>
              {(['dark', 'light', 'specialty'] as const).map((cat) => {
                const isSelected = selectedCategory === cat;
                const iconColor = isSelected ? '#FFFFFF' : (isDark ? '#AAAAAA' : '#666666');
                const iconName: IconSymbolName = cat === 'specialty' 
                  ? 'sparkles' 
                  : cat === 'dark' 
                    ? 'moon.fill' 
                    : 'sun.max.fill';
                const label = cat === 'specialty' ? 'Special' : cat === 'dark' ? 'Dark' : 'Light';
                
                return (
                  <Pressable
                    key={cat}
                    style={[
                      styles.categoryTab,
                      isSelected && { backgroundColor: currentTheme.accentColor },
                    ]}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <View style={styles.categoryTabContent}>
                      <IconSymbol name={iconName} size={16} color={iconColor} />
                      <Text style={[
                        styles.categoryTabText,
                        { color: iconColor },
                      ]}>
                        {label}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {/* Theme Grid */}
            <FlatList
              data={getThemesByCategory(selectedCategory)}
              keyExtractor={(item) => item.id}
              numColumns={2}
              contentContainerStyle={styles.themeGrid}
              renderItem={({ item: themeOption }) => (
                <Pressable
                  style={[
                    styles.themeCard,
                    { backgroundColor: themeOption.backgroundColor },
                    currentTheme.id === themeOption.id && styles.themeCardSelected,
                  ]}
                  onPress={() => handleSelectTheme(themeOption.id)}
                >
                  <Text style={[styles.themeCardName, { color: themeOption.textColor }]}>
                    {themeOption.name}
                  </Text>
                  <Text 
                    style={[
                      styles.themeCardPreview, 
                      { 
                        color: themeOption.textColor,
                        fontFamily: themeOption.fontFamily,
                      },
                    ]}
                    numberOfLines={2}
                  >
                    {themeOption.description}
                  </Text>
                  {themeOption.textShadow && (
                    <View style={styles.themeCardBadge}>
                      <IconSymbol name="sparkles" size={14} color={themeOption.accentColor} />
                    </View>
                  )}
                  {currentTheme.id === themeOption.id && (
                    <View style={[styles.selectedBadge, { backgroundColor: themeOption.accentColor }]}>
                      <Text style={styles.selectedBadgeText}>✓</Text>
                    </View>
                  )}
                </Pressable>
              )}
            />

            {/* Reset to Auto Button */}
            {getThemeOverride(getCurrentContent()?.id ?? '') && (
              <Pressable
                style={[styles.resetButton, { borderColor: currentTheme.accentColor }]}
                onPress={handleResetTheme}
              >
                <View style={styles.resetButtonContent}>
                  <IconSymbol name="arrow.counterclockwise" size={18} color={currentTheme.accentColor} />
                  <Text style={[styles.resetButtonText, { color: currentTheme.accentColor }]}>
                    Reset to Auto-Match
                  </Text>
                </View>
              </Pressable>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

interface MenuItemProps {
  icon: IconSymbolName;
  label: string;
  onPress: () => void;
  isDark: boolean;
  disabled?: boolean;
}

function MenuItem({ icon, label, onPress, isDark, disabled }: MenuItemProps) {
  const iconColor = disabled 
    ? '#9CA3AF' 
    : isDark 
      ? '#F3F4F6' 
      : '#1F2937';
  
  return (
    <Pressable 
      style={[styles.menuItem, disabled && styles.menuItemDisabled]} 
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.menuItemIcon}>
        <IconSymbol name={icon} size={24} color={iconColor} />
      </View>
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
    width: 24,
    height: 24,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
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
  // Theme Selector Styles
  themeSelectorBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  themeSelectorContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 34,
  },
  themeSelectorContainerDark: {
    backgroundColor: '#1A1A1A',
  },
  themeSelectorHeader: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 16,
  },
  themeSelectorHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#888888',
    borderRadius: 2,
    marginBottom: 16,
  },
  themeSelectorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  themeSelectorTitleDark: {
    color: '#FFFFFF',
  },
  themeSelectorSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  themeSelectorSubtitleDark: {
    color: '#888888',
  },
  categoryTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  categoryTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(128, 128, 128, 0.15)',
  },
  categoryTabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  themeGrid: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  themeCard: {
    flex: 1,
    margin: 6,
    padding: 16,
    borderRadius: 16,
    minHeight: 100,
    position: 'relative',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeCardSelected: {
    borderColor: '#FFD700',
  },
  themeCardName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  themeCardPreview: {
    fontSize: 12,
    opacity: 0.8,
    lineHeight: 16,
  },
  themeCardBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  selectedBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  resetButton: {
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  resetButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
