// app/(protected)/home/index.tsx
import { View, Text } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
      <Text>Welcome to Care Bear!</Text>
    </View>
  );
}