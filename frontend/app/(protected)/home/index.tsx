import { View, Text, Image, Button } from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { user } = useUser();
  const router = useRouter();

  const navigateToLocation = () => {
    router.push('/location');
  };
  const { signOut } = useAuth();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 15,
      }}
    >
      <Image
        source={{ uri: user?.imageUrl }}
        style={{ height: 100, aspectRatio: 1, borderRadius: 100 }}
      />
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
        Hey {user?.firstName} 🐻
      </Text>

      <Text style={{ fontSize: 16 }}>Only authenticated Care Bear users can see this 😛</Text>
      <Button title='Go to Location' onPress={navigateToLocation} />
      <Button title='Sign out' onPress={() => signOut()} />
    </View>
  );
}