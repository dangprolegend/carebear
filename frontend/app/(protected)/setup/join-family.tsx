import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
// Import custom UI components
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Button } from '~/components/ui/button';

export default function JoinFamilyScreen() {
  const router = useRouter();
  const [groupId, setGroupId] = useState<string>('');
  const handleJoin = () => {
    console.log("Attempting to join group:", groupId);
    // TODO: Add logic to validate groupId and attempt to join the group via API call.
    router.navigate('/setup/congrats');
  };
  return (
    <View className="flex-1 flex-col">
      {/* Form title */}
      <Text className="mb-8 text-3xl font-bold text-foreground">
        Join your Family Group
      </Text>

      {/* Group ID field */}
      <View className="mb-1">
        <Label nativeID="groupIdLabel" className="mb-2 text-lg font-medium">
          Enter your Group ID
        </Label>
        <Input
          nativeID="groupIdLabel"
          placeholder="Family Group ID (Ex: UMH293)"
          value={groupId}
          onChangeText={setGroupId}
          autoCapitalize="characters" 
          className="p-3"
        />
      </View>
      {/* Description Text */}
      <Text className="mb-10 px-1 text-sm text-muted-foreground">
        Provided by your group admin/creator
      </Text>

      {/* Join Button */}
      <View className="items-center mb-10">
        <Button
          variant="default"
          size="lg"
          onPress={handleJoin}
          className="rounded-full bg-foreground px-10 py-3 w-48" 
        >
          <Text className="text-primary-foreground">Join</Text>
        </Button>
      </View>

      
      
    </View>
  );
}
