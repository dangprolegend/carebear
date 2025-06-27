import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Pressable, 
  ScrollView, 
  Alert, 
  ActivityIndicator, 
  Platform, 
  Modal,
  StyleSheet,
  Image
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { 
  fetchTaskById, 
  updateTask, 
  fetchUsersInGroup,
  fetchUserInfoById
} from '../../../../../service/apiServices';
import { Avatar } from '../../../../../components/ui/avatar';

interface TaskUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  imageURL?: string;
  profilePicture?: string;
}

interface TaskData {
  _id: string;
  title: string;
  description?: string;
  datetime?: string;
  reminder?: {
    start_date?: string;
    end_date?: string;
    times_of_day?: string[];
    recurrence_rule?: string;
  };
  detail?: string;
  subDetail?: string;
  priority?: 'high' | 'medium' | 'low';
  groupID?: string | { _id: string; name?: string };
  assignedTo?: string | TaskUser;
  assignedBy?: string | TaskUser;
  status?: string;
  group?: string | { _id: string; name?: string };
}

interface UserOption {
  label: string;
  value: string;
  imageURL?: string;
  firstName?: string;
  lastName?: string;
}

const EditTaskScreen = () => {
  const { taskId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formChanged, setFormChanged] = useState(false);

  // Form state
  const [taskForm, setTaskForm] = useState<any>({
    title: '',
    description: '',
    datetime: '', // startDate
    endDate: '',
    detail: '', // timesOfDay
    subDetail: '', // recurrence
    priority: 'medium',
    assignedTo: '',
  });

  const [originalTask, setOriginalTask] = useState<any>(null);
  const [assigneeOptions, setAssigneeOptions] = useState<UserOption[]>([]);
  const [currentGroupID, setCurrentGroupID] = useState<string | null>(null);

  // UI state
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showTimesDropdown, setShowTimesDropdown] = useState(false);
  const [showRecurrenceDropdown, setShowRecurrenceDropdown] = useState(false);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);

  // Fetch task data
  useEffect(() => {
    const fetchTaskData = async () => {
      if (!taskId) return;
      
      setLoading(true);
      try {
        console.log("Fetching task data for ID:", taskId);
        const task = await fetchTaskById(taskId as string) as TaskData;
        console.log("Task data retrieved:", task);
        // Log all task properties to find which one might contain group info
        console.log("Task properties:");
        Object.keys(task).forEach(key => {
          console.log(`- ${key}: ${JSON.stringify(task[key as keyof TaskData])}`);
        });
        setOriginalTask(task);
        
        // Extract groupID for fetching assignees
        let groupId = null;
        
        // First check for groupID in task data
        if (task.groupID) {
          groupId = typeof task.groupID === 'object' ? task.groupID._id : task.groupID;
          console.log("Extracted group ID from groupID:", groupId);
        } else if (task.group) {
          groupId = typeof task.group === 'object' ? task.group._id : task.group;
          console.log("Extracted group ID from group property:", groupId);
        } else if (task.assignedBy && typeof task.assignedBy === 'object') {
          // If there's no group ID, try to use assignedBy's ID to at least fetch the user
          const assignedByUserId = task.assignedBy._id;
          console.log("No group ID found, but have assignedBy user ID:", assignedByUserId);
        }
        
        if (groupId) {
          console.log("Setting current group ID:", groupId);
          setCurrentGroupID(groupId);
        } else {
          console.log("No group ID found in task data");
        }
        
        // Extract assignedTo
        let assignedToId = '';
        if (task.assignedTo) {
          if (typeof task.assignedTo === 'object' && task.assignedTo !== null) {
            const assignedUser = task.assignedTo as TaskUser;
            assignedToId = assignedUser._id;
            console.log("Assigned to user (object):", assignedUser._id, 
              assignedUser.firstName ? `${assignedUser.firstName} ${assignedUser.lastName}` : assignedUser.email);
          } else if (typeof task.assignedTo === 'string') {
            assignedToId = task.assignedTo;
            console.log("Assigned to user (ID):", task.assignedTo);
          }
        }
        console.log("Final assignedToId extracted:", assignedToId);
        
        // Set form data from task
        setTaskForm({
          title: task.title || '',
          description: task.description || '',
          datetime: task.datetime || new Date().toISOString(),
          endDate: task.reminder?.end_date || '',
          detail: task.detail || '', // timesOfDay
          subDetail: task.subDetail || 'NONE', // recurrence
          priority: task.priority || 'medium',
          assignedTo: assignedToId
        });
      } catch (err: any) {
        console.error('Error fetching task:', err);
        setError('Failed to load task data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTaskData();
  }, [taskId]);

  // Fetch assignees and add user info if necessary
  useEffect(() => {
    const fetchUsers = async () => {
      // Only proceed if we have task form data
      if (!taskForm.title) {
        console.log("Task form not yet initialized, waiting to fetch users");
        return;
      }
      
      let usersList: any[] = [];
      
      // If we have a group ID, fetch all users in that group
      if (currentGroupID) {
        try {
          console.log("Fetching users for group:", currentGroupID);
          usersList = await fetchUsersInGroup(currentGroupID);
          console.log("Fetched users from group:", usersList.length);
        } catch (e) {
          console.error('Error fetching group users:', e);
        }
      } else {
        console.log("No group ID available to fetch users");
      }
      
      // Map the users we have
      const mappedUsers = usersList.map((user: any) => ({
        label: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user.email || 'Unknown User',
        value: user._id,
        imageURL: user.imageURL || user.profilePicture || null,
        firstName: user.firstName || '',
        lastName: user.lastName || ''
      }));
      
      // Always try to fetch the assigned user's info if we have an assignedTo value
      const assignedToId = taskForm.assignedTo;
      if (assignedToId && !mappedUsers.some(u => u.value === assignedToId)) {
        console.log("Assigned user not in mapped list, fetching user info:", assignedToId);
        try {
          const userInfo = await fetchUserInfoById(assignedToId);
          console.log("Fetched assigned user info:", userInfo);
          if (userInfo) {
            mappedUsers.push({
              label: userInfo.firstName && userInfo.lastName 
                ? `${userInfo.firstName} ${userInfo.lastName}` 
                : userInfo.email || 'Unknown User',
              value: userInfo._id,
              imageURL: userInfo.imageURL || userInfo.profilePicture || null,
              firstName: userInfo.firstName || '',
              lastName: userInfo.lastName || ''
            });
            console.log("Added assigned user to options:", userInfo.email || userInfo._id);
          }
        } catch (err) {
          console.error("Failed to fetch assigned user info:", err);
        }
      }
      
      console.log("Final user options:", mappedUsers.length);
      setAssigneeOptions(mappedUsers);
    };
    
    fetchUsers();
  }, [currentGroupID, taskForm]);

  // Handle form field changes
  const handleInputChange = (field: string, value: any) => {
    setTaskForm((prev: any) => ({
      ...prev,
      [field]: value
    }));
    setFormChanged(true);
  };

  // Save changes
  const handleSaveTask = async () => {
    if (!taskId) {
      Alert.alert('Error', 'Task ID is missing.');
      return;
    }

    if (!taskForm.title.trim()) {
      Alert.alert('Required', 'Task title is required.');
      return;
    }

    setSaving(true);
    try {
      console.log("Saving task with data:", {
        title: taskForm.title,
        description: taskForm.description,
        priority: taskForm.priority,
        detail: taskForm.detail,
        subDetail: taskForm.subDetail,
        assignedTo: taskForm.assignedTo,
        assignedToUser: assigneeOptions.find(opt => opt.value === taskForm.assignedTo)?.label || 'None',
        datetime: taskForm.datetime,
        endDate: taskForm.endDate
      });
      
      const payload = {
        title: taskForm.title,
        description: taskForm.description,
        priority: taskForm.priority,
        detail: taskForm.detail, // timesOfDay
        subDetail: taskForm.subDetail, // recurrence
        assignedTo: taskForm.assignedTo || null, // Send null explicitly if empty to unassign
        reminder: {
          start_date: taskForm.datetime ? new Date(taskForm.datetime).toISOString() : undefined,
          end_date: taskForm.endDate ? new Date(taskForm.endDate).toISOString() : undefined,
        }
      };

      const updatedTask = await updateTask(taskId as string, payload);
      console.log("Task updated successfully:", updatedTask);
      
      Alert.alert(
        'Success', 
        'Task updated successfully!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (err: any) {
      console.error('Error updating task:', err);
      Alert.alert('Error', err?.message || 'Failed to update task. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#FAE5CA" />
        <Text className="mt-2 text-gray-600">Loading task data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">{error}</Text>
        <Pressable 
          className="mt-4 py-2 px-4 bg-black rounded-full"
          onPress={() => router.back()}
        >
          <Text className="text-white">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-8 pb-2 border-b border-gray-200 bg-white">
        <Pressable onPress={() => router.back()} className="p-1">
          <MaterialIcons name="arrow-back" size={24} color="black" />
        </Pressable>
        <Text className="text-lg font-bold text-black flex-1 text-center">Edit Task</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      <ScrollView 
        className="flex-1 p-4"
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        {/* Task Title */}
        <Text className="font-semibold mb-2">Task Title</Text>
        <TextInput
          className="border rounded-lg px-3 py-3 mb-6 text-base"
          value={taskForm.title}
          onChangeText={(text) => handleInputChange('title', text)}
          placeholder="Enter task title"
        />

        {/* Assignee */}
        <Text className="font-semibold mb-2">Assign to</Text>
        <View className="border rounded-lg mb-6 px-3 py-3 bg-white relative">
          <Pressable
            className="flex-row items-center justify-between"
            onPress={() => {
              console.log("Opening assignee dropdown. Current assignedTo:", taskForm.assignedTo);
              console.log("Available assignees:", assigneeOptions.length);
              setShowAssigneeDropdown(!showAssigneeDropdown);
            }}
          >
            {taskForm.assignedTo ? (
              <View className="flex-row items-center">
                {(() => {
                  const selectedUser = assigneeOptions.find(opt => opt.value === taskForm.assignedTo);
                  
                  // If we have an assignedTo ID but no matching user in options yet
                  if (!selectedUser) {
                    return (
                      <View className="flex-row items-center">
                        <ActivityIndicator size="small" color="#FAE5CA" style={{ marginRight: 8 }} />
                        <Text className="text-base text-gray-500">Loading user...</Text>
                      </View>
                    );
                  }
                  
                  return (
                    <>
                      {selectedUser.imageURL ? (
                        <Image 
                          source={{ uri: selectedUser.imageURL }} 
                          className="w-8 h-8 rounded-full mr-2"
                          onError={() => console.log("Failed to load image for", selectedUser.label)} 
                        />
                      ) : (
                        <Avatar 
                          name={`${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`.trim() || selectedUser.label || 'User'} 
                          size="sm"
                          className="mr-2"
                        />
                      )}
                      <Text className="text-base">{selectedUser.label}</Text>
                    </>
                  );
                })()}
              </View>
            ) : (
              <Text className="text-base text-gray-500">Select User</Text>
            )}
            <MaterialIcons name={showAssigneeDropdown ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={22} color="#888" />
          </Pressable>
          {showAssigneeDropdown && (
            <View 
              className="absolute left-0 right-0 top-14 z-50 bg-white border rounded-lg shadow-lg max-h-60"
              style={{ elevation: 5 }}
            >
              {assigneeOptions.length > 0 ? (
                <ScrollView 
                  nestedScrollEnabled={true} 
                  showsVerticalScrollIndicator={true} 
                  contentContainerStyle={{ flexGrow: 0 }}
                  style={{ maxHeight: 240 }}
                  keyboardShouldPersistTaps="handled"
                >
                  {/* Option to clear assignee */}
                  <Pressable
                    className={`py-3 px-4 flex-row items-center ${!taskForm.assignedTo ? 'bg-blue-100' : ''}`}
                    onPress={() => {
                      handleInputChange('assignedTo', '');
                      setShowAssigneeDropdown(false);
                    }}
                  >
                    <View className="mr-3">
                      <Avatar 
                        name="?" 
                        size="sm"
                      />
                    </View>
                    <View>
                      <Text className={`text-base ${!taskForm.assignedTo ? 'font-bold text-blue-700' : 'text-black'}`}>
                        Unassigned
                      </Text>
                    </View>
                  </Pressable>
                  
                  {/* User options */}
                  {assigneeOptions.map(user => (
                    <Pressable
                      key={user.value}
                      className={`py-3 px-4 flex-row items-center ${taskForm.assignedTo === user.value ? 'bg-blue-100' : ''}`}
                      onPress={() => {
                        console.log("Selected user:", user.label, user.value);
                        handleInputChange('assignedTo', user.value);
                        setShowAssigneeDropdown(false);
                      }}
                    >
                      <View className="mr-3">
                        {user.imageURL ? (
                          <Image 
                            source={{ uri: user.imageURL }} 
                            className="w-8 h-8 rounded-full"
                            onError={(e) => {
                              console.log("Failed to load image for", user.label);
                            }} 
                          />
                        ) : (
                          <Avatar 
                            name={`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.label || 'User'}
                            size="sm"
                          />
                        )}
                      </View>
                      <View>
                        <Text className={`text-base ${taskForm.assignedTo === user.value ? 'font-bold text-blue-700' : 'text-black'}`}>
                          {user.label}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </ScrollView>
              ) : (
                <View className="py-4 px-3">
                  <Text className="text-center text-gray-500">No users available</Text>
                </View>
              )}
            </View>
          )}
        </View>


        {/* Description */}
        <Text className="font-semibold mb-2">Description</Text>
        <TextInput
          className="border rounded-lg px-3 py-3 mb-6 text-base min-h-[80px]"
          value={taskForm.description}
          onChangeText={(text) => handleInputChange('description', text)}
          placeholder="Enter task description"
          multiline
          textAlignVertical="top"
        />

        {/* Start Date */}
        <Text className="font-semibold mb-2">Start Date</Text>
        <Pressable
          className="border rounded-lg px-3 py-3 mb-6 bg-white flex-row items-center justify-between"
          onPress={() => {
            if (Platform.OS === 'android') {
              DateTimePickerAndroid.open({
                value: taskForm.datetime ? new Date(taskForm.datetime) : new Date(),
                mode: 'date',
                onChange: (event, selectedDate) => {
                  if (selectedDate) {
                    // Keep time part if present, else just set date
                    const prev = taskForm.datetime ? new Date(taskForm.datetime) : new Date();
                    selectedDate.setHours(prev.getHours(), prev.getMinutes(), prev.getSeconds());
                    handleInputChange('datetime', selectedDate.toISOString());
                  }
                },
              });
            } else {
              setShowStartDatePicker(true);
            }
          }}
        >
          <Text className="text-base text-black">
            {taskForm.datetime
              ? new Date(taskForm.datetime).toLocaleDateString()
              : 'Select Start Date'}
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
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <DateTimePicker
                  value={taskForm.datetime ? new Date(taskForm.datetime) : new Date()}
                  mode="date"
                  display="spinner"
                  onChange={(_, selectedDate) => {
                    if (selectedDate) {
                      // Keep time part if present, else just set date
                      const prev = taskForm.datetime ? new Date(taskForm.datetime) : new Date();
                      selectedDate.setHours(prev.getHours(), prev.getMinutes(), prev.getSeconds());
                      handleInputChange('datetime', selectedDate.toISOString());
                    }
                    setShowStartDatePicker(false);
                  }}
                />
                <Pressable onPress={() => setShowStartDatePicker(false)} style={styles.doneButton}>
                  <Text style={{ color: 'black', fontWeight: 'bold' }}>Done</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        )}

        {/* End Date */}
        <Text className="font-semibold mb-2">End Date</Text>
        <Pressable
          className="border rounded-lg px-3 py-3 mb-6 bg-white flex-row items-center justify-between"
          onPress={() => {
            if (Platform.OS === 'android') {
              DateTimePickerAndroid.open({
                value: taskForm.endDate ? new Date(taskForm.endDate) : new Date(),
                mode: 'date',
                onChange: (event, selectedDate) => {
                  if (selectedDate) {
                    handleInputChange('endDate', selectedDate.toISOString());
                  }
                },
              });
            } else {
              setShowEndDatePicker(true);
            }
          }}
        >
          <Text className="text-base text-black">
            {taskForm.endDate
              ? new Date(taskForm.endDate).toLocaleDateString()
              : 'Select End Date'}
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
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <DateTimePicker
                  value={taskForm.endDate ? new Date(taskForm.endDate) : new Date()}
                  mode="date"
                  display="spinner"
                  onChange={(_, selectedDate) => {
                    if (selectedDate) {
                      handleInputChange('endDate', selectedDate.toISOString());
                    }
                    setShowEndDatePicker(false);
                  }}
                />
                <Pressable onPress={() => setShowEndDatePicker(false)} style={styles.doneButton}>
                  <Text style={{ color: 'black', fontWeight: 'bold' }}>Done</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        )}

        {/* Times of Day */}
        <Text className="font-semibold mb-2">Times of Day</Text>
        <View className="border rounded-lg mb-6 px-3 py-3 bg-white relative">
          <Pressable
            className="flex-row items-center justify-between"
            onPress={() => setShowTimesDropdown(prev => !prev)}
          >
            <Text className="text-base">
              {taskForm.detail ? taskForm.detail : 'Select Time'}
            </Text>
            <MaterialIcons name={showTimesDropdown ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={22} color="#888" />
          </Pressable>
          {showTimesDropdown && (
            <View 
              className="absolute left-0 right-0 top-14 z-50 bg-white border rounded-lg shadow-lg max-h-60"
              style={{ elevation: 5 }}
            >
              <ScrollView 
                nestedScrollEnabled={true} 
                showsVerticalScrollIndicator={true} 
                contentContainerStyle={{ flexGrow: 0 }}
                style={{ maxHeight: 240 }}
                keyboardShouldPersistTaps="handled"
              >
                {Array.from({ length: 24 }).map((_, hour) => {
                  return Array.from({ length: 4 }).map((_, minuteIndex) => {
                    const minutes = minuteIndex * 15;
                    const label = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
                    return (
                      <Pressable
                        key={label}
                        className={`py-3 px-4 ${taskForm.detail === label ? 'bg-blue-100' : ''}`}
                        onPress={() => {
                          handleInputChange('detail', label);
                          setShowTimesDropdown(false);
                        }}
                      >
                        <Text className={`text-base ${taskForm.detail === label ? 'font-bold text-blue-700' : 'text-black'}`}>{label}</Text>
                      </Pressable>
                    );
                  });
                }).flat()}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Recurrence */}
        <Text className="font-semibold mb-2">Recurrence</Text>
        <View className="border rounded-lg mb-6 px-3 py-3 bg-white relative">
          <Pressable
            className="flex-row items-center justify-between"
            onPress={() => setShowRecurrenceDropdown(!showRecurrenceDropdown)}
          >
            <Text className="text-base">
              {['NONE', 'DAILY', 'WEEKLY', 'MONTHLY'].includes(taskForm.subDetail || '') && taskForm.subDetail
                ? taskForm.subDetail.charAt(0) + taskForm.subDetail.slice(1).toLowerCase()
                : 'Select Recurrence'}
            </Text>
            <MaterialIcons name={showRecurrenceDropdown ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={22} color="#888" />
          </Pressable>
          {showRecurrenceDropdown && (
            <View 
              className="absolute left-0 right-0 top-14 z-50 bg-white border rounded-lg shadow-lg"
              style={{ elevation: 5 }}
            >
              <ScrollView 
                nestedScrollEnabled={true} 
                showsVerticalScrollIndicator={true} 
                contentContainerStyle={{ flexGrow: 0 }}
                style={{ maxHeight: 240 }}
                keyboardShouldPersistTaps="handled"
              >
                {['NONE', 'DAILY', 'WEEKLY', 'MONTHLY'].map(option => (
                  <Pressable
                    key={option}
                    className={`py-3 px-4 ${taskForm.subDetail === option ? 'bg-blue-100' : ''}`}
                    onPress={() => {
                      handleInputChange('subDetail', option);
                      setShowRecurrenceDropdown(false);
                    }}
                  >
                    <Text className={`text-base ${taskForm.subDetail === option ? 'font-bold text-blue-700' : 'text-black'}`}>
                      {option.charAt(0) + option.slice(1).toLowerCase()}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Priority */}
        <Text className="font-semibold mb-2">Priority</Text>
        <View className="flex-row mb-6">
          {['high', 'medium', 'low'].map((level) => (
            <Pressable
              key={level}
              className={`flex-1 flex-row items-center justify-center border rounded-lg py-3 mx-1 ${taskForm.priority === level ? 'bg-[#FAE5CA] border-black' : 'bg-white border-slate-300'}`}
              onPress={() => handleInputChange('priority', level)}
            >
              <MaterialIcons 
                name="flag" 
                size={18} 
                color={level === 'high' ? 'red' : level === 'medium' ? 'gold' : 'blue'} 
              />
              <Text className={`ml-1 font-semibold capitalize ${taskForm.priority === level ? 'text-black' : 'text-black'}`}>
                {level}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Save Button */}
        <View className="my-6">
          <Pressable
            className={`py-3 px-4 mb-6 rounded-full items-center flex-row justify-center ${formChanged ? 'bg-black' : 'bg-gray-400'}`}
            onPress={handleSaveTask}
            disabled={!formChanged || saving}
          >
            <Text className="text-white text-lg text-base font-semibold">
              {saving ? 'Saving...' : 'Save Changes'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)'
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: 320
  },
  doneButton: {
    marginTop: 10,
    alignSelf: 'flex-end'
  }
});

export default EditTaskScreen;