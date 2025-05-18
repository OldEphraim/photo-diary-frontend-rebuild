// eas-hooks/eas-build-pre-install.js
module.exports = async () => {
    console.log('Running eas-build-pre-install script...');
    
    // This script will print a message before the build starts
    // We'll actually modify the Info.plist in the post-build phase
    
    return {};
  };