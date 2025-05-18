// hooks/useVideoRecording.ts
import { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { CameraView } from 'expo-camera';

export default function useVideoRecording(setMediaUri: (uri: string | null) => void, setIsVideo: (isVideo: boolean) => void) {
  // Video recording states
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  
  // References
  const cameraRef = useRef<CameraView>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  const takePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        
        setMediaUri(photo.uri);
        setIsVideo(false);
      } catch (error) {
        Alert.alert('Error', 'Could not take photo.');
      }
    } else {
      console.error("Camera ref is null when taking photo");
    }
  };

  const recordVideo = async () => {
    if (!cameraRef.current) {
      return;
    }
    
    if (!isRecordingVideo) {
      // Start recording
      try {
        setIsRecordingVideo(true);
        setRecordingDuration(0);
        
        // Start a timer to track recording duration
        const interval = setInterval(() => {
          setRecordingDuration(prev => prev + 1);
        }, 1000);
        setTimerInterval(interval);
        
        // Create a timeout to force stop recording after maxDuration
        const maxDurationMs = 60 * 1000; // 60 seconds
        const recordingTimeout = setTimeout(() => {
          if (isRecordingVideo && cameraRef.current) {
            try {
              cameraRef.current.stopRecording();
            } catch (e) {
              console.error("Error stopping recording at timeout:", e);
            }
          }
        }, maxDurationMs);
        
        // Start recording in the background
        cameraRef.current.recordAsync({ maxDuration: 60 })
          .then(videoResult => {
            
            // Clear the timer
            if (timerInterval) {
              clearInterval(timerInterval);
              setTimerInterval(null);
            }
            
            // Clear the timeout
            clearTimeout(recordingTimeout);
            
            // Process the recording result
            if (videoResult && videoResult.uri) {
              setMediaUri(videoResult.uri);
              setIsVideo(true);
            } else {
              Alert.alert('Error', 'Failed to get video.');
            }
            
            setIsRecordingVideo(false);
          })
          .catch(error => {
            
            // Clear the timer
            if (timerInterval) {
              clearInterval(timerInterval);
              setTimerInterval(null);
            }
            
            // Clear the timeout
            clearTimeout(recordingTimeout);
            
            setIsRecordingVideo(false);
            Alert.alert('Error', 'Could not complete video recording.');
          });
      } catch (error) {
        setIsRecordingVideo(false);
        
        if (timerInterval) {
          clearInterval(timerInterval);
          setTimerInterval(null);
        }
        
        Alert.alert('Error', 'Could not start video recording.');
      }
    } else {
      // Stop recording
      try {
        
        // This will cause the promise from recordAsync to resolve
        if (cameraRef.current) {
          cameraRef.current.stopRecording();
        }
        
        // Note: We don't set isRecordingVideo to false here
        // That will be done in the promise resolution from recordAsync
      } catch (error) {
        setIsRecordingVideo(false);
        
        // Clear the timer
        if (timerInterval) {
          clearInterval(timerInterval);
          setTimerInterval(null);
        }
      }
    }
  };

  return {
    isRecordingVideo,
    recordingDuration,
    cameraRef,
    takePhoto,
    recordVideo
  };
}