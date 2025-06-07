import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { fetchTasksForDashboard, getCurrentGroupID, fetchUserInfoById } from '../../../../service/apiServices';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import axios from 'axios';

const NotificationScreen = () => {
  const { groupId } = useLocalSearchParams();
  const router = useRouter();
  const { userId, getToken } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentGroupID, setCurrentGroupID] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroupIdIfNeeded = async () => {
      if (!groupId && userId) {
        try {
          const token = await getToken();
          // Get backend userID from Clerk ID
          const userResponse = await axios.get(`https://carebear-backend.onrender.com/api/users/clerk/${userId}`);
          const backendUserID = userResponse.data.userID;
          // Get groupID from backend userID
          const groupResponse = await axios.get(`https://carebear-backend.onrender.com/api/users/${backendUserID}/group`);
          setCurrentGroupID(groupResponse.data.groupID);
        } catch (err) {
          setError('Failed to fetch group ID from Clerk.');
        }
      } else if (groupId) {
        setCurrentGroupID(groupId as string);
      }
    };
    fetchGroupIdIfNeeded();
  }, [groupId, userId, getToken]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        let groupID = currentGroupID;
        if (!groupID) {
          setError('No group ID available.');
          setLoading(false);
          return;
        }
        const tasks = await fetchTasksForDashboard(groupID);
        tasks.sort((a: any, b: any) => {
          const aTime = new Date(a.createdAt).getTime();
          const bTime = new Date(b.createdAt).getTime();
          return bTime - aTime;
        });
        // Fetch user info for assignedBy and assignedTo in parallel
        const userInfoCache: Record<string, any> = {};
        const getUserInfo = async (user: any) => {
          if (!user) return null;
          const userId = user._id || user;
          if (!userId) return null;
          if (userInfoCache[userId]) return userInfoCache[userId];
          const info = await fetchUserInfoById(userId);
          userInfoCache[userId] = info;
          return info;
        };
        const mapped = await Promise.all(tasks.map(async (task: any) => {
          const assignedByInfo = await getUserInfo(task.assignedBy);
          const assignedToInfo = task.assignedTo ? await getUserInfo(task.assignedTo) : null;
          const assignedByName = assignedByInfo?.fullName || assignedByInfo?.name || 'Someone';
          const assignedToName = assignedToInfo?.fullName || assignedToInfo?.name || null;
          const assignedByAvatar = assignedByInfo?.imageURL || 'https://via.placeholder.com/32';
          const time = new Date(task.createdAt || task.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          let message = '';
          if (assignedToName) {
            message = `assigned ${assignedToName} a new task`;
          } else {
            message = `created a task`;
          }
          return {
            avatar: assignedByAvatar,
            senderName: assignedByName,
            message,
            time,
            priorityColor: task.priority === 'high' ? '#FF0000' : task.priority === 'medium' ? '#FFD700' : '#3498db',
            taskTitle: task.title,
          };
        }));
        setNotifications(mapped);
      } catch (err: any) {
        setError('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentGroupID]);

  // Helper to format date headers
  const getDateLabel = (dateString: string) => {
    const notifDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const isToday = notifDate.toDateString() === today.toDateString();
    const isYesterday = notifDate.toDateString() === yesterday.toDateString();
    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';
    return notifDate.toLocaleDateString();
  };

  // Group notifications by date
  const groupedNotifications = notifications.reduce((acc: any, notif: any) => {
    const dateKey = new Date(notif.createdAt).toDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(notif);
    return acc;
  }, {});
  // Sort date groups and notifications by time descending (nearest time at top)
  const sortedDateKeys = Object.keys(groupedNotifications).sort((a, b) => {
    // Compare the most recent notification time in each group
    const aMax = Math.max(...groupedNotifications[a].map((n: any) => new Date(n.createdAt).getTime()));
    const bMax = Math.max(...groupedNotifications[b].map((n: any) => new Date(n.createdAt).getTime()));
    return bMax - aMax;
  });

  // Sort notifications within each group by createdAt descending (nearest at top)
  sortedDateKeys.forEach(dateKey => {
    groupedNotifications[dateKey].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });

  const renderNotification = (n: any, idx: number) => (
    <View
      key={idx}
      className="flex-row items-start py-3 px-2 border-b border-gray-100"
      style={{
        backgroundColor:
          new Date(n.time).toDateString() === new Date().toDateString()
            ? '#FFF8EF'
            : 'white',
      }}
    >
      <Image source={{ uri: n.avatar }} className="w-8 h-8 rounded-full mt-1 mr-2" />
      <View className="flex-1">
        <Text className="text-[15px]">
          <Text className="font-bold">{n.senderName}</Text>{' '}
          <Text className="font-normal text-black">{n.message}</Text>
        </Text>
        <Text className="text-xs text-gray-500 mt-0.5">{n.time}</Text>
        {n.taskTitle ? (
          <View className="flex-row items-center mt-1">
            <MaterialIcons name="flag" size={16} color={n.priorityColor || '#3498db'} />
            <Text className="ml-1 font-bold text-[15px]">{n.taskTitle}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#FAE5CA" />
        <Text className="mt-2 text-gray-600">Loading notifications...</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">{error}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
    <View className="flex-row items-center justify-between px-4 pt-4 pb-2 bg-white">
      <Text className="text-lg font-bold text-black flex-1 text-center">Notifications</Text>
    </View>
      <ScrollView className="flex-1 ml-5 mr-5" contentContainerStyle={{ paddingBottom: 32 }}>
        {notifications.length === 0 && <Text className="px-4 text-gray-400 mt-4">No notifications</Text>}
        {sortedDateKeys.map(dateKey => (
          <View key={dateKey}>
            {/* Removed date header display */}
            {groupedNotifications[dateKey].map(renderNotification)}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default NotificationScreen;
