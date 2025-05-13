import { View, Text, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import Welcome from '../assets/images/welcome.png';
import { useEffect } from 'react';

export default function WelcomeScreen() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.push('/(protected)/dashboard/mydashboard/dashboard'); // Redirect to the home page if signed in
    }
  }, [isSignedIn, router]);

  if (isSignedIn) {
    return null; // Prevent rendering the rest of the component while redirecting
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
