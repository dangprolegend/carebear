import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { useState } from 'react';

const TaskItem = ({ time, title, detail, subDetail }: { time: string; title: string; detail: string; subDetail: string }) => (
  <View className="flex-row items-start mb-4">
    {/* Time */}
    <View className="w-16">
      <Text className="text-xs text-gray-500">{time}</Text>
    </View>

    {/* Vertical Line */}
    <View className="items-center">
      <View className="w-2 h-2 bg-gray-500 rounded-full mb-1" />
      <View className="h-full w-[1px] bg-gray-300" />
    </View>

    {/* Task Details */}
    <View className="flex-1 ml-4 bg-gray-100 p-3 rounded-lg">
      <Text className="text-sm font-medium">{title}</Text>
      <Text className="text-xs text-gray-500">{subDetail}</Text>
      <Text className="text-xs text-gray-400 mt-1">{detail}</Text>
    </View>
  </View>
);

const HealthMetric = ({ label, value, detail }: { label: string; value: string; detail: string }) => (
  <View className="w-[48%] bg-gray-100 p-4 rounded-lg mb-4">
    <Text className="text-sm font-medium">{label}</Text>
    <Text className="text-lg font-bold mt-2">{value}</Text>
    <Text className="text-xs text-gray-500 mt-1">{detail}</Text>
  </View>
);

