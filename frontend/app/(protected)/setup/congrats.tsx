import React from 'react';
import { View, Text } from 'react-native';

export default function CompleteScreen() {

  return (
    <View className="flex-1 items-center justify-center">
      <Text className="mb-6 text-4xl font-bold text-foreground text-center">
        Congrats!
      </Text>
      <View className="w-48 h-64 bg-black-500 rounded-lg mb-6 items-center justify-center">
        <Text className="">(Placeholder)</Text>
      </View>
      <Text className="text-lg text-foreground text-center">
        You joined successfully!
      </Text>
    </View>
  );
}
