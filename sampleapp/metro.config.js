const { getDefaultConfig } = require("expo/metro-config");

const defaultConfig = getDefaultConfig(__dirname);

// Firebase v12 compatibility - enable .cjs module resolution
defaultConfig.resolver.sourceExts.push("cjs");

// Disable package exports for better Firebase compatibility
defaultConfig.resolver.unstable_enablePackageExports = false;

module.exports = defaultConfig;
