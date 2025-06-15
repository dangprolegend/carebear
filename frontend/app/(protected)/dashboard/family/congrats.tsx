import { router } from 'expo-router';
import { View, Text, TouchableOpacity, Image } from 'react-native';

export default function CompleteScreen() {

  return (
    <View className="flex-1 items-center justify-center">
      <Text className="mb-6 text-3xl font-bold text-foreground text-center">
        Congrats!
      </Text>
      <View className="w-48 h-64 bg-black-500 rounded-lg mb-6 items-center justify-center mt-4">
        <Image
          source={require('../../../../assets/images/Bear Illustration.png')}
          style={{ width: 280, height: 320, borderRadius: 12 }}
          resizeMode="contain"
        />
      </View>
     
     <View className="w-[280px] items-center mt-4">
        <Text className="text-[#000] text-center font-lato text-[16px] font-normal leading-[24px] tracking-[0.3px]">
            Go to your <Text className="font-extrabold">Family Group</Text> to set up each member’s information, send invitations, create, and assign tasks.
        </Text>
    </View>

        <TouchableOpacity
          className="bg-[#2A1800] inline-flex min-w-[80px] py-4 px-8 justify-center items-center gap-1 rounded-full mt-14"
          onPress={() => router.push('/(protected)/dashboard/family/family')}
        >
          <Text className="text-white text-center font-lato text-[16px] font-extrabold leading-[24px] tracking-[0.3px]">Go to your group</Text>
        </TouchableOpacity>
      </View>
  );
}
