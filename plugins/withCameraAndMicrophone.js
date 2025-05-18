// plugins/withCameraAndMicrophone.js
const { withEntitlementsPlist } = require('@expo/config-plugins');

module.exports = function withCameraAndMicrophone(config) {
  return withEntitlementsPlist(config, (config) => {
    // Ensure we have an entitlements object
    if (!config.modResults) {
      config.modResults = {};
    }
    
    // Add camera and microphone entitlements
    config.modResults['com.apple.security.device.camera'] = true;
    config.modResults['com.apple.security.device.microphone'] = true;
    
    return config;
  });
};