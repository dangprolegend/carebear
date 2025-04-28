import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { Lock, Bell } from 'lucide-react-native';

const TaskItem = ({ time, title, detail }: { time: string; title: string; detail: string }) => (
  <View>
    <Text className="text-xs text-gray-500 mb-1">{time}</Text>
    <Text className="text-sm font-medium">{title}</Text>
    <Text className="text-xs text-gray-400">{detail}</Text>
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
  return (
    <View className="flex-1 bg-white">
      {/* Date and Calendar */}
      <View className="px-4 flex-row items-center justify-center mb-4">
        {/* Calendar Icon */}
        <Image
          source={require('../../../assets/icons/calendar.png')} // Adjust the path if needed
          style={{
            width: 20,
            height: 20,
            marginRight: 8, // Add spacing between the icon and the text
          }}
        />
        {/* Date */}
        <Text className="text-center text-sm text-gray-600">05/13/2025</Text>
      </View>

      <ScrollView className="flex-1 mt-4" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Today Schedule */}
        <View className="px-4 mb-6">
          <Text className="text-base font-semibold mb-2">Today Schedule</Text>

          {/* Today Tasks */}
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

            {/* Task List */}
            <View className="space-y-4">
              <TaskItem time="8:00 am" title="Medicine 1" detail="1 Tablet" />
              <TaskItem time="12:00 pm" title="Supplement 1" detail="1 Tablet" />
              {/* Add more tasks here */}
            </View>
          </View>
        </View>

        {/* Your Health */}
        <View className="px-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-base font-semibold">Your Health</Text>
            <Pressable>
              <Text className="text-sm text-blue-500">Edit</Text>
            </Pressable>
          </View>

          {/* Health Metrics */}
          <View className="flex-row flex-wrap justify-between">
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
      </ScrollView>
    </View>
  );
}