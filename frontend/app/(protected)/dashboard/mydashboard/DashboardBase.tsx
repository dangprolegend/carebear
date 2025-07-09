import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, View, Text, Pressable, Platform, Image, Modal, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Calendar from 'expo-calendar';
import * as Notifications from 'expo-notifications';
import { groupTasksByTimeAndType, TaskGroup, Task } from './task';
import TaskCard from './taskcard';
import { Link, useRouter } from 'expo-router';
import DashboardTimelineMarker from '../../../../components/DashboardTimelineMarker';
import { 
  updateTaskStatus, 
  completeTaskWithMethod, 
  fetchTasksForDashboard, 
  getCurrentGroupID,
  fetchUsersInGroup,
  getCurrentUserID,
  setCurrentGroupIDForApiService
} from '../../../../service/apiServices';
// Add this import at the top of the file
import { useAuth, useUser } from '@clerk/clerk-expo';
import { setClerkAuthTokenForApiService } from '../../../../service/apiServices';
import axios from 'axios';

type DashboardBaseProps = {
  tasks: Task[];
  showHighPrioritySection?: boolean;
  title?: string;
  userRole?: string;
};


// Configure notifications (unchanged)...
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const DashboardBase = ({ tasks = [], showHighPrioritySection = true, title = 'Dashboard', userRole = 'member' }: DashboardBaseProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState<Calendar.Event[]>([]);
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showTaskCard, setShowTaskCard] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // New state for group filtering
  const [userGroups, setUserGroups] = useState<{id: string, name: string}[]>([]);
  const [showGroupSelector, setShowGroupSelector] = useState(false);
  const [showTaskFilter, setShowTaskFilter] = useState(false);
  const [selectedGroupName, setSelectedGroupName] = useState<string>();
  const [selectedTaskFilter, setSelectedTaskFilter] = useState<string>("All Tasks");
  
  // New state for assigned by filter
  const [familyMembers, setFamilyMembers] = useState<{id: string, name: string, avatar: string}[]>([]);
  const [showAssignedByFilter, setShowAssignedByFilter] = useState(false);
  const [selectedAssignedBy, setSelectedAssignedBy] = useState<{id: string, name: string, avatar: string} | null>(null);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  // Add/modify these state variables in the DashboardBase component
  const [showWhoseTaskFilter, setShowWhoseTaskFilter] = useState(false);
  const [selectedTaskAssignee, setSelectedTaskAssignee] = useState<{id: string, name: string, avatar: string}[]>([]);
  const [taskFilterLabel, setTaskFilterLabel] = useState<string>("All Tasks");

  // Add these new state variables for mood/body status
  const [weekMoodStatuses, setWeekMoodStatuses] = useState<{[date: string]: string}>({});
  const [weekBodyStatuses, setWeekBodyStatuses] = useState<{[date: string]: string}>({});
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(false);

  // Near line 60, where other state variables are declared
  const [groupsLoading, setGroupsLoading] = useState<boolean>(false);

  // Get the current user
  const { user } = useUser();
  const { getToken } = useAuth();

  // API base URL - use the same as your other API calls
  const API_BASE_URL = "https://carebear-carebearvtmps-projects.vercel.app";
  
  // Function to get emoji for mood
  const getMoodEmoji = (mood: string): string => {
    switch(mood) {
      case 'happy': return '😊';
      case 'excited': return '🤩';
      case 'sad': return '😢';
      case 'angry': return '😠';
      case 'nervous': return '😬';
      case 'peaceful': return '🧘';
      default: return '⚪';
    }
  };
  
  // Function to get emoji for body feeling
  const getBodyEmoji = (body: string): string => {
    switch(body) {
      case 'energized': return '⚡';
      case 'sore': return '💪';
      case 'tired': return '😴';
      case 'sick': return '🤒';
      case 'relaxed': return '😌';
      case 'tense': return '😣';
      default: return '⚪';
    }
  };

  // Function to fetch status for a specific date
  const fetchDailyStatusForDate = async (userID: string, date: Date) => {
    try {
      // Format the date as YYYY-MM-DD for the API
      const formattedDate = date.toISOString().split('T')[0];
      
      // Since the API doesn't support querying by date directly, we'll need to get history and filter
      const response = await axios.get(`${API_BASE_URL}/api/daily/history/${userID}`);
      
      if (response.data && response.data.data) {
        // Find the status for the specified date
        const statusForDate = response.data.data.find((status: any) => {
          return status.date?.split('T')[0] === formattedDate;
        });
        
        if (statusForDate) {
          return {
            mood: statusForDate.mood,
            body: statusForDate.body
          };
        }
      }
      
      // Return empty status if nothing found
      return { mood: '', body: '' };
    } catch (error) {
      console.error(`Error fetching status for date ${date.toISOString()}:`, error);
      return { mood: '', body: '' };
    }
  };
  
  // Function to fetch statuses for the displayed week
  const fetchWeekStatuses = async () => {
    if (!getCurrentUserID()) return;
    
    try {
      setIsLoadingStatuses(true);
      const userID = getCurrentUserID();
      if (!userID) return;
      
      // Get dates for the displayed week
      const weekDates = [];
      for (let i = -3; i <= 3; i++) {
        const date = new Date(selectedDate);
        date.setDate(selectedDate.getDate() + i);
        weekDates.push(date);
      }
      
      // Fetch status for each date in the week
      const moodStatuses: {[date: string]: string} = {};
      const bodyStatuses: {[date: string]: string} = {};
      
      // Fetch all history at once (more efficient)
      const response = await axios.get(`${API_BASE_URL}/api/daily/history/${userID}`);
      
      if (response.data && response.data.data) {
        // Process each date in the week
        for (const date of weekDates) {
          const formattedDate = date.toISOString().split('T')[0];
          
          // Find the status for this date in the history data
          const statusForDate = response.data.data.find((status: any) => {
            return status.date?.split('T')[0] === formattedDate;
          });
          
          if (statusForDate) {
            moodStatuses[formattedDate] = statusForDate.mood;
            bodyStatuses[formattedDate] = statusForDate.body;
          }
        }
      }
      
      setWeekMoodStatuses(moodStatuses);
      setWeekBodyStatuses(bodyStatuses);
    } catch (error) {
      console.error('Error fetching week statuses:', error);
    } finally {
      setIsLoadingStatuses(false);
    }
  };

  // Effect to fetch statuses when the selected date changes
  useEffect(() => {
    fetchWeekStatuses();
  }, [selectedDate]);
  
  // Add this effect to fetch statuses when the component mounts
  useEffect(() => {
    const initializeDailyStatus = async () => {
      await fetchWeekStatuses();
    };
    
    initializeDailyStatus();
  }, []);
  
  // Add this effect to set the Clerk token for API service
  useEffect(() => {
    const setAuthToken = async () => {
      try {
        const token = await getToken();
        setClerkAuthTokenForApiService(token);
      } catch (error) {
        console.error('Failed to get Clerk token:', error);
      }
    };
    
    setAuthToken();
  }, [getToken]);

  // Update the function to fetch complete group data for each ID
  useEffect(() => {
    const fetchUserGroups = async () => {
      try {
        if (!getCurrentUserID()) {
          console.log("Cannot fetch groups: No current user ID available");
          return;
        }
        
        const userID = getCurrentUserID();
        setGroupsLoading(true);
        
        // Step 1: Fetch the user's group IDs
        const response = await fetch(`${API_BASE_URL}/api/users/${userID}/allGroups`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log("123456789", response);
        if (!response.ok) {
          throw new Error(`Failed to fetch user groups: ${response.statusText}`);
        }
        
        const data = await response.json();
        const groupIDs = data.groupIDs || [];
        console.log("Group IDs:", groupIDs);
        
        if (groupIDs.length === 0) {
          console.log("No group IDs found for user");
          setUserGroups([]);
          setGroupsLoading(false);
          return;
        }

        // Step 2: Fetch complete group data for each ID
        const groupsData = await Promise.all(
          groupIDs.map(async (groupID: string) => {
            try {
              const groupResponse = await fetch(`${API_BASE_URL}/api/groups/${groupID}`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                },
              });

              if (!groupResponse.ok) {
                console.error(`Failed to fetch group data for ID ${groupID}: ${groupResponse.statusText}`);
                return null;
              }

              const groupData = await groupResponse.json();
              return {
                id: groupData._id || groupData.id,
                name: groupData.name || `Group ${groupID.substring(0, 5)}`
              };
            } catch (error) {
              console.error(`Error fetching group ${groupID}:`, error);
              return null;
            }
          })
        );

        // Filter out any null values (failed fetches)
        const validGroups = groupsData.filter(group => group !== null);
        console.log("Fetched groups data:", validGroups);

        if (validGroups.length > 0) {
          setUserGroups(validGroups);
          
          // If no group is currently selected, select the first one
          if (!selectedGroupName) {
            setSelectedGroupName(validGroups[0].name);
            
            // Also update the current group ID for API service
            setCurrentGroupIDForApiService(validGroups[0].id);
          }
        } else {
          console.log("No valid groups found for user");
          setUserGroups([]);
        }
      } catch (error) {
        console.error("Error fetching user groups:", error);
        setUserGroups([]);
      } finally {
        setGroupsLoading(false);
      }
    };

    // Only fetch groups if we have a user ID
    if (getCurrentUserID()) {
      fetchUserGroups();
    }
  }, []);

  // Update the useEffect that runs when tasks or selectedGroupName changes
