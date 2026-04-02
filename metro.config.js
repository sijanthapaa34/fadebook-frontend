const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const config = {
  resolver: {
    assetExts: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ttf', 'otf'],
  },
  watchFolders: [
    path.resolve(__dirname, 'node_modules/react-native-calendars'),
  ],
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
