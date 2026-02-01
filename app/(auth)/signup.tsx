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
import { signUp, confirmSignUp, signIn } from 'aws-amplify/auth';
import { useAuthStore } from '../../lib/store/authStore';

type Step = 'signup' | 'confirm';

export default function SignupScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { initialize } = useAuthStore();

  const [step, setStep] = useState<Step>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { isSignUpComplete, nextStep } = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
          },
        },
      });

      if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        setStep('confirm');
      } else if (isSignUpComplete) {
        // Auto sign in
        await signIn({ username: email, password });
        await initialize();
        router.replace('/(main)');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!confirmationCode) {
      setError('Please enter the confirmation code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await confirmSignUp({
        username: email,
        confirmationCode,
      });

      // Sign in after confirmation
      await signIn({ username: email, password });
      await initialize();
      router.replace('/(main)');
    } catch (err: any) {
      setError(err.message || 'Failed to confirm');
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logoEmoji}>📚</Text>
          <Text style={[styles.title, isDark && styles.titleDark]}>
            {step === 'signup' ? 'Create Account' : 'Verify Email'}
          </Text>
          <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
            {step === 'signup' 
              ? 'Start curating your personal anthology'
              : `We sent a code to ${email}`
            }
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {step === 'signup' ? (
            <>
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
                  placeholder="At least 8 characters"
                  placeholderTextColor={isDark ? '#666' : '#999'}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete="password-new"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, isDark && styles.labelDark]}>Confirm Password</Text>
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  placeholder="Repeat password"
                  placeholderTextColor={isDark ? '#666' : '#999'}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoComplete="password-new"
                />
              </View>

              <Pressable 
                style={[styles.button, isLoading && styles.buttonDisabled]} 
                onPress={handleSignup}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Create Account</Text>
                )}
              </Pressable>
            </>
          ) : (
            <>
              <View style={styles.inputContainer}>
                <Text style={[styles.label, isDark && styles.labelDark]}>Confirmation Code</Text>
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  placeholder="Enter 6-digit code"
                  placeholderTextColor={isDark ? '#666' : '#999'}
                  value={confirmationCode}
                  onChangeText={setConfirmationCode}
                  keyboardType="number-pad"
                  autoComplete="one-time-code"
                  maxLength={6}
                />
              </View>

              <Pressable 
                style={[styles.button, isLoading && styles.buttonDisabled]} 
                onPress={handleConfirm}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Verify</Text>
                )}
              </Pressable>

              <Pressable 
                style={styles.linkButton}
                onPress={() => setStep('signup')}
              >
                <Text style={[styles.linkText, isDark && styles.linkTextDark]}>
                  Use a different email
                </Text>
              </Pressable>
            </>
          )}

          {step === 'signup' && (
            <Link href="/(auth)/login" asChild>
              <Pressable style={styles.linkButton}>
                <Text style={[styles.linkText, isDark && styles.linkTextDark]}>
                  Already have an account? <Text style={styles.linkBold}>Sign in</Text>
                </Text>
              </Pressable>
            </Link>
          )}
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
    marginBottom: 40,
  },
  logoEmoji: {
    fontSize: 48,
    marginBottom: 16,
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
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
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
});
