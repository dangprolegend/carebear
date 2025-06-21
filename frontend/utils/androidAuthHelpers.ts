// androidAuthHelpers.ts
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

/**
 * Sets up deep linking handlers for Android OAuth redirects
 * This helps with the authentication flow on Android devices
 */
export const setupAndroidAuthHelpers = () => {
  if (Platform.OS !== 'android') return;

  console.log('Setting up Android deep linking handlers');
  
  // Listen for deep linking events
  const subscription = Linking.addEventListener('url', handleRedirect);
  
  // Also attempt to complete any pending auth sessions
  WebBrowser.maybeCompleteAuthSession();
  
  return () => {
    // Clean up listener when no longer needed
    subscription.remove();
  };
};

/**
 * Handles OAuth redirects from external browsers on Android
 */
const handleRedirect = (event: { url: string }) => {
  console.log('Deep link detected:', event.url);
  
  // If this is an OAuth callback URL, process it
  if (event.url.includes('oauth-native-callback')) {
    console.log('Processing OAuth callback URL:', event.url);
    
    try {
      // Parse the URL to extract auth params if needed
      const { queryParams } = Linking.parse(event.url);
      console.log('Parsed URL params:', queryParams);
      
      // Instead of dismissing browser (which doesn't work on Android),
      // we rely on WebBrowser.maybeCompleteAuthSession() called during app init
      
    } catch (error) {
      console.error('Error handling redirect:', error);
    }
  }
};

/**
 * Create a proper redirect URL for Android OAuth
 */
export const getAndroidRedirectUri = (): string => {
  if (Platform.OS !== 'android') return 'myapp://oauth-native-callback';
  
  // Get app scheme from Expo config
  // This should match the scheme in app.json
  const scheme = 'myapp';
  
  // Use AuthSession to create a standard redirect URI
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: scheme,
    path: 'oauth-native-callback',
    preferLocalhost: false,
  });
  
  console.log('Created Android redirect URI:', redirectUri);
  return redirectUri;
};

/**
 * Returns the appropriate redirect URI based on platform
 */
export const getPlatformRedirectUri = (): string => {
  if (Platform.OS === 'android') {
    const androidUri = getAndroidRedirectUri();
    return androidUri || 'myapp://oauth-native-callback';
  }
  
  // For iOS and web, use the standard AuthSession redirect URI
  const scheme = 'myapp';
  return AuthSession.makeRedirectUri({
    scheme: scheme,
    path: 'oauth-native-callback',
  });
};
