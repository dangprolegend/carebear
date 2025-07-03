//@ts-nocheck
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
      const userResponse = await axios.get(`https://carebear-4ju68wsmg-carebearvtmps-projects.vercel.app/api/users/clerk/${userId}`);
      const userID = userResponse.data.userID;
      console.log('Fetching userID for clerkID:', userID);
      // Step 2: Join group with provided group ID
      const updateData = { groupID: groupId };
      await axios.patch(`https://carebear-4ju68wsmg-carebearvtmps-projects.vercel.app/api/users/${userID}/joinGroup`, updateData);
      router.push('/(protected)/dashboard/family/congrats');
    } catch (error) {
      console.error('Error joining group:', error);
      alert('Failed to join group');
    }
  };

  return (
    <View className="flex-1 px-6 py-8 justify-between">
      <View className="max-w-sm mx-auto w-full">
        {/* Form title */}
        <Text className="mb-8 text-3xl font-bold text-foreground">
          Join a New Family Group
        </Text>
        {/* Group ID field */}
        <View className="mb-1">
          <Label nativeID="groupIdLabel" className="mb-2 text-lg font-medium">
            Enter your Group ID
          </Label>
          <Input
            nativeID="groupIdLabel"
            placeholder="6822b15e361a47ff8892c71a"
            value={groupId}
            onChangeText={setGroupId}
            autoCapitalize="characters"
            className="p-3"
          />
        </View>
        {/* Description Text */}
        <Text className="mb-10 px-1 text-sm text-muted-foreground">
          Provided by your BearBoss
        </Text>
      </View>

      <View className="flex flex-row justify-between items-center mb-16">
        <TouchableOpacity
          onPress={() => router.push('/(protected)/dashboard/family/create-family')}
          className="flex py-4 px-12 justify-center items-center rounded-full border border-[#DDD]"
        >
          <Text className='text-[#0F172A] font-lato text-[16px] font-extrabold leading-6 tracking-[-0.1px]'>
            Back
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-[#2A1800] flex py-4 px-12 justify-center items-center rounded-full"
          onPress={handleJoin}
        >
          <Text className="text-white text-center font-lato text-[16px] font-extrabold leading-[24px] tracking-[0.3px]">
            Join Group
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}