import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Link, router } from 'expo-router';
import { signIn } from 'aws-amplify/auth';
import { useAuthStore } from '../../lib/store/authStore';

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { initialize } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { isSignedIn } = await signIn({ username: email, password });
      
      if (isSignedIn) {
        await initialize();
        router.replace('/(main)');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, isDark && styles.scrollContentDark]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo / Header */}
        <View style={styles.header}>
          <Text style={styles.logoEmoji}>📚</Text>
          <Text style={[styles.title, isDark && styles.titleDark]}>Anthist</Text>
          <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
            Your personal anthology
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={[styles.label, isDark && styles.labelDark]}>Email</Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="you@example.com"
              placeholderTextColor={isDark ? '#666' : '#999'}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, isDark && styles.labelDark]}>Password</Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="••••••••"
              placeholderTextColor={isDark ? '#666' : '#999'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />
          </View>

          <Pressable 
            style={[styles.button, isLoading && styles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </Pressable>

          <Link href="/(auth)/signup" asChild>
            <Pressable style={styles.linkButton}>
              <Text style={[styles.linkText, isDark && styles.linkTextDark]}>
                Don't have an account? <Text style={styles.linkBold}>Sign up</Text>
              </Text>
            </Pressable>
          </Link>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, isDark && styles.footerTextDark]}>
            Open source • Privacy-focused
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    padding: 24,
    justifyContent: 'center',
  },
  scrollContentDark: {
    backgroundColor: '#0A0A0A',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
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
  },
  subtitleDark: {
    color: '#AAA',
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  labelDark: {
    color: '#D1D5DB',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
  },
  inputDark: {
    backgroundColor: '#1F1F1F',
    borderColor: '#333',
    color: '#FFFFFF',
  },
  button: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: '#666',
  },
  linkTextDark: {
    color: '#AAA',
  },
  linkBold: {
    fontWeight: '600',
    color: '#3B82F6',
  },
  footer: {
    marginTop: 48,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  footerTextDark: {
    color: '#666',
  },
});
