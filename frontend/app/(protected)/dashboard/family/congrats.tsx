import { router } from 'expo-router';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Congrats from '../../../../assets/images/Content container copy 2.png';


export default function CompleteScreen() {

  return (
    <View className="flex-1 bg-[#FAE5CA] items-center justify-center">
     <Image
          source={Congrats}
          className="h-[500px] w-[400px] self-stretch]"
          resizeMode="contain"
        />

        <TouchableOpacity
          className="bg-[#2A1800] inline-flex min-w-[80px] py-4 px-8 justify-center items-center gap-1 rounded-full mt-14"
          onPress={() => router.push('/(protected)/dashboard/family/family')}
        >
          <Text className="text-white text-center font-lato text-[16px] font-extrabold leading-[24px] tracking-[0.3px]">Go to your group</Text>
        </TouchableOpacity>
      </View>
  );
}
