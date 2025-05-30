// app/task/ai-review.tsx (Example path for Expo Router)
// Or src/screens/AiGeneratedTasksReviewScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable, Alert, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Task as FrontendTaskType } from '../task'; // ADJUST PATH
import { fetchRecentTasksForGroup, updateTask } from '../../../../../service/apiServices';

// TODO: Import your apiService function for updating tasks if you add inline quick edits
// import { updateTaskAPI } from '../../../../services/apiService';

// Add prop types for AiGeneratedTasksReviewScreen
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
  assignedTo: '', // Ensure this is a string (user ID) or null
};

const NUM_TABS = 5;

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

  // Fetch recent tasks for the group and display them
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

  const navigateToEditScreen = (task: FrontendTaskType) => {
    if (task._id) {
      console.log("Navigating to edit AI task:", task.title);
      router.push({
        pathname: `./createtask`, // ADJUST this route to your edit screen
        params: { taskData: JSON.stringify(task) }
      });
    } else {
      Alert.alert("Error", "Task ID is missing, cannot edit.");
    }
  };

  const handleDone = () => {
    if (onDone) {
      onDone();
    } else {
      router.replace('../dashboardBase'); // Fallback navigation
    }
  };

  // Always show 5 tabs, fill with empty tasks if needed
  const paddedTasks = [
    ...aiTasks,
    ...Array(Math.max(0, NUM_TABS - aiTasks.length)).fill(EMPTY_TASK)
  ].slice(0, NUM_TABS);

  // Form state for each tab (initialize with aiTasks or empty)
  const [formTasks, setFormTasks] = useState<FrontendTaskType[]>(paddedTasks);

  useEffect(() => {
    setFormTasks(paddedTasks);
  }, [aiTasks]);

  // Track if the current tab has unsaved changes
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

  // Helper to sanitize task payload for backend
  const sanitizeTaskForBackend = (task: FrontendTaskType) => {
    // Remove null for description, only send string or undefined
    // assignedTo must be string or undefined for backend
    const { description, assignedTo, _id, datetime, type, title, detail, subDetail, checked, priority, status } = task;
    // Only send fields that exist on BackendTask and are compatible
    const payload: any = {
      title,
      description: description ?? undefined,
      priority: priority ?? undefined,
      status: status ?? undefined,
    };
    if (typeof assignedTo === 'string') {
      payload.assignedTo = assignedTo;
    }
    // Optionally add reminder, etc. if needed
    return payload;
  };

  // Save only the current tab's task
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

  // Save all tasks that have unsaved changes
  const handleSaveAllTasks = async () => {
    const updatePromises = formTasks.map(async (task, idx) => {
      if (tabDirty[idx] && task._id) {
        try {
          await updateTask(task._id, sanitizeTaskForBackend(task));
        } catch (e) {
          // Optionally handle per-task error
        }
      }
    });
    await Promise.all(updatePromises);
    setTabDirty(Array(NUM_TABS).fill(false));
    Alert.alert('Success', 'All edited tasks updated.');
  };

  if (aiTasks.length === 0 && !isLoading) { // Show message if no tasks after parsing
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
    <View className="flex-1 bg-white">
      {/* Tab Bar */}
      <View className="flex-row border-b border-slate-200">
        {[...Array(NUM_TABS)].map((_, idx) => (
          <Pressable
            key={idx}
            className={`flex-1 py-3 items-center ${activeTab === idx ? 'border-b-2 border-black' : ''}`}
            onPress={() => setActiveTab(idx)}
          >
            <Text className={`font-semibold ${activeTab === idx ? 'text-black' : 'text-slate-400'}`}>{`Task ${idx + 1}`}</Text>
          </Pressable>
        ))}
      </View>

      {/* Task Form for Active Tab */}
      <ScrollView className="p-5">
        {/* Task Name */}
        <Text className="font-bold mb-1">Task Name</Text>
        <TextInput
          className="border rounded-lg px-3 py-2 mb-4"
          placeholder="Task Name"
          value={formTasks[activeTab]?.title || ''}
          onChangeText={text => handleInputChange('title', text)}
        />

        {/* Assigned To */}
        <Text className="font-bold mb-1">Assigned To (User ID)</Text>
        <TextInput
          className="border rounded-lg px-3 py-2 mb-4"
          placeholder="Assignee User ID"
          value={formTasks[activeTab]?.assignedTo || ''}
          onChangeText={text => handleInputChange('assignedTo', text)}
        />

        {/* Start Date */}
        <Text className="font-bold mb-1">Start Date</Text>
        <TextInput
          className="border rounded-lg px-3 py-2 mb-2"
          placeholder="YYYY-MM-DD"
          value={formTasks[activeTab]?.datetime?.slice(0, 10) || ''}
          onChangeText={text => handleInputChange('datetime', text)}
        />

        {/* Times of Day */}
        <Text className="font-bold mb-1">Times of Day</Text>
        <TextInput
          className="border rounded-lg px-3 py-2 mb-2"
          placeholder="09:00,17:00"
          value={formTasks[activeTab]?.detail || ''}
          onChangeText={text => handleInputChange('detail', text)}
        />

        {/* Recurrence */}
        <Text className="font-bold mb-1">Recurrence</Text>
        <TextInput
          className="border rounded-lg px-3 py-2 mb-4"
          placeholder="DAILY/WEEKLY/NONE"
          value={formTasks[activeTab]?.subDetail || ''}
          onChangeText={text => handleInputChange('subDetail', text)}
        />

        {/* Purpose */}
        <Text className="font-bold mb-1">Purpose</Text>
        <TextInput
          className="border rounded-lg px-3 py-2 mb-4"
          placeholder="Purpose"
          value={formTasks[activeTab]?.description || ''}
          onChangeText={text => handleInputChange('description', text)}
        />

        {/* Priority */}
        <Text className="font-bold mb-1">Priority</Text>
        <View className="flex-row mb-4">
          {['high', 'medium', 'low'].map((level) => (
            <Pressable
              key={level}
              className={`flex-1 flex-row items-center justify-center border rounded-lg py-2 mx-1 ${formTasks[activeTab]?.priority === level ? 'bg-slate-200 border-black' : 'bg-white border-slate-300'}`}
              onPress={() => handleInputChange('priority', level)}
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
          value={formTasks[activeTab]?.description || ''}
          onChangeText={text => handleInputChange('description', text)}
          multiline
        />

        {/* Save/Done Buttons can go here */}
        <View className="flex-row justify-between mt-4 mb-8">
          <Pressable
            className={`flex-1 py-3 rounded-lg items-center mr-2 ${tabDirty[activeTab] ? 'bg-blue-600' : 'bg-slate-300'}`}
            onPress={handleSaveTask}
            disabled={!tabDirty[activeTab]}
          >
            <Text className="text-white text-base font-semibold">Save Task</Text>
          </Pressable>
          <Pressable
            className={`flex-1 py-3 rounded-lg items-center ml-2 ${tabDirty.some(Boolean) ? 'bg-black' : 'bg-slate-300'}`}
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