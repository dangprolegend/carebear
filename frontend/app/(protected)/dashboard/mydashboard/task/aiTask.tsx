import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable, Alert, ActivityIndicator, TextInput, ScrollView, Platform, Modal, Image } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Task as OriginalTaskType } from '../task'; 
import { fetchRecentTasksForGroup, updateTask, fetchUsersInGroup } from '../../../../../service/apiServices';
import { Avatar } from '../../../../../components/ui/avatar';

type FrontendTaskType = OriginalTaskType & {
  endDate?: string;
};

interface AiGeneratedTasksReviewScreenProps {
  generatedTasksJSON?: string;
  groupID?: string | null;
  userID?: string | null;
  onDone?: () => void;
  numGeneratedTasks?: number;
}

const EMPTY_TASK = {
  _id: '',
  title: '',
  description: '',
  datetime: '',
  type: '',
  detail: '',
  subDetail: '',
  checked: false,
  priority: undefined,
  status: 'pending',
  assignedTo: '', 
};

const NUM_TABS = 5;

interface UserOption {
  label: string;
  value: string;
  imageURL?: string;
  firstName?: string;
  lastName?: string;
}

const AiGeneratedTasksReviewScreen: React.FC<AiGeneratedTasksReviewScreenProps> = ({
  generatedTasksJSON,
  groupID,
  userID,
  onDone,
  numGeneratedTasks
}) => {
  const [aiTasks, setAiTasks] = useState<FrontendTaskType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [assigneeOptions, setAssigneeOptions] = useState<UserOption[]>([]);
  const [showRecurrenceDropdown, setShowRecurrenceDropdown] = useState(false);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showTimesDropdown, setShowTimesDropdown] = useState(false);

  const fetchAndDisplayRecentTasks = async () => {
    if (!groupID) {
      Alert.alert('Error', 'No groupID provided for fetching recent tasks.');
      return;
    }
    setIsLoading(true);
    try {
      const recentTasks = await fetchRecentTasksForGroup(groupID, numGeneratedTasks || 5);
      setAiTasks(recentTasks);
    } catch (e) {
      Alert.alert('Error', 'Failed to fetch')
    }
  };

  useEffect(() => {
    if (groupID && numGeneratedTasks) {
      fetchAndDisplayRecentTasks();
    } else if (generatedTasksJSON) {
      try {
        const tasks = JSON.parse(generatedTasksJSON) as FrontendTaskType[];
        setAiTasks(tasks);
      } catch (e) {
        console.error("Failed to parse AI generated tasks:", e);
        Alert.alert("Error", "Could not load AI generated tasks.");
      }
    } else {
      Alert.alert("No Tasks", "No AI generated tasks were passed to this screen.");
    }
  }, [generatedTasksJSON, groupID, numGeneratedTasks]);


  const paddedTasks = [
    ...aiTasks,
    ...Array(Math.max(0, NUM_TABS - aiTasks.length)).fill(EMPTY_TASK)
  ].slice(0, NUM_TABS);

  const [formTasks, setFormTasks] = useState<FrontendTaskType[]>(paddedTasks);

  useEffect(() => {
    setFormTasks(paddedTasks);
  }, [aiTasks]);

  const [tabDirty, setTabDirty] = useState<boolean[]>(Array(NUM_TABS).fill(false));

  const handleInputChange = (field: keyof FrontendTaskType, value: any) => {
    setFormTasks(prev => {
      const updated = [...prev];
      updated[activeTab] = { ...updated[activeTab], [field]: value };
      return updated;
    });
    setTabDirty(prev => {
      const updated = [...prev];
      updated[activeTab] = true;
      return updated;
    });
  };

  const sanitizeTaskForBackend = (task: FrontendTaskType) => {
    const { description, assignedTo, _id, datetime, type, title, detail, subDetail, checked, priority, status } = task;
    const payload: any = {
      title,
      description: description ?? undefined,
      priority: priority ?? undefined,
      status: status ?? undefined,
    };
    if (typeof assignedTo === 'string') {
      payload.assignedTo = assignedTo;
    }
    return payload;
  };

  const handleSaveTask = async () => {
    const task = formTasks[activeTab];
    if (!task._id) {
      Alert.alert('Error', 'Cannot update a task without an ID.');
      return;
    }
    try {
      await updateTask(task._id, sanitizeTaskForBackend(task));
      setTabDirty(prev => {
        const updated = [...prev];
        updated[activeTab] = false;
        return updated;
      });
      Alert.alert('Success', 'Task updated successfully.');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to update task.');
    }
  };

  const handleSaveAllTasks = async () => {
    const updatePromises = formTasks.map(async (task, idx) => {
      if (tabDirty[idx] && task._id) {
        try {
          await updateTask(task._id, sanitizeTaskForBackend(task));
        } catch (e) {
        }
      }
    });
    await Promise.all(updatePromises);
    setTabDirty(Array(NUM_TABS).fill(false));
    Alert.alert('Success', 'All edited tasks updated.');
  };

  useEffect(() => {
    const fetchAssignees = async () => {
      if (!groupID) return;
      try {
        const users = await fetchUsersInGroup(groupID);
        setAssigneeOptions(
          users.map((user: any) => ({
            label: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email,
            value: user._id,
            imageURL: user.imageURL || user.profilePicture || null,
            firstName: user.firstName,
            lastName: user.lastName
          }))
        );
      } catch (e) {
        setAssigneeOptions([]);
      }
    };
    fetchAssignees();
  }, [groupID]);

  if (aiTasks.length === 0 && !isLoading) { 
    return (
        <View className="flex-1 bg-white">
             <View className="flex-row items-center justify-between px-4 pt-12 pb-4 border-b border-slate-200">
                <Pressable onPress={() => router.back()} className="p-1 mr-auto"><MaterialIcons name="arrow-back-ios" size={22} color="black" /></Pressable>
                <Text className="text-lg font-semibold text-slate-800">AI Generated Tasks</Text>
                <View className="w-8" />
            </View>
            <View className="flex-1 justify-center items-center p-5">
                <Text className="text-slate-600 text-center">No tasks were generated by AI, or there was an issue loading them.</Text>
                <Pressable
                    className="py-3 px-6 rounded-lg items-center mt-5 bg-blue-500 active:bg-blue-600"
                    onPress={() => router.back()}
                >
                    <Text className="text-white text-base font-semibold">Go Back</Text>
                </Pressable>
            </View>
        </View>
    )
  }


  return (
    <View className="mt-4 pt-4">
      <View className="flex-row border-b border-slate-200">
        {[...Array(NUM_TABS)].map((_, idx) => (
          <Pressable
            key={idx}
            className={`flex-1 py-3 items-center ${activeTab === idx ? 'border-b-2 border-black' : ''}`}
            onPress={() => setActiveTab(idx)}
          >
            <Text className={`font-bold ${activeTab === idx ? 'text-black' : 'text-black'}`}>{`Task ${idx + 1}`}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView 
        className="pb-10" 
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Text className="font-semibold mb-2">Task Name</Text>
        <TextInput
          className="border rounded-lg px-3 py-3 mb-8"
          placeholder="Task Name"
          value={formTasks[activeTab]?.title || ''}
          onChangeText={text => handleInputChange('title', text)}
        />

        {/* Assigned To */}
        <Text className="font-semibold mb-2">Assigned To</Text>
        <View className="border rounded-lg mb-8 px-3 py-3 bg-white relative">
          <Pressable
            className="flex-row items-center justify-between"
            onPress={() => setShowAssigneeDropdown(prev => !prev)}
          >
            {formTasks[activeTab]?.assignedTo ? (
              <View className="flex-row items-center">
                {(() => {
                  const selectedUser = assigneeOptions.find(opt => opt.value === formTasks[activeTab]?.assignedTo);
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
              <Text className="text-base">Select Assignee</Text>
            )
            }
            <MaterialIcons name={showAssigneeDropdown ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={22} color="#888" />
          </Pressable>
          {showAssigneeDropdown && (
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
                {assigneeOptions.map(user => (
                  <Pressable
                    key={user.value}
                    className={`py-3 px-4 flex-row items-center ${formTasks[activeTab]?.assignedTo === user.value ? 'bg-blue-100' : ''}`}
                    onPress={() => {
                      handleInputChange('assignedTo', user.value);
                      setShowAssigneeDropdown(false);
                    }}
                  >
                    <View className="mr-3">
                            <Avatar 
                              name={`${user.firstName || ''} ${user.lastName || ''}`}
                              size="sm"
                              src={user.imageURL || undefined}
                            />
                    </View>
                    <View>
                      <Text className={`text-base ${formTasks[activeTab]?.assignedTo === user.value ? 'font-bold text-blue-700' : 'text-black'}`}>
                        {user.label}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Start Date */}
        <Text className="font-semibold mb-2">Start Date</Text>
        <Pressable
          className="border rounded-lg px-3 py-3 mb-8 bg-white flex-row items-center justify-between"
          onPress={() => {
            if (Platform.OS === 'android') {
              DateTimePickerAndroid.open({
                value: formTasks[activeTab]?.datetime ? new Date(formTasks[activeTab].datetime) : new Date(),
                mode: 'date',
                onChange: (event, selectedDate) => {
                  if (selectedDate) {
                    // Keep time part if present, else just set date
                    const prev = formTasks[activeTab]?.datetime ? new Date(formTasks[activeTab].datetime) : new Date();
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
            {formTasks[activeTab]?.datetime
              ? new Date(formTasks[activeTab].datetime).toLocaleDateString()
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
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
              <View style={{ backgroundColor: 'white', borderRadius: 10, padding: 20, width: 320 }}>
                <DateTimePicker
                  value={formTasks[activeTab]?.datetime ? new Date(formTasks[activeTab].datetime) : new Date()}
                  mode="date"
                  display="spinner"
                  onChange={(_, selectedDate) => {
                    if (selectedDate) {
                      // Keep time part if present, else just set date
                      const prev = formTasks[activeTab]?.datetime ? new Date(formTasks[activeTab].datetime) : new Date();
                      selectedDate.setHours(prev.getHours(), prev.getMinutes(), prev.getSeconds());
                      handleInputChange('datetime', selectedDate.toISOString());
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
        <Text className="font-semibold mb-2">End Date</Text>
        <Pressable
          className="border rounded-lg px-3 py-3 mb-8 bg-white flex-row items-center justify-between"
          onPress={() => {
            if (Platform.OS === 'android') {
              DateTimePickerAndroid.open({
                value: formTasks[activeTab]?.endDate ? new Date(formTasks[activeTab].endDate) : new Date(),
                mode: 'date',
                onChange: (event, selectedDate) => {
                  if (selectedDate) {
                    handleInputChange('endDate' as any, selectedDate.toISOString());
                  }
                },
              });
            } else {
              setShowEndDatePicker(true);
            }
          }}
        >
          <Text className="text-base text-black">
            {formTasks[activeTab]?.endDate
              ? new Date(formTasks[activeTab].endDate).toLocaleDateString()
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
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
              <View style={{ backgroundColor: 'white', borderRadius: 10, padding: 20, width: 320 }}>
                <DateTimePicker
                  value={formTasks[activeTab]?.endDate ? new Date(formTasks[activeTab].endDate) : new Date()}
                  mode="date"
                  display="spinner"
                  onChange={(_, selectedDate) => {
                    if (selectedDate) {
                      handleInputChange('endDate' as any, selectedDate.toISOString());
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
        <Text className="font-semibold mb-2">Times of Day</Text>
        <View className="border rounded-lg mb-8 px-3 py-3 bg-white relative">
          <Pressable
            className="flex-row items-center justify-between"
            onPress={() => setShowTimesDropdown(prev => !prev)}
          >
            <Text className="text-base">
              {formTasks[activeTab]?.detail ? formTasks[activeTab]?.detail : 'Select Time'}
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
                  const label = hour.toString().padStart(2, '0') + ':00';
                  return (
                    <Pressable
                      key={label}
                      className={`py-3 px-4 ${formTasks[activeTab]?.detail === label ? 'bg-blue-100' : ''}`}
                      onPress={() => {
                        handleInputChange('detail', label);
                        setShowTimesDropdown(false);
                      }}
                    >
                      <Text className={`text-base ${formTasks[activeTab]?.detail === label ? 'font-bold text-blue-700' : 'text-black'}`}>{label}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Recurrence */}
        <Text className="font-semibold mb-2">Recurrence</Text>
        <View className="border rounded-lg mb-8 px-3 py-3 bg-white relative">
          <Pressable
            className="flex-row items-center justify-between"
            onPress={() => setShowRecurrenceDropdown(!showRecurrenceDropdown)}
          >
            <Text className="text-base">
              {['NONE', 'DAILY', 'WEEKLY', 'MONTHLY'].includes(formTasks[activeTab]?.subDetail || '') && formTasks[activeTab]?.subDetail
                ? formTasks[activeTab]?.subDetail.charAt(0) + formTasks[activeTab]?.subDetail.slice(1).toLowerCase()
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
                    className={`py-3 px-4 ${formTasks[activeTab]?.subDetail === option ? 'bg-blue-100' : ''}`}
                    onPress={() => {
                      handleInputChange('subDetail', option);
                      setShowRecurrenceDropdown(false);
                    }}
                  >
                    <Text className={`text-base ${formTasks[activeTab]?.subDetail === option ? 'font-bold text-blue-700' : 'text-black'}`}>
                      {option.charAt(0) + option.slice(1).toLowerCase()}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Purpose */}
        <Text className="font-semibold mb-2">Purpose</Text>
        <TextInput
          className="border rounded-lg px-3 py-3 mb-8"
          placeholder="Purpose"
          value={formTasks[activeTab]?.description || ''}
          onChangeText={text => handleInputChange('description', text)}
        />

        {/* Priority */}
        <Text className="font-semibold mb-2">Priority</Text>
        <View className="flex-row mb-8">
          {['high', 'medium', 'low'].map((level) => (
            <Pressable
              key={level}
              className={`flex-1 flex-row items-center justify-center border rounded-lg py-3 mx-1 ${formTasks[activeTab]?.priority === level ? 'bg-[#FAE5CA] border-black' : 'bg-white border-slate-300'}`}
              onPress={() => handleInputChange('priority', level)}
            >
              <MaterialIcons name="flag" size={18} color={level === 'high' ? 'red' : level === 'medium' ? 'gold' : 'blue'} />
              <Text className={`ml-1 font-semibold capitalize ${formTasks[activeTab]?.priority === level ? 'text-black' : 'text-black'}`}>{level}</Text>
            </Pressable>
          ))}
        </View>

        {/* Instructions */}
        <Text className="font-semibold mb-2">Instructions</Text>
        <TextInput
          className="border rounded-lg px-3 py-3 mb-4 min-h-[80px]"
          placeholder="Instructions"
          value={formTasks[activeTab]?.description || ''}
          onChangeText={text => handleInputChange('description', text)}
          multiline
        />

        {/* Save/Done Buttons can go here */}
        <View className="flex-row justify-between mt-4 mb-20">
          <Pressable
            className={`flex-1 py-3 border border-black rounded-full items-center mr-2 ${tabDirty[activeTab] ? 'bg-white' : 'bg-slate-300'}`}
            onPress={handleSaveTask}
            disabled={!tabDirty[activeTab]}
          >
            <Text className="text-black text-base font-semibold">Save Task</Text>
          </Pressable>
          <Pressable
            className={`flex-1 py-3 rounded-full items-center ml-2 ${tabDirty.some(Boolean) ? 'bg-black' : 'bg-slate-300'}`}
            onPress={handleSaveAllTasks}
            disabled={!tabDirty.some(Boolean)}
          >
            <Text className="text-white text-base font-semibold">Create All</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
};

export default AiGeneratedTasksReviewScreen;