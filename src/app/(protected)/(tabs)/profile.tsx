
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { SignOutButton } from '@/components/SignOutButton';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileTab() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  // Format join date
  const formatJoinDate = () => {
    if (!user?.createdAt) return 'Unknown';
    const date = new Date(user.createdAt);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileCard}>
        <View style={styles.headerRow}>
          <View style={styles.iconContainer}>
            <Ionicons name="person-circle" size={60} color="#4285F4" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.welcomeText}>Welcome!</Text>
            <Text style={styles.userNameText}>
              {user?.firstName || user?.emailAddresses[0].emailAddress.split('@')[0]}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={20} color="#555" style={styles.infoIcon} />
          <Text style={styles.infoText}>
            {user?.emailAddresses[0].emailAddress}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={20} color="#555" style={styles.infoIcon} />
          <Text style={styles.infoText}>
            Member since {formatJoinDate()}
          </Text>
        </View>
      </View>

      <SignOutButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  profileCard: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    marginRight: 15,
  },
  headerTextContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
  },
  userNameText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIcon: {
    marginRight: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#555',
  }
});