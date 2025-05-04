import { View, Text, ScrollView, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import * as Calendar from 'expo-calendar';
import { MaterialIcons } from '@expo/vector-icons';

// Task item component with timeline design
const TaskItem = ({ 
  time, 
  title, 
  detail, 
  subDetail, 
  type = 'default',
  checked = false 
}: { 
  time: string;
  title: string;
  detail?: string;
  subDetail?: string;
  type?: 'default' | 'help' | 'meal';
  checked?: boolean;
}) => (
  <View className="flex-row items-start mb-6">
    {/* Time and Timeline */}
    <View className="w-20">
      <Text className="text-xs text-gray-500">{time}</Text>
      <View className="absolute left-20 h-full w-[1px] bg-gray-200" />
      <View className="absolute left-[77px] top-2 w-2 h-2 rounded-full bg-gray-400" />
    </View>

    {/* Task Card */}
    <View className="flex-1 ml-8">
      <View className={`p-4 rounded-lg border border-gray-100 ${
        type === 'help' ? 'bg-brown-600' : 'bg-white'
      }`}>
        <View className="flex-row items-center">
          {checked ? (
            <MaterialIcons name="check-circle" size={20} color="#4CAF50" className="mr-2" />
          ) : (
            <Pressable className="w-5 h-5 border-2 border-gray-300 rounded mr-2" />
          )}
          <View className="flex-1">
            <Text className={`text-sm font-medium ${
              type === 'help' ? 'text-white' : 'text-gray-800'
            }`}>{title}</Text>
            {subDetail && (
              <Text className={`text-xs mt-1 ${
                type === 'help' ? 'text-gray-200' : 'text-gray-500'
              }`}>{subDetail}</Text>
            )}
          </View>
          {detail && (
            <Text className={`text-xs ${
              type === 'help' ? 'text-gray-200' : 'text-gray-500'
            }`}>{detail}</Text>
          )}
        </View>
      </View>
    </View>
  </View>
);

// Health metric component
const HealthMetric = ({ label, value, detail }: {
  label: string;
  value: string;
  detail: string;
}) => (
  <View className="w-[48%] bg-gray-100 p-4 rounded-lg mb-4">
    <Text className="text-sm font-medium">{label}</Text>
    <Text className="text-lg font-bold mt-2">{value}</Text>
    <Text className="text-xs text-gray-500 mt-1">{detail}</Text>
  </View>
);

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showTodaySchedule, setShowTodaySchedule] = useState(true);
  const [showYourHealth, setShowYourHealth] = useState(true);
  const [calendarEvents, setCalendarEvents] = useState<Calendar.Event[]>([]);

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

  // Example tasks with proper timeline format
  const tasks = [
    { time: '8:00 am', title: 'Breakfast', type: 'meal' as const },
    { time: '8:00 am', title: 'Medicine 1', detail: '1 Tablet', subDetail: 'after breakfast', checked: true },
    { time: '8:00 am', title: 'Supplement 1', detail: '1 Tablet', subDetail: 'after breakfast' },
    { time: '12:00 pm', title: 'Lunch', type: 'meal' as const },
    { time: '12:00 pm', title: 'Supplement 1', detail: '1 Tablet', subDetail: 'after lunch' },
    { time: '1:00 pm', title: 'Help Grandm...', detail: 'Bedroom', type: 'help' as const },
    { time: '6:00 pm', title: 'Dinner', type: 'meal' as const },
    { time: '6:00 pm', title: 'Medicine 2', detail: '1 Tablet', subDetail: 'after dinner' },
    { time: '6:00 pm', title: 'Supplement 2', detail: '1 Tablet', subDetail: 'after dinner' },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 pt-4">
        {/* Calendar Strip */}
        <View className="flex-row items-center justify-between mt-6">
          <MaterialIcons name="chevron-left" size={24} color="#666" />
          <View className="flex-row items-center">
            <MaterialIcons name="calendar-today" size={20} color="#666" />
            <Text className="ml-2">
              {selectedDate.toLocaleDateString('en-US', { 
                month: '2-digit',
                day: '2-digit',
                year: 'numeric'
              })}
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#666" />
        </View>

        {/* Week Days */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="mt-4"
        >
          {Array.from({ length: 7 }).map((_, index) => {
            const date = new Date(selectedDate);
            date.setDate(date.getDate() - 3 + index);
            const isSelected = index === 3;

            return (
              <Pressable
                key={index}
                className={`items-center mx-2 px-4 py-2 rounded-2xl ${
                  isSelected ? 'bg-blue-100' : ''
                }`}
              >
                <Text className={`text-xs ${isSelected ? 'text-blue-500' : 'text-gray-500'}`}>
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </Text>
                <Text className={`text-sm mt-1 ${isSelected ? 'text-blue-500' : 'text-gray-500'}`}>
                  {date.getDate()}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView className="flex-1 mt-6">
        {/* Today Schedule */}
        <View className="px-4 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold">Today Schedule</Text>
            <View className="flex-row space-x-2">
              <Pressable className="flex-row items-center px-3 py-1 bg-gray-100 rounded-full">
                <MaterialIcons name="visibility" size={16} color="#666" />
                <Text className="ml-1 text-sm text-gray-600">View</Text>
              </Pressable>
              <Pressable className="flex-row items-center px-3 py-1 bg-gray-100 rounded-full">
                <MaterialIcons name="edit" size={16} color="#666" />
                <Text className="ml-1 text-sm text-gray-600">Edit</Text>
              </Pressable>
            </View>
          </View>

          <View className="bg-white rounded-xl p-4">
            {tasks.map((task, index) => (
              <TaskItem key={index} {...task} />
            ))}
          </View>
        </View>

        {/* Your Health Section */}
        <View className="px-4">
          <Pressable
            onPress={() => setShowYourHealth(!showYourHealth)}
            className="flex-row items-center justify-between bg-green-50 p-4 rounded-xl"
          >
            <Text className="text-lg font-semibold">Your Health</Text>
            <MaterialIcons 
              name={showYourHealth ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
              size={24} 
              color="#666" 
            />
          </Pressable>

          {showYourHealth && (
            <View className="mt-4">
              <View className="flex-row flex-wrap justify-between">
                <HealthMetric label="Sleep" value="81%" detail="6 hr 15 min / 8 hr" />
                <HealthMetric label="Steps" value="81%" detail="9,500 / 10,000" />
                <HealthMetric label="Weight" value="81%" detail="55 kg / 50 kg" />
                <HealthMetric label="Workout" value="81%" detail="650 cal / 1 hr" />
              </View>

              <Pressable className="flex-row items-center justify-center bg-white p-4 rounded-xl mt-4">
                <MaterialIcons name="add" size={20} color="#666" />
                <Text className="ml-2 text-gray-600">Add More</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}