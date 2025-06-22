import { useState, useEffect } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Calendar from 'expo-calendar';
import Svg, { Circle, Path } from 'react-native-svg';

type CalendarStripProps = {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  userID: string; // Added userID as a prop
  // might want to pass down calendarEvents if intend to display them
  // or pass a function to fetch them based on the selectedDate in the parent
  // calendarEvents: Calendar.Event[]; 
};

const CalendarStrip = ({ selectedDate, setSelectedDate, userID }: CalendarStripProps) => {
  const [calendarEvents, setCalendarEvents] = useState<Calendar.Event[]>([]);
  const [userCreatedDate, setUserCreatedDate] = useState<Date | null>(null);
  const [taskCompletionByDate, setTaskCompletionByDate] = useState<{[dateKey: string]: number}>({});
  const [primaryGroupId, setPrimaryGroupId] = useState<string | null>(null);

  const CircularProgress = ({ percentage, size = 18 }: { percentage: number; size?: number }) => {
    const radius = size / 2;
    const centerX = size / 2;
    const centerY = size / 2;
    
    // Calculate the end point of the arc based on percentage
    const angle = (percentage / 100) * 360 - 90; // Start from top (-90 degrees)
    const endX = centerX + radius * Math.cos((angle * Math.PI) / 180);
    const endY = centerY + radius * Math.sin((angle * Math.PI) / 180);
    
    // Large arc flag for arcs > 180 degrees
    const largeArcFlag = percentage > 50 ? 1 : 0;
    
    // Create path for filled arc
    const pathData = percentage === 0 
      ? '' 
      : `M ${centerX} ${centerY} L ${centerX} ${centerY - radius} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;

    return (
      <View className="relative" style={{ width: size, height: size }}>
        {/* Background circle with heart */}
        <View 
          className="bg-[#2A1800] rounded-full flex items-center justify-center"
          style={{ width: size, height: size }}
        >
          <Image 
            source={require('../assets/icons/heart.png')} // Adjust path to your heart icon
            style={{ width: size * 0.6, height: size * 0.6 }}
            resizeMode="contain"
          />
        </View>
        
        {/* Blue filled progress overlay with circular clipping */}
        {percentage > 0 && (
          <View 
            className="absolute top-0 left-0 rounded-full overflow-hidden"
            style={{ width: size, height: size }}
          >
            <Svg width={size} height={size}>
              <Path
                d={pathData}
                fill="#007AFF"
                opacity={0.8}
              />
            </Svg>
          </View>
        )}
      </View>
    );
  };
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