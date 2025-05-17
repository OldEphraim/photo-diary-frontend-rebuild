import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// This component shows when user has no diary entries
export default function EmptyDiaryState() {
  const { user } = useUser();
  const router = useRouter();
  
  // Get first name or use email username
  const displayName = user?.firstName || 
    user?.emailAddresses[0].emailAddress.split('@')[0] || "New user";
    
  return (
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={styles.scrollViewContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.emptyStateCard}>
        <View style={styles.iconContainer}>
          <Ionicons name="journal-outline" size={80} color="#4285F4" />
        </View>
        
        <Text style={styles.welcomeHeading}>
          Welcome to your diary, {displayName}!
        </Text>
        
        <Text style={styles.infoText}>
          This is where you'll see all your memories. Start by capturing your first photo or video.
        </Text>
        
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => router.push('/(protected)/(tabs)/diary-entry')}
        >
          <Ionicons name="add" size={22} color="white" />
          <Text style={styles.buttonText}>Create First Entry</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsHeading}>Quick Tips:</Text>
        
        <View style={styles.tipRow}>
          <Ionicons name="camera-outline" size={20} color="#4285F4" style={styles.tipIcon} />
          <Text style={styles.tipText}>Take photos to capture important moments</Text>
        </View>
        
        <View style={styles.tipRow}>
          <Ionicons name="videocam-outline" size={20} color="#4285F4" style={styles.tipIcon} />
          <Text style={styles.tipText}>Record videos with sound</Text>
        </View>
        
        <View style={styles.tipRow}>
          <Ionicons name="refresh-outline" size={20} color="#4285F4" style={styles.tipIcon} />
          <Text style={styles.tipText}>Keep your memories fresh!</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  emptyStateCard: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  iconContainer: {
    marginBottom: 16,
  },
  welcomeHeading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  tipsContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipsHeading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Changed from 'center' to 'flex-start' for better text alignment when wrapping
    marginBottom: 16, // Increased spacing between tips
    paddingRight: 10, // Add some padding on the right side
  },
  tipIcon: {
    marginRight: 12,
    marginTop: 2, // Slightly adjust icon position for better alignment with first line of text
  },
  tipText: {
    fontSize: 15,
    color: '#555',
    flex: 1, // This will make the text take available space and wrap
    flexWrap: 'wrap', // Ensure text wraps
    paddingRight: 15, // Add right padding to prevent text from reaching the edge
    lineHeight: 20, // Improve readability with better line height
  },
});