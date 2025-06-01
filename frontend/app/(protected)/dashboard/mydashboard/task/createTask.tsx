import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useAuth } from '@clerk/clerk-expo';
import axios from 'axios';
import { FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  processAndCreateAiTasksAPI,
  setClerkAuthTokenForApiService,
  setCurrentUserIDForApiService,
  setCurrentGroupIDForApiService
} from '../../../../../service/apiServices';
import ManualTaskForm from './manualTask';
import AiGeneratedTasksReviewScreen from './aiTask';
import { Task as FrontendTaskType } from '../task';

const AiTaskInputScreen = () => {
  const navigation = useNavigation();
  const { userId, getToken } = useAuth();

  const [promptText, setPromptText] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserID, setCurrentUserID] = useState<string | null>(null);
  const [currentGroupID, setCurrentGroupID] = useState<string | null>(null);
  const [clerkToken, setClerkToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchIds = async () => {
      if (userId) {
        // Get Clerk session token
        const token = await getToken();
        setClerkToken(token);
        setClerkAuthTokenForApiService(token);

        // Get backend userID from Clerk ID
        const userResponse = await axios.get(`https://carebear-backend.onrender.com/api/users/clerk/${userId}`);
        const backendUserID = userResponse.data.userID;
        setCurrentUserID(backendUserID);
        setCurrentUserIDForApiService(backendUserID);

        // Get groupID from backend userID
        const groupResponse = await axios.get(`https://carebear-backend.onrender.com/api/users/${backendUserID}/group`);
        setCurrentGroupID(groupResponse.data.groupID);
        setCurrentGroupIDForApiService(groupResponse.data.groupID);
      }
    };
    fetchIds();
  }, [userId, getToken]);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Access to your photo library is needed to select an image.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images']   ,   
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.6, 
      base64: true, 
    });

    if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0].base64) {
      setSelectedImageUri(result.assets[0].uri);
      setImageBase64(result.assets[0].base64);
    }
  };
  const [generatedAiTasks, setGeneratedAiTasks] = useState<FrontendTaskType[]>([]);
  const handleSubmitToAI = async () => {
      if (!promptText && !imageBase64) {
        Alert.alert("Input Required", "Please provide a text prompt or select an image.");
        return;
      }
      if (!currentUserID || !currentGroupID) { 
        Alert.alert("Error", "User or Group information is missing. Please try logging in again.");
        return;
      }
      if (!clerkToken) { 
        Alert.alert("Authentication Error", "User session token is missing. Please try logging in again.");
        return;
      }
      setIsLoading(true);
      setGeneratedAiTasks([]); 
      try {
        const responseData = await processAndCreateAiTasksAPI({
          groupID: currentGroupID,
          userID: currentUserID,
          prompt_text: promptText,
          image_base64: imageBase64 ?? undefined,
        });

        if (responseData.tasks && responseData.tasks.length > 0) {
          Alert.alert(
            "Tasks Generated!",
            `${responseData.tasks.length} task(s) were created by AI. You can review or edit them now.`,
            [{ text: "OK" }]
          );
          setGeneratedAiTasks(
            responseData.tasks.map((task: any) => ({
              ...task,
              datetime: task.datetime ?? new Date().toISOString() 
            }))
          ); 
        } else {
          Alert.alert(
            "No Tasks Generated",
            responseData.message || "The AI didn't find any tasks to create. You can try adding one manually.",
            [{ text: "OK" }]
          );
          setGeneratedAiTasks([]); 
        }
  
      } catch (error: any) {
        console.error("Network or other error submitting to AI:", error);
        Alert.alert("Submission Error", error?.message || "An error occurred. Please try adding manually.");
        setGeneratedAiTasks([]); 
      } finally {
        setIsLoading(false);
      }
    };

    const navigateToEditAiTask = (task: FrontendTaskType) => {
    if (task._id) {
      console.log("Navigating to edit AI task:", task.title);
      router.push({
        pathname: `./aiTask`, 
        params: { taskData: JSON.stringify(task) } 
      });
    } else {
      Alert.alert("Error", "Task ID is missing, cannot edit.");
    }
  };

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center px-1 border-b border-black-200 bg-white justify-between">
        <View className="w-8" />
        <Text className="text-lg font-bold text-black-800">Create New Task</Text>
        <Pressable onPress={() => router.back()} className="p-4 ml-auto">
          <MaterialIcons name="close" size={26} color="black" />
        </Pressable>  
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="p-5"
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1">
          <Text className="text-sm text-black-600 mb-3 text-center px-4">
            Describe the task you'd like AI to help with
          </Text>
          <TextInput
            className="bg-white-50 border border-orange-100 rounded-xl p-4 text-base min-h-[100px] text-gray-900 mb-5"
            placeholder="My grandmother needs to take Osteoarthritis around 11:30 am and 6pm everyday."
            placeholderTextColor="#9ca3af"
            value={promptText}
            onChangeText={setPromptText}
            multiline
            textAlignVertical="top"
          />

          {/* Preview selected image for AI */}
          {selectedImageUri && (
            <View className="mb-5 items-center relative bg-slate-200 p-2 rounded-lg">
              <Text className="text-xs text-slate-500 mb-1">Image for AI processing:</Text>
              <Image
                source={{ uri: selectedImageUri }}
                className="w-full h-32 rounded-md"
                resizeMode="contain"
              />
              <Pressable
                className="absolute top-1 right-1 bg-black/50 rounded-full p-1 active:bg-black/70"
                onPress={() => { setSelectedImageUri(null); setImageBase64(null); }}
              >
                <MaterialIcons name="close" size={18} color="white" />
              </Pressable>
            </View>
          )}

          <Pressable
            className={`flex-row justify-center items-center py-4 rounded-full mt-1 mb-3 ${isLoading ? 'bg-grey' : 'bg-black active:bg-grey'}`}
            onPress={handleSubmitToAI} 
            disabled={isLoading}
          >
            {isLoading && !selectedImageUri ? ( 
              <ActivityIndicator size="small" color="white" className="mr-2"/>
            ) : (
              <FontAwesome5 name="magic" size={18} color="white" className="mr-2" />
            )}
            <Text className="text-white text-base font-semibold">
              Generate Task with AI
            </Text>
          </Pressable>

          <Text className="text-center text-sm text-black-500 my-3">
            Or click the button below to scan your medications and let AI auto-fill the details.
          </Text>

          <Pressable
            className="flex-row justify-center items-center py-3 rounded-full border-2 mb-5 bg-black"
            onPress={pickImage} 
            disabled={isLoading}
          >
            <MaterialIcons name="qr-code-scanner" size={22} color="white" className="mr-2" />
            <Text className="text-white text-base font-semibold">
              Scan Medication / Upload Image
            </Text>
          </Pressable>

          {/* Placeholder for Manual Input Section */}
          {isLoading ? ( 
            <View className="items-center my-5">
              <ActivityIndicator size="large" color="#FF9800" />
              <Text className="text-slate-600 mt-2">AI is processing and creating tasks...</Text>
            </View>
          ) : generatedAiTasks.length > 0 ? (
            <View className="mt-6 border-t border-slate-200 pt-4">
              <AiGeneratedTasksReviewScreen 
                generatedTasksJSON={JSON.stringify(generatedAiTasks)}
                groupID={currentGroupID}
                userID={currentUserID}
                onDone={() => {
                  
                  router.back();
                }}
              />
            </View>
          ) : (
          
            <View className="mt-2 border-slate-200 pt-1">
              <Text className="text-center text-sm text-black">
                Or fill manually below
              </Text>
              <ManualTaskForm
                currentUserID={currentUserID} 
                currentGroupID={currentGroupID}
                onTaskCreated={() => {
                  console.log("Manual task created callback triggered from AiTaskInputScreen.");        
                  router.back(); 
                }}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default AiTaskInputScreen;