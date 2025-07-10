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
    router.push('/(protected)/setup/join-family');
  };

  const handleBack = () => {
    router.push('/(protected)/setup/health-input');
  };

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 items-center">
        {/* Title */}
        <Text className="text-[#2A1800] font-lato text-[28px] font-extrabold leading-9 text-center mb-6">
          The Roles
        </Text>

        {/* Subtitle */}
        <Text className="text-[#2A1800] font-lato text-[16px] font-normal leading-6 text-center mb-12">
          Before joining or creating a <Text className="font-semibold">Family Group</Text>, here's what each role means:
        </Text>

        {/* Roles Container */}
        <View className="items-center justify-center gap-[20px]">
          {/* BabyBear Role */}
          <View className="flex-row w-full gap-[24px]">
            <View className="items-center justify-center">
              <Image source={BabyBear} className="w-36 h-36" resizeMode="contain" />
            </View>
            <View className="flex-1">
              <Text className="text-[#2A1800] font-lato text-[14px] font-bold leading-6 mb-2 mt-2">
                BabyBear
              </Text>
              <Text className="text-[#2A1800] font-lato text-[14px] font-normal leading-6">
                Manage their own tasks and receive tasks from CareBear. Cannot edit tasks assigned by others.
              </Text>
            </View>
          </View>

          {/* CareBear Role */}
          <View className="flex-row w-full gap-[24px]">
            <View className=" items-center justify-center">
              <Image source={CareBear} className="w-36 h-36" resizeMode="contain" />
            </View>
            <View className="flex-1">
              <Text className="text-[#2A1800] font-lato text-[14px] font-bold leading-6 mb-2 mt-2">
                CareBear
              </Text>
              <Text className="text-[#2A1800] font-lato text-[14px] font-normal leading-6">
                Can assign tasks to self and to BabyBears. Can edit their own assigned tasks and receive tasks.
              </Text>
            </View>
          </View>

          {/* BearBoss Role */}
          <View className="flex-row w-full gap-[24px]">
            <View className=" justify-center items-center">
              <Image source={BearBoss} className="w-36 h-36" resizeMode="contain" />
            </View>
            <View className="flex-1">
              <Text className="text-[#2A1800] font-lato text-[14px] font-bold leading-6 mb-2 mt-2">
                BearBoss
              </Text>
              <Text className="text-[#2A1800] font-lato text-[14px] font-normal leading-6">
                Group admin. Can be both CareBear and BabyBear. Can add or remove members.
              </Text>
            </View>
          </View>
        </View>

        {/* Navigation Buttons */}
        <View className="flex-row items-center justify-between mt-[62px]">
          <TouchableOpacity
            className="flex-1 py-4 min-w-[160px] px-3 bg-white border border-black rounded-full items-center justify-center"
            onPress={handleBack}
          >
            <Text className="text-[#2A1800] font-lato text-[16px] font-semibold">Back</Text>
          </TouchableOpacity>

          <View style={{ width: 32 }} />

          <TouchableOpacity
            className="flex-1 py-4 min-w-[160px] px-3 bg-[#2A1800] rounded-full items-center justify-center"
            onPress={handleNext}
          >
            <Text className="text-white font-lato text-[16px] font-semibold">Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
