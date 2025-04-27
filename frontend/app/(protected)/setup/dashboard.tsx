// app/dashboard.tsx

import { View, Text, ScrollView, Pressable } from 'react-native';
import { CalendarDays, Bell, Lock, User } from 'lucide-react-native'; // if you want icons
import { Link } from 'expo-router';

export default function Dashboard() {
  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-10 pb-4 bg-white">
        <Lock size={24} />
        <Text className="text-lg font-bold">My Dashboard</Text>
        <Bell size={24} />
      </View>

      {/* Date and Calendar */}
      <View className="px-4">
        <Text className="text-center text-sm text-gray-600 mb-2">05/12/2025</Text>
        <View className="flex-row justify-between">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
            <View key={idx} className="items-center">
              <Text className="text-xs text-gray-500">{day}</Text>
              <View className="w-8 h-8 mt-1 rounded-full bg-gray-200 items-center justify-center">
                <Text className="text-xs">{9 + idx}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <ScrollView className="flex-1 mt-4" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Today Schedule */}
        <View className="px-4 mb-6">
          <Text className="text-base font-semibold mb-2">Today Schedule</Text>

          {/* Today Tasks */}
          <View className="bg-gray-100 rounded-lg p-4 mb-4">
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm font-medium">Today Tasks</Text>
              <View className="flex-row space-x-2">
                <Pressable className="px-2 py-1 bg-white rounded-full">
                  <Text className="text-xs">View</Text>
                </Pressable>
                <Pressable className="px-2 py-1 bg-white rounded-full">
                  <Text className="text-xs">Edit</Text>
                </Pressable>
              </View>
            </View>

            {/* Task List */}
            <View className="space-y-4">
              <View>
                <Text className="text-xs text-gray-500 mb-1">8:00 am</Text>
                <Text className="text-sm font-medium">Medicine 1</Text>
                <Text className="text-xs text-gray-400">1 Tablet</Text>
              </View>

              <View>
                <Text className="text-xs text-gray-500 mb-1">12:00 pm</Text>
                <Text className="text-sm font-medium">Supplement 1</Text>
                <Text className="text-xs text-gray-400">1 Tablet</Text>
              </View>

              {/* Add more tasks here similarly */}
            </View>
          </View>
        </View>

        {/* Your Health */}
        <View className="px-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-base font-semibold">Your Health</Text>
            <Pressable>
              <Text className="text-sm text-blue-500">Edit</Text>
            </Pressable>
          </View>

          {/* Health Metrics */}
          <View className="flex-row flex-wrap justify-between">
            {[
              { label: 'Sleep', value: '81%', detail: '6 hr 15 min / 8 hr' },
              { label: 'Steps', value: '81%', detail: '9,500 / 10,000' },
              { label: 'Weight', value: '81%', detail: '55 kg / 50 kg' },
              { label: 'Workout', value: '81%', detail: '650 cal / 1 hr' },
            ].map((item, idx) => (
              <View
                key={idx}
                className="w-[48%] bg-gray-100 p-4 rounded-lg mb-4"
              >
                <Text className="text-sm font-medium">{item.label}</Text>
                <Text className="text-lg font-bold mt-2">{item.value}</Text>
                <Text className="text-xs text-gray-500 mt-1">{item.detail}</Text>
              </View>
            ))}
          </View>

          {/* Add more section */}
          <Pressable className="flex-row items-center justify-center bg-gray-100 p-4 rounded-lg">
            <Text className="text-sm text-gray-500">+ Add more</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex-row justify-around py-3">
        {[
          { name: 'Dashboard', link: '/dashboard'},
          { name: 'Family Group', link: '/index'},
          { name: 'SafeZone', link: '/index'},
          { name: 'Profile', link: '/index'},
        ].map((tab, idx) => (
          <Link key={idx} href={tab.link as any} className="items-center">
            <Text className="text-xs">{tab.name}</Text>
          </Link>
        ))}
      </View>
    </View>
  );
}
