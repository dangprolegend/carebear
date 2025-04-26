import '~/global.css';
import {Slot} from 'expo-router';
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
    <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
      <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />
      <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaView style={{flex: 1}} edges={['top', 'left', 'right']}>
        <Slot />
      </SafeAreaView>
    </GestureHandlerRootView>
    </ThemeProvider>
  );
}

