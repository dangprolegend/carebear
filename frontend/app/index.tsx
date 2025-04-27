import { View, Text, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

export default function WelcomeScreen() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  return (
    <View className="flex-1 justify-center items-center p-5 bg-white">
      <Text className="text-4xl font-bold mb-10 text-center">Welcome to Care Bear! 🐻</Text>
      <TouchableOpacity
        className="bg-[#0a7ea4] py-4 px-8 rounded-full mb-4 w-4/5 items-center"
        onPress={() => router.push('/(auth)/sign-in')}
      >
        <Text className="text-white text-lg font-semibold">Go to sign in</Text>
      </TouchableOpacity>
      {isSignedIn && (
        <TouchableOpacity
          className="bg-[#0a7ea4] py-4 px-8 rounded-full w-4/5 items-center"
          onPress={() => router.push('/(protected)/setup' as any)}
        >
          <Text className="text-white text-lg font-semibold">Go to protected screens</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
