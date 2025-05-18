
// plugins/withMediaPermissions.js
const { withInfoPlist } = require('@expo/config-plugins');

module.exports = function withMediaPermissions(config) {
  return withInfoPlist(config, (config) => {
    const infoPlist = config.modResults;
    
    // Add camera usage description
    if (!infoPlist.NSCameraUsageDescription) {
      infoPlist.NSCameraUsageDescription = "This app uses the camera to let you capture daily photo and video journal entries.";
    }
    
    // Add microphone usage description
    if (!infoPlist.NSMicrophoneUsageDescription) {
      infoPlist.NSMicrophoneUsageDescription = "This app uses the microphone to allow you to record audio messages with your diary entries.";
    }

    return config;
  });
};