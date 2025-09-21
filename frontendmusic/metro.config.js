const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = mergeConfig(getDefaultConfig(__dirname), {
    // các cấu hình tùy chỉnh khác của bạn có thể đặt ở đây
});

module.exports = withNativeWind(config, { input: './global.css' });