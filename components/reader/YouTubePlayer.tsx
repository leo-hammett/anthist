/**
 * YouTubePlayer
 * 
 * Platform-agnostic export.
 * - On native (iOS/Android): Uses react-native-youtube-iframe
 * - On web: Uses standard iframe embed
 * 
 * React Native/Metro automatically resolves:
 * - YouTubePlayer.native.tsx for iOS/Android
 * - YouTubePlayer.web.tsx for web
 * 
 * This file serves as a fallback and TypeScript type reference.
 */

// Re-export the native implementation as default
// Metro bundler will override this with the correct platform file
export { default } from './YouTubePlayer.native';
