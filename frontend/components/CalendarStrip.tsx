import React, { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Calendar from 'expo-calendar';

type CalendarStripProps = {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  // might want to pass down calendarEvents if intend to display them
  // or pass a function to fetch them based on the selectedDate in the parent
  // calendarEvents: Calendar.Event[]; 
};

const CalendarStrip = ({ selectedDate, setSelectedDate }: CalendarStripProps) => {
  const [calendarEvents, setCalendarEvents] = useState<Calendar.Event[]>([]);

  useEffect(() => {
    (async () => {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        const defaultCalendar = calendars[0];

        const startDate = new Date(selectedDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(selectedDate);
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
  );
};

export default CalendarStrip;