import React, { useEffect, useState } from 'react'
import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  Alert,
  Platform,
} from 'react-native'
import { useCameraPermissions, useMicrophonePermissions } from 'expo-camera'
import { Audio } from 'expo-av'
import { useAuth } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import CaptureView from './CaptureView'
import ReviewView from './ReviewView'
import useVideoRecording from '@/hooks/useVideoRecording'
import API_URL from '@/constants/api'

export default function CameraCapture() {
  // Permissions
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions();
  
  // Media states
  const [mediaUri, setMediaUri] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isVideo, setIsVideo] = useState(false)
  
  // Auth and navigation
  const { getToken } = useAuth()
  const router = useRouter()

  // Hooks
  const {
    isRecordingVideo,
    recordingDuration,
    cameraRef,
    takePhoto,
    recordVideo,
  } = useVideoRecording(setMediaUri, setIsVideo);

  // Debug logging for component mount
  useEffect(() => {
    console.log("📱 CameraCapture component mounted");
    console.log("📊 Initial state - mediaUri:", mediaUri, "isVideo:", isVideo);
    console.log("🔑 Auth hook available:", !!getToken);
    
    // Log API URL from constant
    console.log("🌐 API_URL constant:", API_URL);
    
    return () => {
      console.log("📱 CameraCapture component unmounted");
    };
  }, []);

  // Debug logging for state changes
  useEffect(() => {
    console.log("📊 State changed - mediaUri:", mediaUri, "isVideo:", isVideo);
  }, [mediaUri, isVideo]);

  // Request permissions on mount
  useEffect(() => {
    (async () => {
      console.log("🔒 Requesting camera and microphone permissions...");
      const cameraResult = await requestCameraPermission();
      const micResult = await requestMicrophonePermission();
      console.log("📷 Camera permission result:", cameraResult?.granted);
      console.log("🎙️ Microphone permission result:", micResult?.granted);
      
      // Also request audio permissions for audio recording
      const audioResult = await Audio.requestPermissionsAsync();
      console.log("🔊 Audio permission result:", audioResult.granted);
    })();
  }, [requestCameraPermission, requestMicrophonePermission]);

  const uploadMedia = async () => {
    if (!mediaUri) {
      console.log("⚠️ Upload attempted with no mediaUri");
      return;
    }

    setIsUploading(true);
    console.log("⬆️ Starting upload for:", mediaUri);
    console.log("📝 With caption:", caption);
    console.log("🎬 isVideo flag:", isVideo);

    try {
      console.log("🔑 Getting auth token...");
      const token = await getToken();
      console.log("🔑 Got token:", token ? `${token.slice(0, 10)}...` : "undefined");
      
      if (!token) {
        console.error("❌ No auth token available for upload");
        Alert.alert('Authentication Error', 'Could not authenticate your request.');
        setIsUploading(false);
        return;
      }

      const formData = new FormData();
      console.log("📋 Creating FormData object");
      
      // Regular file upload
      console.log("📁 Regular file upload for:", mediaUri);
      
      if (Platform.OS === 'web') {
        console.log("🌐 Web platform detected, using blob for form data");
        const blob = await (await fetch(mediaUri)).blob();
        formData.append('file', new File([blob], isVideo ? 'upload.mp4' : 'upload.jpg', {
          type: isVideo ? 'video/mp4' : 'image/jpeg'
        }));
      } else {
        console.log("📱 Native platform detected, using uri for form data");
        formData.append('file', {
          uri: mediaUri,
          name: isVideo ? 'upload.mp4' : 'upload.jpg',
          type: isVideo ? 'video/mp4' : 'image/jpeg',
        } as any);
      }      
      console.log("📁 Added media file to FormData");

      formData.append('caption', caption);
      console.log("📝 Added caption to FormData:", caption);

      console.log("📋 FormData ready. Sending request to:", `${API_URL}/upload`);
      
      try {
        console.log("🔄 Making fetch request...");
        const response = await fetch(`${API_URL}/upload`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        console.log("✅ Got response:", response.status, response.statusText);
        console.log("📋 Response headers:", JSON.stringify(Object.fromEntries([...response.headers.entries()]), null, 2));

        if (response.ok) {
          try {
            const responseData = await response.json();
            console.log("📥 Response data:", JSON.stringify(responseData, null, 2));
          } catch (e) {
            console.log("⚠️ Could not parse response as JSON:", e);
          }
          
          console.log("🎉 Upload successful!");
          Alert.alert('Success', 'Entry uploaded successfully!');
          setMediaUri(null);
          setCaption('');
          console.log("🔄 Navigating to home tab...");
          router.replace('/(tabs)');
        } else {
          console.error('❌ Upload failed with status:', response.status);
          let errorText = 'Unknown error';
          try {
            errorText = await response.text();
            console.error('❌ Error response:', errorText);
          } catch (e) {
            console.error('❌ Could not read error response:', e);
          }
          Alert.alert('Error', 'Upload failed.');
        }
      } catch (fetchError) {
        console.error('❌ Fetch operation failed:', fetchError);
        console.error('❌ Error details:', JSON.stringify(fetchError));
        throw fetchError; // Re-throw to be caught by outer try/catch
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      Alert.alert('Error', 'An error occurred during upload.');
    } finally {
      console.log("🏁 Upload process completed");
      setIsUploading(false);
    }
  }

  // Check if permissions are still loading
  if (!cameraPermission || !microphonePermission) {
    console.log("⏳ Permissions still loading");
    return <Text>Requesting permissions...</Text>;
  }

  // Check if permissions were denied
  if (!cameraPermission.granted || !microphonePermission.granted) {
    console.log("❌ Permission denied - Camera:", cameraPermission.granted, "Microphone:", microphonePermission.granted);
    return <Text>No access to camera or microphone</Text>;
  }

  console.log("🎬 Rendering camera capture UI. mediaUri:", !!mediaUri);
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      {mediaUri ? (
        // Media preview and upload UI
        <CaptureView
          mediaUri={mediaUri}
          isVideo={isVideo}
          caption={caption}
          setCaption={setCaption}
          isUploading={isUploading}
          uploadMedia={uploadMedia}
          setMediaUri={setMediaUri}
          setIsVideo={setIsVideo}
        />
      ) : (
        <ReviewView
          cameraRef={cameraRef}
          isRecordingVideo={isRecordingVideo}
          recordingDuration={recordingDuration}
          takePhoto={takePhoto}
          recordVideo={recordVideo}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 10,
      backgroundColor: 'black',
      justifyContent: 'center',
    }
  });