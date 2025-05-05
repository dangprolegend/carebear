import { View, Text } from 'react-native';

export default function SafeZone() {
  
  return (
    <View style={{ flex: 1 }}>
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-2xl font-bold text-foreground">Safe Zone</Text>
        <Text className="mt-4 text-lg text-gray-500">This screen will handle safe zone.</Text>
      </View>
    </View>
  );
}