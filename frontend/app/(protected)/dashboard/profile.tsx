import { View, Text, Pressable, Image, ScrollView } from 'react-native';

export default function Profile() {
  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header */}

      {/* Profile Section */}
      <View className="bg-gray-200 h-32" />
      <View className="px-4 -mt-12">
        <View className="bg-white p-4 rounded-lg shadow-md">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-lg font-bold text-gray-800">Your Name</Text>
              <Text className="text-sm text-gray-500">@account_name</Text>
              <Text className="text-sm text-gray-500">Family Group</Text>
            </View>
            <Pressable className="bg-blue-100 px-3 py-1 rounded-full">
              <Text className="text-sm text-blue-500">Edit</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Streak Section */}
      <View className="px-4 mt-6">
        <View className="flex-row justify-between items-center">
          <Text className="text-sm font-medium text-gray-800">Streak</Text>
          <Text className="text-sm text-gray-500">39 Days Streak</Text>
        </View>
        <View className="flex-row justify-between mt-2">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
            <View key={index} className="items-center">
              <Text className="text-xs text-gray-500">{day}</Text>
              <View
                className={`w-4 h-4 mt-1 rounded-full ${
                  index < 5 ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            </View>
          ))}
        </View>
      </View>

      {/* Stats Section */}
      <View className="px-4 mt-6">
        <View className="flex-row justify-between">
          <View className="w-[48%] bg-gray-100 p-4 rounded-lg items-center">
            <Text className="text-lg font-bold text-gray-800">110</Text>
            <Text className="text-sm text-gray-500">Task Completed</Text>
          </View>
          <View className="w-[48%] bg-gray-100 p-4 rounded-lg items-center">
            <Text className="text-lg font-bold text-gray-800">1</Text>
            <Text className="text-sm text-gray-500">Top Caregiver</Text>
          </View>
        </View>
        <View className="flex-row justify-between mt-4">
          <View className="w-[48%] bg-gray-100 p-4 rounded-lg items-center">
            <Text className="text-lg font-bold text-gray-800">90</Text>
            <Text className="text-sm text-gray-500">Gifts Received</Text>
          </View>
          <View className="w-[48%] bg-gray-100 p-4 rounded-lg items-center">
            <Text className="text-lg font-bold text-gray-800">Hero Bear</Text>
            <Text className="text-sm text-gray-500">Your Level</Text>
          </View>
        </View>
      </View>

      {/* Automatic Tracking Section */}
        <View className="px-4 mt-6">
            <Text className="text-sm font-medium text-gray-800">Automatic Tracking</Text>
            <View className="flex-row justify-between mt-4">
                {[
                    { label: 'Steps iPhone', icon: require('../../../assets/icons/steps.png') },
                    { label: 'Apple Health', icon: require('../../../assets/icons/apple_health.png') },
                    { label: 'Apple Watch', icon: require('../../../assets/icons/apple_watch.png') },
                    { label: 'FitBit', icon: require('../../../assets/icons/fitbit.png') },
                    ].map((item, index) => (
                    <View key={index} className="items-center">
                    {/* Grey Round Background */}
                        <View className="w-16 h-16 bg-gray-200 rounded-full items-center justify-center mb-2">
                            <Image
                                source={item.icon}
                                style={{ width: 24, height: 24 }}
                            />
                        </View>
                        <Text className="text-xs text-gray-500 text-center">{item.label}</Text>
                    </View>
                ))}
            </View>
        </View>
    </ScrollView>
  );
}