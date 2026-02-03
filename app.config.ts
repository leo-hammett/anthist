/**
 * Anthist App Configuration
 * 
 * This file configures the Expo application for iOS, Android, and Web platforms.
 * It defines build settings, platform-specific configurations, plugins, and extensions.
 * 
 * Key Features:
 * - Custom Xcode build settings for iOS/macOS deployment
 * - Share extension support for receiving content from other apps
 * - Cross-platform support (iOS, Android, macOS, Web)
 * - App groups for secure data sharing between app and extensions
 * 
 * @see https://docs.expo.dev/workflow/configuration/
 */

import { ConfigContext, ExpoConfig } from 'expo/config';
import { ConfigPlugin, withXcodeProject } from 'expo/config-plugins';

/**
 * Custom Xcode Settings Config Plugin
 * 
 * This plugin modifies the Xcode project to apply custom build settings that cannot
 * be configured through standard Expo configuration. It runs during the prebuild phase
 * and directly manipulates the .pbxproj file.
 * 
 * What it does:
 * 1. Sets the development team ID for code signing
 * 2. Configures iOS/macOS deployment targets
 * 3. Enables multi-platform support (iOS, iPad, macOS)
 * 4. Configures security settings (sandboxing, hardened runtime)
 * 5. Sets up app groups for data sharing
 * 
 * Applies settings to:
 * - Main app target (com.anthist.app)
 * - Share extension target (com.anthist.app.ShareExtension)
 * 
 * @param config - The Expo config object
 * @returns Modified config with Xcode settings applied
 */
