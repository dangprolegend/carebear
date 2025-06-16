//@ts-nocheck
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
      const userResponse = await axios.get(`https://carebear-backend.onrender.com/api/users/clerk/${userId}`);
      const userID = userResponse.data.userID;
      console.log('Fetching userID for clerkID:', userID);
      const data = { name: groupName };
      await axios.post(`https://carebear-backend.onrender.com/api/users/${userID}/createGroup`, data);
      router.push('/(protected)/dashboard/family/congrats');
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group');
    }
  }

  return (
    <View className="flex-1 px-6 py-8 justify-between">
      <View className="max-w-sm mx-auto w-full">
        <Text className="mb-8 text-3xl font-bold text-foreground">
          Create a New Family Group
        </Text>
        
        <View className="mb-6">
          <Label nativeID="groupNameLabel" className="mb-2 text-lg font-medium">
            Group Name
          </Label>
          <Input
            nativeID="groupNameLabel"
            placeholder="CareBear Family"
            value={groupName}
            onChangeText={setGroupName}
            autoCapitalize="words"
            className="p-3"
          />
        </View>
      </View>

      <View className="flex flex-col items-center space-y-4 mb-8 gap-4">
        <TouchableOpacity
          className="bg-[#2A1800] py-4 px-12 justify-center items-center rounded-full"
          onPress={handleCreate}
        >
          <Text className="text-white text-center font-lato text-[16px] font-extrabold leading-[24px] tracking-[0.3px]">
            Create Group
          </Text>
        </TouchableOpacity>
        
        <Text className="text-center text-gray-600 text-sm px-4">
          or join a family group if you have the group ID
        </Text>
        
        <TouchableOpacity
          onPress={() => router.push('/(protected)/dashboard/family/join-family')}
          className="py-4 px-12 justify-center items-center rounded-full border border-[#DDD]"
        >
          <Text className='text-[#0F172A] font-lato text-[16px] font-extrabold leading-6 tracking-[-0.1px]'>
            Join
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