export default function Dashboard() {
  const [showTodaySchedule, setShowTodaySchedule] = useState(true);
  const [showYourHealth, setShowYourHealth] = useState(true);

  const handleCalendarBackward = () => {
    console.log('Move calendar backward');
  };

  const handleCalendarForward = () => {
    console.log('Move calendar forward');
  };

  const tasks = [
    { time: '8:00 am', title: 'Medicine 1', detail: '1 Tablet', subDetail: 'Take with water' },
    { time: '9:00 am', title: 'Supplement 1', detail: '1 Tablet', subDetail: 'Take after breakfast' },
    { time: '10:00 am', title: 'Exercise', detail: '30 min', subDetail: 'Morning workout' },
    { time: '12:00 pm', title: 'Lunch', detail: 'Healthy meal', subDetail: 'Include vegetables' },
    { time: '2:00 pm', title: 'Meeting', detail: '1 hr', subDetail: 'Discuss project updates' },
    { time: '4:00 pm', title: 'Snack', detail: 'Fruit', subDetail: 'Eat an apple' },
    { time: '6:00 pm', title: 'Dinner', detail: 'Light meal', subDetail: 'Avoid heavy food' },
    { time: '8:00 pm', title: 'Reading', detail: '30 min', subDetail: 'Read a book' },
  ];

  return (
    <View className="flex-1 bg-white">
      {/* Date and Calendar */}
      <View className="px-4 flex-row items-center justify-between mb-4">
        {/* Backward Triangle */}
        <Pressable onPress={handleCalendarBackward}>
          <View
            style={{
              width: 0,
              height: 0,
              borderTopWidth: 6,
              borderBottomWidth: 6,
              borderRightWidth: 6,
              borderStyle: 'solid',
              borderTopColor: 'transparent',
              borderBottomColor: 'transparent',
              borderRightColor: 'gray',
            }}
          />
        </Pressable>

        {/* Calendar Icon and Date */}
        <View className="flex-row items-center">
          <Image
            source={require('../../../assets/icons/calendar.png')}
            style={{
              width: 20,
              height: 20,
              marginRight: 8,
            }}
          />
          <Text className="text-center text-sm text-gray-600">05/13/2025</Text>
        </View>

        {/* Forward Triangle */}
        <Pressable onPress={handleCalendarForward}>
          <View
            style={{
              width: 0,
              height: 0,
              borderTopWidth: 6,
              borderBottomWidth: 6,
              borderLeftWidth: 6,
              borderStyle: 'solid',
              borderTopColor: 'transparent',
              borderBottomColor: 'transparent',
              borderLeftColor: 'gray',
            }}
          />
        </Pressable>
      </View>

      {/* Calendar Days */}
      <View className="px-4">
        <View className="flex-row justify-between">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => {
            const currentDate = 13; // Example: Current date is the 13th
            const date = 9 + idx; // Example: Dates start from 9
            let indicatorColor = 'white'; // Default color for upcoming dates

            if (date < currentDate) {
              indicatorColor = 'gray'; // Passed dates
            } else if (date === currentDate) {
              indicatorColor = 'red'; // Current date
            }

            return (
              <View key={idx} className="items-center">
                <Text className="text-xs text-gray-500">{day}</Text>
                <View className="w-8 h-8 mt-1 rounded-full bg-gray-200 items-center justify-center">
                  <Text className="text-xs">{date}</Text>
                </View>
                {/* Indicator */}
                <View
                  style={{
                    width: 8,
                    height: 8,
                    backgroundColor: indicatorColor,
                    borderRadius: 4, // Makes it a circle
                    marginTop: 4,
                  }}
                />
              </View>
            );
          })}
        </View>
      </View>

      <ScrollView className="flex-1 mt-4" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Today Schedule */}
        <View className="px-4 mb-6">
          <Pressable
            onPress={() => setShowTodaySchedule(!showTodaySchedule)}
            className="flex-row items-center bg-blue-100 p-3 rounded-lg justify-between"
          >
            <Text className="text-base font-semibold">Today Schedule</Text>
            <View
              style={{
                width: 0,
                height: 0,
                borderTopWidth: 6,
                borderBottomWidth: 6,
                borderLeftWidth: 6,
                borderStyle: 'solid',
                borderTopColor: 'transparent',
                borderBottomColor: 'transparent',
                borderLeftColor: showTodaySchedule ? 'blue' : 'gray',
              }}
            />
          </Pressable>
          {showTodaySchedule && (
            <View className="bg-gray-100 rounded-lg p-4 mb-4">
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm font-medium">Today Tasks</Text>
                <View className="flex-row space-x-2">
                  <Pressable className="px-2 py-1 bg-white rounded-full">
                    <Text className="text-xs">View</Text>
                  </Pressable>
                  <Pressable className="px-2 py-1 bg-white rounded-full">
                    <Text className="text-xs">Edit</Text>
                  </Pressable>
                </View>
              </View>

              {/* Task List with Scrollable Limit */}
              <ScrollView style={{ maxHeight: 200 }} contentContainerStyle={{ flexGrow: 1 }}>
                {tasks.map((task, index) => (
                  <TaskItem
                    key={index}
                    time={task.time}
                    title={task.title}
                    detail={task.detail}
                    subDetail={task.subDetail}
                  />
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Your Health */}
        <View className="px-4">
          <Pressable
            onPress={() => setShowYourHealth(!showYourHealth)}
            className="flex-row items-center bg-green-100 p-3 rounded-lg justify-between"
          >
            <Text className="text-base font-semibold">Your Health</Text>
            <View
              style={{
                width: 0,
                height: 0,
                borderTopWidth: 6,
                borderBottomWidth: 6,
                borderLeftWidth: 6,
                borderStyle: 'solid',
                borderTopColor: 'transparent',
                borderBottomColor: 'transparent',
                borderLeftColor: showYourHealth ? 'green' : 'gray',
              }}
            />
          </Pressable>
          {showYourHealth && (
            <View>
              {/* Health Metrics */}
              <View className="flex-row flex-wrap justify-between mt-4">
                <HealthMetric label="Sleep" value="81%" detail="6 hr 15 min / 8 hr" />
                <HealthMetric label="Steps" value="81%" detail="9,500 / 10,000" />
                <HealthMetric label="Weight" value="81%" detail="55 kg / 50 kg" />
                <HealthMetric label="Workout" value="81%" detail="650 cal / 1 hr" />
              </View>

              {/* Add more section */}
              <Pressable className="flex-row items-center justify-center bg-gray-100 p-4 rounded-lg">
                <Text className="text-sm text-gray-500">Add More</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}