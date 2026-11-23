module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    // Required by react-native-reanimated 4 (a glacia-native peer dependency).
    plugins: ["react-native-worklets/plugin"],
  };
};
