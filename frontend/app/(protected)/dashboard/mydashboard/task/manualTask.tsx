import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, ActivityIndicator, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { createManualTaskAPI } from '../../../../../service/apiServices'; // ADJUST PATH

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

  const [showDateRangeModal, setShowDateRangeModal] = useState(false);
  const [showTimesDropdown, setShowTimesDropdown] = useState(false);
  const [showRecurrenceDropdown, setShowRecurrenceDropdown] = useState(false);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(manualForm.startDateString ? new Date(manualForm.startDateString) : new Date());
  const [tempEndDate, setTempEndDate] = useState(manualForm.endDateString ? new Date(manualForm.endDateString) : new Date());

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
    <View className="mt-4 pt-4 ml-2 mr-2">

      {/* Task Title */}
      <Text className="font-semibold mb-2">Task Name</Text>
      <TextInput
        className="border border-[0.5px] rounded-lg px-3 py-3 mb-8"
        placeholder="Task Name"
        value={manualForm.title}
        onChangeText={text => handleInputChange('title', text)}
      />

      <Text className="font-semibold mb-2">Assigned To</Text>
      <View className="border border-[0.5px] rounded-lg px-3 py-1 mb-8 bg-white">
        <Pressable
          className="py-2.5"
          onPress={() => setShowAssigneeDropdown(true)}
        >
          <Text>
            {manualForm.assignedToId === '681ed8ef263e811447b9f1a1'
              ? 'Minh Le'
              : manualForm.assignedToId === '6822b2e0a8f4a090c6b13f8a'
              ? 'Luigi'
              : manualForm.assignedToId === '682d4cb8b00f754d18bc6584'
              ? 'Dang Nguyen'
              : 'Select Assignee'}
          </Text>
        </Pressable>
        <Modal
          visible={!!showAssigneeDropdown}
          transparent
          animationType="fade"
          onRequestClose={() => setShowAssigneeDropdown(false)}
        >
          <Pressable
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' }}
            onPress={() => setShowAssigneeDropdown(false)}
          >
            <View style={{
              backgroundColor: 'white',
              borderRadius: 8,
              margin: 300,
              marginLeft: 50,
              padding: 10,
              alignSelf: 'flex-start',
              width: 220
            }}>
              {[
          { label: 'Minh Le', value: '681ed8ef263e811447b9f1a1' },
          { label: 'Luigi', value: '6822b2e0a8f4a090c6b13f8a' },
          { label: 'Dang Nguyen', value: '682d4cb8b00f754d18bc6584' }
              ].map(opt => (
          <Pressable
            key={opt.value}
            onPress={() => {
              handleInputChange('assignedToId', opt.value);
              setShowAssigneeDropdown(false);
            }}
            style={{
              paddingVertical: 12,
              borderBottomWidth: opt.value !== 'user3' ? 0.5 : 0,
              borderColor: '#eee'
            }}
          >
            <Text>{opt.label}</Text>
          </Pressable>
              ))}
            </View>
          </Pressable>
        </Modal>
      </View>

      <Text className="font-semibold mb-2">Date Range</Text>
      <Pressable
        className="border border-[0.5px] rounded-lg px-3 py-2 mb-4 bg-white"
        onPress={() => setShowDateRangeModal(true)}
      >
        <Text>
          {manualForm.startDateString && manualForm.endDateString
            ? `${manualForm.startDateString} - ${manualForm.endDateString}`
            : 'Select Date Range'}
        </Text>
      </Pressable>

      {/* Date Range Modal */}
      <Modal
        visible={showDateRangeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDateRangeModal(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <View style={{ backgroundColor: 'white', borderRadius: 10, padding: 20, width: 320 }}>
            <Text className="mb-2 font-semibold">Select Start Date</Text>
            <DateTimePicker
              value={tempStartDate}
              mode="date"
              display="default"
              onChange={(_, selectedDate) => {
                if (selectedDate) setTempStartDate(selectedDate);
              }}
            />
            <Text className="mb-2 mt-4 font-semibold">Select End Date</Text>
            <DateTimePicker
              value={tempEndDate}
              mode="date"
              display="default"
              onChange={(_, selectedDate) => {
                if (selectedDate) setTempEndDate(selectedDate);
              }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 }}>
              <Pressable
                style={{ marginRight: 16 }}
                onPress={() => setShowDateRangeModal(false)}
              >
                <Text style={{ color: 'black', fontWeight: 'medium' }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  handleInputChange('startDateString', tempStartDate.toISOString().slice(0, 10));
                  handleInputChange('endDateString', tempEndDate.toISOString().slice(0, 10));
                  setShowDateRangeModal(false);
                }}
              >
                <Text style={{ color: 'black', fontWeight: 'bold' }}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <View className="flex-row mb-8 items-center">
        <View className="flex-1 mr-2">
          <Pressable
        className="border border-[0.5px] rounded-lg px-2 py-2 bg-white"
        onPress={() => setShowTimesDropdown(true)}
          >
        <Text>
          {manualForm.timesOfDayInput
            ? manualForm.timesOfDayInput
            : 'Select Time'}
        </Text>
          </Pressable>
          {/* Times Dropdown Modal */}
          <Modal
        visible={!!showTimesDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTimesDropdown(false)}
          >
        <Pressable
          style={{  backgroundColor: 'rgba(0,0,0,0.2)' }}
          onPress={() => setShowTimesDropdown(false)}
        >
          <View style={{
            backgroundColor: 'white',
            borderRadius: 8,
            margin: 360,
            marginLeft: 50,
            padding: 10,
            alignSelf: 'flex-start',
            width: 200
          }}>
            <ScrollView>
          {Array.from({ length: 24 }).map((_, hour) => {
            const label = hour.toString().padStart(2, '0') + ':00';
            return (
              <Pressable
            key={label}
            onPress={() => {
              handleInputChange('timesOfDayInput', label);
              setShowTimesDropdown(false);
            }}
            style={{
              paddingVertical: 10,
              borderBottomWidth: hour < 23 ? 0.5 : 0,
              borderColor: '#eee'
            }}
              >
            <Text>{label}</Text>
              </Pressable>
            );
          })}
            </ScrollView>
          </View>
        </Pressable>
          </Modal>
        </View>

        {/* Recurrence Dropdown (Touchable) */}
        <View className="w-32">
          <Pressable
        className="border border-[0.5px] rounded-lg px-2 py-2 bg-white"
        onPress={() => setShowRecurrenceDropdown(true)}
          >
        <Text>
          {{
            NONE: 'None',
            DAILY: 'Daily',
            WEEKLY: 'Weekly',
            MONTHLY: 'Monthly'
          }[manualForm.recurrenceRule || 'NONE']}
        </Text>
          </Pressable>
          {/* Recurrence Dropdown Modal */}
          <Modal
        visible={!!showRecurrenceDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRecurrenceDropdown(false)}
          >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' }}
          onPress={() => setShowRecurrenceDropdown(false)}
        >
          <View style={{
            backgroundColor: 'white',
            borderRadius: 8,
            margin: 360,
            marginLeft: 220,
            padding: 10,
            alignSelf: 'flex-start',
            width: 160
          }}>
            {[
          { label: 'None', value: 'NONE' },
          { label: 'Daily', value: 'DAILY' },
          { label: 'Weekly', value: 'WEEKLY' },
          { label: 'Monthly', value: 'MONTHLY' }
            ].map(opt => (
          <Pressable
            key={opt.value}
            onPress={() => {
              handleInputChange('recurrenceRule', opt.value);
              setShowRecurrenceDropdown(false);
            }}
            style={{
              paddingVertical: 10,
              borderBottomWidth: opt.value !== 'MONTHLY' ? 0.5 : 0,
              borderColor: '#eee'
            }}
          >
            <Text>{opt.label}</Text>
          </Pressable>
            ))}
          </View>
        </Pressable>
          </Modal>
        </View>
      </View>

            {/* Purpose */}
            <Text className="font-semibold mb-2">Purpose</Text>
            <TextInput
              className="border border-[0.5px] rounded-lg px-3 py-2 mb-8"
              placeholder="Purpose"
              value={manualForm.description || ''}
              onChangeText={text => handleInputChange('description', text)}
            />

            {/* Priority */}
            <Text className="font-semibold mb-2">Priority</Text>
            <View className="flex-row mb-8">
                      {['high', 'medium', 'low'].map((level) => (
                        <Pressable
                          key={level}
                          className={`flex-1 flex-row items-center justify-center border border-[0.5px] rounded-lg py-3 mx-1 ${manualForm.priority === level ? 'border-[black] bg-[#FAE5CA]' : 'bg-white border-black'}`}
                          onPress={() => handleInputChange('priority', level)}
                        >
                          <MaterialIcons name="flag" size={18} color={level === 'high' ? 'red' : level === 'medium' ? 'gold' : 'blue'} />
                          <Text className={`ml-1 font-semibold capitalize ${manualForm.priority === level ? 'text-black' : 'text-black'}`}>{level}</Text>
                        </Pressable>
                      ))}
              </View>

      {/* Instructions */}
      <Text className="font-semibold mb-2">Instructions</Text>
      <TextInput
        className="border border-[0.5px] rounded-lg bg-white px-3 py-2 mb-4 min-h-[80px]"
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
        {isLoading ? <ActivityIndicator color="white"/> : <Text className="text-white text-base font-semibold">Create Task</Text>}
      </Pressable>
    </View>
  );
};

export default ManualTaskForm;