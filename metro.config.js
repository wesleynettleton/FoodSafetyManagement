const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  resolver: {
    assetExts: ['bin', 'txt', 'jpg', 'png', 'json', 'ttf', 'otf', 'woff', 'woff2'],
  },
  transformer: {
    assetRegistryPath: 'react-native/Libraries/Image/AssetRegistry',
  },
  server: {
    port: 8081,
    host: '0.0.0.0', // Allow external connections
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config); 