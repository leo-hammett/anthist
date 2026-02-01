import { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import 'react-native-reanimated';
import 'react-native-get-random-values';
import { Amplify } from 'aws-amplify';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/lib/store/authStore';

// Configure Amplify - this will be auto-generated after amplify sandbox
// For now, we'll conditionally import if the config exists
let amplifyConfig: any = null;
try {
  amplifyConfig = require('../amplify_outputs.json');
} catch (e) {
  console.log('Amplify config not found - run `npx ampx sandbox` to generate');
}

if (amplifyConfig) {
  Amplify.configure(amplifyConfig);
}

export const unstable_settings = {
  initialRouteName: '(auth)',
};

function useProtectedRoute() {
  const segments = useSegments();
  const { isAuthenticated, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated and not already in auth group
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to main app if authenticated and in auth group
      router.replace('/(main)');
    }
  }, [isAuthenticated, segments, isLoading]);

  return { isLoading };
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isLoading } = useProtectedRoute();

  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <View style={[styles.loading, colorScheme === 'dark' && styles.loadingDark]}>
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#FFF' : '#000'} />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(main)" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingDark: {
    backgroundColor: '#0A0A0A',
  },
});
