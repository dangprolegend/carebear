import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';

type NumberOption = { value: string; label: string };

export default function CreateFamilyGroupScreen() {
  const [groupName, setGroupName] = useState<string>('');
  const [numMembers, setNumMembers] = useState<NumberOption | null>(null);

  const memberOptions: NumberOption[] = Array.from({ length: 10 }, (_, i) => ({
    value: (i + 1).toString(), // Value as string
    label: (i + 1).toString(), // Label as string
  }));


  // TODO: Add state management logic if needed to pass data
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
      <View className="mb-6">
        <Label nativeID="numMembersLabel" className="mb-2 text-lg font-medium">
          Number of Members
        </Label>
        <Select
          value={numMembers || { value: '', label: 'Select...' }} 
          onValueChange={(option: any) => {
            if (option && typeof option.value === 'string' && typeof option.label === 'string') {
              setNumMembers({ value: option.value, label: option.label });
            }
          }}
        >
          <SelectTrigger nativeID="numMembersLabel">
            <SelectValue
              placeholder="Select..."
              className="text-gray-500" 
            />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {memberOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} label={option.label} />
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </View>

      <View className="flex flex-row justify-between items-start self-stretch mt-[286px]">
          <TouchableOpacity 
            onPress={() => router.push('/setup/join-family')}
            className="flex min-w-[80px] py-4 px-8 justify-center items-center gap-1 rounded-full border border-[#DDD]"
          >
          <Text className='text-[#0F172A] font-lato text-[16px] font-extrabold leading-6 tracking-[-0.1px]'>
            Back
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-[#0F172A] inline-flex min-w-[80px] py-4 px-8 justify-center items-center gap-1 rounded-full"
          onPress={() => router.push('/setup/congrats')}
        >
          <Text className="text-white text-center font-lato text-[16px] font-extrabold leading-[24px] tracking-[0.3px]">Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
