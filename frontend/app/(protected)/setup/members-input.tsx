import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native'; 

const PlaceholderCheckbox = () => (
  <View className="h-6 w-6 border-2 border-muted-foreground rounded mr-3" />
);

export default function MembersInputScreen() {
  const router = useRouter();

  const numberOfMembers = 5; // will change this
  // TODO: get the actual number of members from 'create-family'

  const members = Array.from({ length: numberOfMembers }, (_, i) => `Member ${i + 1}`);

  const handleMemberPress = (memberIndex: number) => {
    console.log(`Navigate to edit details for Member ${memberIndex + 1}`);
  
  };


  return (
    <View>
      <Text className="mb-8 text-3xl font-bold text-foreground">
        Member Information
      </Text>

      <View className="space-y-4">
        {members.map((memberName, index) => (
          <Pressable
            key={index}
            onPress={() => handleMemberPress(index)}
            className="flex-row items-center justify-between p-4 border border-border rounded-lg bg-card" // Added some styling
          >
            <View className="flex-row items-center">
              <PlaceholderCheckbox />
              <Text className="text-lg text-card-foreground">{memberName}</Text>
            </View>
            <ChevronRight className="text-muted-foreground" size={20} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}
