import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons'; // For Home and Notification icons

const tabs = [
  { name: 'Dashboard', route: '/dashboard/dashboard', icon: require('../../../assets/icons/dashboard.png') },
  { name: 'Family Group', route: '/dashboard/family', icon: require('../../../assets/icons/family.png') },
  { name: 'Safezone', route: '/dashboard/safezone', icon: require('../../../assets/icons/safezone.png') },
  { name: 'Profile', route: '/dashboard/profile', icon: require('../../../assets/icons/profile.png') },
];

export default function DashboardLayout() {
  const router = useRouter();
  const segments = useSegments();

  // Determine the active tab based on the current route
  const activeTab = tabs.find((tab) => segments.join('/').includes(tab.route))?.name || 'My Dashboard';

  const handleTabPress = (route: string) => {
    router.replace(route as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-2 bg-white border-b border-gray-300">
        {/* Home Button */}
        <Pressable onPress={() => router.replace('/home')}>
          <MaterialIcons name="home" size={24} color="#362209" />
        </Pressable>

        {/* Dynamic Dashboard Title */}
        <Text
          className="text-lg font-bold text-[#362209]"
          style={{
            fontFamily: 'Lato',
            fontSize: 18,
            letterSpacing: 0.3,
          }}
        >
          {activeTab}
        </Text>

        {/* Notification Button */}
        <Pressable onPress={() => console.log('Notification pressed')}>
          <MaterialIcons name="notifications" size={24} color="#362209" />
        </Pressable>
      </View>

      <View className="flex-1">
        {/* Main Content */}
        <View className="flex-1">
          <Slot />
        </View>

        {/* Tab Navigation */}
        <View className="flex-row justify-around bg-gray-100 p-4 border-t border-gray-300">
          {tabs.map((tab) => {
            const isActive = segments.join('/').includes(tab.route); // Check active tab
            return (
              <Pressable
                key={tab.name}
                onPress={() => handleTabPress(tab.route)}
                className={`items-center px-4 py-2 rounded-lg ${
                  isActive ? 'bg-[#F5E8D8]' : 'bg-transparent'
                }`}
              >
                {/* Icon */}
                <Image
                  source={tab.icon}
                  style={{
                    width: 24,
                    height: 24,
                    tintColor: isActive ? '#362209' : 'gray',
                    marginBottom: 4,
                  }}
                />
                {/* Tab Name */}
                <Text
                  className={`text-sm ${
                    isActive ? 'font-black text-[#362209]' : 'text-gray-700'
                  }`}
                  style={{
                    fontFamily: 'Lato',
                    fontSize: 14,
                    letterSpacing: 0.3,
                    textAlign: 'center',
                  }}
                >
                  {tab.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}