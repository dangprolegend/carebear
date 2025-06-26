import { View, Text, TouchableOpacity, Image, SafeAreaView, Platform, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import Welcome from '../assets/images/welcome.png';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { setupAndroidAuthHelpers } from '../utils/androidAuthHelpers';

export default function WelcomeScreen() {
  const { isSignedIn, userId, isLoaded } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Set up Android-specific auth helpers
  useEffect(() => {
    if (Platform.OS === 'android') {
      console.log('Welcome screen: Setting up Android auth helpers');
      return setupAndroidAuthHelpers();
    }
  }, []);

  useEffect(() => {
    console.log('Welcome screen - Platform:', Platform.OS, 'isSignedIn:', isSignedIn, 'isLoaded:', isLoaded, 'userId:', userId);
    
    const checkUserGroup = async () => {
      // Only proceed if auth is loaded and user is signed in
      if (isLoaded && isSignedIn && userId) {
        console.log('User is signed in with ID:', userId, 'checking group status');
        setIsLoading(true);
        setError(null);
        
        try {
          // Step 1: Fetch userID using clerkID
          console.log('Fetching userID for clerkID:', userId);
          const userResponse = await axios.get(`https://carebear-backend.onrender.com/api/users/clerk/${userId}`);
          const userID = userResponse.data.userID;
          console.log('Received userID:', userID);

          // Step 2: Get the user's groupID
          console.log('Fetching groupID for userID:', userID);
          const groupResponse = await axios.get(`https://carebear-backend.onrender.com/api/users/${userID}/group`);
          const { groupID } = groupResponse.data;
          console.log('Received groupID:', groupID);

          // Step 3: Redirect based on groupID status
          if (groupID) {
            // User has a group, redirect to family
            console.log('User has a group, redirecting to family screen');
            router.replace('/(protected)/dashboard/family/family');
          } else {
            // User has no group, redirect to setup
            console.log('User has no group, redirecting to setup screen');
            router.replace('/(protected)/setup/health-input');
          }
        } catch (error: any) {
          console.error('Error checking user group:', error);
          setError(error?.message || 'Failed to check user group status');
          
          // If there's an error, default to setup
          console.log('Error occurred, defaulting to setup screen');
          
          // Small delay to ensure error message is visible
          setTimeout(() => {
            router.replace('/(protected)/setup/health-input');
          }, 2000);
        } finally {
          setIsLoading(false);
        }
      } else if (isLoaded && !isSignedIn) {
        console.log('User is not signed in, staying on welcome screen');
        setIsLoading(false);
      }
    };

    checkUserGroup();
  }, [isLoaded, isSignedIn, userId, router]);

  // Show loading state while checking user status or while Clerk is loading
  if (!isLoaded || (isLoaded && isSignedIn) || isLoading) {
    console.log('Showing loading state');
    return (
      <SafeAreaView>
        <View className="items-center justify-center h-screen bg-white">
          <ActivityIndicator size="large" color="#0F172A" />
          <Text className="text-black font-lato text-lg mt-4">
            {error ? `Error: ${error}` : 'Loading...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView>
      <View className="items-center justify-center h-screen bg-white">
        <View className='flex flex-col items-center gap-20 w-[246px]'>
          <Text className='font-montserrat-alt-black text-black text-center text-[40px] font-extrabold leading-[40px] tracking-[1.16px]'>
            CareBear
          </Text>
          <Image source={Welcome} className="h-[269px] self-stretch aspect-[246/269]"/>

          <Text className="text-black text-center font-lato-black text-[16px] font-extrabold leading-[24px] tracking-[0.3px]">
            For you and the ones you love
        </Text>
        </View>
        <TouchableOpacity
          className="bg-[#0F172A] inline-flex min-w-[80px] py-4 px-8 justify-center items-center gap-1 rounded-full mt-[68px]"
          onPress={() => router.replace('/(auth)/sign-in')}
        >
          <Text className="text-white text-center font-lato text-[16px] font-extrabold leading-[24px] tracking-[0.3px]">Let's Start</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
