import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-expo';

type NumberOption = { value: string; label: string };

export default function CreateFamilyGroupScreen() {
  const { userId } = useAuth();
  const [groupName, setGroupName] = useState<string>('');
  const handleCreate = async () => {
    try {
      if (!userId) {
        alert('User is not authenticated.');
        return;
      }

      // Step 1: Fetch userID using clerkID
      const userResponse = await axios.get(`https://carebear-carebearvtmps-projects.vercel.app/api/users/clerk/${userId}`);
      const userID = userResponse.data.userID;
      console.log('Fetching userID for clerkID:', userID);
      

      // Step 2: Create the family group
      const data = { name: groupName };

      await axios.post(`https://carebear-carebearvtmps-projects.vercel.app/api/users/${userID}/createGroup`, data);
      router.push('/setup/roles-info');
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group');
    }
  }

  return (
    <View>
      <Text className="mb-8 text-3xl font-bold text-foreground">
        Create Family Group
      </Text>

      <View className="mb-6">
        <Label nativeID="groupNameLabel" className="mb-2 text-lg font-medium">
          Group Name
        </Label>
        <Input
          nativeID="groupNameLabel"
          placeholder="Group name"
          value={groupName}
          onChangeText={setGroupName}
          autoCapitalize="words"
          className="p-3" 
        />
      </View>

      <View className="flex flex-row justify-between items-start self-stretch mt-[286px]">
          <TouchableOpacity 
            onPress={() => router.push('/setup/join-family')}
            className="flex min-w-[80px] py-4 px-8 justify-center items-center gap-1 rounded-full border border-black"
          >
          <Text className='text-[#0F172A] font-lato text-[16px] font-extrabold leading-6 tracking-[-0.1px]'>
            Back
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-[#2A1800] inline-flex min-w-[80px] py-4 px-8 justify-center items-center gap-1 rounded-full"
          onPress={handleCreate}
        >
          <Text className="text-white text-center font-lato text-[16px] font-extrabold leading-[24px] tracking-[0.3px]">Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
