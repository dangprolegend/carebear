//@ts-nocheck
import  { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { fetchTaskById, updateTaskWithImage, fetchUserInfoById, deleteTask } from '../../../../../service/apiServices';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import FeedLoading from '~/components/ui/feed-loading';
import redFlag from '~/assets/icons/redflag.png';
import yellowFlag from '~/assets/icons/yellowflag.png';
import blueFlag from '~/assets/icons/blueflag.png';
import {Camera} from 'lucide-react-native';
import {Pen} from 'lucide-react-native';
import { Trash2} from 'lucide-react-native';

const PRIORITY_FLAG = {
  high: { icon: redFlag },
  medium: { icon: yellowFlag },
  low: { icon: blueFlag },
};

const TaskInfoScreen = () => {
  const { taskId } = useLocalSearchParams();
  const [task, setTask] = useState<any>(null);
  const [assignedByUser, setAssignedByUser] = useState<any>(null);
  const [assignedToUser, setAssignedToUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Fetch task
  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true);
      setError(null);
      try {
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

  // Fetch assigned by user info
  useEffect(() => {
    const fetchAssignedBy = async () => {
      if (task?.assignedBy) {
        try {
          const userId = typeof task.assignedBy === 'object' ? task.assignedBy._id : task.assignedBy;
          const user = await fetchUserInfoById(userId);
          setAssignedByUser(user);
        } catch {
          setAssignedByUser(null);
        }
      } else {
        setAssignedByUser(null);
      }
    };
    fetchAssignedBy();
  }, [task]);

  // Fetch assigned to user info
  useEffect(() => {
    const fetchAssignedTo = async () => {
      if (task?.assignedTo) {
        try {
          const userId = typeof task.assignedTo === 'object' ? task.assignedTo._id : task.assignedTo;
          const user = await fetchUserInfoById(userId);
          setAssignedToUser(user);
        } catch {
          setAssignedToUser(null);
        }
      } else {
        setAssignedToUser(null);
      }
    };
    fetchAssignedTo();
  }, [task]);

  // Image picker using camera
  const takePhoto = async () => {
    // Request camera permissions
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    
    if (!cameraPermission.granted) {
      Alert.alert('Permission Required', 'Access to your camera is needed to take a photo.');
      return;
    }
    
    try {
      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
        console.log("Photo taken:", result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Camera Error', 'There was a problem using the camera. Please try again.');
    }
  };

  // Mark done with image
  const handleMarkDone = async () => {
    if (!photoUri) {
      Alert.alert('Photo Required', 'Please take a photo as evidence before marking as done.');
      return;
    }
    setUploading(true);
    try {
      const response = await fetch(photoUri);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result?.toString().split(',')[1];
        if (!base64data) {
          Alert.alert('Error', 'Failed to read image data.');
          setUploading(false);
          return;
        }
        // Send both 'image' and 'evidenceUrl' to ensure compatibility
        await updateTaskWithImage(taskId as string, { 
          status: 'done', 
          image: base64data, 
          evidenceUrl: base64data, 
          completionMethod: 'photo',
          completedAt: new Date() 
        });
        Alert.alert('Success', 'Task marked as done!');
        
        // Refresh the task data to show the image
        const updatedTask = await fetchTaskById(taskId as string);
        setTask(updatedTask);
        setPhotoUri(null);
        setUploading(false);
      };
      reader.readAsDataURL(blob);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to update task status.');
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <FeedLoading 
        dataReady={false}
        onFinish={() => setLoading(false)}
      />
    );
  }
  if (error || !task) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">{error || 'Task not found.'}</Text>
      </View>
    );
  }

  // Priority flag color
  let flagColor = '#B0B0B0';
  if (task.priority === 'high') flagColor = PRIORITY_FLAG.high.color;
  else if (task.priority === 'medium') flagColor = PRIORITY_FLAG.medium.color;
  else if (task.priority === 'low') flagColor = PRIORITY_FLAG.low.color;

  // Determine if the task has an attached image
  const taskImage = task.evidenceUrl || task.image || null;
  
  // Debug the image data
  console.log('Task image data:', {
    hasEvidenceUrl: !!task.evidenceUrl,
    hasImage: !!task.image,
    taskImage
  });

  return (
    <View className="flex-1 bg-transparent">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-8 pb-2 border-b border-black bg-white">
        <Image 
          source={PRIORITY_FLAG[task.priority]?.icon} 
          style={{ width: 18, height: 18, marginRight: 8 }} 
        />
        <Text className="text-lg font-bold text-black flex-1 text-center" numberOfLines={1}>{task.title}</Text>
        <Pressable onPress={() => router.back()} className="p-1">
          <MaterialIcons name="close" size={26} color="black" />
        </Pressable>
      </View>

      {/* Scrollable content with image and info */}
      <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingBottom: 32 }}>

        {/* Image section - full width, scrolls with content */}
        <View className="w-full aspect-[4/3] bg-gray-100 relative items-center justify-center">
          {/* Banner absolutely positioned on top of the image */}
          <View className="absolute top-3 left-4 right-4 z-10 bg-[#2A1800] rounded-lg py-3 px-2 items-center opacity-90">
            <Text className="text-white text-lg font-medium text-center">Show us you took it-just a quick photo!</Text>
          </View>
          {taskImage ? (
            <Image 
              source={{ 
                uri: taskImage.startsWith('data:') ? taskImage : `data:image/jpeg;base64,${taskImage}` 
              }} 
              className="absolute w-full h-full" 
              resizeMode="cover" 
            />
          ) : photoUri ? (
            <Image source={{ uri: photoUri }} className="absolute w-full h-full" resizeMode="cover" />
          ) : (
            <Text className="text-gray-400 text-center mt-5 pt-0">No photo captured</Text>
          )}
          {!taskImage && (
            <Pressable
              className="absolute bottom-3 right-3 bg-[#2A1800] rounded-full p-2"
              onPress={takePhoto}
            >
              <Camera color="white" size={24} />
            </Pressable>
          )}
        </View>
        
        {/* Edit and Delete Buttons */}
        <View className="flex-row justify-end px-4 mt-2">
            <Pressable 
            className="mr-8 mt-4 p-2 flex-row items-center border border-[#2A1800] rounded-full aspect-square w-8 h-8 justify-center" 
            onPress={() => {
              // Navigate to the edit task screen with the taskId
              router.push({
                pathname: "/(protected)/dashboard/mydashboard/task/editTask",
                params: { taskId }
              });
            }}
            >
            <Pen size='16'/>
            </Pressable>
          <Pressable 
            className="mt-4 p-2 flex-row items-center border border-[#2A1800] rounded-full aspect-square w-8 h-8 justify-center" 
            onPress={() => {
              Alert.alert(
                "Delete Task",
                "Are you sure you want to delete this task?",
                [
                  {
                    text: "Cancel",
                    style: "cancel"
                  },
                  { 
                    text: "Delete", 
                    style: "destructive",
                    onPress: async () => {
                      try {
                        // Implement delete functionality here
                        await deleteTask(taskId as string);
                        Alert.alert("Success", "Task deleted successfully");
                        router.back();
                      } catch (err: any) {
                        Alert.alert("Error", err?.message || "Failed to delete task");
                      }
                    }
                  }
                ]
              );
            }}
          >
            <Trash2 size={16}/>
          </Pressable>
        </View>

        {/* Info section */}
        <View className="px-4 pt-4">
          <View className="mb-3 p-3">
            <Text className="font-bold mb-2">Instructions</Text>
            <Text>{task.description || 'No instructions provided.'}</Text>
          </View>
          <View className="mb-3 p-3">
            <Text className="font-bold mb-2">Purpose</Text>
            <Text>{task.purpose || task.description || 'No purpose provided.'}</Text>
          </View>
          <View className="mb-3 p-3">
            <Text className="font-bold mb-2">Start and End Date</Text>
            {/* Debug logs for reminder and dates */}
            {(() => {
              if (task.reminder) {
              }
              return null;
            })()}
            <Text>
              {task.reminder?.start_date
                ? (() => {
                    const start = new Date(task.reminder.start_date);
                    const startStr = isNaN(start.getTime()) ? String(task.reminder.start_date) : start.toLocaleDateString();
                    if (task.reminder.end_date) {
                      const end = new Date(task.reminder.end_date);
                      const endStr = isNaN(end.getTime()) ? String(task.reminder.end_date) : end.toLocaleDateString();
                      return `${startStr} - ${endStr}`;
                    } else {
                      return startStr;
                    }
                  })()
                : 'N/A'}
            </Text>
          </View>
          <View className="mb-3 flex-row items-center p-3">
            <Text>
                <Text className="font-bold">Assigned </Text>
                to{' '}
            </Text>
            {assignedToUser ? (
              <>
                <Image
                  source={{ uri: assignedToUser.imageURL || 'https://via.placeholder.com/32' }}
                  className="w-6 h-6 rounded-full mx-1"
                />
                <Text className="font-bold">{assignedToUser.fullName || 'Unknown'}</Text>
              </>
            ) : (
              <Text className="font-bold">Unassigned</Text>
            )}
            <Text> by{' '}</Text>
            {assignedByUser ? (
              <>
                <Image
                  source={{ uri: assignedByUser.imageURL || 'https://via.placeholder.com/32' }}
                  className="w-6 h-6 rounded-full mx-1"
                />
                <Text className="font-bold">{assignedByUser.fullName || 'Unknown'}</Text>
              </>
            ) : (
              <Text className="font-bold">Nobody</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Mark Done Button - hidden if task has image */}
      {!taskImage && (
        <View className="px-3 pb-8 pt-2">
          <Pressable
            className={`rounded-full py-4 items-center ${photoUri ? 'bg-[#3A2B13]' : 'bg-gray-400'}`}
            onPress={handleMarkDone}
            disabled={!photoUri || uploading}
          >
            <Text className="text-white text-lg font-semibold">{uploading ? 'Marking...' : 'Mark Done'}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

export default TaskInfoScreen;
