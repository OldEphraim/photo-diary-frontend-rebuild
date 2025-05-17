import { View, StyleSheet, Text } from 'react-native'
// import CameraCapture from '../../components/CameraCapture'

export default function DiaryEntryScreen() {
  return (
    <View style={styles.container}>
      {/* <CameraCapture /> */} <Text>This is where the CameraCapture will go.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
})