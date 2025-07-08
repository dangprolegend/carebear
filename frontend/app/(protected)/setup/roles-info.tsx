import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import BabyBear from '../../../assets/icons/babybear.png';
import CareBear from '../../../assets/icons/carebear.png';
import BearBoss from '../../../assets/icons/bearboss.png';

export default function RolesInfo() {
  const router = useRouter();

  const handleNext = () => {
    // Navigate to the next setup step
    router.push('/(protected)/setup/congrats');
  };

  const handleBack = () => {
    router.push('/(protected)/setup/join-family');
  };

  return (
    <SafeAreaView className="flex-1 mt-[-30px]">
      <View className="flex-1 px-8 py-3">

        {/* Title */}
        <Text className="text-[#2A1800] font-lato text-[28px] font-extrabold leading-9 text-center mb-4">
          The Roles
        </Text>

        {/* Subtitle */}
        <Text className="text-[#2A1800] font-lato text-[16px] font-normal leading-6 text-center mb-2">
          Before joining or creating a <Text className="font-semibold">Family Group</Text>, here's what each role means:
        </Text>

        {/* Roles Container */}
        <View className="flex-1 justify-center">
          {/* BabyBear Role */}
          <View className="flex-row items-center mb-20">
            <View className="w-20 h-20 items-center justify-center mr-[55px]">
              <Image source={BabyBear} className="w-40 h-40" resizeMode="contain" />
            </View>
            <View className="flex-1">
              <Text className="text-[#2A1800] font-lato text-[20px] font-bold leading-6 mb-2">
            BabyBear
              </Text>
              <Text className="text-[#2A1800] font-lato text-[14px] font-normal leading-5">
            Manage their own tasks and receive tasks from CareBear. Cannot edit tasks assigned by others.
              </Text>
            </View>
          </View>

          {/* CareBear Role */}
          <View className="flex-row items-center mb-20">
            <View className="w-20 h-20 items-center justify-center mr-[55px]">
              <Image source={CareBear} className="w-40 h-40" resizeMode="contain" />
            </View>
            <View className="flex-1">
              <Text className="text-[#2A1800] font-lato text-[20px] font-bold leading-6 mb-2">
            CareBear
              </Text>
              <Text className="text-[#2A1800] font-lato text-[14px] font-normal leading-5">
            Can assign tasks to self and to BabyBears. Can edit their own assigned tasks and receive tasks.
              </Text>
            </View>
          </View>

          {/* BearBoss Role */}
          <View className="flex-row items-center">
            <View className="w-20 h-20 items-center justify-center mr-[55px]">
              <Image source={BearBoss} className="w-40 h-40" resizeMode="contain" />
            </View>
            <View className="flex-1">
              <Text className="text-[#2A1800] font-lato text-[20px] font-bold leading-6 mb-2">
            BearBoss
              </Text>
              <Text className="text-[#2A1800] font-lato text-[14px] font-normal leading-5">
            Group admin. Can be both CareBear and BabyBear. Can add or remove members.
              </Text>
            </View>
          </View>
        </View>

        {/* Navigation Buttons */}
        <View className="flex-row gap-12 mt-12">
          <TouchableOpacity
            className="flex-1 py-4 px-3 bg-white border-2 border-[#2A1800] rounded-full items-center justify-center"
            onPress={handleBack}
          >
            <Text className="text-[#2A1800] font-lato text-[16px] font-semibold">Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 py-4 px-3 bg-[#2A1800] rounded-full items-center justify-center"
            onPress={handleNext}
          >
            <Text className="text-white font-lato text-[16px] font-semibold">Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
