import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { fetchTasksForDashboard, getCurrentGroupID, fetchUserInfoById, getBackendUserID } from '../../../../service/apiServices';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import axios from 'axios';

// Helper function to check if a date is today
function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() && 
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
}

// Helper function to check if a date is yesterday
function isYesterday(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.getDate() === yesterday.getDate() && 
         date.getMonth() === yesterday.getMonth() &&
         date.getFullYear() === yesterday.getFullYear();
}

interface DateGroup {
  dateLabel: string;
  items: any[];
}

// Group notifications by date (Today, Yesterday, or specific date)
function groupItemsByDate(items: any[]): DateGroup[] {
  const groups: Record<string, any[]> = {};

  items.forEach(item => {
    const itemDate = new Date(item.timestamp || item.time);
    let dateLabel = '';
    
    if (isToday(itemDate)) {
      dateLabel = 'Today';
    } else if (isYesterday(itemDate)) {
      dateLabel = 'Yesterday';
    } else {
      dateLabel = itemDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });
    }
    
    if (!groups[dateLabel]) {
      groups[dateLabel] = [];
    }
    
    groups[dateLabel].push(item);
  });

  return Object.keys(groups).map(dateLabel => ({
    dateLabel,
    items: groups[dateLabel]
  })).sort((a, b) => {
    if (a.dateLabel === 'Today') return -1;
    if (b.dateLabel === 'Today') return 1;
    if (a.dateLabel === 'Yesterday') return -1;
    if (b.dateLabel === 'Yesterday') return 1;
    
    // For other dates, compare the first item's timestamp
    const aDate = new Date(a.items[0].timestamp || a.items[0].time);
    const bDate = new Date(b.items[0].timestamp || b.items[0].time);
    return bDate.getTime() - aDate.getTime();
  });
}

const NotificationScreen = () => {
  const { groupId } = useLocalSearchParams();
  const router = useRouter();
  const { userId, getToken } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentGroupID, setCurrentGroupID] = useState<string | null>(null);
  const [currentUserID, setCurrentUserID] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
        try {
          const token = await getToken();
          // Get backend userID from Clerk ID
          const userResponse = await axios.get(`https://carebear-backend.onrender.com/api/users/clerk/${userId}`);
          const backendUserID = userResponse.data.userID;
          setCurrentUserID(backendUserID);
          
          if (!groupId) {
            // Get groupID from backend userID
            const groupResponse = await axios.get(`https://carebear-backend.onrender.com/api/users/${backendUserID}/group`);
            setCurrentGroupID(groupResponse.data.groupID);
          }
        } catch (err) {
          setError('Failed to fetch user data from Clerk.');
        }
      }
    };
    
    fetchUserData();
    
    if (groupId) {
      setCurrentGroupID(groupId as string);
    }
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
        
        if (!currentUserID) {
          setError('No user ID available.');
          setLoading(false);
          return;
        }
        
        const tasks = await fetchTasksForDashboard(groupID);
        
        // Filter tasks where the current user is either assignedTo or assignedBy
        const filteredTasks = tasks.filter((task: any) => {
          // If assignedTo or assignedBy is missing or doesn't have a valid ID, don't display
          if (!task.assignedTo && !task.assignedBy) return false;
          
          const assignedToId = task.assignedTo?._id || 
            (typeof task.assignedTo === 'string' ? task.assignedTo : null);
            
          const assignedById = task.assignedBy?._id || 
            (typeof task.assignedBy === 'string' ? task.assignedBy : null);
          
          // Don't display if both IDs are null or undefined
          if (!assignedToId && !assignedById) return false;
          
          return (
            (assignedToId && assignedToId === currentUserID) || 
            (assignedById && assignedById === currentUserID)
          );
        });
        
        // Sort tasks by creation date in descending order (newest first)
        filteredTasks.sort((a: any, b: any) => {
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
        const mapped = await Promise.all(filteredTasks.map(async (task: any) => {
          // Skip tasks without valid assignedBy or assignedTo
          if (!task.assignedBy && !task.assignedTo) return null;
          
          const assignedByInfo = task.assignedBy ? await getUserInfo(task.assignedBy) : null;
          const assignedToInfo = task.assignedTo ? await getUserInfo(task.assignedTo) : null;
          
          // Skip if we couldn't get user info
          if (!assignedByInfo && !assignedToInfo) return null;
          
          const assignedByName = assignedByInfo?.fullName || assignedByInfo?.name || 'Someone';
          const assignedToName = assignedToInfo?.fullName || assignedToInfo?.name || null;
          const assignedByAvatar = assignedByInfo?.imageURL || 'https://via.placeholder.com/32';
          
          // Format time for display
          const timestamp = new Date(task.createdAt || task.datetime);
          const timeFormatted = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          
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
            time: timeFormatted,
            timestamp: timestamp, // Store the actual date object for grouping
            priorityColor: task.priority === 'high' ? '#FF0000' : task.priority === 'medium' ? '#FFD700' : '#3498db',
            taskTitle: task.title,
          };
        }));
        
        // Filter out any null entries that might have resulted from invalid tasks
        setNotifications(mapped.filter(Boolean));
      } catch (err: any) {
        setError('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };
    
    if (currentGroupID && currentUserID) {
      fetchData();
    }
  }, [currentGroupID, currentUserID]);

  const renderNotification = (n: any, idx: number) => (
    <View
      key={idx}
      className="flex-row items-start py-3 px-2 border-b border-gray-100"
      style={{
        backgroundColor: isToday(n.timestamp) ? '#FFF8EF' : 'white',
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
            <MaterialIcons name="flag" size={18} color={n.priorityColor || '#3498db'} />
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

  // Group notifications by date
  const groupedNotifications: DateGroup[] = groupItemsByDate(notifications);

  return (
    <View className="flex-1 bg-white">
    <View className="flex-row items-center justify-between px-4 pt-4 pb-2 bg-white">
      <Text className="text-lg font-bold text-black flex-1 text-center">Notifications</Text>
    </View>
      <ScrollView className="flex-1 ml-5 mr-5" contentContainerStyle={{ paddingBottom: 32 }}>
        {notifications.length === 0 && <Text className="px-4 text-gray-400 mt-4">No notifications</Text>}
        {groupedNotifications.map((group: DateGroup, idx: number) => (
          <View key={idx} className="mb-4">
            <Text className="font-semibold text-gray-800 text-lg px-4 py-2">
              {group.dateLabel}
            </Text>
            {group.items.map((item, index) => renderNotification(item, index))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default NotificationScreen;
