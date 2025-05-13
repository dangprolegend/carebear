import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Calendar from 'expo-calendar';
import { groupTasksByTimeAndType, TaskGroup, Task } from './task';
import { HealthMetric } from './healthmetric';

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
        {/* Today Schedule Section */}
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
              {groupTasksByTimeAndType(tasks).map((group, index) => (
                <TaskGroup key={index} time={group.time} type={group.type} tasks={group.tasks} />
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
  );
};

export default DashboardBase;