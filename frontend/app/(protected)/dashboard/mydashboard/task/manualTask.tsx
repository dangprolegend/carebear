// components/task/ManualTaskForm.tsx (or a suitable path)
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
// import { createManualTaskAPI, setClerkAuthTokenForApiService } from '../../../services/apiService'; // ADJUST PATH
// import { useAuth } from '@clerk/clerk-expo';

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
    if (!manualForm.title.trim()) {
      Alert.alert("Required", "Task title is required.");
      return;
    }
    if (!currentGroupID || !currentUserID) {
      Alert.alert("Error", "User or Group information is missing. Cannot create task.");
      return;
    }
    // const token = await getToken(); // Fetch fresh token if needed by createManualTaskAPI
    // if (!token) {
    //   Alert.alert("Auth Error", "Session expired. Please log in again.");
    //   return;
    // }
    // setClerkAuthTokenForApiService(token); // Ensure apiService has it

    setIsLoading(true);
    try {
      const reminderPayload: any = {};
      if (manualForm.startDateString) reminderPayload.start_date = manualForm.startDateString;
      if (manualForm.endDateString) reminderPayload.end_date = manualForm.endDateString;
      if (manualForm.timesOfDayInput) reminderPayload.times_of_day = manualForm.timesOfDayInput.split(',').map(t => t.trim()).filter(t => t.match(/^\d{2}:\d{2}$/));
      if (manualForm.recurrenceRule && manualForm.recurrenceRule !== 'NONE') reminderPayload.recurrence_rule = manualForm.recurrenceRule;

      const taskToCreateForBackend = {
        title: manualForm.title,
        description: manualForm.description,
        groupID: currentGroupID,
        // assignedBy: currentUserID, // Backend should get this from authenticated token
        assignedTo: manualForm.assignedToId || undefined,
        priority: manualForm.priority || 'medium',
        reminder: Object.keys(reminderPayload).length > 0 ? reminderPayload : undefined,
      };

      // TODO: UNCOMMENT AND USE YOUR ACTUAL API FUNCTION
      // const createdTask = await createManualTaskAPI(taskToCreateForBackend);
      // Alert.alert("Success", `Task "${createdTask.title}" created!`, [{
      //   text: "OK",
      //   onPress: () => {
      //     if (onTaskCreated) onTaskCreated(); // Call callback
      //     router.back(); // Or navigate to dashboard
      //   }
      // }]);

      // SIMULATED API CALL FOR NOW
      console.log("MANUAL TASK TO CREATE (payload for POST /api/tasks):", taskToCreateForBackend);
      Alert.alert("Manual Task Submitted (Simulated)", `Task "${manualForm.title}" prepared.`, [{
        text: "OK", onPress: () => {
          setManualForm({ title: '', description: '', startDateString: '', endDateString: '', timesOfDayInput: '', recurrenceRule: 'NONE', priority: 'medium', assignedToId: null });
          if (onTaskCreated) onTaskCreated();
          // router.back(); // Decide if you navigate back automatically
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
      <Text className="text-base font-medium mt-2 mb-1 text-slate-600">Task Title*</Text>
      <TextInput
        className="bg-slate-50 border border-slate-300 rounded-lg p-3 text-base text-slate-900 mb-3"
        value={manualForm.title}
        onChangeText={(text) => handleInputChange('title', text)}
        placeholder="e.g., Water the plants"
      />

      {/* Description */}
      <Text className="text-base font-medium mb-1 text-slate-600">Description</Text>
      <TextInput
        className="bg-slate-50 border border-slate-300 rounded-lg p-3 text-base min-h-[80px] text-slate-900 mb-3"
        value={manualForm.description || ''}
        onChangeText={(text) => handleInputChange('description', text)}
        multiline
        textAlignVertical="top"
        placeholder="Any details or notes for the task"
      />

      {/* --- TODO: Implement Proper Scheduling Inputs (DatePickers, TimePickers, Pickers) --- */}
      <Text className="text-base font-medium mt-2 mb-1 text-slate-600">Scheduling (Optional)</Text>
      <TextInput className="bg-slate-50 border border-slate-300 rounded-lg p-3 text-base text-slate-900 mb-2"
          value={manualForm.startDateString || ''} onChangeText={(text) => handleInputChange('startDateString', text)} placeholder="Start Date (YYYY-MM-DD)" />
      <TextInput className="bg-slate-50 border border-slate-300 rounded-lg p-3 text-base text-slate-900 mb-2"
          value={manualForm.endDateString || ''} onChangeText={(text) => handleInputChange('endDateString', text)} placeholder="End Date (YYYY-MM-DD, optional)" />
      <TextInput className="bg-slate-50 border border-slate-300 rounded-lg p-3 text-base text-slate-900 mb-2"
          value={manualForm.timesOfDayInput || ''} onChangeText={(text) => handleInputChange('timesOfDayInput', text)} placeholder="Times, e.g., 09:00,17:00" />
      <TextInput className="bg-slate-50 border border-slate-300 rounded-lg p-3 text-base text-slate-900 mb-3"
          value={manualForm.recurrenceRule || 'NONE'} onChangeText={(text) => handleInputChange('recurrenceRule', text)} placeholder="Recurrence (NONE, DAILY, etc.)" />
      {/* --- End Placeholder for Scheduling Inputs ---- */}

      {/* Priority - TODO: Replace with a Picker */}
      <Text className="text-base font-medium mt-2 mb-1 text-slate-600">Priority</Text>
        <TextInput
          className="bg-slate-50 border border-slate-300 rounded-lg p-3 text-base text-slate-900 mb-3"
          value={manualForm.priority || ''}
          onChangeText={(text) => handleInputChange('priority', text as 'low'|'medium'|'high'|null)}
          placeholder="low, medium, high" />

      {/* Assigned To - TODO: Replace with a User Picker/Search */}
      <Text className="text-base font-medium mt-2 mb-1 text-slate-600">Assign To (Optional)</Text>
      <TextInput
          className="bg-slate-50 border border-slate-300 rounded-lg p-3 text-base text-slate-900 mb-4"
          value={manualForm.assignedToId || ''}
          onChangeText={(text) => handleInputChange('assignedToId', text)}
          placeholder="User ID of assignee"
      />

      <Pressable
        className={`py-4 rounded-lg items-center mt-3 ${isLoading ? 'bg-blue-300' : 'bg-blue-600 active:bg-blue-700'}`}
        onPress={handleSaveManualTask}
        disabled={isLoading}
      >
        {isLoading ? <ActivityIndicator color="white"/> : <Text className="text-white text-lg font-semibold">Save Manual Task</Text>}
      </Pressable>
    </View>
  );
};

export default ManualTaskForm;