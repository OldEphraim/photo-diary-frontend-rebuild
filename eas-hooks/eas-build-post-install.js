// eas-hooks/eas-build-post-install.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

module.exports = async ({ platform, modRequest }) => {
  console.log('Running eas-build-post-install script...');
  
  // Skip if not iOS build
  if (platform !== 'ios') {
    console.log('Not an iOS build. Skipping Info.plist modification.');
    return {};
  }
  
  console.log('This is an iOS build. Checking for Info.plist...');
  
  try {
    // Get the iOS project directory
    const projectRoot = modRequest.projectRoot;
    const iosDir = path.join(projectRoot, 'ios');
    
    if (!fs.existsSync(iosDir)) {
      console.error('iOS directory not found at:', iosDir);
      return {};
    }
    
    // Find the app directory (should be named like your app or something similar)
    const appDirs = fs.readdirSync(iosDir).filter(file => 
      fs.statSync(path.join(iosDir, file)).isDirectory() && 
      !file.startsWith('.') &&
      file !== 'Pods'
    );
    
    if (appDirs.length === 0) {
      console.error('No app directory found in the iOS folder.');
      // List what's in the iOS directory for debugging
      console.log('Contents of iOS directory:', fs.readdirSync(iosDir));
      return {};
    }
    
    // Assume the first directory is the app directory 
    // (usually it's the only one apart from Pods)
    const appDir = appDirs[0];
    const infoPlistPath = path.join(iosDir, appDir, 'Info.plist');
    
    if (!fs.existsSync(infoPlistPath)) {
      console.error('Info.plist not found at:', infoPlistPath);
      return {};
    }
    
    console.log('Found Info.plist at:', infoPlistPath);
    
    // Read the Info.plist file
    const infoPlistContent = fs.readFileSync(infoPlistPath, 'utf8');
    
    // Check if the keys already exist
    const hasCameraKey = infoPlistContent.includes('NSCameraUsageDescription');
    const hasMicrophoneKey = infoPlistContent.includes('NSMicrophoneUsageDescription');
    
    // Create a temporary file to modify the plist
    const tempFile = path.join(projectRoot, 'temp-plist-modifications.xml');
    
    // Write the modifications to the temporary file
    fs.writeFileSync(tempFile, `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>NSCameraUsageDescription</key>
  <string>This app uses the camera to let you capture daily photo and video journal entries.</string>
  <key>NSMicrophoneUsageDescription</key>
  <string>This app uses the microphone to allow you to record audio messages with your diary entries.</string>
</dict>
</plist>`);
    
    // Use plutil to merge the files
    execSync(`plutil -insert NSCameraUsageDescription -string "This app uses the camera to let you capture daily photo and video journal entries." "${infoPlistPath}"`, { stdio: 'inherit' });
    execSync(`plutil -insert NSMicrophoneUsageDescription -string "This app uses the microphone to allow you to record audio messages with your diary entries." "${infoPlistPath}"`, { stdio: 'inherit' });
    
    console.log('Successfully modified Info.plist');
    
    // Clean up
    fs.unlinkSync(tempFile);
    
    return {};
  } catch (error) {
    console.error('Error modifying Info.plist:', error);
    return {};
  }
};