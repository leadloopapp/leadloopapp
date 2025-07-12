// metro.config.js
const { getDefaultConfig } = require("@expo/metro-config");

const config = getDefaultConfig(__dirname);

// Force enable web support with webpack
config.web = {
  bundler: "webpack",
};

module.exports = config;
