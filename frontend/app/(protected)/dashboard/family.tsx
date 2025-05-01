import { View, Text, Pressable, Image, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function Family() {
  const familyMembers = [
    { name: 'Grandpa', age: 79, status: 'Currently alive and healthy' },
    { name: 'Grandma', age: 75, status: 'Currently alive and healthy' },
    { name: 'Mom', age: 49, status: 'Currently alive and healthy' },
    { name: 'Dad', age: 49, status: 'Currently alive and healthy' },
    { name: 'Sister', age: 19, status: 'Currently alive and healthy', isStarred: true },
  ];

  return (
    <ScrollView className="flex-1 bg-white">
      {/* You Member Section */}
      <View className="px-4 mt-4">
        <View className="flex-row items-center bg-gray-100 p-4 rounded-lg">
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

      {/* Family Group Section */}
      <View className="px-4 mt-4">
        <View className="flex-row justify-between items-center">
          <Text className="text-sm font-medium text-gray-800">1 Family</Text>
          <Pressable>
            <Text className="text-sm text-blue-500">Add Family</Text>
          </Pressable>
        </View>

        {/* Tabs */}
        <View className="flex-row justify-center mt-4">
          <Pressable className="border-b-2 border-black px-4 py-2">
            <Text className="text-sm font-medium text-black">Family 1</Text>
          </Pressable>
        </View>

        {/* Family Members */}
        <View className="mt-4">
          {familyMembers.map((member, index) => (
            <View
              key={index}
              className="flex-row items-center bg-gray-100 p-4 rounded-lg mb-4"
            >
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
          ))}
        </View>
      </View>
    </ScrollView>
  );
}