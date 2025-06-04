import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable, Image, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { fetchTaskById, updateTask } from '../../../../../service/apiServices';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

const PRIORITY_FLAG = {
  high: { color: '#FF0000', icon: 'flag' },
  medium: { color: '#FFD700', icon: 'flag' },
  low: { color: '#0000FF', icon: 'flag' },
};

const TaskInfoScreen = () => {
  // Get the taskId from the route params
  const params = useLocalSearchParams();
  const { taskId } = params;
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch the task by its ID
        const foundTask = await fetchTaskById(taskId as string);
        setTask(foundTask);
      } catch (err: any) {
        setError('Failed to load task info');
      } finally {
        setLoading(false);
      }
    };
    if (taskId) fetchTask();
  }, [taskId]);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Access to your photo library is needed to select an image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleMarkDone = async () => {
    if (!photoUri) {
      Alert.alert('Photo Required', 'Please upload a photo as evidence before marking as done.');
      return;
    }
    setUploading(true);
    try {
      await updateTask(taskId as string, { status: 'done' });
      Alert.alert('Success', 'Task marked as done!');
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to update task status.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#FAE5CA" />
        <Text className="mt-2 text-gray-600">Loading task info...</Text>
      </View>
    );
  }
  if (error || !task) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">{error || 'Task not found.'}</Text>
      </View>
    );
  }

  // Priority flag color (fix TS error)
  let flagColor = '#B0B0B0';
  if (task.priority === 'high') flagColor = PRIORITY_FLAG.high.color;
  else if (task.priority === 'medium') flagColor = PRIORITY_FLAG.medium.color;
  else if (task.priority === 'low') flagColor = PRIORITY_FLAG.low.color;

  return (
    <View className="flex-1 bg-transparent">
      {/* Header */}
    <View className="flex-row items-center justify-between px-4 pt-8 pb-2 border-b border-black bg-white">
      <MaterialIcons name="flag" size={22} color={flagColor} />
      <Text className="text-lg font-bold text-black flex-1 text-center" numberOfLines={1}>{task.title}</Text>
      <Pressable onPress={() => router.back()} className="p-1">
        <MaterialIcons name="close" size={26} color="black" />
      </Pressable>
    </View>

      {/* Banner */}
      <View className="bg-[#2A1800] mx-4 mt-4 rounded-lg py-4 pl-1 pr-1 items-center">
        <Text className="text-white text-base font-medium text-center">Show us you took it—just a quick photo!</Text>
      </View>

      {/* Scrollable content with image and info */}
      <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Image section - full width, scrolls with content */}
        <View className="mt-4 w-full aspect-[4/3] bg-gray-100 relative items-center justify-center">
          {photoUri ? (
            <Image source={{ uri: photoUri }} className="absolute w-full h-full" resizeMode="cover" />
          ) : (
            <Text className="text-gray-400 text-center mt-16">No photo uploaded</Text>
          )}
          <Pressable
            className="absolute bottom-3 right-3 bg-[#2A1800] rounded-full p-2"
            onPress={pickImage}
          >
            <MaterialIcons name="photo-camera" size={24} color="white" />
          </Pressable>
        </View>

        {/* Info section */}
        <View className="px-4 pt-4">
          <View className="mb-3">
            <Text className="font-bold mb-2">Instructions</Text>
            <Text>{ task.description || 'No instructions provided.'}</Text>
          </View>
          <View className="mb-3">
            <Text className="font-bold mb-2">Purpose</Text>
            <Text>{task.purpose || task.description || 'No purpose provided.'}</Text>
          </View>
          <View className="mb-3">
            <Text className="font-bold mb-2">Start and End Date</Text>
            <Text>
              {task.reminder?.start_date ? new Date(task.reminder.start_date).toLocaleDateString() : 'N/A'}
              {task.reminder?.end_date ? ` - ${new Date(task.reminder.end_date).toLocaleDateString()}` : ''}
            </Text>
          </View>
          <View className="mb-3 flex-row items-center">
            <Text className="font-bold">Assigned to You by </Text>
            {task.assignedBy?.name ? (
              <>
                <Image
                  source={{ uri: task.assignedBy?.avatar || 'https://via.placeholder.com/32' }}
                  className="w-6 h-6 rounded-full mx-1"
                />
                <Text className="font-bold">{task.assignedBy.name}</Text>
              </>
            ) : (
              <Text className="font-bold">Nobody</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Mark Done Button */}
      <View className="px-3 pb-8 pt-2">
        <Pressable
          className={`rounded-full py-4 items-center ${photoUri ? 'bg-[#3A2B13]' : 'bg-gray-400'}`}
          onPress={handleMarkDone}
          disabled={!photoUri || uploading}
        >
          <Text className="text-white text-lg font-semibold">{uploading ? 'Marking...' : 'Mark Done'}</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default TaskInfoScreen;
