import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
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
                          source={require('../assets/icons/elipse.png')}
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
  );
};

export default CalendarStrip;