import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, Pressable, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { fetchTasksForDashboard, getCurrentGroupID, fetchUserInfoById, getBackendUserID } from '../../../../service/apiServices';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import axios from 'axios';
import FeedLoading from '~/components/ui/feed-loading';
import RedFlag from '../../../../assets/icons/redflag.png';
import YellowFlag from '../../../../assets/icons/yellowflag.png';
import BlueFlag from '../../../../assets/icons/blueflag.png';

// Helper function to check if a date is today (more accurate comparison)
function isToday(date: Date): boolean {
  const today = new Date();
  
  // Convert both to same timezone for date-only comparison
  const todayStr = today.toLocaleDateString();
  const dateStr = date.toLocaleDateString();
  
  return dateStr === todayStr;
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
    // Use createdAt as the timestamp for grouping
    const itemDate = new Date(item.createdAt || item.timestamp || item.time);
    let dateLabel = '';
    
    // Categorize the date based on creation time
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

  // Sort items within each group by createdAt (newest first)
  Object.keys(groups).forEach(key => {
    groups[key].sort((a, b) => {
      const aDate = new Date(a.createdAt || a.timestamp || a.time);
      const bDate = new Date(b.createdAt || b.timestamp || b.time);
      return bDate.getTime() - aDate.getTime();
    });
  });

  // Create date groups and apply custom sorting for display
  return Object.keys(groups).map(dateLabel => ({
    dateLabel,
    items: groups[dateLabel]
  })).sort((a, b) => {
    // Handle special date labels in order: Today, Yesterday, then other dates chronologically
    if (a.dateLabel === 'Today') return -1;
    if (b.dateLabel === 'Today') return 1;
    if (a.dateLabel === 'Yesterday') return -1;
    if (b.dateLabel === 'Yesterday') return 1;
    
    // For other dates, compare chronologically (newest first)
    const aDate = new Date(a.items[0].createdAt || a.items[0].timestamp || a.items[0].time);
    const bDate = new Date(b.items[0].createdAt || b.items[0].timestamp || b.items[0].time);
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
          const userResponse = await axios.get(`https://carebear-carebearvtmps-projects.vercel.app/api/users/clerk/${userId}`);
          const backendUserID = userResponse.data.userID;
          setCurrentUserID(backendUserID);
          
          if (!groupId) {
            // Get groupID from backend userID
            const groupResponse = await axios.get(`https://carebear-carebearvtmps-projects.vercel.app/api/users/${backendUserID}/group`);
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
          const aTime = new Date(a.createdAt || a.datetime).getTime();
          const bTime = new Date(b.createdAt || b.datetime).getTime();
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
          // For accurate date comparison across timezones
          const taskCreatedDate = new Date(task.createdAt);
          const isTaskCreatedToday = isToday(taskCreatedDate);
          
          // Log for debugging
          console.log(`Task ${task.title}: Created ${taskCreatedDate.toLocaleDateString()}, isToday: ${isTaskCreatedToday}`);
          
          return {
            avatar: assignedByAvatar,
            senderName: assignedByName,
            message,
            time: timeFormatted,
            timestamp: timestamp, // Store the actual date object for grouping
            priorityColor: task.priority === 'high' ? '#FF0000' : task.priority === 'medium' ? '#FFD700' : '#3498db',
            taskTitle: task.title,
            taskId: task._id, // Store the task ID for navigation
            createdAt: task.createdAt, // Store createdAt for sorting
            isCreatedToday: isTaskCreatedToday, // Check if created today
            reminder: task.reminder // Store reminder info for display purposes
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

  const renderNotification = (n: any, idx: number) => {
    // Determine flag image based on priority
    const flagImage = n.priorityColor === '#FF0000' ? RedFlag : n.priorityColor === '#FFD700' ? YellowFlag : BlueFlag;

    // Show scheduled date if available, but not using it for sorting
    const hasScheduledDate = n.reminder?.start_date ? true : false;
    const scheduledDate = hasScheduledDate ? new Date(n.reminder.start_date) : null;
    
    // Format the scheduled date for display if applicable
    const scheduledDateFormatted = scheduledDate ? scheduledDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : null;
    
    return (
      <View
        key={idx}
        className="flex-row items-start py-3 px-2 border-b border-gray-100"
        style={{
          backgroundColor: n.isCreatedToday ? '#FFF8EF' : 'white', // Only highlight tasks created today
        }}
      >
        <Image source={{ uri: n.avatar }} className="w-8 h-8 rounded-full mt-1 mr-2 border border-[#2A1800]" />
        <View className="flex-1">
          <Text className="text-[15px]">
            <Text style={{ fontFamily: 'Lato' }} className="font-bold">{n.senderName}</Text>{' '}
            <Text style={{ fontFamily: 'Lato' }} className="font-normal text-black">{n.message}</Text>
          </Text>
          <Text style={{ fontFamily: 'Lato' }} className="text text-gray-500 mt-0.5">{n.time}</Text>
          
          {n.taskTitle ? (
            <Pressable 
              className="flex-row items-center mt-1" 
              onPress={() => {
                if (n.taskId) {
                  console.log(`Navigating to task details: ${n.taskId}`);
                  router.push({
                    pathname: '/dashboard/mydashboard/task/taskInfo',
                    params: { taskId: n.taskId }
                  });
                }
              }}
            >
              <Image source={flagImage} className="w-5 h-5" />
              <Text style={{ fontFamily: 'Lato' }} className="ml-1 font-bold text-[15px]">{n.taskTitle}</Text>
              <MaterialIcons name="chevron-right" size={16} color="#999" style={{ marginLeft: 4 }} />
            </Pressable>
          ) : null}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <FeedLoading 
        dataReady={false}
        onFinish={() => setLoading(false)}
      />
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
      <Text style={{ fontFamily: 'Lato' }} className="text-lg font-bold text-black flex-1 text-center">Notifications</Text>
    </View >
      <ScrollView className="flex-1 ml-5 mr-5" contentContainerStyle={{ paddingBottom: 32 }}>
        {notifications.length === 0 && <Text className="px-4 text-gray-400 mt-4">No notifications</Text>}
        {groupedNotifications.map((group: DateGroup, idx: number) => (
          <View key={idx} className="mb-4">
            {/* Special styling for "Today" section */}
            <Text style={{ fontFamily: 'Lato' }}
              className={`font-semibold text-lg px-4 py-2 ${
                group.dateLabel === 'Today' 
                  ? 'text-[#362209] bg-[#FFF8EF]' 
                  : 'text-gray-800'
              }`}
            >
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
