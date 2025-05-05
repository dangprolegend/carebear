import { View, Text, ScrollView, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import * as Calendar from 'expo-calendar';
import { MaterialIcons } from '@expo/vector-icons';

// First, create a helper function to group tasks
type Task = {
  time: string;
  type?: string;  // Remove the strict type constraint
  title: string;
  detail?: string;
  subDetail?: string;
  checked?: boolean;
};

type GroupedTask = {
  time: string;
  type?: string;  // Remove the strict type constraint
  tasks: Task[];
};

const groupTasksByTimeAndType = (tasks: Task[]): GroupedTask[] => {
  const grouped = tasks.reduce<Record<string, GroupedTask>>((acc, task) => {
    const key = `${task.time}-${task.type || 'default'}`;
    if (!acc[key]) {
      acc[key] = {
        time: task.time,
        type: task.type,
        tasks: []
      };
    }
    acc[key].tasks.push(task);
    return acc;
  }, {});
  return Object.values(grouped);
};

const TaskGroup = ({ 
  time, 
  type,
  tasks
}: { 
  time: string;
  type?: string;
  tasks: Task[];
}) => (
  <View className="mb-6">
    {/* Time and Type Header */}
    <View className="flex-row items-center mb-2">
      <Text className="text-xs text-gray-500 w-20">{time}</Text>
      {type && (
        <Text className="text-xs text-gray-500 ml-2">
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Text>
      )}
    </View>

    <View className="space-y-4 w-full">
      {tasks.map((task, index) => (
        <View 
          key={index}
          className="p-4 rounded-lg border-[1.5px] border-gray-300 w-full bg-[#F7F7F7]"
        >
          <View className="flex-row items-start justify-between w-full">
            {/* Task Content */}
            <View className="flex-1 mr-4">
              {/* Title */}
              <Text className="text-sm font-bold text-black">
                {task.title}
              </Text>
              {/* Detail and SubDetail in same row */}
              <View className="flex-row items-center mt-1">
                {task.detail && (
                  <Text className="text-xs text-gray-500">
                    {task.detail}
                  </Text>
                )}
                {task.subDetail && (
                  <Text className="text-xs text-gray-500 ml-2">
                    {task.subDetail}
                  </Text>
                )}
              </View>
            </View>

            {/* Checkbox moved to right */}
            {task.checked ? (
              <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
            ) : (
              <Pressable className="w-5 h-5 border-2 border-gray-300 rounded bg-white" />
            )}
          </View>
        </View>
      ))}
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
    { time: '8:00 am', type: 'Breakfast' as const, title: 'Medicine 1', detail: '1 Tablet', subDetail: 'after breakfast', checked: true },
    { time: '8:00 am', type: 'Breakfast' as const, title: 'Supplement 1', detail: '1 Tablet', subDetail: 'after breakfast' },
    { time: '12:00 pm', type: 'Lunch' as const, title: 'Supplement 1', detail: '1 Tablet', subDetail: 'after lunch' },
    { time: '1:00 pm', type: 'Lunch' as const, title: 'Help Grandm...', detail: 'Bedroom'},
    { time: '6:00 pm',  type: 'Dinner' as const, title: 'Medicine 2', detail: '1 Tablet', subDetail: 'after dinner' },
    { time: '6:00 pm',  type: 'Dinner' as const, title: 'Supplement 2', detail: '1 Tablet', subDetail: 'after dinner' },
  ];

  return (
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
                year: 'numeric'
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
        <View 
          className="flex-row items-center justify-between mt-4"
        >
          {Array.from({ length: 7 }).map((_, index) => {
          const date = new Date(selectedDate);
          date.setDate(date.getDate() - 3 + index);
          const isSelected = date.toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0];

          return (
            <Pressable
              key={index}
              onPress={() => setSelectedDate(new Date(date))}
              className={`w-[40px] h-[88px] items-center mx-2 p-2 space-y-1 ${
                isSelected ? 
                'bg-[#EBEBEB] rounded-[100px] border border-gray-200' : 
                ''
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
        {/* Today Schedule */}
          <View className="px-4 mb-6">
            {/* Today Schedule Header */}
            <Pressable
              onPress={() => setShowTodaySchedule(!showTodaySchedule)}
              className="w-[393px] h-[56px] flex-row items-center justify-between border-t border-b border-gray-200 px-6 py-4"
            >
              <Text className="text-lg font-semibold">Today Schedule</Text>
              <MaterialIcons 
                name={showTodaySchedule ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                size={24} 
                color="#666" 
            />
            </Pressable>

            {showTodaySchedule && (
              <>
                {/* Today tasks text and View and Edit Buttons */}
                <View className="flex-row justify-between items-center mt-4 mb-2 px-6">
                  <Text className="text-base font-medium text-gray-800">Today Tasks</Text>
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

                {/* Today Schedule Content */}
                <View className="bg-white rounded-xl p-4">
                  {groupTasksByTimeAndType(tasks).map((group, index) => (
                    <TaskGroup 
                      key={index}
                      time={group.time}
                      type={group.type}
                      tasks={group.tasks}
                    />
                  ))}
                </View>
              </>
            )}
          </View>

        {/* Your Health Section */}
        <View className="px-4">
          <Pressable
            onPress={() => setShowYourHealth(!showYourHealth)}
            className="w-[393px] h-[56px] flex-row items-center justify-between border-t border-b border-gray-200 px-6 py-4"
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
      </View>
    </ScrollView>
  );
}