const withCustomXcodeSettings: ConfigPlugin = (config) => {
  return withXcodeProject(config, async (config) => {
    const xcodeProject = config.modResults;
    
    // Get all build configurations from the Xcode project
    // This includes Debug, Release, and any custom configurations
    const configurations = xcodeProject.pbxXCBuildConfigurationSection();
    
    // Iterate through all build configurations to apply settings
    for (const key in configurations) {
      const buildSettings = configurations[key]?.buildSettings;
      if (!buildSettings) continue;
      
      const name = configurations[key]?.name; // e.g., "Debug" or "Release"
      
      /*
       * Main App Target Configuration
       * Applies settings to the primary Anthist application
       */
      if (buildSettings.PRODUCT_BUNDLE_IDENTIFIER === 'com.anthist.app' || 
          buildSettings.PRODUCT_NAME === 'Anthist') {
        
        // Apple Development Team ID (required for code signing and distribution)
        buildSettings.DEVELOPMENT_TEAM = 'G2WXN4J37T';
        
        // Minimum iOS version required to run the app
        // iOS 15.1 provides good device coverage while enabling modern features
        buildSettings.IPHONEOS_DEPLOYMENT_TARGET = '15.1';
        
        // Platform Support Configuration
        // Enables building for iOS devices, iOS simulator, and native macOS
        buildSettings.SUPPORTED_PLATFORMS = '"iphoneos iphonesimulator macosx"';
        buildSettings.SUPPORTS_MACCATALYST = 'NO'; // Disable Mac Catalyst (iPad app on Mac)
        buildSettings.SUPPORTS_MAC_DESIGNED_FOR_IPHONE_IPAD = 'NO'; // Disable "Designed for iPad" on Mac
        buildSettings.SUPPORTS_XR_DESIGNED_FOR_IPHONE_IPAD = 'NO'; // Disable Vision Pro compatibility
        
        // macOS Security Settings
        // App Sandbox restricts file system and network access for security
        buildSettings.ENABLE_APP_SANDBOX = 'YES';
        // Hardened Runtime provides additional memory protection and security
        buildSettings.ENABLE_HARDENED_RUNTIME = 'YES';
        // Explicitly allow network connections (required for API calls)
        buildSettings.ENABLE_OUTGOING_NETWORK_CONNECTIONS = 'YES';
        
        // App Store Category
        // Categorizes the app as a books/reading application
        buildSettings.INFOPLIST_KEY_LSApplicationCategoryType = '"public.app-category.books"';
        
        // Enable app groups for secure data sharing between app and extensions
        buildSettings.REGISTER_APP_GROUPS = 'YES';
      }
      
      /*
       * Share Extension Target Configuration
       * Applies settings to the share extension (allows sharing content from other apps)
       */
      if (buildSettings.PRODUCT_BUNDLE_IDENTIFIER === 'com.anthist.app.ShareExtension' ||
          buildSettings.PRODUCT_NAME === 'AnthistShareExtension') {
        
        // Code signing team (must match main app)
        buildSettings.DEVELOPMENT_TEAM = 'G2WXN4J37T';
        
        // Deployment target (must match or be lower than main app)
        buildSettings.IPHONEOS_DEPLOYMENT_TARGET = '15.1';
        
        // Platform support (same as main app for consistency)
        buildSettings.SUPPORTED_PLATFORMS = '"iphoneos iphonesimulator macosx"';
        buildSettings.SUPPORTS_MACCATALYST = 'NO';
        buildSettings.SUPPORTS_MAC_DESIGNED_FOR_IPHONE_IPAD = 'NO';
        buildSettings.SUPPORTS_XR_DESIGNED_FOR_IPHONE_IPAD = 'NO';
        
        // Apply security settings only in Debug configuration
        // (Release builds may have different requirements)
        if (name === 'Debug') {
          buildSettings.ENABLE_APP_SANDBOX = 'YES';
          buildSettings.ENABLE_HARDENED_RUNTIME = 'YES';
          buildSettings.ENABLE_OUTGOING_NETWORK_CONNECTIONS = 'YES';
          buildSettings.REGISTER_APP_GROUPS = 'YES';
        }
      }
    }
    
    /*
     * Project-Level Deployment Target Configuration
     * Sets the iOS deployment target at the project level (not just per target)
     * This ensures consistency across all targets and prevents build warnings
     */
    const projectConfig = xcodeProject.pbxProjectSection();
    for (const key in projectConfig) {
      if (projectConfig[key]?.buildConfigurationList) {
        const buildConfigListKey = projectConfig[key].buildConfigurationList;
        const configList = xcodeProject.pbxXCConfigurationList()[buildConfigListKey];
        if (configList) {
          // Apply deployment target to all project-level configurations
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

/**
 * Main Expo Configuration Export
 * 
 * This function returns the complete app configuration object used by Expo during
 * development and build processes. It defines app metadata, platform-specific settings,
 * plugins, and build options.
 * 
 * Configuration Flow:
 * 1. Expo reads this config during app initialization
 * 2. During prebuild, it generates native iOS/Android project files
 * 3. Custom plugins (like withCustomXcodeSettings) modify native projects
 * 4. Build process uses these settings to compile the app
 * 
 * @param context - Expo configuration context containing environment info
 * @returns Complete ExpoConfig object with all app settings
 */
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config, // Spread any existing config from app.json or environment
  
  /*
   * Basic App Information
   * These fields identify the app in stores and on devices
   */
  name: 'Anthist', // Display name shown to users
  slug: 'anthist', // URL-safe identifier used in Expo services
  version: '1.0.0', // Semantic version (major.minor.patch)
  orientation: 'portrait', // Lock app to portrait mode for better reading experience
  icon: './assets/images/icon.png', // App icon (1024x1024 recommended)
  scheme: 'anthist', // Deep linking scheme (anthist://path)
  userInterfaceStyle: 'automatic', // Support both light and dark modes
  
  /*
   * Splash Screen Configuration
   * Displayed while the app is loading on first launch
   */
  splash: {
    image: './assets/images/splash-icon.png',
    resizeMode: 'contain', // Center the image without cropping
    backgroundColor: '#0A0A0A', // Dark background matches app theme
  },
  
  // Include all assets in the bundle (images, fonts, etc.)
  assetBundlePatterns: ['**/*'],
  
  /*
   * iOS Platform Configuration
   * Settings specific to iPhone, iPad, and macOS builds
   */
  ios: {
    supportsTablet: true, // Enable iPad support with adaptive layouts
    bundleIdentifier: 'com.anthist.app', // Unique identifier for App Store
    
    /*
     * Entitlements
     * Special permissions required by iOS/macOS for security features
     * App groups enable secure data sharing between the main app and share extension
     */
    entitlements: {
      'com.apple.security.application-groups': ['group.com.anthist.app'],
    },
    
    /*
     * Info.plist Configuration
     * iOS metadata and permissions that get embedded in the app bundle
     */
    infoPlist: {
      // Allow loading arbitrary web content in WebViews
      // Required for displaying external blog posts and articles
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: true,
      },
      
      // App Group Configuration
      // Enables data sharing with share extension through shared containers
      AppGroup: 'group.com.anthist.app',
      AppGroupIdentifier: 'group.com.anthist.app',
      
      // Motion Sensor Permission
      // Required for gesture-based interactions (if using accelerometer/gyroscope)
      NSMotionUsageDescription: 'Allow $(PRODUCT_NAME) to access your device motion',
      
      // macOS Minimum Version
      // Requires macOS Monterey (12.0) or later for native Mac builds
      LSMinimumSystemVersion: '12.0',
    },
  },
  
  /*
   * Android Platform Configuration
   * Settings specific to Android devices and Google Play Store
   */
  android: {
    /*
     * Adaptive Icon Configuration
     * Android 8.0+ supports adaptive icons that adjust to different device themes
     * - Foreground: Main logo/icon design
     * - Background: Color or pattern behind the icon
     * - Monochrome: Single-color version for themed icons (Android 13+)
     */
    adaptiveIcon: {
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    package: 'com.anthist.app', // Unique package name for Play Store
    
    /*
     * Intent Filters
     * Define how Android apps can interact with Anthist
     */
    intentFilters: [
      /*
       * Share Intent Filter
       * Allows users to share text/URLs from other apps (browser, notes, etc.) to Anthist
       * Appears in the Android share sheet when sharing text content
       */
      {
        action: 'android.intent.action.SEND',
        category: ['android.intent.category.DEFAULT'],
        data: [
          { mimeType: 'text/plain' }, // Plain text content
          { mimeType: 'text/*' }, // Any text-based content
        ],
      },
      /*
       * Deep Link Intent Filter
       * Handles both app scheme (anthist://) and web URLs (*.anthist.com)
       * Enables opening the app from external links
       */
      {
        action: 'android.intent.action.VIEW',
        category: ['android.intent.category.DEFAULT', 'android.intent.category.BROWSABLE'],
        data: [
          { scheme: 'anthist' }, // Custom app scheme
          { scheme: 'https', host: '*.anthist.com' }, // Web URLs
        ],
      },
    ],
  },
  
  /*
   * Web Platform Configuration
   * Settings for the web version of the app (PWA)
   */
  web: {
    bundler: 'metro', // Use Metro bundler (same as React Native for consistency)
    output: 'static', // Generate static files for hosting
    favicon: './assets/images/favicon.png', // Browser tab icon
  },
  
  /*
   * Plugins
   * Expo Config Plugins that modify native projects and add functionality
   * Plugins run during 'npx expo prebuild' to configure native iOS/Android code
   */
  plugins: [
    /*
     * Expo Router Plugin
     * Enables file-based routing system (similar to Next.js)
     * Automatically generates navigation based on app/ directory structure
     */
    'expo-router',
    
    /*
     * Expo Sensors Plugin
     * Provides access to device sensors (accelerometer, gyroscope, magnetometer)
     * Used for gesture-based interactions or motion detection
     */
    'expo-sensors',
    
    /*
     * Expo Document Picker Plugin
     * Allows users to select files from their device or iCloud Drive
     * Configured for production iCloud environment
     */
    [
      'expo-document-picker',
      {
        iCloudContainerEnvironment: 'Production',
      },
    ],
    
    /*
     * Expo Share Extension Plugin
     * Creates an iOS share extension that appears in the system share sheet
     * Allows users to share content from Safari, Notes, and other apps into Anthist
     * 
     * How it works:
     * 1. User shares content from another app
     * 2. Anthist appears in the share sheet
     * 3. Share extension opens with custom UI
     * 4. Content is processed and saved to app group container
     * 5. Main app reads shared content on next launch
     */
    [
      'expo-share-extension',
      {
        /*
         * Activation Rules
         * Define what types of content can be shared to Anthist
         */
        activationRules: [
          {
            type: 'url', // Accept URLs (max 1 URL at a time)
            max: 1,
          },
          {
            type: 'text', // Accept any text content (unlimited)
          },
        ],
        
        /*
         * Share Extension UI Customization
         */
        // Dark background matching app theme (RGBA: 10, 10, 10, 0.95)
        backgroundColor: {
          red: 10,
          green: 10,
          blue: 10,
          alpha: 0.95,
        },
        
        // Share sheet height in points (iOS default is ~280)
        height: 400,
        
        /*
         * Bundle Size Optimization
         * Exclude packages not needed in the share extension to reduce size
         * Share extension has 120MB memory limit on iOS
         */
        excludedPackages: [
          'expo-dev-client', // Development only
          'expo-splash-screen', // Not shown in extensions
          'expo-updates', // OTA updates not applicable
          'expo-sensors', // Sensors not used in share flow
        ],
      },
    ],
    
    /*
     * Custom Xcode Settings Plugin (defined above)
     * Applies development team, deployment targets, and security settings
     */
    withCustomXcodeSettings,
  ],
  
  /*
   * Experimental Features
   * Beta features that may become stable in future Expo versions
   */
  experiments: {
    typedRoutes: true, // Enable TypeScript type checking for Expo Router routes
  },
  
  /*
   * Extra Configuration
   * Custom settings passed to the app at runtime via expo-constants
   */
  extra: {
    router: {
      origin: false, // Disable automatic origin detection for routing
    },
  },
});
