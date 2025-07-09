import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Slot, useRouter, useSegments, useGlobalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'react-native';
import { fetchUserNameByID, getCurrentGroupID, getBackendUserID, getUnreadTasksCount, markAllTasksAsRead } from '../../../service/apiServices';
import { useAuth } from '@clerk/clerk-expo';

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
    name: 'Feed', 
    route: '/dashboard/feed/feed', 
    icon: require('../../../assets/icons/feed.png')
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
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState<boolean>(false);
  const [userID, setUserID] = useState<string | null>(null);
  const [groupID, setGroupID] = useState<string | null>(null);
  const { userId } = useAuth();

  // Fetch the user's name based on userID
  useEffect(() => {
    const fetchUserData = async () => {
      if (segments.includes('member-dashboard')) {
        const userID = searchParams.userID as string | undefined; 
        if (userID) {
          try {
            const name = await fetchUserNameByID(userID); 
            setUserName(name);
            setUserID(userID);
          } catch (error) {
            console.error('Failed to fetch user name:', error);
            setUserName(null); 
          }
        }
      } else if (userId) {
        try {
          // Get the current user ID and group ID
          const backendUserID = await getBackendUserID(userId);
          setUserID(backendUserID);
          
          // Get groupID directly from API instead of using the cache function
          try {
            const groupResponse = await fetch(`https://carebear-carebearvtmps-projects.vercel.app/api/users/${backendUserID}/group`);
            const groupData = await groupResponse.json();
            
            if (groupData && groupData.groupID) {
              console.log(`Successfully retrieved group ID from API: ${groupData.groupID}`);
              setGroupID(groupData.groupID);
            } else {
              console.error('Failed to get valid group ID from API response', groupData);
            }
          } catch (groupError) {
            console.error('Error fetching group ID from API:', groupError);
          }
        } catch (error) {
          console.error('Failed to fetch user or group ID:', error);
        }
      }
    };

    fetchUserData();
  }, [segments, searchParams, userId]);

  // Fetch unread notification count
  useEffect(() => {
    const fetchNotificationStatus = async () => {
      try {
        if (userID && groupID) {
          console.log(`Checking unread notifications for user ${userID} in group ${groupID}`);
          const count = await getUnreadTasksCount(userID, groupID);
          console.log(`Unread notifications count: ${count}`);
          setUnreadCount(count);
          setHasUnreadNotifications(count > 0);
          console.log(`hasUnreadNotifications set to: ${count > 0}`); // Debug log
        }
      } catch (error) {
        console.error('Failed to fetch notification status:', error);
      }
    };

    // Fetch unread notifications every 30 seconds
    fetchNotificationStatus();
    const interval = setInterval(fetchNotificationStatus, 30000);
    
    return () => clearInterval(interval);
  }, [userID, groupID]);

  // Debug effect to track state changes
  useEffect(() => {
    console.log(`[DEBUG] Component state: userID=${userID}, groupID=${groupID}, hasUnreadNotifications=${hasUnreadNotifications}, unreadCount=${unreadCount}`);
  }, [userID, groupID, hasUnreadNotifications, unreadCount]);

  const getActiveTitle = () => {
    if (segments.includes('member-dashboard')) {
      return userName ? `${userName}'s Dashboard` : 'Member Dashboard'; 
    }

    return tabs.find((tab) => segments.join('/').includes(tab.route))?.name || 'My Dashboard';
  };

  const activeTitle = getActiveTitle();

  const handleTabPress = (route: string) => {
    router.replace(route as any);
  };

  const renderIcon = (icon: any, isActive: boolean) => {
    return (
      <View style={{ 
        position: 'relative', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: 32  
      }}>
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
            tintColor: isActive ? '#2A1800' : 'gray',
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
            <MaterialIcons name="keyboard-arrow-left" size={24} color="#2A1800" />
          </Pressable>

          {/* Dynamic Dashboard Title */}
          <Text
            className="text-[18px] font-bold text-[#2A1800] font-['Lato'] text-[18px] tracking-[0.3px]"
          >
            {activeTitle}
          </Text>

          {/* Notification Button */}
            <Pressable
            onPress={async () => {
              // Mark tasks as read and navigate to the notification screen
              if (userID && groupID) {
                try {
                  console.log(`Marking tasks as read for user ${userID} in group ${groupID}`);
                  await markAllTasksAsRead(userID, groupID);
                  
                  // Update the notification count locally
                  setUnreadCount(0);
                  setHasUnreadNotifications(false);
                  
                  // Navigate to the notification screen
                  router.push({
                    pathname: '/dashboard/notification/notification',
                    params: { userID, groupID }
                  });
                } catch (error) {
                  console.error('Failed to mark tasks as read:', error);
                  router.push({
                    pathname: '/dashboard/notification/notification',
                    params: { userID, groupID }
                  });
                }
              } else {
                router.replace('../notification/notification');
              }
            }}
            style={{
              position: 'relative',
              paddingTop: 16,
              paddingBottom: 16,
            }}
            >
            <Image
              source={require('../../../assets/icons/bell.png')}
              style={{ width: 24, height: 24}}
              resizeMode="contain"
            />
            {/* Notification badge */}
            {unreadCount > 0 && (
              <View
                style={{
                  position: 'absolute',
                  right: -3,
                  top: -5,
                  backgroundColor: 'red',
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  borderWidth: 1.5,
                  borderColor: '#FFFFFF',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 10,
                }}
              >
                <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </Pressable>
        </View>

        <View className="flex-1">
          {/* Main Content */}
          <View className="flex-1">
            <Slot />
          </View>

          {/* Tab Navigation - Fixed at bottom with proper spacing */}
          <View className="bg-white">
            {/* Horizontal separator line */}
            <View style={{ height: 1, backgroundColor: '#2A1800' }} />
            <SafeAreaView edges={['bottom']}>
              <View className="flex-row justify-around items-center py-3 px-2 min-h-[70px]">
                {tabs.map((tab) => {
                  const isActive = segments.join('/').includes(tab.route); // Check active tab
                  return (
                    <Pressable
                      key={tab.name}
                      onPress={() => handleTabPress(tab.route)}
                      className={`items-center py-2 px-3 flex-1 max-w-[90px] ${isActive ? 'rounded-lg bg-transparent overflow-hidden' : ''}`}
                    >
                      {/* Icon */}
                      {renderIcon(tab.icon, isActive)}

                      {/* Tab Name */}
                      <Text
                        className={`text-xs mt-1 font-['Lato'] tracking-[0.3px] z-10 text-center ${
                          isActive ? 'font-bold text-[#1A0933]' : 'text-gray-500'
                        }`}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                      >
                        {tab.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </SafeAreaView>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}