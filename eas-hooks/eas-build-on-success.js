// eas-hooks/eas-build-on-success.js
const fs = require('fs');
const path = require('path');

module.exports = async ({ platform, buildPath }) => {
  console.log('Running eas-build-on-success script...');
  
  // Skip if not iOS build
  if (platform !== 'ios') {
    return {};
  }
  
  try {
    // Find the Info.plist file in the build output
    const infoPlistPaths = findFilesWithNameInDirectory('Info.plist', buildPath);
    
    if (infoPlistPaths.length === 0) {
      console.error('No Info.plist files found in the build output.');
      return {};
    }
    
    // Process each Info.plist file found
    for (const infoPlistPath of infoPlistPaths) {
      console.log('Processing Info.plist at:', infoPlistPath);
      
      // Read the file content
      let content = fs.readFileSync(infoPlistPath, 'utf8');
      
      // Check if our keys are already in the file
      if (!content.includes('NSCameraUsageDescription')) {
        // Add the camera usage description
        content = content.replace(
          '</dict>', 
          '    <key>NSCameraUsageDescription</key>\n    <string>This app uses the camera to let you capture daily photo and video journal entries.</string>\n</dict>'
        );
      }
      
      if (!content.includes('NSMicrophoneUsageDescription')) {
        // Add the microphone usage description
        content = content.replace(
          '</dict>', 
          '    <key>NSMicrophoneUsageDescription</key>\n    <string>This app uses the microphone to allow you to record audio messages with your diary entries.</string>\n</dict>'
        );
      }
      
      // Write the updated content back to the file
      fs.writeFileSync(infoPlistPath, content);
      
      console.log('Successfully updated Info.plist at:', infoPlistPath);
    }
    
    return {};
  } catch (error) {
    console.error('Error in eas-build-on-success script:', error);
    return {};
  }
};

// Helper function to find files with a specific name in a directory (recursively)
function findFilesWithNameInDirectory(fileName, directoryPath) {
  const results = [];
  
  if (!fs.existsSync(directoryPath)) {
    return results;
  }
  
  const files = fs.readdirSync(directoryPath);
  
  for (const file of files) {
    const filePath = path.join(directoryPath, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      // Recursively search subdirectories
      results.push(...findFilesWithNameInDirectory(fileName, filePath));
    } else if (file === fileName) {
      // Found a matching file
      results.push(filePath);
    }
  }
  
  return results;
}