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




const YOUR_BACKEND_API_BASE_URL = "";

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

        // Get backend userID from Clerk ID
        const userResponse = await axios.get(`https://carebear-backend.onrender.com/api/users/clerk/${userId}`);
        const backendUserID = userResponse.data.userID;
        setCurrentUserID(backendUserID);

        // Get groupID from backend userID
        const groupResponse = await axios.get(`https://carebear-backend.onrender.com/api/users/${backendUserID}/group`);
        setCurrentGroupID(groupResponse.data.groupID);
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

    const requestBody = {
      userID: currentUserID, // Your backend's aiController expects userID from req.user._id after auth
      groupID: currentGroupID,
      prompt_text: promptText,
      image_base64: imageBase64, 
    };

    try {
      const response = await fetch(`${YOUR_BACKEND_API_BASE_URL}/api/ai/suggest-tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${clerkToken}` // Send Clerk token for backend auth
        },
        body: JSON.stringify(requestBody),
      });
      const responseText = await response.text(); // Get response as text first
        console.log("Raw response status:", response.status);
        console.log("Raw response headers:", JSON.stringify(response.headers)); // May or may not be super useful here
        console.log("Raw response text from server:", responseText);

      const responseData = await response.json();

      if (response.ok) {
        Alert.alert(
          "Tasks Generated!",
          `${responseData.tasks?.length || 0} task(s) were created by AI. You can review them on your dashboard.`,
          [{ text: "OK"  }] 
           
        );
        console.log("AI Generated and Created Tasks:", responseData.tasks);
        setPromptText('');
        setImageBase64(null);
        setSelectedImageUri(null);
      } else {
        Alert.alert("AI Error", responseData.error || responseData.message || "Failed to generate tasks with AI. Please try again.");
        console.error("AI Error Response from backend:", responseData);
      }
    } catch (error) {
      console.error("Network or other error submitting to AI:", error);
      Alert.alert("Submission Error", "An error occurred while contacting the AI service. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      className="p-5 bg-slate-100" // Using slate for a slightly different background
      keyboardShouldPersistTaps="handled"
    >
      <View className="flex-1">
        <Text className="text-2xl font-bold mb-6 text-center text-slate-800">
          Add Tasks with AI
        </Text>

        <View className="mb-5">
          <Text className="text-base font-medium mb-2 text-slate-700">
            Describe the tasks or prescription details:
          </Text>
          <TextInput
            className="bg-white border border-slate-300 rounded-lg p-4 text-base min-h-[120px] text-slate-900"
            placeholder="e.g., Mom's morning meds, John's cough syrup instructions, or details from a prescription..."
            placeholderTextColor="#9ca3af"
            value={promptText}
            onChangeText={setPromptText}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View className="mb-6">
          <Text className="text-base font-medium mb-2 text-slate-700">
            Upload Prescription Image (Optional):
          </Text>
          <Pressable
            className="flex-row items-center bg-slate-200 p-4 rounded-lg justify-center active:bg-slate-300"
            onPress={pickImage}
          >
            <MaterialIcons name="photo-camera" size={24} color="#007AFF" />
            <Text className="ml-3 text-base text-blue-600 font-medium">
              {selectedImageUri ? "Change Image" : "Select Image"}
            </Text>
          </Pressable>
        </View>

        {selectedImageUri && (
          <View className="mb-6 items-center relative bg-slate-200 p-2 rounded-lg">
            <Image
              source={{ uri: selectedImageUri }}
              className="w-full h-48 rounded-md" // Adjusted height
              resizeMode="contain"
            />
            <Pressable
              className="absolute top-1 right-1 bg-black/50 rounded-full p-1 active:bg-black/70"
              onPress={() => {
                setSelectedImageUri(null);
                setImageBase64(null);
              }}
            >
              <MaterialIcons name="close" size={20} color="white" />
            </Pressable>
          </View>
        )}

        <Pressable
          className={`py-4 rounded-lg items-center mt-4 ${isLoading ? 'bg-blue-300' : 'bg-blue-600 active:bg-blue-700'}`}
          onPress={handleSubmitToAI}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white text-lg font-semibold">
              Generate & Create Tasks
            </Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default AiTaskInputScreen;