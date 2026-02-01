import { getCurrentUser, fetchUserAttributes, signOut } from 'aws-amplify/auth';
import { create } from 'zustand';
import { amplifyClient } from '../amplify-client';

// Generate a random importer email address
function generateImporterEmail(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // User's unique import email address
  return `${result}@import.anthist.com`;
}

export interface User {
  cognitoId: string;
  email: string;
  importerEmail: string;
  hasSeenTutorial: boolean;
  preferredTheme: string;
  accessibilityMode: boolean;
  defaultPlaylistId?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  
  // Actions
  initialize: () => Promise<void>;
  createUserProfile: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserSettings: (settings: Partial<User>) => Promise<void>;
  markTutorialSeen: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  initialize: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const cognitoUser = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      
      // Try to fetch existing user profile
      const { data: existingUser } = await amplifyClient.models.User.get({
        cognitoId: cognitoUser.userId,
      });

      if (existingUser) {
        set({
          user: {
            cognitoId: existingUser.cognitoId,
            email: existingUser.email,
            importerEmail: existingUser.importerEmail,
            hasSeenTutorial: existingUser.hasSeenTutorial ?? false,
            preferredTheme: existingUser.preferredTheme ?? 'auto',
            accessibilityMode: existingUser.accessibilityMode ?? false,
            defaultPlaylistId: existingUser.defaultPlaylistId ?? undefined,
          },
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        // User exists in Cognito but not in our DB - create profile
        await get().createUserProfile();
      }
    } catch (error) {
      // User not authenticated
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  createUserProfile: async () => {
    try {
      const cognitoUser = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      
      const importerEmail = generateImporterEmail();
      
      const { data: newUser, errors } = await amplifyClient.models.User.create({
        cognitoId: cognitoUser.userId,
        email: attributes.email ?? '',
        importerEmail,
        hasSeenTutorial: false,
        preferredTheme: 'auto',
        accessibilityMode: false,
        createdAt: new Date().toISOString(),
      });

      if (errors) {
        throw new Error(errors[0].message);
      }

      if (newUser) {
        set({
          user: {
            cognitoId: newUser.cognitoId,
            email: newUser.email,
            importerEmail: newUser.importerEmail,
            hasSeenTutorial: false,
            preferredTheme: 'auto',
            accessibilityMode: false,
          },
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create user profile',
        isLoading: false,
      });
    }
  },

  logout: async () => {
    try {
      await signOut();
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to logout' });
    }
  },

  updateUserSettings: async (settings) => {
    const { user } = get();
    if (!user) return;

    try {
      const { data: updatedUser, errors } = await amplifyClient.models.User.update({
        cognitoId: user.cognitoId,
        ...settings,
      });

      if (errors) {
        throw new Error(errors[0].message);
      }

      if (updatedUser) {
        set({
          user: {
            ...user,
            ...settings,
          },
        });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update settings' });
    }
  },

  markTutorialSeen: async () => {
    await get().updateUserSettings({ hasSeenTutorial: true });
  },

  clearError: () => set({ error: null }),
}));
