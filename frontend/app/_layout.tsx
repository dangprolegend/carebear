import '~/global.css';
import {Slot, router} from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import { Theme, ThemeProvider, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import {useEffect} from 'react';
import {useFonts} from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Platform } from 'react-native';
import { NAV_THEME } from '~/lib/constants';
import { useColorScheme } from '~/lib/useColorScheme';
import { ClerkProvider, SignedIn, SignedOut, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

console.log('Initializing root layout');
console.log('Platform:', Platform.OS);

// Handle authentication sessions 
const maybeCompleteAuthSessionWithLogging = () => {
  try {
    console.log('Attempting to complete any pending auth sessions');
    const result = WebBrowser.maybeCompleteAuthSession();
    console.log('Auth session completion result:', result);
    return result;
  } catch (error) {
    console.error('Error completing auth session:', error);
  }
};

// Complete authentication sessions
maybeCompleteAuthSessionWithLogging();

SplashScreen.preventAutoHideAsync(); 
// prevent FOUT: If the splash screen hides before your custom fonts (Lato, Montserrat Alternates) are fully loaded by useFonts, any text that's supposed to use those fonts will initially render using a default system font. Then, once your custom fonts do load a moment later, the text will suddenly switch or "flash" to the correct font. This looks jarring and unprofessional.

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

export {
ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  console.log('Rendering RootLayout');
  
  const [fontsLoaded, fontError] = useFonts({
    'Lato-Regular': require('../assets/fonts/Lato/Lato-Regular.ttf'),
    'Lato-Light': require('../assets/fonts/Lato/Lato-Light.ttf'),
    'Lato-Black': require('../assets/fonts/Lato/Lato-Black.ttf'),
    'MontserratAlternates-Black': require('../assets/fonts/Montserrat_Alternates/MontserratAlternates-Black.ttf'), // Use the directory name shown
  })
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  const { colorScheme, isDarkColorScheme } = useColorScheme();
  
  // Set up deep link handling
  useEffect(() => {
    if (Platform.OS === 'android') {
      const subscription = Linking.addEventListener('url', (event) => {
        console.log('Deep link received in RootLayout:', event.url);
      });
      
      return () => subscription.remove();
    }
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') {
      document.documentElement.classList.add('bg-background');
    }
  }, []);

  if (!fontsLoaded && !fontError) { //prevent rendering until fonts are loaded
    return null
  }

  if (fontError) {
    console.error("Font loading error:", fontError);
  }

  return (
    <ClerkProvider tokenCache={tokenCache}>
      <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
        <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />
        <GestureHandlerRootView style={{flex: 1}}>
          <SafeAreaView style={{flex: 1}} edges={['top', 'left', 'right']}>
            <Slot />
          </SafeAreaView>
        </GestureHandlerRootView>
      </ThemeProvider>
    </ClerkProvider>
  );
}


