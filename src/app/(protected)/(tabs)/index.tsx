import { useState, useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native'
import { Video, ResizeMode } from 'expo-av'
import { useUser, useAuth } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import EmptyDiaryState from '@/components/EmptyDiaryState'
import API_URL from '@/constants/api'

interface DiaryEntry {
  id: string
  created_at: string
  media_url: string
  caption: string
}

export default function DiaryHomeScreen() {
  const { user } = useUser()
  const { getToken } = useAuth()
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchEntries()
    setRefreshing(false)
  }  

  const fetchEntries = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/entries`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      data.sort((a: DiaryEntry, b: DiaryEntry) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      setEntries(data)
    } catch (err) {
      Alert.alert('Error', 'Could not fetch your diary entries.')
    } finally {
      setIsLoading(false)
    }
  }

  const confirmDelete = (id: string) => {
    Alert.alert('Delete Entry', 'Are you sure you want to delete this entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteEntry(id),
      },
    ])
  }  

  const deleteEntry = async (id: string) => {
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/entry/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        setEntries((prev) => prev.filter((entry) => entry.id !== id))
        Alert.alert('Deleted', 'Diary entry removed.')
      } else {
        throw new Error('Server rejected deletion')
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to delete entry.')
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchEntries()
    }, [])
  )  

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.loadingText}>Loading your entries...</Text>
      </View>
    )
  }

  if (entries.length === 0) {
    return <EmptyDiaryState />
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >  
      {entries.map((entry) => {
        const isVideo = entry.media_url.endsWith('.mp4') || entry.media_url.includes('.mp4')
        const formattedDate = new Date(entry.created_at).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        return (
          <View key={entry.id} style={styles.entryCard}>
            {isVideo ? (
              <Video
                source={{ uri: entry.media_url }}
                style={styles.mediaPreview}
                useNativeControls
                resizeMode={ResizeMode.COVER}
                shouldPlay={false}
              />
            ) : (
              <Image
                source={{ uri: entry.media_url }}
                style={styles.mediaPreview}
                resizeMode="cover"
              />
            )}
            
            <View style={styles.entryInfo}>
              <View style={styles.captionContainer}>
                <Text style={styles.captionText}>
                  {entry.caption || 'No caption'}
                </Text>
              </View>
              
              <View style={styles.entryFooter}>
                <Text style={styles.dateText}>
                  <Ionicons name="time-outline" size={14} color="#888" /> {formattedDate}
                </Text>
                
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => confirmDelete(entry.id)}
                >
                  <Ionicons name="trash-outline" size={18} color="#ff4444" />
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  entryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mediaPreview: {
    height: 220,
    width: '100%',
  },
  entryInfo: {
    padding: 16,
  },
  captionContainer: {
    marginBottom: 12,
  },
  captionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  dateText: {
    fontSize: 14,
    color: '#888',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#fff0f0',
  },
  deleteText: {
    fontSize: 14,
    color: '#ff4444',
    marginLeft: 6,
  }
});