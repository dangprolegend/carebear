import { router } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';

export default function CompleteScreen() {

  return (
    <View className="flex-1 items-center justify-center">
      <Text className="mb-6 text-3xl font-bold text-foreground text-center">
        Congrats!
      </Text>
      <View className="w-48 h-64 bg-black-500 rounded-lg mb-6 items-center justify-center">
        <Image
          source={require('../../../assets/images/Bear Illustration.png')}
          style={{ width: 280, height: 320, borderRadius: 12 }}
          resizeMode="contain"
        />
      </View>
      <Text className="text-lg text-foreground text-center">
        You joined successfully!
      </Text>

      <View className="flex flex-row justify-between items-start self-stretch mt-[56px]">
          <TouchableOpacity 
            onPress={() => router.push('/setup/join-family')}
            className="flex min-w-[80px] py-4 px-8 justify-center items-center gap-1 rounded-full border border-[#DDD]"
          >
          <Text className='text-[#0F172A] font-lato text-[16px] font-extrabold leading-6 tracking-[-0.1px]'>
            Back
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-[#0F172A] inline-flex min-w-[80px] py-4 px-8 justify-center items-center gap-1 rounded-full"
          onPress={() => router.push('../dashboard/family/family')}
        >
          <Text className="text-white text-center font-lato text-[16px] font-extrabold leading-[24px] tracking-[0.3px]">Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
