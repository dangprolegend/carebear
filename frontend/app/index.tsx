import { View, Text, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import Welcome from '../assets/images/welcome.png';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function WelcomeScreen() {
  const { isSignedIn, userId } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
        const checkUserGroup = async () => {
      if (isSignedIn && userId) {
        setIsLoading(true);
        try {
          // Step 1: Fetch userID using clerkID
          const userResponse = await axios.get(`https://carebear-backend.onrender.com/api/users/clerk/${userId}`);
          const userID = userResponse.data.userID;

          // Step 2: Get the user's groupID
          const groupResponse = await axios.get(`https://carebear-backend.onrender.com/api/users/${userID}/group`);
          const { groupID } = groupResponse.data;

          // Step 3: Redirect based on groupID status
          if (groupID) {
            // User has a group, redirect to family
            router.push('/(protected)/dashboard/family/family');
          } else {
            // User has no group, redirect to setup
            router.push('/(protected)/setup/health-input');
          }
        } catch (error) {
          console.error('Error checking user group:', error);
          // If there's an error, default to setup
          router.push('/(protected)/setup/health-input');
        } finally {
          setIsLoading(false);
        }
      }
    };

    checkUserGroup();
  }, [isSignedIn, userId, router]);

  // Show loading state while checking user status
  if (isLoading || isSignedIn) {
    return (
      <SafeAreaView>
        <View className="items-center justify-center h-screen bg-white">
          <Text className="text-black font-lato text-lg">Loading...</Text>
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
          onPress={() => router.push('/(auth)/sign-in')}
        >
          <Text className="text-white text-center font-lato text-[16px] font-extrabold leading-[24px] tracking-[0.3px]">Let's Start</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