useEffect(() => {
  if (tasks.length > 0) {
    // Find the selected group ID
    const selectedGroup = userGroups.find(group => group.name === selectedGroupName);
    
    if (selectedGroup) {
      // Filter tasks by the selected group
      const groupTasks = filterTasksByGroup(tasks, selectedGroup.id);
      setLocalTasks(groupTasks);
    } else {
      // If no group is selected yet, show all tasks
      setLocalTasks(tasks);
    }
  }
}, [tasks, selectedGroupName, userGroups]);

  // Update tasks when props change
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  // Request notification permissions & setup listeners (unchanged)...
  useEffect(() => {
    registerForPushNotificationsAsync();

    // Handle notification received while app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Handle user tapping on notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
      // Find the related task and open its details
      const taskId = response.notification.request.content.data?.taskId;
      const matchedTask = localTasks.find(t => t.id === taskId);
      
      if (matchedTask) {
        handleTaskPress(matchedTask);
      }
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  // Add this function to filter tasks by selected group
  const filterTasksByGroup = (allTasks: Task[], groupId: string | undefined): Task[] => {
    if (!groupId) return allTasks;
    
    return allTasks.filter(task => {
      // Check if task.groupID matches the selected group
      const taskGroupId = typeof task.groupID === 'object' && task.groupID !== null && '_id' in task.groupID 
        ? task.groupID._id 
        : task.groupID;
        
      return taskGroupId === groupId;
    });
  };

  // Update the handleGroupChange function to load tasks for the selected group
  const handleGroupChange = (groupName: string) => {
    setSelectedGroupName(groupName);
    setShowGroupSelector(false);
    
    // Find the selected group ID
    const selectedGroup = userGroups.find(group => group.name === groupName);
    
    if (selectedGroup) {
      // Update the current group ID in API service
      setCurrentGroupIDForApiService(selectedGroup.id);
      setGroupsLoading(true);
      
      // Different handling based on user role
      if (isCareReceiver) {
        // For care receivers, load only tasks assigned to them in this group
        loadTasksForCareReceiverInGroup(selectedGroup.id);
      } else {
        // For other users, use the existing function
        loadTasksForGroup(selectedGroup.id);
      }
    }
  };

  // Create a helper function to load tasks for a specific group
  const loadTasksForGroup = async (groupID: string) => {
    try {
      const groupTasks = await fetchTasksForDashboard(groupID);
      setLocalTasks(groupTasks);
      
      // Apply any existing filters to the new tasks
      let filteredTasks = groupTasks;
      
      // Apply date filter if needed
      filteredTasks = filteredTasks.filter(isTaskForSelectedDate);
      
      // Apply assignedBy filter if one is selected
      if (selectedAssignedBy) {
        filteredTasks = filteredTasks.filter(task => {
          const assignedById = typeof task.assignedBy === 'object' && task.assignedBy !== null 
            ? (task.assignedBy._id || task.assignedBy.id) 
            : task.assignedBy;
          
          return assignedById === selectedAssignedBy.id;
        });
      }
      
      // Apply task assignee filter if any are selected
      if (selectedTaskAssignee && selectedTaskAssignee.length > 0) {
        const assigneeIds = selectedTaskAssignee.map(assignee => assignee.id);
        
        filteredTasks = filteredTasks.filter(task => {
          let assignedToId;
          if (typeof task.assignedTo === 'object' && task.assignedTo !== null) {
            if ('_id' in task.assignedTo && typeof (task.assignedTo as any)._id === 'string') {
              assignedToId = (task.assignedTo as any)._id;
            } else if ('id' in task.assignedTo && typeof (task.assignedTo as any).id === 'string') {
              assignedToId = (task.assignedTo as any).id;
            } else {
              assignedToId = undefined;
            }
          } else {
            assignedToId = task.assignedTo;
          }
            
          return assigneeIds.includes(assignedToId as string);
        });
      }
      
      // Update the displayed tasks
      setLocalTasks(filteredTasks);
    } catch (error) {
      console.error(`Error loading tasks for group ${groupID}:`, error);
    } finally {
      setGroupsLoading(false);
    }
  };

  // Add a function to handle task filter selection
  const handleTaskFilterChange = (filter: string) => {
    setSelectedTaskFilter(filter);
    setShowTaskFilter(false);
  };

  // Update the closeAllDropdowns function
  const closeAllDropdowns = () => {
    setShowGroupSelector(false);
    setShowAssignedByFilter(false);
    setShowWhoseTaskFilter(false);
  };

  // Add function to handle assigned by selection
  const handleAssignedByChange = (member: {id: string, name: string, avatar: string} | null) => {
    setSelectedAssignedBy(member);
    setShowAssignedByFilter(false);
    
    // Filter tasks by assignedBy
    if (!member) {
      // Show all tasks if "All Members" is selected
      setLocalTasks(tasks);
    } else {
      // Filter tasks assigned by the selected member
      const filteredTasks = tasks.filter(task => {
        const assignedById = typeof task.assignedBy === 'object' && task.assignedBy !== null 
          ? task.assignedBy._id 
          : task.assignedBy;
          
        return assignedById === member.id;
      });
      
      setLocalTasks(filteredTasks);
    }
  };

  // Rest of the component...

  // Now update the "Assigned by" filter in the Filter Options section

  // Helper: Request permissions
  const registerForPushNotificationsAsync = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
  };

  useEffect(() => {
    scheduleAllTaskNotifications();
  }, [tasks]);
  
  // Helper: Schedule notifications for all tasks 
  const scheduleAllTaskNotifications = async () => {
    // Cancel all existing notifications first
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    // Schedule new notifications for all tasks
    for (const task of tasks) {
      await scheduleTaskNotification(task);
    }
    
    console.log(`Scheduled notifications for ${tasks.length} tasks`);
  };

  // Helper: Schedule a notification for a single task
  const scheduleTaskNotification = async (task: Task) => {
    try {
      const taskDate = new Date(task.datetime);
      
      // Create a reminder time
      // Adjust the time ahead as needed
      const reminderTime = new Date(taskDate);
      const timeAhead = 5; // Set a default time ahead of 5 minutes
      reminderTime.setMinutes(reminderTime.getMinutes() - timeAhead);
      
      // Only schedule if in the future
      if (reminderTime > new Date()) {
        const identifier = await Notifications.scheduleNotificationAsync({
          content: {
            title: `Time for: ${task.title}`,
            body: `${task.detail || ''} ${task.subDetail || ''}`,
            data: { taskId: task.id || task.datetime },
          },
          trigger: { 
            type: 'date' as any,
            date: reminderTime
          },
        });
        
        console.log(`Scheduled notification ${identifier} for ${task.title} at ${reminderTime.toLocaleString()}`);
        return identifier;
      }
    } catch (error) {
      console.error("Error scheduling notification:", error);
    }
  };

  // Handle task status updates for care receivers
  const handleSkipTask = async (task: Task) => {
    try {
      setRefreshing(true);
      await updateTaskStatus(task._id, 'skipped');
      console.log('Task skipped:', task.title);
      refreshTasks();
    } catch (error) {
      console.error('Error skipping task:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleTakeTask = async (task: Task) => {
    try {
      setRefreshing(true);
      await completeTaskWithMethod(task._id, 'manual', 'Completed via baby dashboard');
      console.log('Task completed:', task.title);
      refreshTasks();
    } catch (error) {
      console.error('Error completing task:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Update refreshTasks to only fetch tasks for the selected group
  const refreshTasks = async () => {
    try {
      const groupID = getCurrentGroupID();
      if (!groupID) {
        console.error('No group ID available for refresh');
        return;
      }
      
      const updatedTasks = await fetchTasksForDashboard(groupID);
      
      // Apply filtering to ensure only tasks from this group are shown
      const filteredByGroup = filterTasksByGroup(updatedTasks, groupID);
      setLocalTasks(filteredByGroup);
    } catch (error) {
      console.error('Error refreshing tasks:', error);
    }
  };

  // Function to handle task press
  const handleTaskPress = (task: Task) => {
    router.push({
      pathname: './task/taskInfo',
      params: { taskId: task._id, groupID: task.groupID?._id || task.groupID }
    });
  };

  const isTaskForSelectedDate = (task: Task) => {
    const taskDate = new Date(task.datetime);
    return (
      taskDate.getFullYear() === selectedDate.getFullYear() &&
      taskDate.getMonth() === selectedDate.getMonth() &&
      taskDate.getDate() === selectedDate.getDate()
    );
  };

  // Compare dates only (not time) to see if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  // Is the selected date today?
  const isSelectedDateToday = isToday(selectedDate);
  
  // Check if a task is in the past
  const isTaskInPast = (taskDatetime: string) => {
    try {
      const taskDate = new Date(taskDatetime);
      return taskDate < new Date();
    } catch (e) {
      console.error("Error comparing task datetime:", e);
      return false;
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  // Add a helper function to filter tasks by multiple assignees
const filterTasksByAssignee = (assignees: {id: string, name: string, avatar: string}[]) => {
  if (assignees.length === 0) {
    setLocalTasks(tasks);
    return;
  }
  
  const assigneeIds = assignees.map(assignee => assignee.id);
  
  const filteredTasks = tasks.filter(task => {
    const assignedTo = task.assignedTo as { _id?: string } | string | null | undefined;
    const assignedToId = typeof assignedTo === 'object' && assignedTo !== null && '_id' in assignedTo
      ? assignedTo._id
      : assignedTo;
      
    return assigneeIds.includes(assignedToId as string);
  });
  
  setLocalTasks(filteredTasks);
};

// Close the dropdown but don't reset selections
const closeWhoseTaskFilter = () => {
  setShowWhoseTaskFilter(false);
};

  // Add this function to handle task assignee selection
const handleTaskAssigneeChange = (member: {id: string, name: string, avatar: string} | null) => {
  
  if (!member) {
    setTaskFilterLabel("All Tasks");
    setSelectedTaskAssignee([]);
    setTaskFilterLabel("All Tasks");
    setLocalTasks(tasks);
    return;
  }
  // Check if the member is already selected
  const isAlreadySelected = (selectedTaskAssignee ?? []).some(selected => selected.id === member.id);
  
  let newSelection;
  if (isAlreadySelected) {
    // Remove the member from selection
    newSelection = selectedTaskAssignee.filter(selected => selected.id !== member.id);
  } else {
    // Add the member to selection
    newSelection = [...selectedTaskAssignee, member];
  }
  
  // Update the selection state
  setSelectedTaskAssignee(newSelection);

  // Update the filter label
  if (newSelection.length === 0) {
    setTaskFilterLabel("All Tasks");
    // Show all tasks
    setLocalTasks(tasks);
  } else if (newSelection.length === 1) {
    setTaskFilterLabel(`${newSelection[0].name}'s Tasks`);
    // Filter for just one member
    filterTasksByAssignee(newSelection);
  } else if (newSelection.length === familyMembers.length) {
    setTaskFilterLabel("Everyone's Tasks");
    // If all members are selected, show all tasks
    setLocalTasks(tasks);
  } else {
    setTaskFilterLabel(`${newSelection.length} Members' Tasks`);
    // Filter for multiple members
    filterTasksByAssignee(newSelection);
  }
};

  // Add this new function to filter tasks for the care receiver
  const getTasksForCareReceiver = (allTasks: Task[]): Task[] => {
    const currentUserId = getCurrentUserID();
    if (!currentUserId) return [];
    
    // Filter tasks that are specifically assigned to the current user (care receiver)
    return allTasks.filter(task => {
      let assignedToId: string | undefined;
      if (typeof task.assignedTo === 'object' && task.assignedTo !== null && '_id' in task.assignedTo) {
        assignedToId = (task.assignedTo as { _id: string })._id;
      } else {
        assignedToId = task.assignedTo as string;
      }
      
      return assignedToId === currentUserId;
    });
  };

  // Check if user is care receiver
  const isCareReceiver = userRole === 'carereceiver';

  // Filter tasks for the selected date
  const filteredTasks = isCareReceiver 
  ? getTasksForCareReceiver(localTasks).filter(isTaskForSelectedDate)
  : localTasks.filter(isTaskForSelectedDate);

  // Add this function to replace getPriorityColor
  const getPriorityFlagIcon = (priority?: string): any => {
    switch (priority) {
      case 'high': 
        return require('../../../../assets/icons/redflag.png');
      case 'medium': 
        return require('../../../../assets/icons/yellowflag.png');
      case 'low': 
        return require('../../../../assets/icons/blueflag.png');
      default:
        return require('../../../../assets/icons/redflag.png'); // Default flag
    }
  };

  // Replace the loadFamilyMembers function inside useEffect around line ~800
    useEffect(() => {
      const loadFamilyMembers = async () => {
        if (isCareReceiver) return;
        
        try {
          setLoadingMembers(true);
          const groupID = getCurrentGroupID();
          
          if (!groupID) {
            console.error("No group ID available to load family members");
            return;
          }
          
          const members = await fetchUsersInGroup(groupID);
          console.log("Raw members data:", members);
          
          // Map the API response to our format - FIXED to include all needed fields
          const mappedMembers = members.map(member => ({
            id: member._id || member.userID, // Use _id first, then fallback to userID
            name: member.fullName || 
                  (member.firstName && member.lastName ? `${member.firstName} ${member.lastName}` : 
                  member.firstName || member.email || 'Unknown User'),
            avatar: member.imageURL || 'https://via.placeholder.com/40',
            role: member.role,
            clerkID: member.clerkID // Keep this for matching current user
          }));
          
          console.log("Mapped members:", mappedMembers);
          setFamilyMembers(mappedMembers);

          // Find myself in the members list using clerkID
          if (user) {
            const currentUserId = user.id;
            // Look for a member with matching clerkID
            const myself = mappedMembers.find(member => member.clerkID === currentUserId);
            
            if (myself) {
              console.log("Found myself in members:", myself);
              // Set myself as default for "Assigned by" filter - USING THE MAPPED OBJECT
              setSelectedAssignedBy(myself);
            } else {
              console.log("Could not find myself in members list");
              console.log("Current user ID:", currentUserId);
              console.log("Available clerkIDs:", mappedMembers.map(m => m.clerkID));
              
              // If no match by clerkID, try to find by name or email matching the user's info
              const currentUserName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
              const currentUserEmail = user.emailAddresses?.[0]?.emailAddress;
              
              const possibleMatch = mappedMembers.find(m => 
                m.name.includes(currentUserName) || 
                (currentUserEmail && m.name.includes(currentUserEmail))
              );
              
              if (possibleMatch) {
                console.log("Found possible match by name/email:", possibleMatch);
                setSelectedAssignedBy(possibleMatch);
              } else {
                // Last resort: create a "Me" entry if user isn't found in the group
                const meEntry = {
                  id: currentUserId, // Use the clerk ID as fallback
                  name: currentUserName || currentUserEmail || "Me",
                  avatar: user.imageUrl || 'https://via.placeholder.com/40',
                  role: 'member',
                  clerkID: currentUserId
                };
                
                // Add this entry to family members
                const updatedMembers = [meEntry, ...mappedMembers];
                setFamilyMembers(updatedMembers);
                setSelectedAssignedBy(meEntry);
                console.log("Created Me entry:", meEntry);
              }
            }
          }
        } catch (error) {
          console.error('Error loading family members:', error);
        } finally {
          setLoadingMembers(false);
        }
      };
      
      loadFamilyMembers();
    }, [selectedGroupName, isCareReceiver, user]);


  const loadTasksForCareReceiverInGroup = async (groupID: string) => {
    try {
      // Get current user ID
      const currentUserId = getCurrentUserID();
      if (!currentUserId) {
        console.error("No user ID available");
        setLocalTasks([]);
        setGroupsLoading(false);
        return;
      }
      
      console.log(`Loading tasks for care receiver (${currentUserId}) in group ${groupID}`);
      
      // First, fetch all tasks for the selected group
      const allGroupTasks = await fetchTasksForDashboard(groupID);
      console.log(`Found ${allGroupTasks.length} total tasks in group ${groupID}`);
      
      // Then filter to only show tasks assigned to this care receiver
      const myTasks = allGroupTasks.filter(task => {
        let assignedToId;
        
        // Handle different ways assignedTo might be structured
        if (typeof task.assignedTo === 'object' && task.assignedTo !== null) {
          if ('_id' in task.assignedTo) {
            assignedToId = (task.assignedTo as { _id: string })._id;
          } else if ('id' in task.assignedTo) {
            assignedToId = (task.assignedTo as { id: string }).id;
          } else if ('userID' in task.assignedTo) {
            assignedToId = (task.assignedTo as { userID: string }).userID;
          }
        } else {
          assignedToId = task.assignedTo;
        }
        
        return assignedToId === currentUserId;
      });
      
      console.log(`Found ${myTasks.length} tasks assigned to care receiver in group ${groupID}`);
      setLocalTasks(myTasks);
      
    } catch (error) {
      console.error(`Error loading care receiver tasks for group ${groupID}:`, error);
      setLocalTasks([]);
    } finally {
      setGroupsLoading(false);
    }
  };

  // Add this useEffect to load tasks when the default group is selected
  useEffect(() => {
    const loadInitialTasks = async () => {
      // Get the first group or current group ID
      let groupID;
      if (userGroups.length > 0) {
        // Use the currently selected group if available
        if (selectedGroupName) {
          const group = userGroups.find(g => g.name === selectedGroupName);
          if (group) groupID = group.id;
        } else {
          // Otherwise use the first group
          groupID = userGroups[0].id;
          setSelectedGroupName(userGroups[0].name);
        }
      } else {
        // Fallback to whatever is in the API service
        groupID = getCurrentGroupID();
      }
      
      if (!groupID) {
        console.log("No group ID available for initial task load");
        return;
      }
      
      setGroupsLoading(true);
      
      try {
        if (isCareReceiver) {
          await loadTasksForCareReceiverInGroup(groupID);
        } else {
          const groupTasks = await fetchTasksForDashboard(groupID);
          setLocalTasks(groupTasks);
        }
      } catch (error) {
        console.error('Error loading initial tasks:', error);
      } finally {
        setGroupsLoading(false);
      }
    };
    
    loadInitialTasks();
  }, [userGroups, isCareReceiver]);


  // Get avatar URL helper function
  const getAvatarUrl = (user: any): string => {
    if (typeof user === 'object' && user !== null && 'imageURL' in user && user.imageURL) {
      return user.imageURL;
    }
    return 'https://via.placeholder.com/40';
  };

  // Get priority color helper function
  const getPriorityColor = (priority?: string): string => {
    switch (priority) {
      case 'high': return '#FF5555';
      case 'medium': return '#FFCC00';
      case 'low': return '#198AE9';
      default: return '#666';
    }
  };

  // Initialize calendar (unchanged)
  useEffect(() => {
    (async () => {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        const defaultCalendar = calendars[0];

        // Get today's events
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date();
        endDate.setHours(23, 59, 59, 999);

        if (defaultCalendar?.id) {
          const events = await Calendar.getEventsAsync(
            [defaultCalendar.id],
            startDate,
            endDate
          );
          setCalendarEvents(events);
        }
      }
    })();
  }, [selectedDate]);

  // Restore a skipped task to pending status
  async function handleRestoreTask(task: Task): Promise<void> {
    try {
      setRefreshing(true);
      await updateTaskStatus(task._id, 'pending');
      console.log('Task restored:', task.title);
      refreshTasks();
    } catch (error) {
      console.error('Error restoring task:', error);
    } finally {
      setRefreshing(false);
    }
  }

  // State for filter modal visibility
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Add these new state variables for controlling the dropdown sections
  const [showAssignedToDropdown, setShowAssignedToDropdown] = useState(false);
  const [showAssignedByDropdown, setShowAssignedByDropdown] = useState(false);

  return (
    <>
      <ScrollView className="flex-1 bg-white">
        {/* Header (Common for all users) */}
        <View className="px-4">
          {/* Calendar Strip */}
          <View className="flex-row items-center justify-between mt-6">
            <Pressable
              onPress={() => {
                const newDate = new Date(selectedDate);
                newDate.setDate(selectedDate.getDate() - 1);
                setSelectedDate(newDate);
              }}
            >
              <MaterialIcons name="arrow-left" size={24} color="#666" />
            </Pressable>
            <View className="flex-row items-center">
              {/* Replace MaterialIcons with Image */}
              <Image
                source={require('../../../../assets/icons/calendar.png')}
                style={{ width: 20, height: 20 }}
                resizeMode="contain"
              />
              <Text className="ml-2">
                {selectedDate.toLocaleDateString('en-US', {
                  month: '2-digit',
                  day: '2-digit',
                  year: 'numeric',
                })}
              </Text>
            </View>
            <Pressable
              onPress={() => {
                const newDate = new Date(selectedDate);
                newDate.setDate(selectedDate.getDate() + 1);
                setSelectedDate(newDate);
              }}
            >
              <MaterialIcons name="arrow-right" size={24} color="#666" />
            </Pressable>
          </View>

          {/* Week Days with Mood and Body Status Indicators */}
          <View className="flex-row items-center justify-between mt-4">
            {Array.from({ length: 7 }).map((_, index) => {
              const date = new Date(selectedDate);
              date.setDate(date.getDate() - 3 + index);
              const formattedDate = date.toISOString().split('T')[0];
              
              const isSelected = date.toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0];
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const dateToCompare = new Date(date);
              dateToCompare.setHours(0, 0, 0, 0);
              const isPastDate = dateToCompare <= today;
              
              // Get mood and body status for this date
              const moodStatus = weekMoodStatuses[formattedDate] || '';
              const bodyStatus = weekBodyStatuses[formattedDate] || '';
              const moodEmoji = getMoodEmoji(moodStatus);
              const bodyEmoji = getBodyEmoji(bodyStatus);

              return (
                <Pressable
                  key={index}
                  onPress={() => setSelectedDate(new Date(date))}
                  style={{
                    width: 40,
                    height: 100, // Increased height to accommodate mood/body indicators
                    borderRadius: 4,
                    borderStyle: 'solid',
                    borderWidth: isSelected ? 1 : 0,
                    borderColor: isSelected ? '#2A1800' : 'transparent',
                    padding: 8,
                    alignItems: 'center',
                    backgroundColor: isSelected ? '#FAE5CA' : 'transparent',
                    marginHorizontal: 2,
                  }}
                >
                  {/* Day letter */}
                  <Text
                    className={`text-center text-xs ${
                      isSelected ? 'text-gray-800' : 'text-gray-500'
                    }`}
                  >
                    {date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0).toUpperCase()}
                  </Text>
                  
                  {/* Day number */}
                  <Text
                    className={`text-center text-xs ${
                      isSelected ? 'text-gray-800' : 'text-gray-500'
                    }`}
                  >
                    {date.getDate()}
                  </Text>
                  
                  <View>
                    <Text 
                      className="text-xl"
                      style={{ 
                        color: bodyStatus ? 'white' : '#2A1800',
                        // Added text shadow to create border effect around the emoji
                        textShadowColor: '#000',
                        textShadowOffset: { width: 0, height: 0 },
                        textShadowRadius: 1,
                      }}
                    >
                      {getMoodEmoji(moodStatus)}
                    </Text>
                  </View>

                  <View>
                    <Text 
                      className="text-xl" 
                      style={{ 
                        color: moodStatus ? 'white' : '#2A1800',
                        // Added text shadow to create border effect around the emoji
                        textShadowColor: '#000',
                        textShadowOffset: { width: 0, height: 0 },
                        textShadowRadius: 1,
                      }}
                    >
                      {getBodyEmoji(bodyStatus)}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* CONDITIONAL RENDERING BASED ON USER ROLE */}
        {isCareReceiver ? (
        // CARE RECEIVER VIEW - Simple task cards
        <View className="flex-1 mt-6">
          <View className="mb-0">
            {/* Combined header with group selector - MODIFIED */}
            <View className="w-full h-[56px] flex-row items-center justify-between border-t border-[#FAE5CA] px-6 py-4"
              style={{ paddingTop: 12, paddingBottom: 12 }}>
              <Text className="text-lg font-semibold text-[#2A1800]">Today's Tasks</Text>
              <Pressable 
                onPress={(e) => {
                  e.stopPropagation();
                  setShowGroupSelector(!showGroupSelector);
                }}
                style={{
                  display: 'flex',
                  width: 157,
                  height: 32,
                  padding: 0,
                  paddingLeft: 12,
                  paddingRight: 8,
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#2A1800',
                  backgroundColor: '#FFF',
                  flexDirection: 'row'
                }}
              >
                <Text className="text-sm mr-2">{selectedGroupName}</Text>
                <MaterialIcons 
                  name={showGroupSelector ? "arrow-drop-up" : "arrow-drop-down"} 
                  size={20} color="#333" 
                />
              </Pressable>
              
              {/* Group dropdown menu */}
              {showGroupSelector && (
                <View
                  style={{ 
                    position: 'absolute',
                    top: 43, // Position below header
                    right: 20, // Align with right padding
                    backgroundColor: 'white',
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: '#2A1800',
                    zIndex: 10,
                    width: 157,
                    elevation: 5,
                  }}
                >
                  {userGroups.map((group, index) => (
                    <Pressable
                      key={index}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderBottomWidth: index < userGroups.length - 1 ? 1 : 0,
                        borderBottomColor: '#FAE5CA',
                      }}
                      onPress={() => handleGroupChange(group.name)}
                    >
                      <Text
                        style={{ 
                          color: '#2A1800',
                          fontWeight: selectedGroupName === group.name ? 'bold' : 'normal'
                        }}
                      >
                        {group.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
              <View className="bg-white px-4">
                {filteredTasks.length === 0 ? (
                  <View className="items-center justify-center py-12">
                    <Text className="text-gray-500">There is no task for today</Text>
                  </View>
                ) : (
                  filteredTasks.map((task, index) => (
                    // SIMPLIFIED TASK CARD FOR CARE RECEIVERS
                    <Pressable
                      key={index}
                      onPress={() => handleTaskPress(task)}
                    >
                      <View 
                        key={index}
                        className="border rounded-lg p-4 mb-4"
                        style={{
                          borderWidth: 1.5,
                          borderColor: '#2A1800',
                          borderRadius: 12,
                          backgroundColor: '#FFFFFF',
                          // Apply blur effect based on task status
                          opacity: task.status === 'skipped' || task.status === 'done' ? 0.6 : 1,
                        }}
                      >
                        {/* Task Title and Flag */}
                        <View className="flex-row items-center justify-between mb-2">
                          <View className="flex-row items-center gap-2">
                            <MaterialIcons 
                              name="circle" 
                              size={16} 
                              color="#623405"
                            />
                            <Text 
                              className="text-[#2A1800]"
                              style={{
                                fontFamily: 'Lato',
                                fontSize: 16,
                                fontWeight: '900',
                                lineHeight: 24,
                                letterSpacing: 0.3,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                              numberOfLines={1}
                            >
                              {task.title}
                            </Text>
                          </View>
                          <Image
                            source={getPriorityFlagIcon(task.priority as string)}
                            style={{ width: 20, height: 20 }}
                            resizeMode="contain"
                          />
                        </View>

                        {/* Task Description */}
                        <Text 
                          className="text-[#2A1800] mb-3 pl-2"
                          style={{
                            fontFamily: 'Lato',
                            fontSize: 14,
                            fontWeight: '300',
                            lineHeight: 24,
                            letterSpacing: -0.1,
                            overflow: 'hidden'
                          }}
                          numberOfLines={2}
                        >
                          {task.description}
                        </Text>

                        {/* Action Buttons - Show based on task status */}
                        {task.status === 'pending' || task.status === 'in-progress' ? (
                          // Regular buttons for active tasks
                          <View className="flex-row justify-between mt-2">
                            <Pressable
                              onPress={() => handleSkipTask(task)}
                              className="py-2 px-6 rounded-full border border-[#2A1800]"
                            >
                              <Text className="text-[#2A1800]">Skip</Text>
                            </Pressable>

                            <Pressable
                              onPress={() => handleTakeTask(task)}
                              className="py-2 px-8 rounded-full bg-[#2A1800]"
                            >
                              <Text className="text-white">Take</Text>
                            </Pressable>
                          </View>
                        ) : task.status === 'skipped' ? (
                          // Only show Restore button for skipped tasks
                          <View className="flex-row justify-center mt-2">
                            <Pressable
                              onPress={() => handleRestoreTask(task)}
                              className="py-2 px-6 rounded-full border border-[#2A1800]"
                            >
                              <Text className="text-[#2A1800]">Restore Task</Text>
                            </Pressable>
                          </View>
                        ) : (
                          // No buttons for completed tasks
                          <View />
                        )}
                      </View>
                    </Pressable>
                  ))
                )}
              </View>
            </View>
          </View>
        ) : (
          // NORMAL DASHBOARD FOR OTHER USERS
          <>
            {/* High Priority Section - Only for non-care receivers */}
            {showHighPrioritySection && (
              <View className="mb-0 pt-7">
                <View className="w-full h-[56px] flex-row items-center justify-between border-t border-[#FAE5CA] px-6 py-4">
                  <Text className="text-lg font-semibold text-[#2A1800]">High Priority Today</Text>
                  <Link href="/dashboard/mydashboard/task/createTask" asChild>
                    <Pressable
                      className="w-10 h-10 items-center justify-center bg-black rounded-full"
                    >
                      <MaterialIcons name="add" size={18} color="white" />
                    </Pressable>
                  </Link>
                </View>
                <View>
                  <ScrollView 
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ 
                      paddingHorizontal: 16, 
                      paddingVertical: 8,
                      minWidth: '100%', // Make sure the content container takes full width
                      gap: 16,
                    }}
                  >
                    {filteredTasks.filter(task => task.priority === 'high').length === 0 ? (
                    <View style={{ 
                      flex: 1,
                      width: '100%', 
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingVertical: 24,
                      paddingHorizontal: 16
                    }}>
                      <Text style={{ 
                        color: '#808080', 
                        textAlign: 'center',
                        fontSize: 14,
                        lineHeight: 20
                      }}>
                        You have no assigned task.{'\n'}Add task and set priority
                      </Text>
                    </View>
                  ) : (
                      filteredTasks.filter(task => task.priority === 'high').map((task, index) => {
                        // Format the time from datetime or detail
                        // Solution: Format time properly regardless of the source
                        const taskTime = task.detail ? 
                          // If task.detail contains a time string, parse and format it
                          (() => {
                            try {
                              // Check if detail is in time format (HH:MM or HH:MM:SS)
                              const timeRegex = /^\d{1,2}:\d{2}(:\d{2})?$/;
                              if (timeRegex.test(task.detail)) {
                                // If it's just a time (no date), create today's date with this time
                                const [hours, minutes] = task.detail.split(':').map(Number);
                                const date = new Date();
                                date.setHours(hours, minutes, 0);
                                return date.toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true
                                });
                              }
                              return task.detail;
                            } catch (e) {
                              return task.detail; // If parsing fails, return the original string
                            }
                          })() 
                          : (task.datetime ? new Date(task.datetime).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          }) : '');
                          
                        return (
                          <Pressable
                            key={index}
                            onPress={() => handleTaskPress(task)}
                            style={({ pressed }) => [
                              {
                                opacity: pressed ? 0.9 : 1,
                                marginRight: 12,
                                minWidth: 165,
                              }
                            ]}
                          >
                            <View 
                              className="border border-[#2A1800] bg-white p-4"
                              style={{
                                borderWidth: 1.5,
                                borderRadius: 8,
                                display: 'flex',
                                alignItems: 'flex-start', // Changed from center to flex-start
                                gap: 16, // Changed from 24 to 16
                              }}
                            >
                              <Text 
                                className="text-[#2A1800] font-semibold"
                                style={{ fontSize: 16 }}
                                numberOfLines={1}
                              >
                                {task.title}
                              </Text>
                              <Text 
                                className="text-[#666]"
                                style={{ fontSize: 14 }}
                              >
                                {taskTime}
                              </Text>
                            </View>
                          </Pressable>
                        );
                      })
                    )}
                  </ScrollView>
                </View>
              </View>
            )}

            {/* Regular Dashboard Timeline View */}
            <View className="flex-1 mt-6">
              <View className="mb-0">
                <View className="w-full h-[56px] flex-row items-center justify-between border-t border-[#FAE5CA] px-6 py-4">
                  <Text className="text-lg font-semibold text-[#2A1800]">Today Schedule</Text>
                </View>

                {/* Group Selector - Moved below the header */}
                {!isCareReceiver && (
                  <View className="px-6 mt-3 mb-2 flex-row justify-between items-center">
                    <Pressable 
                      onPress={(e) => {
                        e.stopPropagation();
                        setShowFilterModal(false);
                        setShowGroupSelector(!showGroupSelector);
                      }}
                      style={{
                        display: 'flex',
                        width: 153,
                        height: 44,
                        padding: 0,
                        paddingLeft: 12,
                        paddingRight: 8,
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: '#2A1800',
                        backgroundColor: '#FFF',
                        flexDirection: 'row'
                      }}
                    >
                      <Text className="text-sm mr-2">{selectedGroupName}</Text>
                      <MaterialIcons 
                        name={showGroupSelector ? "arrow-drop-up" : "arrow-drop-down"} 
                        size={20} color="#333" 
                      />
                    </Pressable>

                    {/* Filter Button (circular) */}
                    <Pressable 
                      onPress={() => setShowFilterModal(true)}
                      className="w-10 h-10 items-center justify-center border border-black bg-white rounded-full"
                    >
                      <MaterialIcons name="filter-list" size={20} color="#2A1800" />
                    </Pressable>
                    
                    {/* Group dropdown menu */}
                    {showGroupSelector && (
                      <View
                        style={{ 
                          position: 'absolute',
                          top: 47, // Positioned below the selector
                          left: 20,
                          backgroundColor: 'white',
                          borderRadius: 4,
                          borderWidth: 1,
                          borderColor: '#FAE5CA',
                          zIndex: 10,
                          width: 153,
                          elevation: 5,
                        }}
                      >
                        {userGroups.map((group, index) => (
                          <Pressable
                            key={index}
                            style={{
                              paddingVertical: 8,
                              paddingHorizontal: 12,
                              borderBottomWidth: index < userGroups.length - 1 ? 1 : 0,
                              borderBottomColor: '#FAE5CA',
                            }}
                            onPress={() => handleGroupChange(group.name)}
                          >
                            <Text
                              style={{ 
                                color: '#2A1800',
                                fontWeight: selectedGroupName === group.name ? 'bold' : 'normal'
                              }}
                            >
                              {group.name}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    )}
                  </View>
                )}

                {/* Filter Modal */}
                <Modal
                  visible={showFilterModal}
                  transparent={true}
                  animationType="fade"
                  onRequestClose={() => setShowFilterModal(false)}
                >
                  <Pressable 
                    style={{
                      flex: 1,
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    onPress={() => setShowFilterModal(false)}
                  >
                    <View 
                      style={{
                        width: '90%',
                        maxHeight: '80%',
                        backgroundColor: 'white',
                        borderRadius: 8,
                        padding: 16,
                        elevation: 5,
                      }}
                    >
                      <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-lg font-bold">Filter</Text>
                        <Pressable onPress={() => setShowFilterModal(false)}>
                          <MaterialIcons name="close" size={24} color="#2A1800" />
                        </Pressable>
                      </View>
                      
                      <ScrollView style={{ maxHeight: 500 }}>
                        <View 
                          style={{
                            borderWidth: 1,
                            borderColor: '#DBC3A0',
                            borderRadius: 8,
                            overflow: 'hidden'
                          }}
                        >
                          {/* Assigned to section */}
                          <View>
                            <Pressable
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: 16,
                                borderBottomWidth: 1,
                                borderBottomColor: '#DBC3A0',
                              }}
                              onPress={() => setShowAssignedToDropdown(!showAssignedToDropdown)}
                            >
                              <Text style={{ fontSize: 16, color: '#2A1800' }}>Assigned to</Text>
                              <MaterialIcons 
                                name={showAssignedToDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                                size={24} 
                                color="#2A1800" 
                              />
                            </Pressable>
                            
                            {/* Assigned to dropdown content */}
                            {showAssignedToDropdown && (
                              <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
                                {/* All option */}
                                <Pressable
                                  style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    paddingVertical: 8,
                                  }}
                                  onPress={() => handleTaskAssigneeChange(null)}
                                >
                                  <View className="flex-row items-center">
                                    <View 
                                      style={{
                                        width: 20,
                                        height: 20,
                                        borderRadius: 4,
                                        borderWidth: 2,
                                        borderColor: '#2A1800',
                                        marginRight: 12,
                                        backgroundColor: selectedTaskAssignee.length === 0 ? '#2A1800' : 'transparent',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                      }}
                                    >
                                      {selectedTaskAssignee.length === 0 && (
                                        <MaterialIcons name="check" size={12} color="white" />
                                      )}
                                    </View>
                                    <Text style={{ fontSize: 14, color: '#2A1800' }}>All</Text>
                                  </View>
                                </Pressable>
                                
                                {/* Family members list */}
                                {familyMembers.map((member, index) => {
                                  const isSelected = selectedTaskAssignee.some(selected => selected.id === member.id);
                                  
                                  return (
                                    <Pressable
                                      key={member.id}
                                      style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        paddingVertical: 8,
                                      }}
                                      onPress={() => handleTaskAssigneeChange(member)}
                                    >
                                      <View className="flex-row items-center">
                                        <View 
                                          style={{
                                            width: 20,
                                            height: 20,
                                            borderRadius: 4,
                                            borderWidth: 2,
                                            borderColor: '#2A1800',
                                            marginRight: 12,
                                            backgroundColor: isSelected ? '#2A1800' : 'transparent',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                          }}
                                        >
                                          {isSelected && (
                                            <MaterialIcons name="check" size={12} color="white" />
                                          )}
                                        </View>
                                        <Text style={{ fontSize: 14, color: '#2A1800', marginRight: 8 }}>
                                          {member.name}
                                        </Text>
                                      </View>
                                      <Image
                                        source={{ uri: member.avatar }}
                                        style={{ width: 24, height: 24, borderRadius: 12 }}
                                      />
                                    </Pressable>
                                  );
                                })}
                              </View>
                            )}
                          </View>
                          
                          {/* Assigned by section */}
                          <View>
                            <Pressable
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: 16,
                                borderBottomWidth: showAssignedByDropdown ? 1 : 0,
                                borderBottomColor: '#DBC3A0',
                              }}
                              onPress={() => setShowAssignedByDropdown(!showAssignedByDropdown)}
                            >
                              <Text style={{ fontSize: 16, color: '#2A1800' }}>Assigned by</Text>
                              <MaterialIcons 
                                name={showAssignedByDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                                size={24} 
                                color="#2A1800" 
                              />
                            </Pressable>
                            
                            {/* Assigned by dropdown content */}
                            {showAssignedByDropdown && (
                              <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
                                {/* All option */}
                                <Pressable
                                  style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    paddingVertical: 8,
                                  }}
                                  onPress={() => handleAssignedByChange(null)}
                                >
                                  <View className="flex-row items-center">
                                    <View 
                                      style={{
                                        width: 20,
                                        height: 20,
                                        borderRadius: 4,
                                        borderWidth: 2,
                                        borderColor: '#2A1800',
                                        marginRight: 12,
                                        backgroundColor: !selectedAssignedBy ? '#2A1800' : 'transparent',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                      }}
                                    >
                                      {!selectedAssignedBy && (
                                        <MaterialIcons name="check" size={12} color="white" />
                                      )}
                                    </View>
                                    <Text style={{ fontSize: 14, color: '#2A1800' }}>All</Text>
                                  </View>
                                </Pressable>
                                
                                {/* Family members list */}
                                {familyMembers.map((member, index) => {
                                  const isSelected = selectedAssignedBy?.id === member.id;
                                  
                                  return (
                                    <Pressable
                                      key={member.id}
                                      style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        paddingVertical: 8,
                                      }}
                                      onPress={() => handleAssignedByChange(member)}
                                    >
                                      <View className="flex-row items-center">
                                        <View 
                                          style={{
                                            width: 20,
                                            height: 20,
                                            borderRadius: 4,
                                            borderWidth: 2,
                                            borderColor: '#2A1800',
                                            marginRight: 12,
                                            backgroundColor: isSelected ? '#2A1800' : 'transparent',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                          }}
                                        >
                                          {isSelected && (
                                            <MaterialIcons name="check" size={12} color="white" />
                                          )}
                                        </View>
                                        <Text style={{ fontSize: 14, color: '#2A1800', marginRight: 8 }}>
                                          {member.name}
                                        </Text>
                                      </View>
                                      <Image
                                        source={{ uri: member.avatar }}
                                        style={{ width: 24, height: 24, borderRadius: 12 }}
                                      />
                                    </Pressable>
                                  );
                                })}
                              </View>
                            )}
                          </View>
                        </View>
                      </ScrollView>
                    </View>
                  </Pressable>
                </Modal>
                <View className="bg-white rounded-xl p-4">
                  {filteredTasks.length === 0 ? (
                    <View className="items-center justify-center py-12">
                      <Text className="text-gray-500">There is no task for today</Text>
                    </View>
                  ) : (
                    groupTasksByTimeAndType(filteredTasks).map((group, index) => (
                      <View key={index} className="flex-row">
                        {/* Timeline Marker */}
                        {/* <View className="flex-row items-stretch">                 
                          <DashboardTimelineMarker
                            time={group.time}
                            isFirst={index === 0}
                            isLast={index === groupTasksByTimeAndType(filteredTasks).length - 1}
                          />
                        </View> */}

                        {/* Task Group */}
                        <View className="flex-1 ml-2">
                          {/* <Text className="text-sm font-semibold text-[#2A1800] mb-2">{group.time}</Text> */}
                          {group.tasks.map((task, taskIndex) => {
                            // Check if task is in the past
                            const isPastTask = isTaskInPast(task.datetime);
                            
                            return (
                              <View
                                key={taskIndex}
                                className={`border border-[#FAE5CA] rounded-lg p-4 mb-4 ${isPastTask ? 'opacity-60' : ''}`}
                                style={{
                                  borderWidth: 1.5,
                                  borderColor: '#2A1800',
                                  borderRadius: 8,
                                  backgroundColor: '#FFFFFF',
                                  marginBottom: 16,
                                }}
                              >
                                <Pressable onPress={() => handleTaskPress(task)} className="flex-1">
                                  {/* ROW 1: Avatar, Title, Flag */}
                                  <View className="flex-row items-center justify-between mb-2">
                                    <View className="flex-row items-center flex-1">
                                      {/* Avatar of assignee */}
                                      <Image
                                        source={{ uri: getAvatarUrl(task.assignedTo) }}
                                        className="w-6 h-6 rounded-full mr-3"
                                      />
                                      
                                      {/* Task title */}
                                      <Text
                                        style={{ fontFamily: 'Lato', fontSize: 16 }}
                                        className="text-sm font-bold text-[#2A1800] flex-shrink mr-2"
                                        numberOfLines={1}
                                      >
                                        {task.title}
                                      </Text>
                                    </View>
                                    
                                    {/* Flag at far right */}
                                    <Image
                                      source={getPriorityFlagIcon(task.priority as string)}
                                      style={{ width: 20, height: 20 }}
                                      resizeMode="contain"
                                    />
                                  </View>
                                  
                                  {/* ROW 2: Time and Checkbox */}
                                  <View className="flex-row items-center justify-between mb-2">
                                    {/* Time */}
                                    <Text 
                                      className="text-[#666]"
                                      style={{ fontSize: 14 }}
                                    >
                                      {new Date(task.datetime).toLocaleTimeString('en-US', {
                                        hour: 'numeric',
                                        minute: '2-digit',
                                        hour12: true,
                                        hourCycle: 'h12'
                                      })}
                                    </Text>
                                    
                                    {/* Checkbox */}
                                    <Pressable
                                      onPress={() => console.log('Task completed:', task.title)}
                                      className="w-6 h-6 border border-[#2A1800] rounded-full flex items-center justify-center"
                                    >
                                      {task.checked ? (
                                        <MaterialIcons name="check" size={16} color="#2A1800" />
                                      ) : isPastTask ? (
                                        <MaterialIcons name="error-outline" size={16} color="#F44336" />
                                      ) : null}
                                    </Pressable>
                                  </View>
                                  
                                  {/* ROW 3: Description and Bell */}
                                  <View className="flex-row items-center justify-between mt-1">
                                    {/* Task Description */}
                                    <Text
                                      style={{ fontFamily: 'Lato', fontSize: 14 }}
                                      className="text-xs font-lato text-[#666] flex-1 mr-2"
                                      numberOfLines={2}
                                    >
                                      {task.description}
                                    </Text>
                                    
                                    {/* Bell icon */}
                                    <Pressable
                                      onPress={() => console.log('Notification for:', task.title)}
                                      className="w-6 h-6 flex items-center justify-center"
                                    >
                                      <Image
                                        source={require('../../../../assets/icons/bell-icon.png')}
                                        style={{ width: 20, height: 20 }}
                                        resizeMode="contain"
                                      />
                                    </Pressable>
                                  </View>
                                </Pressable>
                              </View>
                            );
                          })}
                        </View>
                      </View>
                    ))
                  )}
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Only show TaskCard for non-care receivers */}
      {!isCareReceiver && (
        <TaskCard
          visible={showTaskCard}
          onClose={() => setShowTaskCard(false)}
          task={selectedTask}
        />
      )}
    </>
  );
};

export default DashboardBase;