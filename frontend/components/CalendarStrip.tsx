import { useState, useEffect } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Calendar from 'expo-calendar';
import axios from 'axios';
import CircularProgress from './CircularProgress';

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

    const fetchUserCreatedDate = async (userID: string) => {
    try {
      const response = await axios.get(`https://mature-catfish-cheaply.ngrok-free.app/api/users/${userID}`);
      const createdDate = new Date(response.data.createdAt);
      setUserCreatedDate(createdDate);
      return createdDate;
    } catch (error) {
      console.error('Error fetching user created date:', error);
      return null;
    }
  };

  const fetchPrimaryGroupId = async (userID: string) => {
    try {
      const response = await axios.get(`https://carebear-backend.onrender.com/api/users/${userID}/group`);
      setPrimaryGroupId(response.data.groupID);
      return response.data.groupID;
    } catch (error) {
      console.error('Error fetching primary group ID:', error);
      return null;
    }
  };

  // Helper function to format date as YYYY-MM-DD
  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchTaskCompletionForDate = async (userID: string, groupID: string, date: Date) => {
    try {
      const dateKey = formatDateForAPI(date); // Use helper function for consistent formatting
      const response = await axios.get(`https://mature-catfish-cheaply.ngrok-free.app/api/tasks/user/${userID}/group/${groupID}/completion`, {
        params: {
          date: dateKey 
        }
      });
      const percentage = response.data.completionPercentage || 0;
      setTaskCompletionByDate(prev => ({
        ...prev,
        [dateKey]: percentage
      }));
      return percentage;
    } catch (error) {
      console.error(error);
      setTaskCompletionByDate(prev => ({
        ...prev,
        [formatDateForAPI(date)]: 0
      }));
      return 0;
    }
  };

   useEffect(() => {
    const fetchUserData = async () => {
      if (userID) { 
        const createdDate = await fetchUserCreatedDate(userID);
        const groupID = await fetchPrimaryGroupId(userID);
        
        if (createdDate && groupID) {
          const promises = [];
          for (let i = -3; i <= 3; i++) {
            const date = new Date(selectedDate);
            date.setDate(date.getDate() + i);
            
            if (date >= createdDate) {
              promises.push(fetchTaskCompletionForDate(userID, groupID, date));
            }
          }
          await Promise.all(promises);
        }
      }
    };
    
    fetchUserData();
  }, [userID, selectedDate]);

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
      
      // Fetch task completions for new week when selectedDate changes
      if (userID && primaryGroupId && userCreatedDate) {
        const promises = [];
        for (let i = -3; i <= 3; i++) {
          const date = new Date(selectedDate);
          date.setDate(date.getDate() + i);
          
          if (date >= userCreatedDate) {
            promises.push(fetchTaskCompletionForDate(userID, primaryGroupId, date));
          }
        }
        await Promise.all(promises);
      }
    })();
  }, [selectedDate, userID, primaryGroupId, userCreatedDate]);

  const shouldShowHeart = (date: Date) => {
    if (!userCreatedDate) return false;
    
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);
    const createdDateNormalized = new Date(userCreatedDate);
    createdDateNormalized.setHours(0, 0, 0, 0);
    
    return dateToCheck >= createdDateNormalized;
  };


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
                  const completionPercentage = taskCompletionByDate[formatDateForAPI(date)] || 0;
    
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
    
                      {shouldShowHeart(date) && completionPercentage > 0 ? (
                          <CircularProgress 
                            percentage={completionPercentage} 
                            size={20} 
                          />
                        ) : (
                          <View className="w-5 h-5" />
                        )}
                                </Pressable>
                                );
                              })}
                            </View>
                          </View>
                        );
                      };

export default CalendarStrip;