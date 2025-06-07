import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Slot, useRouter, useSegments, useGlobalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'react-native';
import { fetchUserNameByID } from '../../../service/apiServices'; // Import the function to fetch user name

const tabs = [
  { 
    name: 'Family Group', 
    route: '/dashboard/family/family', 
    icon: require('../../../assets/icons/family.png')
  },
  { 
    name: 'My Dashboard', 
    route: '/dashboard/mydashboard/dashboard',
    icon: require('../../../assets/icons/dashboard.png')
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
  const segments = useSegments() as string[];
  const searchParams = useGlobalSearchParams(); 
  const [userName, setUserName] = useState<string | null>(null); 

  // Fetch the user's name based on userID
  useEffect(() => {
    const fetchUserName = async () => {
      if (segments.includes('member-dashboard')) {
        const userID = searchParams.userID as string | undefined; 
        if (userID) {
          try {
            const name = await fetchUserNameByID(userID); 
            setUserName(name);
          } catch (error) {
            console.error('Failed to fetch user name:', error);
            setUserName(null); 
          }
        }
      }
    };

    fetchUserName();
  }, [segments, searchParams]);

  const getActiveTitle = () => {
    if (segments.includes('member-dashboard')) {
      return userName ? `${userName}'s Dashboard` : 'Member Dashboard'; 
    }

    return tabs.find((tab) => segments.join('/').includes(tab.route))?.name || 'My Dashboard';
  };

  const activeTitle = getActiveTitle();

  const hasUnreadNotifications = false;

  const handleTabPress = (route: string) => {
    router.replace(route as any);
  };

  const renderIcon = (icon: any, isActive: boolean) => {
    return (
      <View style={{ position: 'relative', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
        {/* Background shade for active tab */}
        {isActive && (
          <View
            style={{
              position: 'absolute',
              width: 64,
              height: 32,
              borderRadius: 16,
              backgroundColor: '#FAE5CA', 
              zIndex: 0,
            }}
          />
        )}

        {/* Icon */}
        <Image
          source={icon}
          style={{
            width: 24,
            height: 24,
            tintColor: isActive ? '#1A0933' : '#777',
            zIndex: 1,
          }}
          resizeMode="contain"
        />
      </View>
    );
  };

  return (
    <View className="flex-1 relative">
      <SafeAreaView className="flex-1" edges={['left', 'right']}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4">
          {/* Home Button */}
          <Pressable
            onPress={() => {
              if (segments.includes('family')) {
                // Navigate to logout page if on family group page
                router.replace('/home/abc' as any);
              } else {
                // Navigate to dashboard for other pages
                router.replace('/dashboard/mydashboard/dashboard');
              }
            }}
          >
            <MaterialIcons name="keyboard-arrow-left" size={24} color="#362209" />
          </Pressable>

          {/* Dynamic Dashboard Title */}
          <Text
            className="text-lg font-bold text-[#362209] font-['Lato'] text-[18px] tracking-[0.3px]"
          >
            {activeTitle}
          </Text>

          {/* Notification Button */}
            <Pressable
            onPress={() => router.replace('../notification/notification')}
            style={{
              position: 'relative',
              padding: 5,
            }}
            >
            <Image
              source={require('../../../assets/icons/bell.png')}
              style={{ width: 22, height: 22, borderRadius: 20 }}
              resizeMode="contain"
            />

            {/* Only show badge if there are unread notifications */}
            {hasUnreadNotifications && (
              <View
                style={{
                  position: 'absolute',
                  right: 1,
                  top: 1,
                  backgroundColor: '#FF3B30',
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  borderWidth: 1.5,
                  borderColor: '#FFFFFF',
                }}
              />
            )}
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