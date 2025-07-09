import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
// Import custom UI components
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Button } from '~/components/ui/button';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-expo';

export default function JoinFamilyScreen() {
  const { userId } = useAuth();
  const router = useRouter();
  const [groupId, setGroupId] = useState<string>('');
  const handleJoin = async () => {
    try {
      if (!userId) {
        alert('User is not authenticated.');
        return;
      }

      // Step 1: Fetch userID using clerkID
      const userResponse = await axios.get(`https://carebear-carebearvtmps-projects.vercel.app/api/users/clerk/${userId}`);
      const userID = userResponse.data.userID;
      console.log('Fetching userID for clerkID:', userID);
      

      // Step 2: Join group with provided group ID
      const updateData = { groupID: groupId };

      await axios.patch(`https://carebear-carebearvtmps-projects.vercel.app/api/users/${userID}/joinGroup`, updateData);
      router.push('/setup/roles-info');
    } catch (error) {
      console.error('Error joining group:', error);
      alert('Failed to join group');
    }
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
          className="rounded-full bg-[#2A1800] px-10 py-3 w-48" 
        >
          <Text className="text-white text-center font-lato text-[16px] font-extrabold leading-[24px] tracking-[0.3px]">Join</Text>
        </Button>
      </View>

      <Text className="text-center text-black font-lato text-[16px] font-extrabold leading-[24px] tracking-[0.3px] mt-[172px]">
        No worries if you don't have a group yet!
      </Text>

      <View className="flex flex-row justify-between items-start self-stretch mt-[56px]">
          <TouchableOpacity 
            onPress={() => router.push('/setup/health-input')}
            className="flex min-w-[80px] py-4 px-8 justify-center items-center gap-1 rounded-full border border-black"
          >
          <Text className='text-[#0F172A] font-lato text-[16px] font-extrabold leading-6 tracking-[-0.1px]'>
            Back
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-[#2A1800] inline-flex min-w-[80px] py-4 px-8 justify-center items-center gap-1 rounded-full"
          onPress={() => router.push('/setup/create-family')}
        >
          <Text className="text-white text-center font-lato text-[16px] font-extrabold leading-[24px] tracking-[0.3px]">Create Group</Text>
        </TouchableOpacity>
      </View>
      
    </View>
  );
}
