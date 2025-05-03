import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const tabs = [
  { name: 'Dashboard', route: '/dashboard/mydashboard/dashboard', icon: 'dashboard', iconType: 'MaterialCommunityIcons' },
  { name: 'Family Group', route: '/dashboard/family/family', icon: 'home', iconType: 'Ionicons' },
  { name: 'Safezone', route: '/dashboard/safezone/safezone', icon: 'map-marker-alt', iconType: 'FontAwesome5' },
  { name: 'Profile', route: '/dashboard/profile/profile', icon: 'person', iconType: 'MaterialIcons' },
];

export default function DashboardLayout() {
  const router = useRouter();
  const segments = useSegments();

  // Determine the active tab based on the current route
  const activeTab = tabs.find((tab) => segments.join('/').includes(tab.route))?.name || 'My Dashboard';

  const handleTabPress = (route: string) => {
    router.replace(route as any);
  };

  const renderIcon = (icon: string, iconType: string, isActive: boolean) => {
    const color = isActive ? '#1A0933' : '#777';
    const size = 24;

    switch (iconType) {
      case 'Ionicons':
        return <Ionicons name={icon as any} size={size} color={color} />;
      case 'FontAwesome5':
        return <FontAwesome5 name={icon as any} size={size} color={color} />;
      default:
        return <MaterialIcons name={icon as any} size={size} color={color} />;
    }
  };

  return (
    <View className="flex-1 relative">
      {/* For LinearGradient, we use a combination of style prop for positioning (which is critical for gradients) 
          while keeping the Tailwind approach for the rest of the components */}
      <LinearGradient
        colors={['#ED9E8F', '#FFDBC3', '#FEF6E3', '#FFFFFF']}
        style={gradientStyles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      <SafeAreaView className="flex-1" edges={['left', 'right']}>
        {/* Header */}
        <View 
          className="flex-row items-center justify-between px-4 py-2"
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
                    {renderIcon(tab.icon, tab.iconType, isActive)}
                    
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