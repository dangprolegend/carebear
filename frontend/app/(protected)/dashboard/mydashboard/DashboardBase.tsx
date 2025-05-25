import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, View, Text, Pressable, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Calendar from 'expo-calendar';
import * as Notifications from 'expo-notifications';
import { groupTasksByTimeAndType, TaskGroup, Task } from './task';
import { HealthMetric } from './healthmetric';
import TaskCard from './taskcard';

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
  showHealthSection?: boolean; // Whether to show the health section
  title?: string; // Title for the dashboard
};


const DashboardBase = ({ tasks, showHealthSection = true, title = 'Dashboard' }: DashboardBaseProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showTodaySchedule, setShowTodaySchedule] = useState(true);
  const [showYourHealth, setShowYourHealth] = useState(true);
  const [calendarEvents, setCalendarEvents] = useState<Calendar.Event[]>([]);

  // Add state for TaskCard
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showTaskCard, setShowTaskCard] = useState(false);

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
    console.log('Task pressed:', task);
    const enhancedTask = {
      title: task.title,
      purpose: 'For pain relief and inflammation reduction',
      dosageStrength: task.detail,
      howToTake: 'Oral, by mouth',
      instructions: [
        task.subDetail,
      ],
      startDate: 'Monday, May 9, 2025',
      endDate: 'Saturday, May 17, 2025',
      importantNotes: [
        'Side effects: May cause drowsiness',
        'Do not take with alcohol',
        'Store in a cool, dry place',
        'Follow-up appointment: Sunday, May 19'
      ],
      contactNumber: '123-456-7890'
    };
    setSelectedTask(enhancedTask);
    setShowTaskCard(true);
  };

  const isTaskForSelectedDate = (task: Task) => {
  const taskDate = new Date(task.datetime);
  console.log('Task Date:', taskDate, 'Selected Date:', selectedDate);

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
      <ScrollView className="flex-1 bg-gray-50">
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
              <MaterialIcons name="chevron-left" size={24} color="#666" />
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
              <MaterialIcons name="chevron-right" size={24} color="#666" />
            </Pressable>
          </View>

          {/* Week Days */}
          <View className="flex-row items-center justify-between mt-4">
            {Array.from({ length: 7 }).map((_, index) => {
              const date = new Date(selectedDate);
              date.setDate(date.getDate() - 3 + index);
              const isSelected = date.toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0];

              return (
                <Pressable
                  key={index}
                  onPress={() => setSelectedDate(new Date(date))}
                  className={`w-[40px] h-[88px] items-center mx-2 p-2 space-y-1 ${
                    isSelected ? 'bg-[#EBEBEB] rounded-[100px] border border-gray-200' : ''
                  }`}
                >
                  <Text
                    className={`w-[24px] h-6 text-center text-xs ${
                      isSelected ? 'text-gray-800' : 'text-gray-500'
                    }`}
                  >
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </Text>
                  <Text
                    className={`w-[19px] h-6 text-center text-xs ${
                      isSelected ? 'text-gray-800' : 'text-gray-500'
                    }`}
                  >
                    {date.getDate()}
                  </Text>
                  <View
                    className={`w-[19px] h-6 rounded-full flex items-center justify-center bg-[#B0B0B0]`}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="flex-1 mt-6">
          {/* Schedule Section */}
          <View className="px-4 mb-6">
            <Pressable
              onPress={() => setShowTodaySchedule(!showTodaySchedule)}
              className="w-[393px] h-[56px] flex-row items-center justify-between border-t border-b border-gray-200 px-6 py-4"
            >
              <Text className="text-lg font-semibold">Today Schedule</Text>
              <MaterialIcons
                name={showTodaySchedule ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                size={24}
                color="#666"
              />
            </Pressable>

            {showTodaySchedule && (
              <View className="bg-white rounded-xl p-4">
                {groupTasksByTimeAndType(filteredTasks).map((group, index) => (
                  <TaskGroup key={index} time={group.time} type={group.type} 
                      tasks={group.tasks.map(task => ({
                        ...task,
                        onPress: () => handleTaskPress(task)
                      }))}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Your Health Section */}
          {showHealthSection && (
            <View className="px-4 pb-6">
              <Pressable
                onPress={() => setShowYourHealth(!showYourHealth)}
                className="w-[393px] h-[56px] flex-row items-center justify-between border-t border-b border-gray-200 px-6 py-4"
              >
                <Text className="text-lg font-semibold">Your Health</Text>
                <MaterialIcons
                  name={showYourHealth ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                  size={24}
                  color="#666"
                />
              </Pressable>

              {showYourHealth && (
                <View className="mt-4 pb-6">
                  <View className="flex-row flex-wrap justify-between">
                    <HealthMetric label="Sleep" value="81%" detail="6 hr 15 min / 8 hr" />
                    <HealthMetric label="Steps" value="81%" detail="9,500 / 10,000" />
                    <HealthMetric label="Weight" value="81%" detail="55 kg / 50 kg" />
                    <HealthMetric label="Workout" value="81%" detail="650 cal / 1 hr" />
                  </View>
                </View>
              )}
            </View>
          )}
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