import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, ActivityIndicator, Platform, Modal, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { createManualTaskAPI, fetchUsersInGroup } from '../../../../../service/apiServices'; // ADJUST PATH
import { Avatar } from '../../../../../components/ui/avatar';

type ManualTaskFormProps = {
  currentUserID: string | null; 
  currentGroupID: string | null;
  onTaskCreated?: () => void; 
};

interface ManualTaskData { 
  title: string;
  description?: string;
  startDateString?: string;
  endDateString?: string;
  timesOfDayInput?: string;
  recurrenceRule?: string;
  priority?: 'low' | 'medium' | 'high' | null;
  assignedToId?: string | null;
}

interface UserOption {
  label: string;
  value: string;
  imageURL?: string;
  firstName?: string;
  lastName?: string;
}

const ManualTaskForm = ({ currentUserID, currentGroupID, onTaskCreated }: ManualTaskFormProps) => {
  
  const [manualForm, setManualForm] = useState<ManualTaskData>({
    title: '',
    description: '',
    startDateString: '',
    endDateString: '',
    timesOfDayInput: '',
    recurrenceRule: 'NONE',
    priority: 'medium',
    assignedToId: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showTimesDropdown, setShowTimesDropdown] = useState(false);
  const [showRecurrenceDropdown, setShowRecurrenceDropdown] = useState(false);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(manualForm.startDateString ? new Date(manualForm.startDateString) : new Date());
  const [tempEndDate, setTempEndDate] = useState(manualForm.endDateString ? new Date(manualForm.endDateString) : new Date());
  const [assigneeOptions, setAssigneeOptions] = useState<UserOption[]>([]);

  useEffect(() => {
    const fetchAssignees = async () => {
      if (!currentGroupID) return;
      try {
        const users = await fetchUsersInGroup(currentGroupID);
        setAssigneeOptions(
          users.map((user: any) => ({
            label: user.fullName || user.email || 'Unknown User',
            value: user.userID, // Changed from user._id to user.userID
            imageURL: user.imageURL || null,
            firstName: user.fullName?.split(' ')[0] || '',
            lastName: user.fullName?.split(' ')[1] || ''
          }))
        );
      } catch (e) {
        setAssigneeOptions([]);
      }
    };
    fetchAssignees();
  }, [currentGroupID]);

  const handleInputChange = (field: keyof ManualTaskData, value: string | null) => {
    setManualForm(prev => ({ ...prev, [field]: value }));
  };

  // Priority flag icon getter moved outside so it's accessible in render and handlers
  const getPriorityFlagIcon = (priority: string): any => {
    switch (priority) {
      case 'high': 
        return require('../../../../../assets/icons/redflag.png');
      case 'medium': 
        return require('../../../../../assets/icons/yellowflag.png');
      case 'low': 
        return require('../../../../../assets/icons/blueflag.png');
      default:
        return require('../../../../../assets/icons/redflag.png'); // Default flag
    }
  };

  const handleSaveManualTask = async () => {
  // Validate all required fields
  if (!manualForm.title.trim()) {
    Alert.alert("Required", "Task title is required.");
    return;
  }
  if (!manualForm.description || !manualForm.description.trim()) {
    Alert.alert("Required", "Description is required.");
    return;
  }
  if (!manualForm.startDateString || !manualForm.startDateString.trim()) {
    Alert.alert("Required", "Start date is required.");
    return;
  }
  if (!manualForm.endDateString || !manualForm.endDateString.trim()) {
    Alert.alert("Required", "End date is required.");
    return;
  }
  if (!manualForm.timesOfDayInput || !manualForm.timesOfDayInput.trim()) {
    Alert.alert("Required", "Times of day is required.");
    return;
  }
  if (!manualForm.recurrenceRule || !manualForm.recurrenceRule.trim()) {
    Alert.alert("Required", "Recurrence is required.");
    return;
  }
  if (!manualForm.priority || !manualForm.priority.trim()) {
    Alert.alert("Required", "Priority is required.");
    return;
  }
  if (!manualForm.assignedToId || !manualForm.assignedToId.trim()) {
    Alert.alert("Required", "Assigned To (User ID) is required.");
    return;
  }
  if (!currentGroupID || !currentUserID) {
    Alert.alert("Error", "User or Group information is missing. Cannot create task.");
    return;
  }

  // Parse dates and calculate date range
  const startDate = new Date(manualForm.startDateString);
  const endDate = new Date(manualForm.endDateString);
  
  // Validate date range
  if (endDate < startDate) {
    Alert.alert("Invalid Dates", "End date cannot be before start date.");
    return;
  }
  
  // Calculate number of days between start and end date (inclusive)
  const dayDifference = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  setIsLoading(true);
    try {
      // Track successfully created tasks
      let tasksCreated = 0;
      
      // Create a task for each day in the range
      for (let i = 0; i < dayDifference; i++) {
        // Create a new date for this day
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        
        // Format as ISO date string (YYYY-MM-DD)
        const currentDateString = currentDate.toISOString().slice(0, 10);
        
        // Create reminder payload for this day (keep same structure as original)
        const reminderPayload: any = {};
        reminderPayload.start_date = currentDateString;
        reminderPayload.end_date = currentDateString;
        
        // Keep the time_of_day format the same
        if (manualForm.timesOfDayInput) {
          reminderPayload.times_of_day = [manualForm.timesOfDayInput];
        }
        
        // Add recurrence if applicable
        if (manualForm.recurrenceRule && manualForm.recurrenceRule !== 'NONE') {
          reminderPayload.recurrence_rule = manualForm.recurrenceRule;
        }

        // Fix assignedTo for backend: only send if present
        let assignedToPayload: any = undefined;
        if (manualForm.assignedToId && manualForm.assignedToId !== '') {
          assignedToPayload = { _id: manualForm.assignedToId };
        }
        
        // Add assignedBy for backend
        let assignedByPayload: any = undefined;
        if (currentUserID) {
          assignedByPayload = { _id: currentUserID };
        }
        
        // Create task with the day-specific data
        const taskToCreateForBackend = {
          title: dayDifference > 1 ? `${manualForm.title} (Day ${i+1})` : manualForm.title,
          description: manualForm.description ?? undefined,
          groupID: currentGroupID,
          assignedTo: assignedToPayload,
          assignedBy: assignedByPayload,
          priority: manualForm.priority || 'medium',
          reminder: Object.keys(reminderPayload).length > 0 ? reminderPayload : undefined,
          datetime: currentDateString // Add the specific date for this task
        };

        // Create this day's task
        await createManualTaskAPI(taskToCreateForBackend);
        tasksCreated++;
      }

      // Show success message
      Alert.alert(
        "Success", 
        tasksCreated > 1 
          ? `Created ${tasksCreated} tasks from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}` 
          : `Task "${manualForm.title}" created!`, 
        [{
          text: "OK",
          onPress: () => {
            setManualForm({ 
              title: '', 
              description: '', 
              startDateString: '', 
              endDateString: '', 
              timesOfDayInput: '', 
              recurrenceRule: 'NONE', 
              priority: 'medium', 
              assignedToId: null 
            });
            if (onTaskCreated) onTaskCreated();
          }
        }]
      );
    } catch (error: any) {
      Alert.alert("Manual Creation Error", error?.message || "Failed to create task manually.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="mt-4 pt-4 ml-2 mr-2">

      {/* Task Title */}
      <Text style={{ fontFamily: 'Lato' }} className="font-bold mb-2">Task Name</Text>
      <TextInput style={{ fontFamily: 'Lato' }}
        className="border border-[#2A1800] rounded-lg px-3 py-4 mb-8"
        placeholder="Task Name"
        value={manualForm.title}
        onChangeText={text => handleInputChange('title', text)}
      />

      {/* Assigned To */}
      <Text style={{ fontFamily: 'Lato' }} className="font-bold mb-2">Assigned To</Text>
      <View className="border border-[#2A1800] rounded-lg mb-8 px-3 py-3 bg-white relative">
        <Pressable
          className="flex-row items-center justify-between"
          onPress={() => setShowAssigneeDropdown(prev => !prev)}
        >
          {manualForm.assignedToId ? (
            <View className="flex-row items-center">
              {(() => {
                const selectedUser = assigneeOptions.find(opt => opt.value === manualForm.assignedToId);
                return (
                  <>
                    {selectedUser?.imageURL ? (
                      <Image source={{ uri: selectedUser.imageURL }} className="w-8 h-8 rounded-full mr-2" />
                    ) : (
                      <Avatar 
                        name={selectedUser?.firstName && selectedUser?.lastName 
                          ? `${selectedUser.firstName} ${selectedUser.lastName}`
                          : selectedUser?.label || 'User'} 
                        size="sm"
                        className="mr-2"
                      />
                    )}
                    <Text className="text-base">
                      {selectedUser?.label || 'Select Assignee'}
                    </Text>
                  </>
                );
              })()}
            </View>
          ) : (
            <Text style={{ fontFamily: 'Lato' }} className="text-base">Select Assignee</Text>
          )}
          <MaterialIcons name={showAssigneeDropdown ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={22} color="#888" />
        </Pressable>
        {showAssigneeDropdown && (
          <View className="absolute left-0 right-0 top-14 z-10 bg-white border rounded-lg shadow-lg max-h-60">
            <ScrollView 
              nestedScrollEnabled={true} 
              showsVerticalScrollIndicator={true} 
              contentContainerStyle={{ flexGrow: 0 }}
              style={{ maxHeight: 240 }}
            >
              {assigneeOptions.length === 0 ? (
                <Text className="text-slate-400 px-3 py-2">No users found</Text>
              ) : (
                assigneeOptions.map(user => (
                  <Pressable
                    key={user.value}
                    className={`py-2 px-3 ${manualForm.assignedToId === user.value ? 'bg-blue-100' : ''}`}
                    onPress={() => {
                      handleInputChange('assignedToId', user.value);
                      setShowAssigneeDropdown(false);
                    }}
                  >
                    <View className="flex-row items-center">
                      {user.imageURL ? (
                        <Image source={{ uri: user.imageURL }} className="w-8 h-8 rounded-full mr-2" />
                      ) : (
                        <Avatar 
                          name={user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.label} 
                          size="sm"
                          className="mr-2"
                        />
                      )}
                      <Text className={`text-base ${manualForm.assignedToId === user.value ? 'font-bold text-blue-700' : 'text-black'}`}>{user.label}</Text>
                    </View>
                  </Pressable>
                ))
              )}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Start Date */}
      <Text style={{ fontFamily: 'Lato' }} className="font-bold mb-2">Start Date</Text>
      <Pressable
        className="border rounded-lg px-3 py-3 mb-8 bg-white flex-row items-center justify-between"
        onPress={() => {
          if (Platform.OS === 'android') {
            DateTimePickerAndroid.open({
              value: manualForm.startDateString ? new Date(manualForm.startDateString) : new Date(),
              mode: 'date',
              onChange: (event, selectedDate) => {
                if (selectedDate) {
                  handleInputChange('startDateString', selectedDate.toISOString().slice(0, 10));
                }
              },
            });
          } else {
            setShowStartDatePicker(true);
          }
        }}
      >
        <Text style={{ fontFamily: 'Lato' }} className="text-base text-black">
          {manualForm.startDateString ? manualForm.startDateString : 'Select Start Date'}
        </Text>
        <MaterialIcons name="calendar-today" size={22} color="#888" />
      </Pressable>
      {/* iOS Date Picker Modal for Start Date */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={showStartDatePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowStartDatePicker(false)}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <View style={{ backgroundColor: 'white', borderRadius: 10, padding: 20, width: 320 }}>
              <DateTimePicker
                value={manualForm.startDateString ? new Date(manualForm.startDateString) : new Date()}
                mode="date"
                display="spinner"
                onChange={(_, selectedDate) => {
                  if (selectedDate) {
                    handleInputChange('startDateString', selectedDate.toISOString().slice(0, 10));
                  }
                  setShowStartDatePicker(false);
                }}
              />
              <Pressable onPress={() => setShowStartDatePicker(false)} style={{ marginTop: 10, alignSelf: 'flex-end' }}>
                <Text style={{ color: 'black', fontWeight: 'bold' }}>Done</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}

      {/* End Date */}
      <Text style={{ fontFamily: 'Lato' }} className="font-bold mb-2">End Date</Text>
      <Pressable
        className="border rounded-lg px-3 py-3 mb-8 bg-white flex-row items-center justify-between"
        onPress={() => {
          if (Platform.OS === 'android') {
            DateTimePickerAndroid.open({
              value: manualForm.endDateString ? new Date(manualForm.endDateString) : new Date(),
              mode: 'date',
              onChange: (event, selectedDate) => {
                if (selectedDate) {
                  handleInputChange('endDateString', selectedDate.toISOString().slice(0, 10));
                }
              },
            });
          } else {
            setShowEndDatePicker(true);
          }
        }}
      >
        <Text style={{ fontFamily: 'Lato' }} className="text-base text-black">
          {manualForm.endDateString ? manualForm.endDateString : 'Select End Date'}
        </Text>
        <MaterialIcons name="calendar-today" size={22} color="#888" />
      </Pressable>
      {/* iOS Date Picker Modal for End Date */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={showEndDatePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowEndDatePicker(false)}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <View style={{ backgroundColor: 'white', borderRadius: 10, padding: 20, width: 320 }}>
              <DateTimePicker
                value={manualForm.endDateString ? new Date(manualForm.endDateString) : new Date()}
                mode="date"
                display="spinner"
                onChange={(_, selectedDate) => {
                  if (selectedDate) {
                    handleInputChange('endDateString', selectedDate.toISOString().slice(0, 10));
                  }
                  setShowEndDatePicker(false);
                }}
              />
              <Pressable onPress={() => setShowEndDatePicker(false)} style={{ marginTop: 10, alignSelf: 'flex-end' }}>
                <Text style={{ color: 'black', fontWeight: 'bold' }}>Done</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}

      {/* Times of Day */}
      <Text style={{ fontFamily: 'Lato' }} className="font-bold mb-2">Times of Day</Text>
      <View className="border rounded-lg mb-8 px-3 py-3 bg-white relative">
        <Pressable
          className="flex-row items-center justify-between"
          onPress={() => setShowTimesDropdown(prev => !prev)}
        >
          <Text className="text-base">
            {manualForm.timesOfDayInput ? manualForm.timesOfDayInput : 'Select Time'}
          </Text>
          <MaterialIcons name={showTimesDropdown ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={22} color="#888" />
        </Pressable>
        {showTimesDropdown && (
          <View className="absolute left-0 right-0 top-14 z-10 bg-white border rounded-lg shadow-lg max-h-60">
            <ScrollView 
              nestedScrollEnabled={true} 
              showsVerticalScrollIndicator={true} 
              contentContainerStyle={{ flexGrow: 0 }}
              style={{ maxHeight: 240 }}
            >
              {Array.from({ length: 24 }).map((_, hour) => {
                return Array.from({ length: 4 }).map((_, minuteIndex) => {
                  const minutes = minuteIndex * 15;
                  const label = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
                  return (
                    <Pressable
                      key={label}
                      className={`py-2 px-3 ${manualForm.timesOfDayInput === label ? 'bg-blue-100' : ''}`}
                      onPress={() => {
                        handleInputChange('timesOfDayInput', label);
                        setShowTimesDropdown(false);
                      }}
                    >
                      <Text className={`text-base ${manualForm.timesOfDayInput === label ? 'font-bold text-blue-700' : 'text-black'}`}>{label}</Text>
                    </Pressable>
                  );
                });
              }).flat()}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Recurrence */}
      <Text style={{ fontFamily: 'Lato' }} className="font-bold mb-2">Recurrence</Text>
      <View className="border rounded-lg mb-8 px-3 py-3 bg-white relative">
        <Pressable
          className="flex-row items-center justify-between"
          onPress={() => setShowRecurrenceDropdown(prev => !prev)}
        >
          <Text className="text-base">
            {{
              NONE: 'None',
              DAILY: 'Daily',
              WEEKLY: 'Weekly',
              MONTHLY: 'Monthly'
            }[manualForm.recurrenceRule || 'NONE']}
          </Text>
          <MaterialIcons name={showRecurrenceDropdown ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={22} color="#888" />
        </Pressable>
        {showRecurrenceDropdown && (
          <View className="absolute left-0 right-0 top-14 z-10 bg-white border rounded-lg shadow-lg">
            <ScrollView 
              nestedScrollEnabled={true} 
              showsVerticalScrollIndicator={true} 
              contentContainerStyle={{ flexGrow: 0 }}
            >
              {[
                { label: 'None', value: 'NONE' },
                { label: 'Daily', value: 'DAILY' },
                { label: 'Weekly', value: 'WEEKLY' },
                { label: 'Monthly', value: 'MONTHLY' }
              ].map(opt => (
                <Pressable
                  key={opt.value}
                  className={`py-2 px-3 ${manualForm.recurrenceRule === opt.value ? 'bg-blue-100' : ''}`}
                  onPress={() => {
                    handleInputChange('recurrenceRule', opt.value);
                    setShowRecurrenceDropdown(false);
                  }}
                >
                  <Text className={`text-base ${manualForm.recurrenceRule === opt.value ? 'font-bold text-blue-700' : 'text-black'}`}>{opt.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

            {/* Purpose */}
            <Text style={{ fontFamily: 'Lato' }} className="font-bold mb-2">Purpose</Text>
            <TextInput style={{ fontFamily: 'Lato' }}
              className="border border-[#2A1800] rounded-lg px-3 py-4 mb-8"
              placeholder="Purpose"
              value={manualForm.description || ''}
              onChangeText={text => handleInputChange('description', text)}
            />

            
            {/* Priority */}
            <Text style={{ fontFamily: 'Lato' }} className="font-bold mb-2">Priority</Text>
            <View className="flex-row mb-8">
                      {['high', 'medium', 'low'].map((level) => (
                        <Pressable
                          key={level}
                          className={`flex-1 flex-row items-center justify-center border border-[#2A1800] rounded-lg py-3 mx-1 ${manualForm.priority === level ? 'border-[black] bg-[#FAE5CA]' : 'bg-white border-black'}`}
                          onPress={() => handleInputChange('priority', level)}
                        >
                          <Image 
                            source={getPriorityFlagIcon(level)}
                            style={{ width: 18, height: 18 }}
                            resizeMode="contain"
                          />
                          <Text style={{ fontFamily: 'Lato' }} className={`ml-1 font-bold capitalize ${manualForm.priority === level ? 'text-black' : 'text-black'}`}>{level}</Text>
                        </Pressable>
                      ))}
              </View>

      {/* Instructions */}
      <Text style={{ fontFamily: 'Lato' }} className="font-bold mb-2">Instructions</Text>
      <TextInput style={{ fontFamily: 'Lato' }}
        className="border border-[#2A1800] rounded-lg bg-white px-3 py-2 mb-4 min-h-[80px]"
        placeholder="Instructions"
        value={manualForm.description || ''}
        onChangeText={text => handleInputChange('description', text)}
        multiline
      />

      <Pressable
        className={`py-3 px-6 rounded-full items-center mt-3 mb-20 ${isLoading ? 'bg-white' : 'bg-black active:bg-black'}`}
        onPress={handleSaveManualTask}
        disabled={isLoading}  
        style={{ alignSelf: 'center', maxWidth: 160 }}
      >
        {isLoading ? <ActivityIndicator color="white"/> : <Text style={{ fontFamily: 'Lato' }} className="text-white text-base font-bold">Create Task</Text>}
      </Pressable>
    </View>
  );
};

export default ManualTaskForm;