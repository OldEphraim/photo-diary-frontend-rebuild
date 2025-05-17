import React from 'react';
import { View, Image, TextInput, Button, ActivityIndicator, StyleSheet } from 'react-native';
import { Video, ResizeMode } from 'expo-av';

interface CaptureViewProps {
  mediaUri: string;
  isVideo: boolean;
  caption: string;
  setCaption: (caption: string) => void;
  isUploading: boolean;
  uploadMedia: () => void;
  setMediaUri: (uri: string | null) => void;
  setIsVideo: (val: boolean) => void; 
}

const CaptureView: React.FC<CaptureViewProps> = ({
  mediaUri,
  isVideo,
  caption,
  setCaption,
  isUploading,
  uploadMedia,
  setMediaUri,
  setIsVideo,
}) => {
  return (
    <>
      <View style={styles.previewContainer}>
        {isVideo ? (
          <Video
            source={{ uri: mediaUri }}
            style={styles.preview}
            useNativeControls
            resizeMode={ResizeMode.COVER}
            shouldPlay
            isLooping
          />
        ) : (
          <Image source={{ uri: mediaUri }} style={styles.preview} />
        )}
      </View>
      <TextInput
        style={styles.input}
        placeholder="Enter a caption"
        placeholderTextColor="#aaa"
        value={caption}
        onChangeText={setCaption}
      />

      {isUploading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : (
        <View style={styles.actionButtonContainer}>
          <Button title="Save Entry" onPress={uploadMedia} />
          <Button
            title="Start Over"
            onPress={() => {
              setMediaUri(null);
            }}
            color="#888"
          />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  previewContainer: {
    flex: 1,
    position: 'relative',
  },
  preview: {
    flex: 1,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  videoIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: 'white',
    padding: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
    overflow: 'hidden',
  },
  input: {
    backgroundColor: '#222',
    color: '#fff',
    borderColor: '#555',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginVertical: 10,
  },
  actionButtonContainer: {
    marginTop: 10,
    marginBottom: 20,
  }
});

export default CaptureView;