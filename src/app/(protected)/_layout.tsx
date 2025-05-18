import { useAuth } from '@clerk/clerk-expo';
import { Slot, Redirect } from 'expo-router';

export default function ProtectedLayout() {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return <Redirect href='/sign-in' />;
  }

  return <Slot />;
}