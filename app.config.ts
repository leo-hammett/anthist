import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Anthist',
  slug: 'anthist',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'anthist',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/images/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#0A0A0A',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.anthist.app',
    // Share extension configuration
    infoPlist: {
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: true, // For WebView content
      },
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    package: 'com.anthist.app',
    // Share intent filter
    intentFilters: [
      {
        action: 'android.intent.action.SEND',
        category: ['android.intent.category.DEFAULT'],
        data: [
          { mimeType: 'text/plain' },
          { mimeType: 'text/*' },
        ],
      },
      {
        action: 'android.intent.action.VIEW',
        category: ['android.intent.category.DEFAULT', 'android.intent.category.BROWSABLE'],
        data: [
          { scheme: 'anthist' },
          { scheme: 'https', host: '*.anthist.com' },
        ],
      },
    ],
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-sensors',
    [
      'expo-document-picker',
      {
        iCloudContainerEnvironment: 'Production',
      },
    ],
    [
      'expo-share-extension',
      {
        // Activation rules for what content types can be shared
        activationRules: [
          {
            type: 'url',
            max: 1,
          },
          {
            type: 'text',
          },
        ],
        // Custom background with slight transparency
        backgroundColor: {
          red: 10,
          green: 10,
          blue: 10,
          alpha: 0.95,
        },
        // Custom height for the share sheet
        height: 400,
        // Exclude unnecessary packages from share extension bundle
        excludedPackages: [
          'expo-dev-client',
          'expo-splash-screen',
          'expo-updates',
          'expo-sensors',
        ],
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {
      origin: false,
    },
  },
});
