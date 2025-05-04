import { View, Text } from 'react-native';
import { useState } from 'react';
import { Agenda } from 'react-native-calendars';
import dayjs from 'dayjs';

// Define custom item type
type CustomAgendaItem = {
  name: string;
  height?: number;
  day?: string;
  detail?: string;
  subDetail?: string;
};

export default function Dashboard() {
  const [items, setItems] = useState<{ [key: string]: CustomAgendaItem[] }>({});
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));

  const loadItems = (day: any) => {
    const newItems: { [key: string]: CustomAgendaItem[] } = {};

    for (let i = -15; i < 15; i++) {
      const date = dayjs(day.dateString).add(i, 'day').format('YYYY-MM-DD');

      if (!newItems[date]) {
        newItems[date] = [];

        if (i === 0) {
          newItems[date].push(
            { name: 'Medicine 1', detail: '1 Tablet', subDetail: 'Take with water', height: 80 },
            { name: 'Exercise', detail: '30 min', subDetail: 'Morning workout', height: 80 },
            { name: 'Lunch', detail: 'Healthy meal', subDetail: 'Include vegetables', height: 80 }
          );
        } else {
          newItems[date].push({ name: 'No Tasks', height: 50 });
        }
      }
    }

    setItems(newItems);
  };

  const renderItem = (item: CustomAgendaItem) => (
    <View className="bg-gray-100 p-4 rounded-lg mb-2">
      <Text className="text-sm font-medium">{item.name}</Text>
      {item.subDetail && <Text className="text-xs text-gray-500">{item.subDetail}</Text>}
      {item.detail && <Text className="text-xs text-gray-400 mt-1">{item.detail}</Text>}
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Agenda Calendar */}
      <Agenda
        items={items}
        selected={selectedDate}
        loadItemsForMonth={loadItems}
        renderItem={renderItem}
        showClosingKnob={true}
        onDayPress={(day: any) => setSelectedDate(day.dateString)}
        theme={{
          agendaTodayColor: 'red',
        }}
      />

      {/* Your Health Section */}
      <View className="px-4 mt-4">
        <Text className="text-base font-semibold mb-2">Your Health</Text>
        <View className="flex-row flex-wrap justify-between">
          <HealthMetric label="Sleep" value="81%" detail="6 hr 15 min / 8 hr" />
          <HealthMetric label="Steps" value="81%" detail="9,500 / 10,000" />
          <HealthMetric label="Weight" value="81%" detail="55 kg / 50 kg" />
          <HealthMetric label="Workout" value="81%" detail="650 cal / 1 hr" />
        </View>
      </View>
    </View>
  );
}

// Reuse your HealthMetric component
const HealthMetric = ({ label, value, detail }: { label: string; value: string; detail: string }) => (
  <View className="w-[48%] bg-gray-100 p-4 rounded-lg mb-4">
    <Text className="text-sm font-medium">{label}</Text>
    <Text className="text-lg font-bold mt-2">{value}</Text>
    <Text className="text-xs text-gray-500 mt-1">{detail}</Text>
  </View>
);
