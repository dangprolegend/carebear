import { router } from 'expo-router';
import React from 'react';
import Congrats from '../../../assets/images/Content container copy 2.png';
import { View, Text, TouchableOpacity, Image } from 'react-native';

export default function CompleteScreen() {

  return (
    <View className="flex-1 items-center justify-center mt-[-100px]">
      <Image
          source={Congrats}
          className="h-[500px] w-[400px] self-stretch]"
          resizeMode="contain"
        />

      <View className="flex flex-row justify-between items-start self-stretch mt-[56px]">
          <TouchableOpacity 
            onPress={() => router.push('/setup/join-family')}
            className="flex min-w-[160px] py-4 px-8 justify-center items-center gap-1 rounded-full border border-black"
          >
          <Text className='text-[#0F172A] font-lato text-[16px] font-extrabold leading-6 tracking-[-0.1px]'>
            Back
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-[#2A1800] inline-flex min-w-[160px] py-4 px-8 justify-center items-center gap-1 rounded-full"
          onPress={() => router.push('../dashboard/family/family')}
        >
          <Text className="text-white text-center font-lato text-[16px] font-extrabold leading-[24px] tracking-[0.3px]">Your Group</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
