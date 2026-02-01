import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  useColorScheme,
  Switch,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useAuthStore } from '../../lib/store/authStore';
import { getAllThemes, ReaderTheme } from '../../components/themes';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const { user, logout, updateUserSettings } = useAuthStore();
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyImporterEmail = async () => {
    if (user?.importerEmail) {
      await Clipboard.setStringAsync(user.importerEmail);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const handleToggleAccessibility = async () => {
    await updateUserSettings({ accessibilityMode: !user?.accessibilityMode });
  };

  const themes = getAllThemes();

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.titleDark]}>Settings</Text>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Text style={[styles.closeButtonText, isDark && styles.closeButtonTextDark]}>Done</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Account</Text>
          
          <View style={[styles.card, isDark && styles.cardDark]}>
            <View style={styles.row}>
              <Text style={[styles.rowLabel, isDark && styles.rowLabelDark]}>Email</Text>
              <Text style={[styles.rowValue, isDark && styles.rowValueDark]}>{user?.email}</Text>
            </View>
          </View>
        </View>

        {/* Import Email Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Content Import</Text>
          
          <View style={[styles.card, isDark && styles.cardDark]}>
            <Pressable style={styles.row} onPress={handleCopyImporterEmail}>
              <View style={styles.rowContent}>
                <Text style={[styles.rowLabel, isDark && styles.rowLabelDark]}>
                  Your Import Email
                </Text>
                <Text style={[styles.rowDescription, isDark && styles.rowDescriptionDark]}>
                  Forward links to this email to add them to your feed
                </Text>
              </View>
              <Text style={[styles.rowAction, copiedEmail && styles.rowActionSuccess]}>
                {copiedEmail ? 'Copied!' : 'Copy'}
              </Text>
            </Pressable>
            
            {user?.importerEmail && (
              <View style={styles.emailPreview}>
                <Text style={[styles.emailText, isDark && styles.emailTextDark]}>
                  {user.importerEmail}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Reading Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Reading</Text>
          
          <View style={[styles.card, isDark && styles.cardDark]}>
            <View style={styles.row}>
              <View style={styles.rowContent}>
                <Text style={[styles.rowLabel, isDark && styles.rowLabelDark]}>
                  Theme
                </Text>
                <Text style={[styles.rowDescription, isDark && styles.rowDescriptionDark]}>
                  {user?.preferredTheme === 'auto' ? 'Automatic (matches content)' : user?.preferredTheme}
                </Text>
              </View>
              <Text style={[styles.rowValue, isDark && styles.rowValueDark]}>
                {themes.length} available
              </Text>
            </View>

            <View style={styles.rowDivider} />

            <View style={styles.row}>
              <View style={styles.rowContent}>
                <Text style={[styles.rowLabel, isDark && styles.rowLabelDark]}>
                  Accessibility Mode
                </Text>
                <Text style={[styles.rowDescription, isDark && styles.rowDescriptionDark]}>
                  High contrast for better readability
                </Text>
              </View>
              <Switch
                value={user?.accessibilityMode ?? false}
                onValueChange={handleToggleAccessibility}
                trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Import Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Import</Text>
          
          <View style={[styles.card, isDark && styles.cardDark]}>
            <Pressable style={styles.row} onPress={() => router.push('/(main)/add-content')}>
              <Text style={[styles.rowLabel, isDark && styles.rowLabelDark]}>Add Content</Text>
              <Text style={styles.rowArrow}>→</Text>
            </Pressable>

            <View style={styles.rowDivider} />

            <Pressable style={styles.row}>
              <Text style={[styles.rowLabel, isDark && styles.rowLabelDark]}>Import Bookmarks</Text>
              <Text style={styles.rowArrow}>→</Text>
            </Pressable>

            <View style={styles.rowDivider} />

            <Pressable style={styles.row}>
              <Text style={[styles.rowLabel, isDark && styles.rowLabelDark]}>Export Bookmarks</Text>
              <Text style={styles.rowArrow}>→</Text>
            </Pressable>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>About</Text>
          
          <View style={[styles.card, isDark && styles.cardDark]}>
            <View style={styles.row}>
              <Text style={[styles.rowLabel, isDark && styles.rowLabelDark]}>Version</Text>
              <Text style={[styles.rowValue, isDark && styles.rowValueDark]}>1.0.0</Text>
            </View>

            <View style={styles.rowDivider} />

            <Pressable style={styles.row}>
              <Text style={[styles.rowLabel, isDark && styles.rowLabelDark]}>Open Source</Text>
              <Text style={styles.rowArrow}>→</Text>
            </Pressable>

            <View style={styles.rowDivider} />

            <Pressable style={styles.row}>
              <Text style={[styles.rowLabel, isDark && styles.rowLabelDark]}>Privacy Policy</Text>
              <Text style={styles.rowArrow}>→</Text>
            </Pressable>
          </View>
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <Pressable 
            style={[styles.card, styles.logoutCard, isDark && styles.cardDark]} 
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Sign Out</Text>
          </Pressable>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  titleDark: {
    color: '#FFFFFF',
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  closeButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#3B82F6',
  },
  closeButtonTextDark: {
    color: '#60A5FA',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionTitleDark: {
    color: '#9CA3AF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardDark: {
    backgroundColor: '#1A1A1A',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 52,
  },
  rowContent: {
    flex: 1,
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 17,
    color: '#1F2937',
  },
  rowLabelDark: {
    color: '#F3F4F6',
  },
  rowDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  rowDescriptionDark: {
    color: '#9CA3AF',
  },
  rowValue: {
    fontSize: 17,
    color: '#6B7280',
  },
  rowValueDark: {
    color: '#9CA3AF',
  },
  rowAction: {
    fontSize: 17,
    fontWeight: '500',
    color: '#3B82F6',
  },
  rowActionSuccess: {
    color: '#10B981',
  },
  rowArrow: {
    fontSize: 17,
    color: '#9CA3AF',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginLeft: 16,
  },
  emailPreview: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  emailText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#374151',
  },
  emailTextDark: {
    color: '#D1D5DB',
  },
  logoutCard: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  logoutText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#DC2626',
  },
});
