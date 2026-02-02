import { ConfigContext, ExpoConfig } from 'expo/config';
import { ConfigPlugin, withXcodeProject } from 'expo/config-plugins';
eas build --platform android
// Config plugin to apply custom Xcode build settings
const withCustomXcodeSettings: ConfigPlugin = (config) => {
  return withXcodeProject(config, async (config) => {
    const xcodeProject = config.modResults;
    
    // Get all build configurations
    const configurations = xcodeProject.pbxXCBuildConfigurationSection();
    
    for (const key in configurations) {
      const buildSettings = configurations[key]?.buildSettings;
      if (!buildSettings) continue;
      
      const name = configurations[key]?.name;
      
      // Apply to main app target configurations
      if (buildSettings.PRODUCT_BUNDLE_IDENTIFIER === 'com.anthist.app' || 
          buildSettings.PRODUCT_NAME === 'Anthist') {
        // Development team
        buildSettings.DEVELOPMENT_TEAM = 'G2WXN4J37T';
        
        // iOS deployment target
        buildSettings.IPHONEOS_DEPLOYMENT_TARGET = '15.1';
        
        // macOS support
        buildSettings.SUPPORTED_PLATFORMS = '"iphoneos iphonesimulator macosx"';
        buildSettings.SUPPORTS_MACCATALYST = 'NO';
        buildSettings.SUPPORTS_MAC_DESIGNED_FOR_IPHONE_IPAD = 'NO';
        buildSettings.SUPPORTS_XR_DESIGNED_FOR_IPHONE_IPAD = 'NO';
        
        // App Sandbox & Hardened Runtime (for macOS)
        buildSettings.ENABLE_APP_SANDBOX = 'YES';
        buildSettings.ENABLE_HARDENED_RUNTIME = 'YES';
        buildSettings.ENABLE_OUTGOING_NETWORK_CONNECTIONS = 'YES';
        
        // App category
        buildSettings.INFOPLIST_KEY_LSApplicationCategoryType = '"public.app-category.books"';
        
        // App groups
        buildSettings.REGISTER_APP_GROUPS = 'YES';
      }
      
      // Apply to share extension target configurations  
      if (buildSettings.PRODUCT_BUNDLE_IDENTIFIER === 'com.anthist.app.ShareExtension' ||
          buildSettings.PRODUCT_NAME === 'AnthistShareExtension') {
        buildSettings.DEVELOPMENT_TEAM = 'G2WXN4J37T';
        buildSettings.IPHONEOS_DEPLOYMENT_TARGET = '15.1';
        buildSettings.SUPPORTED_PLATFORMS = '"iphoneos iphonesimulator macosx"';
        buildSettings.SUPPORTS_MACCATALYST = 'NO';
        buildSettings.SUPPORTS_MAC_DESIGNED_FOR_IPHONE_IPAD = 'NO';
        buildSettings.SUPPORTS_XR_DESIGNED_FOR_IPHONE_IPAD = 'NO';
        
        if (name === 'Debug') {
          buildSettings.ENABLE_APP_SANDBOX = 'YES';
          buildSettings.ENABLE_HARDENED_RUNTIME = 'YES';
          buildSettings.ENABLE_OUTGOING_NETWORK_CONNECTIONS = 'YES';
          buildSettings.REGISTER_APP_GROUPS = 'YES';
        }
      }
    }
    
    // Set project-level deployment target
    const projectConfig = xcodeProject.pbxProjectSection();
    for (const key in projectConfig) {
      if (projectConfig[key]?.buildConfigurationList) {
        const buildConfigListKey = projectConfig[key].buildConfigurationList;
        const configList = xcodeProject.pbxXCConfigurationList()[buildConfigListKey];
        if (configList) {
          configList.buildConfigurations.forEach((configRef: { value: string }) => {
            const config = configurations[configRef.value];
            if (config?.buildSettings) {
              config.buildSettings.IPHONEOS_DEPLOYMENT_TARGET = '15.1';
            }
          });
        }
      }
    }
    
    return config;
  });
};

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
    // Entitlements for app groups (shared with share extension)
    entitlements: {
      'com.apple.security.application-groups': ['group.com.anthist.app'],
    },
    // Info.plist configuration
    infoPlist: {
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: true, // For WebView content
      },
      // App group identifiers for share extension
      AppGroup: 'group.com.anthist.app',
      AppGroupIdentifier: 'group.com.anthist.app',
      // Motion usage (for sensors)
      NSMotionUsageDescription: 'Allow $(PRODUCT_NAME) to access your device motion',
      // Minimum macOS version
      LSMinimumSystemVersion: '12.0',
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
    // Custom Xcode build settings (development team, deployment target, macOS support, etc.)
    withCustomXcodeSettings,
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
