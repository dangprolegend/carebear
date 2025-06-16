import { Slot, Redirect } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { ActivityIndicator, View, Platform } from 'react-native';
import { useEffect } from 'react';

export default function ProtectedLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  
  console.log('Protected layout - Platform:', Platform.OS, 'isSignedIn:', isSignedIn, 'isLoaded:', isLoaded);
  
  // Track when auth state changes
  useEffect(() => {
    console.log('Protected layout - Auth state updated:', { isSignedIn, isLoaded });
  }, [isSignedIn, isLoaded]);

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  if (!isSignedIn) {
    console.log('Protected layout - User is not signed in, redirecting to sign-in');
    return <Redirect href='/(auth)/sign-in' />;
  }

  console.log('Protected layout - Rendering protected content');
  return <Slot />;
}