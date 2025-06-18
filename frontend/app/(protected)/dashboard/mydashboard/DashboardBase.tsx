import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, View, Text, Pressable, Platform, Image, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Calendar from 'expo-calendar';
import * as Notifications from 'expo-notifications';
import { groupTasksByTimeAndType, TaskGroup, Task } from './task';
import TaskCard from './taskcard';
import { Link, useRouter } from 'expo-router';
import DashboardTimelineMarker from '../../../../components/DashboardTimelineMarker';
import { updateTaskStatus, completeTaskWithMethod, fetchTasksForDashboard, getCurrentGroupID } from '../../../../service/apiServices';

// Configure notifications (unchanged)...
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

type DashboardBaseProps = {
  tasks: Task[];
  showHighPrioritySection?: boolean;
  title?: string;
  userRole?: string;
};

const DashboardBase = ({ tasks = [], showHighPrioritySection = true, title = 'Dashboard', userRole = 'member' }: DashboardBaseProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState<Calendar.Event[]>([]);
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showTaskCard, setShowTaskCard] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // New state for group filtering
  // New state for group filtering
  const [userGroups, setUserGroups] = useState<{id: string, name: string}[]>([]);
  const [showGroupSelector, setShowGroupSelector] = useState(false);
  const [showTaskFilter, setShowTaskFilter] = useState(false);
  const [selectedGroupName, setSelectedGroupName] = useState<string>('The Cheese Fam');
  const [selectedTaskFilter, setSelectedTaskFilter] = useState<string>("My Task, Brother's Task");
  

  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  // Add this effect to load user groups on component mount
  useEffect(() => {
    // In a real implementation, fetch the user's groups from the API
    // For now, we'll use mock data to match your screenshot
    const mockGroups = [
      { id: '1', name: 'The Cheese Fam' },
      { id: '2', name: 'Johnson Family' },
      { id: '3', name: 'Smith Household' }
    ];
    
    setUserGroups(mockGroups);
  }, []);

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

  // Add a function to handle group selection
  const handleGroupChange = (groupName: string) => {
    setSelectedGroupName(groupName);
    setShowGroupSelector(false);
    
    // In a real implementation, you would filter tasks by the selected group ID
    // For now, we'll just update the displayed name
  };

  // Add a function to handle task filter selection
  const handleTaskFilterChange = (filter: string) => {
    setSelectedTaskFilter(filter);
    setShowTaskFilter(false);
  };

  // Add a function to close all dropdowns
  const closeAllDropdowns = () => {
    setShowGroupSelector(false);
    setShowTaskFilter(false);
  };

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
      const timeAhead = 0
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

  // Refresh tasks after status change
  const refreshTasks = async () => {
    try {
      const groupID = getCurrentGroupID();
      if (!groupID) {
        console.error('No group ID available for refresh');
        return;
      }
      
      const updatedTasks = await fetchTasksForDashboard(groupID);
      setLocalTasks(updatedTasks);
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

  // Filter tasks for the selected date
  const filteredTasks = localTasks.filter(isTaskForSelectedDate);

  // Check if user is care receiver
  const isCareReceiver = userRole === 'carereceiver';

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
      case 'high': return '#FF0000';
      case 'medium': return '#FFD700';
      case 'low': return '#0000FF';
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
              <MaterialIcons name="calendar-today" size={20} color="#666" />
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

          {/* Week Days (Common for all users) */}
          <View className="flex-row items-center justify-between mt-4">
            {Array.from({ length: 7 }).map((_, index) => {
              const date = new Date(selectedDate);
              date.setDate(date.getDate() - 3 + index);
              const isSelected = date.toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0];
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const dateToCompare = new Date(date);
              dateToCompare.setHours(0, 0, 0, 0);
              const isPastDate = dateToCompare <= today;

              return (
                <Pressable
                  key={index}
                  onPress={() => setSelectedDate(new Date(date))}
                  style={{
                    width: 35,
                    height: 88,
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
                  <Text
                    className={`w-[24px] h-[24px] text-center text-xs ${
                      isSelected ? 'text-gray-800' : 'text-gray-500'
                    }`}
                  >
                    {date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0).toUpperCase()}
                  </Text>
                  <Text
                    className={`w-[19px] h-[24px] text-center text-xs ${
                      isSelected ? 'text-gray-800' : 'text-gray-500'
                    }`}
                  >
                    {date.getDate()}
                  </Text>

                  {isPastDate ? (
                    <Image
                      source={require('../../../../assets/icons/elipse.png')}
                      style={{ width: 22, height: 22, borderRadius: 20 }}
                      resizeMode="contain"
                    />
                  ) : (
                    <View
                      className={`w-[19px] h-6 rounded-full flex items-center justify-center bg-[#B0B0B0]`}
                    />
                  )}
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
              <View className="w-full h-[56px] flex-row items-center justify-between border-t border-[#FAE5CA] px-6 py-4"
                style={{ paddingTop: 16, paddingBottom: 16 }}>
                <Text className="text-lg font-semibold text-[#2A1800]">Today's Tasks</Text>
              </View>
              <View className="bg-white px-4">
                {filteredTasks.length === 0 ? (
                  <View className="items-center justify-center py-12">
                    <Text className="text-gray-500">There is no task for today</Text>
                  </View>
                ) : (
                  filteredTasks.map((task, index) => (
                    // SIMPLIFIED TASK CARD FOR CARE RECEIVERS
                    <View 
                      key={index}
                      className="border rounded-lg p-4 mb-4"
                      style={{
                        borderWidth: 1.5,
                        borderColor: '#2A1800',
                        borderRadius: 12,
                        backgroundColor: '#FFFFFF'
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
                        <MaterialIcons
                          name="flag"
                          size={20}
                          color={getPriorityColor(task.priority as any)}
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

                      {/* Assigned By - with updated typography */}
                      <View className="flex-row items-center mb-4 pl-2">
                        <Text 
                          className="mr-1"
                          style={{
                            color: '#000',
                            fontFamily: 'Lato',
                            fontSize: 14,
                            fontWeight: '300',
                            lineHeight: 24,
                            letterSpacing: -0.1
                          }}
                        >
                          Assigned by
                        </Text>
                        <Image
                          source={{ uri: getAvatarUrl(task.assignedBy) }}
                          className="w-6 h-6 rounded-full"
                        />
                      </View>

                      {/* Action Buttons */}
                      <View className="flex-row justify-between mt-2">
                        <Pressable
                          onPress={() => handleSkipTask(task)}
                          className="py-2 px-6 rounded-full border border-[#2A1800]"
                        >
                          <Text className="text-[#2A1800]">Skipped</Text>
                        </Pressable>

                        <Pressable
                          onPress={() => handleTakeTask(task)}
                          className="py-2 px-8 rounded-full bg-[#2A1800]"
                        >
                          <Text className="text-white">Taken</Text>
                        </Pressable>
                      </View>
                    </View>
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
                  <Text className="text-lg font-semibold">High Priority Today</Text>
                  <Link href="/dashboard/mydashboard/task/createTask" asChild>
                    <Pressable
                      className="absolute right-6 w-10 h-10 items-center justify-center bg-black rounded-full"
                    >
                      <MaterialIcons name="add" size={18} color="white" />
                    </Pressable>
                  </Link>
                </View>
                <View className="px-4">
                  {filteredTasks.filter(task => task.priority === 'high').length === 0 ? (
                    <View className="items-center justify-center py-8">
                      <Text className="text-gray-500 text-center">
                        You have no assigned task.{'\n'}Add task and set priority
                      </Text>
                    </View>
                  ) : (
                    filteredTasks.filter(task => task.priority === 'high').map((task, index) => (
                      <View
                        key={index}
                        className="border border-[#FAE5CA] rounded-lg p-4 mb-4 bg-white"
                      >
                        <Text className="text-sm font-semibold text-[#2A1800]">{task.title}</Text>
                        <Text className="text-xs text-[#666]">{task.description}</Text>
                      </View>
                    ))
                  )}
                </View>
              </View>
            )}

            {/* Regular Dashboard Timeline View */}
            <View className="flex-1 mt-6">
              <View className="mb-0">
                <View className="w-full h-[56px] flex-row items-center justify-between border-t border-[#FAE5CA] px-6 py-4">
                  <Text className="text-lg font-semibold text-[#2A1800]">Today Schedule</Text>

                  {/* Group Selector Dropdown */}
                  {!isCareReceiver && (
                    <View style = {{paddingTop: 16}}>
                      <Pressable 
                        onPress={(e) => {
                          e.stopPropagation();
                          setShowTaskFilter(false);
                          setShowGroupSelector(!showGroupSelector);
                        }}
                        style={{
                          display: 'flex',
                          width: 153,
                          height: 44,
                          padding: 8,
                          paddingLeft: 12,
                          paddingRight: 8,
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexShrink: 0,
                          borderRadius: 4, // Assuming var(--radius) is 4px
                          borderWidth: 1,
                          borderColor: '#FAE5CA',
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
                      
                      {/* Dropdown menu */}
                      {showGroupSelector && (
                        <View
                          className="absolute top-12 right-0 bg-white rounded-md border border-gray-300 z-10 w-40"
                          style={{ 
                            position: 'absolute',
                            top: 44 + 16, // Height of selector (44) + paddingTop (16)
                            right: 0,
                            backgroundColor: 'white',
                            borderRadius: 4,
                            borderWidth: 1,
                            borderColor: '#FAE5CA',
                            zIndex: 10,
                            width: 153, // Same width as selector
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
                              onPress={(e) => {
                                e.stopPropagation();
                                handleGroupChange(group.name);
                              }}
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
                </View>

                {/* Filter Options */}
                {!isCareReceiver && (
                  <View 
                    style={{
                      display: 'flex',
                      height: 44,
                      padding: 0,
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: 8
                    }}
                    className="px-6 py-2"
                  >
                    <View className="flex-row justify-between w-full">
                      {/* Task Assignment Filter */}
                      <View>
                        <Pressable 
                          className="flex-row items-center"
                          onPress={(e) => {
                            e.stopPropagation();
                            setShowGroupSelector(false);
                            setShowTaskFilter(!showTaskFilter);
                          }}
                        >
                          <Text className="text-sm text-[#333] mr-1">{selectedTaskFilter}</Text>
                          <MaterialIcons 
                            name={showTaskFilter ? "arrow-drop-up" : "arrow-drop-down"} 
                            size={20} color="#333" 
                          />
                        </Pressable>
                        
                        {/* Dropdown menu for task filter */}
                        {showTaskFilter && (
                          <View
                            className="absolute top-8 left-0 bg-white rounded-md border border-gray-300 z-10 w-40"
                            style={{ elevation: 5 }}
                          >
                            {['My Tasks', "Brother's Tasks", "All Tasks"].map((option, index) => (
                              <Pressable
                                key={index}
                                className={`py-2 px-3 ${index < 2 ? 'border-b border-gray-200' : ''}`}
                                onPress={(e) => {
                                  e.stopPropagation();
                                  handleTaskFilterChange(option);
                                }}
                              >
                                <Text 
                                  style={{ color: '#2A1800' }}
                                  className={selectedTaskFilter === option ? 'font-bold' : 'font-normal'}
                                >
                                  {option}
                                </Text>
                              </Pressable>
                            ))}
                          </View>
                        )}
                      </View>
                      
                      {/* Assigned By Filter */}
                      <Pressable 
                        className="flex-row items-center"
                        onPress={closeAllDropdowns}
                      >
                        <Text className="text-sm text-[#333] mr-2">Assigned by</Text>
                        <Image
                          source={{ uri: 'https://via.placeholder.com/24' }} // Replace with actual avatar
                          className="w-6 h-6 rounded-full"
                        />
                      </Pressable>
                    </View>
                  </View>
                )}
                <View className="bg-white rounded-xl p-4">
                  {filteredTasks.length === 0 ? (
                    <View className="items-center justify-center py-12">
                      <Text className="text-gray-500">There is no task for today</Text>
                    </View>
                  ) : (
                    groupTasksByTimeAndType(filteredTasks).map((group, index) => (
                      <View key={index} className="flex-row">
                        {/* Timeline Marker */}
                        <View className="flex-row items-stretch">                 
                          <DashboardTimelineMarker
                            time={group.time}
                            isFirst={index === 0}
                            isLast={index === groupTasksByTimeAndType(filteredTasks).length - 1}
                          />
                        </View>

                        {/* Task Group */}
                        <View className="flex-1 ml-4">
                          <Text className="text-sm font-semibold text-[#2A1800] mb-2">{group.time}</Text>
                          {group.tasks.map((task, taskIndex) => (
                            <View
                              key={taskIndex}
                              className="border border-[#FAE5CA] rounded-lg p-4 mb-4"
                              style={{
                                borderWidth: 1.5,
                                borderColor: '#2A1800',
                                borderRadius: 8,
                                backgroundColor: '#FFFFFF',
                                marginBottom: 16,
                              }}
                            >
                              <Pressable onPress={() => handleTaskPress(task)} className="flex-1">
                                {/* Task content */}
                                <View className="flex-row items-center justify-between mb-2">
                                  <View className="flex-row items-center gap-4 flex-1">
                                    <MaterialIcons
                                      name={task.type === 'medicine' ? 'medication' : 'home'}
                                      size={24}
                                      color="#666"
                                    />
                                    <MaterialIcons
                                      name="flag"
                                      size={20}
                                      color={getPriorityColor(task.priority as any)}
                                    />
                                    <Text
                                      style={{ fontFamily: 'Lato', fontSize: 16 }}
                                      className="text-sm font-bold text-[#2A1800] flex-shrink"
                                    >
                                      {task.title}
                                    </Text>
                                  </View>
                                  <Image
                                    source={{ uri: getAvatarUrl(task.assignedTo) }}
                                    className="w-6 h-6 rounded-full"
                                  />
                                </View>

                                {/* Second Line */}
                                <View className="flex-row items-center gap-4 mb-2">
                                  <Text
                                    style={{ fontFamily: 'Lato', fontSize: 14 }}
                                    className="text-xs font-lato text-[#666] flex-1"
                                  >
                                    {task.description}
                                  </Text>
                                  <Pressable
                                    onPress={() => console.log('Task completed:', task.title)}
                                    className="w-6 h-6 border border-[#2A1800] rounded-lg flex items-center justify-center"
                                  >
                                    {task.checked && (
                                      <MaterialIcons name="check" size={16} color="#2A1800" />
                                    )}
                                  </Pressable>
                                </View>

                                {/* Third Line */}
                                <View className="flex-row items-center justify-between gap-4">
                                  <View className="flex-row items-center gap-2">
                                    <Text
                                      style={{ fontFamily: 'Lato', fontSize: 14 }}
                                      className="text-xs text-[#666]"
                                    >
                                      Assigned by
                                    </Text>
                                    <Image
                                      source={{ uri: getAvatarUrl(task.assignedBy) }}
                                      className="w-6 h-6 rounded-full"
                                    />
                                  </View>
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
                          ))}
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