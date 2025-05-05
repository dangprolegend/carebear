import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Image } from 'react-native';

const tabs = [
  { 
    name: 'My Dashboard', 
    route: '/dashboard/mydashboard/dashboard', 
    icon: require('../../../assets/icons/dashboard.png')
  },
  { 
    name: 'Family Group', 
    route: '/dashboard/family/family', 
    icon: require('../../../assets/icons/family.png')
  },
  { 
    name: 'Safezone', 
    route: '/dashboard/safezone/safezone', 
    icon: require('../../../assets/icons/safezone.png')
  },
  { 
    name: 'Profile', 
    route: '/dashboard/profile/profile', 
    icon: require('../../../assets/icons/profile.png')
  },
];

export default function DashboardLayout() {
  const router = useRouter();
  const segments = useSegments();

  // Determine the active tab based on the current route
  const activeTab = tabs.find((tab) => segments.join('/').includes(tab.route))?.name || 'My Dashboard';

  const handleTabPress = (route: string) => {
    router.replace(route as any);
  };

  // Update the renderIcon function
  const renderIcon = (icon: any, isActive: boolean) => {
    return (
      <Image 
        source={icon}
        style={{ 
          width: 24, 
          height: 24,
          tintColor: isActive ? '#1A0933' : '#777'
        }} 
        resizeMode="contain"
      />
    );
};

  return (
    <View className="flex-1 relative">
      <SafeAreaView className="flex-1" edges={['left', 'right']}>
        {/* Header */}
        <View 
          className="flex-row items-center justify-between px-4"
        >
          {/* Home Button */}
          <Pressable onPress={() => router.replace('/home')}>
            <MaterialIcons name="home" size={24} color="#362209" />
          </Pressable>

          {/* Dynamic Dashboard Title */}
          <Text
            className="text-lg font-bold text-[#362209] font-['Lato'] text-[18px] tracking-[0.3px]"
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
          <View className="flex-1 mb-16">
            <Slot />
          </View>

          {/* Tab Navigation - Fixed at bottom */}
          <View className="absolute bottom-0 left-0 right-0 bg-white shadow-lg">
            <View className="flex-row justify-around items-center py-3 px-2">
              {tabs.map((tab) => {
                const isActive = segments.join('/').includes(tab.route); // Check active tab
                return (
                  <Pressable
                    key={tab.name}
                    onPress={() => handleTabPress(tab.route)}
                    className={`items-center py-2 px-4 ${isActive ? 'rounded-lg bg-transparent overflow-hidden' : ''}`}
                  >
                    {/* Icon */}
                    {renderIcon(tab.icon, isActive)}
                    
                    {/* Tab Name */}
                    <Text
                      className={`text-xs mt-1 font-['Lato'] tracking-[0.3px] z-10 ${
                        isActive ? 'font-bold text-[#1A0933]' : 'text-gray-500'
                      }`}
                    >
                      {tab.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

// We keep this minimal StyleSheet only for the gradient background
// which requires native positioning to work correctly
const gradientStyles = StyleSheet.create({
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  }
});