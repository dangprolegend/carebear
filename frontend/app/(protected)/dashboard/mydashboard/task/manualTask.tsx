// components/task/ManualTaskForm.tsx (or a suitable path)
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { createManualTaskAPI } from '../../../../../service/apiServices'; // ADJUST PATH

// TODO: Remove this placeholder and get from props or context
const API_BASE_URL = "https://your-ngrok-or-deployed-url.com"; // Replace

// Props that ManualTaskForm will receive from AiTaskInputScreen
type ManualTaskFormProps = {
  currentUserID: string | null; // Backend User ID for assignedBy
  currentGroupID: string | null;
  onTaskCreated?: () => void; // Optional callback after task creation
};

interface ManualTaskData { // Local state for the form
  title: string;
  description?: string;
  startDateString?: string;
  endDateString?: string;
  timesOfDayInput?: string;
  recurrenceRule?: string;
  priority?: 'low' | 'medium' | 'high' | null;
  assignedToId?: string | null;
}

const ManualTaskForm = ({ currentUserID, currentGroupID, onTaskCreated }: ManualTaskFormProps) => {
  // const { getToken } = useAuth(); // If this component needs to refresh token itself
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

  // TODO: Date/Time Picker states and handlers would go here
  // const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  // const [datePickerTarget, setDatePickerTarget] = useState<'start' | 'end' | null>(null);

  const handleInputChange = (field: keyof ManualTaskData, value: string | null) => {
    setManualForm(prev => ({ ...prev, [field]: value }));
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
    setIsLoading(true);
    try {
      const reminderPayload: any = {};
      if (manualForm.startDateString) reminderPayload.start_date = manualForm.startDateString;
      if (manualForm.endDateString) reminderPayload.end_date = manualForm.endDateString;
      if (manualForm.timesOfDayInput) reminderPayload.times_of_day = manualForm.timesOfDayInput.split(',').map(t => t.trim()).filter(t => t.match(/^\d{2}:\d{2}$/));
      if (manualForm.recurrenceRule && manualForm.recurrenceRule !== 'NONE') reminderPayload.recurrence_rule = manualForm.recurrenceRule;

      // Fix assignedTo for backend: only send if present, and as { _id: string }
      let assignedToPayload: any = undefined;
      if (manualForm.assignedToId && manualForm.assignedToId !== '') {
        assignedToPayload = { _id: manualForm.assignedToId };
      }
      const taskToCreateForBackend = {
        title: manualForm.title,
        description: manualForm.description ?? undefined,
        groupID: currentGroupID,
        assignedTo: assignedToPayload,
        priority: manualForm.priority || 'medium',
        reminder: Object.keys(reminderPayload).length > 0 ? reminderPayload : undefined,
      };

      const createdTask = await createManualTaskAPI(taskToCreateForBackend);
      Alert.alert("Success", `Task \"${createdTask.title}\" created!`, [{
        text: "OK",
        onPress: () => {
          setManualForm({ title: '', description: '', startDateString: '', endDateString: '', timesOfDayInput: '', recurrenceRule: 'NONE', priority: 'medium', assignedToId: null });
          if (onTaskCreated) onTaskCreated();
        }
      }]);
    } catch (error: any) {
      Alert.alert("Manual Creation Error", error?.message || "Failed to create task manually.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <View className="mt-4 pt-4">
      <Text className="text-lg font-semibold text-slate-700 mb-3">Create Task Manually:</Text>

      {/* Task Title */}
      <Text className="font-bold mb-1">Task Name</Text>
      <TextInput
        className="border rounded-lg px-3 py-2 mb-4"
        placeholder="Task Name"
        value={manualForm.title}
        onChangeText={text => handleInputChange('title', text)}
      />

      {/* Assigned To */}
      <Text className="font-bold mb-1">Assigned To (User ID)</Text>
      <TextInput
        className="border rounded-lg px-3 py-2 mb-4"
        placeholder="Assignee User ID"
        value={manualForm.assignedToId || ''}
        onChangeText={text => handleInputChange('assignedToId', text)}
      />

      {/* Start and End Date */}
      <Text className="font-bold mb-1">Start and end date</Text>
      <TextInput
        className="border rounded-lg px-3 py-2 mb-2"
        placeholder="Start Date (YYYY-MM-DD)"
        value={manualForm.startDateString || ''}
        onChangeText={text => handleInputChange('startDateString', text)}
      />
      <TextInput
        className="border rounded-lg px-3 py-2 mb-2"
        placeholder="End Date (YYYY-MM-DD)"
        value={manualForm.endDateString || ''}
        onChangeText={text => handleInputChange('endDateString', text)}
      />

      {/* Times of Day and Recurrence */}
      <View className="flex-row mb-2">
        <TextInput
          className="flex-1 border rounded-lg px-3 py-2 mr-2"
          placeholder="Time(s), e.g. 09:00,17:00"
          value={manualForm.timesOfDayInput || ''}
          onChangeText={text => handleInputChange('timesOfDayInput', text)}
        />
        <TextInput
          className="w-28 border rounded-lg px-3 py-2"
          placeholder="Daily"
          value={manualForm.recurrenceRule || ''}
          onChangeText={text => handleInputChange('recurrenceRule', text)}
        />
      </View>

      {/* Purpose */}
      <Text className="font-bold mb-1">Purpose</Text>
      <TextInput
        className="border rounded-lg px-3 py-2 mb-4"
        placeholder="Purpose"
        value={manualForm.description || ''}
        onChangeText={text => handleInputChange('description', text)}
      />

      {/* Priority */}
      <Text className="font-bold mb-1">Priority</Text>
      <View className="flex-row mb-4">
        {['high', 'medium', 'low'].map((level) => (
          <Pressable
            key={level}
            className={`flex-1 flex-row items-center justify-center border rounded-lg py-2 mx-1 ${manualForm.priority === level ? 'bg-slate-200 border-black' : 'bg-white border-slate-300'}`}
            onPress={() => handleInputChange('priority', level as 'low'|'medium'|'high')}
          >
            <MaterialIcons name="flag" size={18} color={level === 'high' ? 'red' : level === 'medium' ? 'gold' : 'blue'} />
            <Text className="ml-1 font-semibold capitalize">{level}</Text>
          </Pressable>
        ))}
      </View>

      {/* Instructions */}
      <Text className="font-bold mb-1">Instructions</Text>
      <TextInput
        className="border rounded-lg px-3 py-2 mb-4 min-h-[80px]"
        placeholder="Instructions"
        value={manualForm.description || ''}
        onChangeText={text => handleInputChange('description', text)}
        multiline
      />

      <Pressable
        className={`py-4 rounded-lg items-center mt-3 ${isLoading ? 'bg-blue-300' : 'bg-blue-600 active:bg-blue-700'}`}
        onPress={handleSaveManualTask}
        disabled={isLoading}
      >
        {isLoading ? <ActivityIndicator color="white"/> : <Text className="text-white text-lg font-semibold">Create Task</Text>}
      </Pressable>
    </View>
  );
};

export default ManualTaskForm;