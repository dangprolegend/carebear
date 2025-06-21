import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { ActivityIndicator, View, Platform } from 'react-native';
import { useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';

export default function AuthLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  
  console.log('Auth layout - Platform:', Platform.OS, 'isSignedIn:', isSignedIn, 'isLoaded:', isLoaded);
  
  // Try to complete auth session - this is especially important for Android
  useEffect(() => {
    try {
      const result = WebBrowser.maybeCompleteAuthSession();
      console.log('Auth layout - maybeCompleteAuthSession result:', result);
    } catch (error) {
      console.error('Auth layout - Error completing auth session:', error);
    }
  }, []);

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  if (isSignedIn) {
    console.log('Auth layout - User is signed in, redirecting to root');
    return <Redirect href={'/'} />;
  }

  return (
    <Stack>
      <Stack.Screen
        name='sign-in'
        options={{ headerShown: false, title: 'Sign in' }}
      />
      <Stack.Screen name='sign-up' options={{ title: 'Sign up' }} />
      <Stack.Screen name='verify' options={{ title: 'Verify Email' }} />
    </Stack>
  );
}