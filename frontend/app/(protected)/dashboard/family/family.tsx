import { View, Text, Pressable, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useRef } from 'react';
import AddFamily from './add_family';

// Define the FamilyMember type
interface FamilyMember {
  name: string;
  age: number;
  status: string;
  isStarred?: boolean;
}

// Define the Family type
interface Family {
  id: string;
  name: string;
}

export default function Family() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Family 1');
  const [modalVisible, setModalVisible] = useState(false);
  
  // Available families 
  const [availableFamilies, setAvailableFamilies] = useState<Family[]>([
    { id: '1', name: 'Family 1' },
    { id: '2', name: 'Family 2' },
  ]);

  const familyMembers: FamilyMember[] = [
    { name: 'Grandpa', age: 79, status: 'Currently alive and healthy' },
    { name: 'Grandma', age: 75, status: 'Currently alive and healthy' },
    { name: 'Mom', age: 49, status: 'Currently alive and healthy' },
    { name: 'Dad', age: 49, status: 'Currently alive and healthy' },
    { name: 'Sister', age: 19, status: 'Currently alive and healthy', isStarred: true },
  ];
  
  const handleMemberPress = (member: FamilyMember) => {
    router.push({
      pathname: '/(protected)/dashboard/mydashboard/member-dashboard',
      params: { 
        name: member.name, 
        age: member.age.toString(),
        status: member.status
      }
    });
  };

  // Function to add a new family
  const handleAddFamily = (familyName: string) => {
    // Generate a new id
    const newId = (availableFamilies.length + 1).toString();
    
    // Create the new family
    const newFamily = {
      id: newId,
      name: familyName
    };
    
    // Add to families array
    const updatedFamilies = [...availableFamilies, newFamily];
    setAvailableFamilies(updatedFamilies);
    
    // Automatically switch to the new family tab
    setActiveTab(newFamily.name);
    
    // Close modal
    setModalVisible(false);
    
    // Show success message
    Alert.alert('Success', `Family "${newFamily.name}" has been created`);
  };

  return (
    <View className="flex-1">
      <ScrollView className="flex-1">
        {/* You Member Section */}
        <View className="px-4 mt-4">
          <View className="flex-row items-center bg-white p-4 rounded-lg">
            {/* Profile Icon */}
            <View className="w-12 h-12 bg-gray-300 rounded-full items-center justify-center mr-4">
              <MaterialIcons name="person" size={24} color="white" />
            </View>

            {/* Member Info */}
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-800">You</Text>
              <Text className="text-xs text-gray-500">Currently alive and healthy</Text>
            </View>

            {/* Age */}
            <Text className="text-sm font-medium text-gray-800">22</Text>
          </View>
        </View>

        {/* Family Management Header */}
        <View className="px-4 mt-4">
          <View className="flex-row justify-between items-center">
            <Text className="text-sm font-medium text-gray-800">{availableFamilies.length} {availableFamilies.length === 1 ? 'Family' : 'Families'}</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
            >
              {availableFamilies.map((family) => (
                <Pressable 
                  key={family.id}
                  className="px-4 py-2 active:opacity-80 relative"
                  onPress={() => setActiveTab(family.name)}
                >
                  <Text 
                    className={`text-sm font-medium ${activeTab === family.name ? 'text-[#1A0933]' : 'text-gray-500'}`}
                  >
                    {family.name}
                  </Text>
                  {activeTab === family.name && (
                    <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1A0933]" />
                  )}
                </Pressable>
              ))}
              <Pressable 
                className="px-3 py-2 active:opacity-70"
                onPress={() => setModalVisible(true)}
              >
                <Text className="text-sm text-blue-500">Add</Text>
              </Pressable>
            </ScrollView>
          </View>

          {/* Family Members */}
          <View className="mt-4 mb-6">
            {familyMembers.map((member, index) => (
              <Pressable
                key={index}
                className="mb-4 active:opacity-90 active:scale-[0.99]"
                android_ripple={{ color: 'rgba(0, 0, 0, 0.05)' }}
                onPress={() => handleMemberPress(member)}
              >
                <View className="flex-row items-center bg-white p-4 rounded-lg shadow-sm">
                  {/* Profile Icon */}
                  <View className="w-12 h-12 bg-gray-300 rounded-full items-center justify-center mr-4">
                    <MaterialIcons name="person" size={24} color="white" />
                  </View>

                  {/* Member Info */}
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-800">{member.name}</Text>
                    <Text className="text-xs text-gray-500">{member.status}</Text>
                  </View>

                  {/* Age and Star */}
                  <View className="flex-row items-center">
                    <Text className="text-sm font-medium text-gray-800 mr-2">{member.age}</Text>
                    {member.isStarred && (
                      <MaterialIcons name="star" size={20} color="black" />
                    )}
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Add Family Modal Component */}
      <AddFamily
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAddFamily={handleAddFamily}
      />
    </View>
  );
}