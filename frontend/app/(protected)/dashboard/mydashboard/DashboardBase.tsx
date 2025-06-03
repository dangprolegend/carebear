import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, Pressable, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Calendar from 'expo-calendar';
import { groupTasksByTimeAndType, TaskGroup, Task } from './task';
import { HealthMetric } from './healthmetric';
import TaskCard from './taskcard';
import {Link} from 'expo-router'

type DashboardBaseProps = {
  tasks: Task[];
  showHealthSection?: boolean; 
  title?: string; 
};


const DashboardBase = ({ tasks = [], showHealthSection = true, title = 'Dashboard' }: DashboardBaseProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showTodaySchedule, setShowTodaySchedule] = useState(true);
  const [showYourHealth, setShowYourHealth] = useState(true);
  const [calendarEvents, setCalendarEvents] = useState<Calendar.Event[]>([]);

  // Add state for TaskCard
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showTaskCard, setShowTaskCard] = useState(false);


  // Function to handle task press
  const handleTaskPress = (task: Task) => {
    console.log('Task pressed:', task);
    const enhancedTask = {
      title: task.title,
      purpose: 'For pain relief and inflammation reduction',
      dosageStrength: task.detail,
      howToTake: 'Oral, by mouth',
      instructions: [
        task.subDetail,
      ],
      startDate: 'Monday, May 9, 2025',
      endDate: 'Saturday, May 17, 2025',
      importantNotes: [
        'Side effects: May cause drowsiness',
        'Do not take with alcohol',
        'Store in a cool, dry place',
        'Follow-up appointment: Sunday, May 19'
      ],
      contactNumber: '123-456-7890'
    };
    setSelectedTask(enhancedTask);
    setShowTaskCard(true);
  };

  const isTaskForSelectedDate = (task: Task) => {
  const taskDate = new Date(task.datetime);
  console.log('Task Date:', taskDate, 'Selected Date:', selectedDate);

  // Example fetch:
  // fetch(`${process.env.NGROK_API_URL}/api/tasks/682ed36cb380744bd1ed4559`)
  //   .then(res => res.json())
  //   .then(data => console.log(data));

  return (
    taskDate.getFullYear() === selectedDate.getFullYear() &&
    taskDate.getMonth() === selectedDate.getMonth() &&
    taskDate.getDate() === selectedDate.getDate()
  );
};


  // Filter tasks for the selected date
  const filteredTasks = tasks.filter(isTaskForSelectedDate);

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
    <>
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
                      source={require('../../../../assets/icons/elipse.png')}
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

      
          {/* High Priority */}
          <View className="mb-0 pt-7">
             <View className="w-full h-[56px] flex-row items-center justify-between border-t border-[#FAE5CA] px-6 py-4">
              <Text className="text-lg font-semibold">High Priority Today</Text>
              <Link href="/dashboard/mydashboard/task/createTask" asChild> 
              <Pressable
                className="pt-5 mr-2 absolute w-12 h-12 items-center justify-center right-6 bg-black rounded-full "
              >
                <MaterialIcons name="add" size={20} color="white" className="justify-center items-center pb-10" />
                
              </Pressable>
            </Link>
            </View>

            
          </View>

        <View className="flex-1 mt-6">
          {/* Schedule Section */}
          <View className="mb-0">
            <Pressable
              onPress={() => setShowTodaySchedule(!showTodaySchedule)}
              className="w-full h-[56px] flex-row items-center justify-between border-t border-b border-[#FAE5CA] px-6 py-4"
            >
              <Text className="text-lg font-semibold">Today Schedule</Text>
              <MaterialIcons
                name='keyboard-arrow-right'
                size={24}
                color="#666"
              />
            </Pressable>

            {showTodaySchedule && (
              <View className="bg-white rounded-xl p-4">
                {groupTasksByTimeAndType(filteredTasks).map((group, index) => (
                  <TaskGroup key={index} time={group.time} type={group.type} 
                      tasks={group.tasks.map(task => ({
                        ...task,
                        onPress: () => handleTaskPress(task)
                      }))}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Your Health Section */}
          {showHealthSection && (
            <View className="pb-6">
              <Pressable
                onPress={() => setShowYourHealth(!showYourHealth)}
                className="w-full h-[56px] flex-row items-center justify-between border-t border-b border-[#FAE5CA] px-6 py-4"
              >
                <Text className="text-lg font-semibold">Your Health</Text>
                <MaterialIcons
                  name='keyboard-arrow-right'
                  size={24}
                  color="#666"
                />
              </Pressable>

              {showYourHealth && (
                <View 
                  style={{
                    display: 'flex',
                    height: 494,
                    paddingHorizontal: 24,
                    paddingVertical: 16,
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 24,
                    flexShrink: 0,
                    alignSelf: 'stretch',
                    width: '100%',
                    backgroundColor: '#FAE5CA',
                  }}
                >
                  <View className="flex-row flex-wrap justify-between w-full">
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
      <TaskCard
      visible={showTaskCard}
      onClose={() => setShowTaskCard(false)}
      task={selectedTask}
      />
   </>
  );
};

export default DashboardBase;