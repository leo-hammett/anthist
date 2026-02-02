// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const { withShareExtension } = require('expo-share-extension/metro');

const config = getDefaultConfig(__dirname);

module.exports = withShareExtension(config, {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: true,
});
