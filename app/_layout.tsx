import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/lib/store/authStore';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Amplify } from 'aws-amplify';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import 'react-native-get-random-values';
import 'react-native-reanimated';
import amplifyConfig from '../amplify_outputs.json';

// Configure Amplify with the outputs from sandbox/deployment
Amplify.configure(amplifyConfig);

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
