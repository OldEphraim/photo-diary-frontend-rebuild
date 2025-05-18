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

  // Request permissions on mount
  useEffect(() => {
    (async () => {
      const cameraResult = await requestCameraPermission();
      const micResult = await requestMicrophonePermission();

      // Also request audio permissions for audio recording
      const audioResult = await Audio.requestPermissionsAsync();
    })();
  }, [requestCameraPermission, requestMicrophonePermission]);

  const uploadMedia = async () => {
    if (!mediaUri) {
      return;
    }

    setIsUploading(true);

    try {
      const token = await getToken();
      
      if (!token) {
        Alert.alert('Authentication Error', 'Could not authenticate your request.');
        setIsUploading(false);
        return;
      }

      const formData = new FormData();
      
      if (Platform.OS === 'web') {
        const blob = await (await fetch(mediaUri)).blob();
        formData.append('file', new File([blob], isVideo ? 'upload.mp4' : 'upload.jpg', {
          type: isVideo ? 'video/mp4' : 'image/jpeg'
        }));
      } else {
        formData.append('file', {
          uri: mediaUri,
          name: isVideo ? 'upload.mp4' : 'upload.jpg',
          type: isVideo ? 'video/mp4' : 'image/jpeg',
        } as any);
      }      

      formData.append('caption', caption);
      
      try {
        const response = await fetch(`${API_URL}/upload`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (response.ok) {
          try {
            const responseData = await response.json();
          } catch (e) {
            console.log("⚠️ Could not parse response as JSON:", e);
          }

          Alert.alert('Success', 'Entry uploaded successfully!');
          setMediaUri(null);
          setCaption('');
          router.replace('/(tabs)');
        } else {
          let errorText = 'Unknown error';
          try {
            errorText = await response.text();
          } catch (e) {
            console.error('❌ Could not read error response:', e);
          }
          Alert.alert('Error', 'Upload failed.');
        }
      } catch (fetchError) {
        throw fetchError; // Re-throw to be caught by outer try/catch
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  }

  // Check if permissions are still loading
  if (!cameraPermission || !microphonePermission) {
    return <Text>Requesting permissions...</Text>;
  }

  // Check if permissions were denied
  if (!cameraPermission.granted || !microphonePermission.granted) {
    return <Text>No access to camera or microphone</Text>;
  }
    
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