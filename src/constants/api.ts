import Constants from 'expo-constants';

// Get API IP from Constants (for dev builds) or fallback to process.env (for Expo Go)
const API_IP = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_IP;

// Make sure to handle the case where both might be undefined
if (!API_IP) {
  console.warn('API_IP is not defined in environment variables or app config!');
}

const API_URL = `${API_IP}/api`;

export default API_URL;