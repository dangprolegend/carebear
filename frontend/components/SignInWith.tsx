import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { useEffect, useCallback, useState } from 'react';
import { useSSO, useAuth } from '@clerk/clerk-expo';
import { Pressable, Image, TouchableOpacity, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import googleButton from '../assets/images/google.png';
import appleButton from '../assets/images/apple.png';
import facebookButton from '../assets/images/facebook.png';
import { setupAndroidAuthHelpers, getPlatformRedirectUri } from '../utils/androidAuthHelpers';

export const useWarmUpBrowser = () => {
  useEffect(() => {
    // Preloads the browser for Android devices to reduce authentication load time
    // See: https://docs.expo.dev/guides/authentication/#improving-user-experience
    void WebBrowser.warmUpAsync();
    return () => {
      // Cleanup: closes browser when component unmounts
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

type SignInWithProps = {
  strategy: 'oauth_google' | 'oauth_apple' | 'oauth_facebook';
};

const strategyIcons = {
  oauth_google: googleButton,
  oauth_apple: appleButton,
  oauth_facebook: facebookButton,
};

export default function SignInWith({ strategy }: SignInWithProps) {
  useWarmUpBrowser();
  const [loading, setLoading] = useState(false);
  const { isSignedIn, isLoaded } = useAuth();

  // Use the `useSSO()` hook to access the `startSSOFlow()` method
  const { startSSOFlow } = useSSO();
  
  // Set up Android-specific deep linking handlers
  useEffect(() => {
    // Run platform-specific setup code
    if (Platform.OS === 'android') {
      console.log('Setting up Android auth helpers for SignInWith');
      return setupAndroidAuthHelpers();
    }
  }, []);

  // Effect to handle successful sign-in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      console.log('Auth state detected as signed in, redirecting to root');
      router.replace('/');
    }
  }, [isLoaded, isSignedIn]);

  const onPress = useCallback(async () => {
    try {
      setLoading(true);
      console.log(`Starting SSO flow with ${strategy} on platform: ${Platform.OS}`);
      
      // Get the appropriate redirect URI for this platform
      const redirectUrl = getPlatformRedirectUri();
      
      // Safety check to ensure we always have a valid redirect URL
      if (!redirectUrl) {
        throw new Error('Failed to create a valid redirect URL');
      }
      
      console.log('Using redirect URL:', redirectUrl);
      
      // Start the authentication process by calling `startSSOFlow()`
      const { createdSessionId, setActive, signIn, signUp } =
        await startSSOFlow({
          strategy,
          redirectUrl,
        });

      console.log('SSO flow result:', JSON.stringify({ 
        createdSessionId, 
        hasSignIn: !!signIn, 
        hasSignUp: !!signUp 
      }, null, 2));

      // If sign in was successful, set the active session
      if (createdSessionId) {
        console.log('Setting active session with ID:', createdSessionId);
        await setActive!({ session: createdSessionId });
        
        console.log('Session activated, redirecting to root');
        // Force navigation to root to ensure proper redirection
        router.replace('/');
      } else if (signIn) {
        console.log('Sign in requires additional steps');
        // Handle multi-factor auth if needed
        if (signIn.status === 'needs_second_factor') {
          Alert.alert(
            "Two-Factor Authentication Required", 
            "Please complete the second factor authentication."
          );
        } else {
          console.log('Other sign in status:', signIn.status);
        }
      } else if (signUp) {
        console.log('User needs to complete sign up');
        // Handle completing the sign up flow
        if (signUp.status === 'missing_requirements') {
          Alert.alert(
            "Sign Up Incomplete", 
            "Please complete your sign up information."
          );
        } else {
          console.log('Other sign up status:', signUp.status);
        }
      } else {
        console.log('No session ID created, may need additional steps');
        Alert.alert(
          "Authentication Issue",
          "There was a problem with the authentication. Please try again."
        );
      }
    } catch (err) {
      console.error('SSO error:', JSON.stringify(err, null, 2));
      Alert.alert(
        "Authentication Error",
        "Could not authenticate with the provider. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [strategy]);

  return (
    <Pressable 
      onPress={onPress} 
      disabled={loading}
      className="flex w-11 h-11 p-0 justify-center items-center aspect-square rounded-full border border-[#DDD]"
    >
        <Image
          source={strategyIcons[strategy]}
          className="w-4 h-4 flex-shrink-0 aspect-square"
        />
    </Pressable>
  );
}
