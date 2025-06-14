import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, View, Text, Pressable, Platform, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Calendar from 'expo-calendar';
import * as Notifications from 'expo-notifications';
import { groupTasksByTimeAndType, TaskGroup, Task } from './task';
import TaskCard from './taskcard';
import {Link, useRouter} from 'expo-router'
import DashboardTimelineMarker from '../../../../components/DashboardTimelineMarker';

// Configure how notifications are handled when app is in foreground
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
  userRole?: string; // Add userRole prop
};


const DashboardBase = ({ tasks = [], showHighPrioritySection = true, title = 'Dashboard', userRole = 'member' }: DashboardBaseProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState<Calendar.Event[]>([]);

  // Add state for TaskCard
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showTaskCard, setShowTaskCard] = useState(false);
  const router = useRouter();

  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  // Request notification permissions & setup listeners
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
      const matchedTask = tasks.find(t => t.id === taskId);
      
      if (matchedTask) {
        handleTaskPress(matchedTask);
      }
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);


  // Schedule notifications for all tasks
  useEffect(() => {
    scheduleAllTaskNotifications();
  }, [tasks]);
  
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


  // Function to handle task press
  const handleTaskPress = (task: Task) => {
    router.push({
      pathname: './task/taskInfo',
      params: { taskId: task._id, groupID: task.groupID?._id || task.groupID }
    });
  };

  const isTaskForSelectedDate = (task: Task) => {
  const taskDate = new Date(task.datetime);

  // Example fetch:
  // fetch(`${process.env.NGROK_API_URL}/api/tasks/682ed36cb380744bd1ed4559`)
  //   .then(res => res.json())
  //   .then(data => console.log(data));

  return (
    taskDate.getFullYear() === selectedDate.getFullYear() &&
    taskDate.getMonth() === selectedDate.getMonth() &&
    taskDate.getDate() === selectedDate.getDate()
  );
};


  // Filter tasks for the selected date
  const filteredTasks = tasks.filter(isTaskForSelectedDate);

  // Initialize calendar
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
        {/* Header */}
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

          {/* Week Days */}
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

      
        {/* High Priority Section */}
        {(() => {
          // Filter high priority tasks for the selected date
          const highPriorityTasks = filteredTasks.filter(task => task.priority === 'high');

          // Role-based feature visibility
          const shouldShowHighPrioritySection = showHighPrioritySection && (userRole === 'caregiver' || userRole === 'admin');

          return shouldShowHighPrioritySection && (
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
                {highPriorityTasks.length === 0 ? (
                  <View className="items-center justify-center py-8">
                    <Text className="text-gray-500 text-center">
                      You have no assigned task.{'\n'}Add task and set priority
                    </Text>
                  </View>
                ) : (
                  highPriorityTasks.map((task, index) => (
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
          );
        })()}


        {/* Today Schedule Section */}
        <View className="flex-1 mt-6">
          <View className="mb-0">
            <View
              className="w-full h-[56px] flex-row items-center justify-between border-t border-[#FAE5CA] px-6 py-4"
            >
              <Text className="text-lg font-semibold text-[#2A1800]">Today Schedule</Text>
            </View>
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
                        isLast={index === filteredTasks.length - 1}
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
                            borderWidth: 1.5, // Ensures the border is visible
                            borderColor: '#2A1800', // Matches the design
                            borderRadius: 8, // Adds rounded corners
                            backgroundColor: '#FFFFFF', // Keeps the background white
                            marginBottom: 16, // Adds spacing between tasks
                          }}
                        >
                          <Pressable onPress={() => router.push({
                              pathname: './task/taskInfo',
                              params: { taskId: task._id, groupID: task.groupID?._id || task.groupID }
                            })} className="flex-1">
                            {/* First Line */}
                            <View className="flex-row items-center justify-between mb-2">
                              <View className="flex-row items-center gap-4 flex-1">
                                {/* Medication or Home Icon */}
                                <MaterialIcons
                                  name={task.type === 'medicine' ? 'medication' : 'home'}
                                  size={24}
                                  color="#666"
                                />
                                {/* Flag Icon */}
                                <MaterialIcons
                                  name="flag"
                                  size={20}
                                  color={
                                    task.priority === 'high'
                                      ? '#FF0000'
                                      : task.priority === 'medium'
                                      ? '#FFD700'
                                      : '#0000FF'
                                  }
                                />
                                {/* Task Name */}
                                <Text
                                  style={{ fontFamily: 'Lato', fontSize: 16 }}
                                  className="text-sm font-bold text-[#2A1800] flex-shrink"
                                >
                                  {task.title}
                                </Text>
                              </View>
                              {/* Avatar of Assignee */}
                              <Image
                                source={{
                                  uri:
                                    typeof task.assignedTo === 'object' && task.assignedTo !== null && 'imageURL' in task.assignedTo
                                      ? (task.assignedTo as { imageURL: string }).imageURL
                                      : typeof task.assignedTo === 'string'
                                      ? task.assignedTo
                                      : 'https://via.placeholder.com/40',
                                }}
                                className="w-6 h-6 rounded-full"
                              />
                            </View>

                            {/* Second Line */}
                            <View className="flex-row items-center gap-4 mb-2">
                              {/* Brief Instruction */}
                              <Text
                                style={{ fontFamily: 'Lato', fontSize: 14 }}
                                className="text-xs font-lato text-[#666] flex-1"
                              >
                                {task.description}
                              </Text>
                              {/* Checkbox */}
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
                              {/* Assigned By */}
                              <View className="flex-row items-center gap-2">
                                <Text
                                  style={{ fontFamily: 'Lato', fontSize: 14 }}
                                  className="text-xs text-[#666]"
                                >
                                  Assigned by
                                </Text>
                                <Image
                                  source={{
                                    uri: task.assignedBy?.imageURL || 'https://via.placeholder.com/40',
                                  }}
                                  className="w-6 h-6 rounded-full"
                                />
                              </View>
                              {/* Notification Bell */}
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
                )))}
              </View>
          </View>
        </View>
      </ScrollView>
      <TaskCard
      visible={showTaskCard}
      onClose={() => setShowTaskCard(false)}
      task={selectedTask}
      />
   </>
  );
};

export default DashboardBase;