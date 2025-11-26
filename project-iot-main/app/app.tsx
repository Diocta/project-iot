import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import RootLayout from './_layout';

SplashScreen.preventAutoHideAsync();

export default function App() {
  // If you don't have the SpaceMono font file in `assets/fonts`, skip loading it.
  // Using an empty object makes `useFonts` resolve immediately on Expo.
  const [fontsLoaded, fontError] = useFonts({});

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return <RootLayout />;
}
