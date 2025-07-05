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
  StyleSheet,
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

  const [activeTab, setActiveTab] = useState<'generate' | 'scan'>('generate');
  const [promptText, setPromptText] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserID, setCurrentUserID] = useState<string | null>(null);
  const [currentGroupID, setCurrentGroupID] = useState<string | null>(null);
  const [clerkToken, setClerkToken] = useState<string | null>(null);
  
  // Ensure loading state is reset if the component unmounts or there's an error
  useEffect(() => {
    return () => {
      setIsLoading(false); // Reset loading state when component unmounts
    };
  }, []);

  useEffect(() => {
    const fetchIds = async () => {
      if (userId) {
        // Get Clerk session token
        const token = await getToken();
        setClerkToken(token);
        setClerkAuthTokenForApiService(token);

        // Get backend userID from Clerk ID
        const userResponse = await axios.get(`https://carebear-4ju68wsmg-carebearvtmps-projects.vercel.app/api/users/clerk/${userId}`);
        const backendUserID = userResponse.data.userID;
        setCurrentUserID(backendUserID);
        setCurrentUserIDForApiService(backendUserID);

        // Get groupID from backend userID
        const groupResponse = await axios.get(`https://carebear-4ju68wsmg-carebearvtmps-projects.vercel.app/api/users/${backendUserID}/group`);
        setCurrentGroupID(groupResponse.data.groupID);
        setCurrentGroupIDForApiService(groupResponse.data.groupID);
      }
    };
    fetchIds();
  }, [userId, getToken]);

  const pickImage = async (shouldScan = false) => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraPermission.granted === false || libraryPermission.granted === false) {
      Alert.alert("Permission Required", "Access to your camera and photo library is needed to select or take images.");
      return;
    }

    const options = {
      mediaTypes: 'images' as any,
      allowsEditing: true,
      aspect: [4, 3] as [number, number],
      quality: 0.6,
      base64: true,
    };

    let result;
    if (shouldScan) {
      // For scanning, we prefer using the camera
      result = await ImagePicker.launchCameraAsync(options);
    } else {
      // For general task images, launch the photo library
      result = await ImagePicker.launchImageLibraryAsync(options);
    }

    if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0].base64) {
      setSelectedImageUri(result.assets[0].uri);
      setImageBase64(result.assets[0].base64);
      
      if (shouldScan) {
        // If scanning, immediately submit to AI for processing
        handleSubmitToAI(true);
      }
    }
  };
  const [generatedAiTasks, setGeneratedAiTasks] = useState<FrontendTaskType[]>([]);
  const [loadingStep, setLoadingStep] = useState<number>(1);

  const handleSubmitToAI = async (isScan = false) => {
      if (!isScan && !promptText && !imageBase64) {
        Alert.alert("Input Required", "Please provide a text prompt or select an image.");
        return;
      }
      if (isScan && !imageBase64) {
        Alert.alert("Image Required", "Please scan or select an image of your medication.");
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
      setLoadingStep(1);

      // Simulate loading steps for UI feedback
      let step = 1;
      const interval = setInterval(() => {
        setLoadingStep((prev) => {
          if (prev < 6) {
            step = prev + 1;
            return step;
          }
          return prev;
        });
      }, 500);

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
        clearInterval(interval);
        setLoadingStep(6);
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
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
        nestedScrollEnabled={true}
      >
        <View className="flex-1">
          {/* Tab selector */}
          <View className="flex-row mb-5 border-b border-gray-200">
            <Pressable 
              style={[
                styles.tabButton, 
                { borderBottomWidth: activeTab === 'generate' ? 3 : 0 }
              ]}
              onPress={() => setActiveTab('generate')}
            >
              <Text style={[
                styles.tabText, 
                { fontWeight: activeTab === 'generate' ? 'bold' : 'normal' }
              ]}>
                Generate Task with AI
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.tabButton, 
                { borderBottomWidth: activeTab === 'scan' ? 3 : 0 }
              ]}
              onPress={() => setActiveTab('scan')}
            >
              <Text style={[
                styles.tabText, 
                { fontWeight: activeTab === 'scan' ? 'bold' : 'normal' }
              ]}>
                Scan with AI
              </Text>
            </Pressable>
          </View>

          {activeTab === 'generate' ? (
            <>
              <Text className="text-sm text-black-600 mb-3 text-center px-4">
                Describe the task you'd like AI to help with
              </Text>
              <TextInput
                className="bg-white-50 border border-orange-100 rounded-xl p-4 text-base min-h-[100px] text-gray-900 mb-7"
                placeholder="My grandmother needs to take Osteoarthritis around 11:30 am and 6pm everyday."
                placeholderTextColor="#9ca3af"
                value={promptText}
                onChangeText={setPromptText}
                multiline
                textAlignVertical="top"
              />
            </>
          ) : (
            <View className="mb-7">
                    <Text className="text-center text-sm text-black-500 my-3 pb-3">
            Or click the button below to scan your medications and let AI auto-fill the details
          </Text>

          <View className="flex-row justify-center">
            <Pressable
              className={`flex-row justify-center items-center py-2 px-4 rounded-full border-2 ${isLoading ? 'bg-gray-400' : 'bg-black active:bg-gray-700'}`}
              style={{ width: 'auto', alignSelf: 'center', minWidth: 200 }}
              onPress={() => {
                console.log("Scan button pressed, isLoading:", isLoading);
                if (!isLoading) {
                  pickImage(true);
                }
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" className="mr-2"/>
              ) : (
                <MaterialIcons name="camera-alt" size={22} color="white" className="mr-2" />
              )}
              <Text className="text-white text-base font-semibold">
                {isLoading ? "Processing..." : "Scan and Autofill with AI"}
              </Text>
            </Pressable>
          </View>
            </View>
          )}
          

          {/* Preview selected image for AI */}
          {selectedImageUri && (activeTab === 'generate' || (activeTab === 'scan' && !isLoading)) && (
            <View className="mb-5 items-center relative bg-slate-200 p-2 rounded-lg">
              <Text className="text-xs text-slate-500 mb-1">
                {activeTab === 'scan' ? 'Scanned medication:' : 'Image for AI processing:'}
              </Text>
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

          {activeTab === 'generate' ? (
            <View className="flex-row justify-center">
              <Pressable
                className={`mb-7 flex-row justify-center items-center py-3 px-4 rounded-full mt-1 mb-3 ${isLoading ? 'bg-grey' : 'bg-black active:bg-grey'}`}
                style={{ width: 'auto', alignSelf: 'center', minWidth: 200 }}
                onPress={() => handleSubmitToAI()} 
                disabled={isLoading}
              >
                {isLoading ? ( 
                  <ActivityIndicator size="small" color="white" className="mr-2"/>
                ) : (
                  <FontAwesome5 name="magic" size={18} color="white" className="mr-2" />
                )}
                <Text className="text-white text-base font-semibold">
                  Generate Task with AI
                </Text>
              </Pressable>
            </View>
          ) : null}

    

          {/* Placeholder for Manual Input Section */}
          {isLoading ? ( 
            <View className="items-center my-5">
              {/* Transition of 6 different images, last image = finished */}
                <View className="items-center mb-3">
                <Image
                  source={
                  [
                    require('../../../../../assets/images/Property 1=Sending.png'),
                    require('../../../../../assets/images/Property 1=Variant2.png'),
                    require('../../../../../assets/images/Property 1=Variant3.png'),
                    require('../../../../../assets/images/Property 1=Variant4.png'),
                    require('../../../../../assets/images/Property 1=Variant5.png'),
                    require('../../../../../assets/images/Property 1=Variant6.png'),
                  ][(loadingStep - 1) % 5] 
                  }
                  style={{
                  width: 250,
                  height: 100,
                  opacity: 1,
                  borderRadius: 12,
                  borderWidth: loadingStep === 6 ? 2 : 0,
                  borderColor: loadingStep === 6 ? 'transparent' : 'transparent',
                  }}
                  resizeMode="cover"
                  progressiveRenderingEnabled={true}
                  blurRadius={0}
                />
                {loadingStep === 6 && (
                  <Image
                  source={require('../../../../../assets/images/Property 1=Variant6.png')}
                  style={{
                    width: 250,
                    height: 100,
                    opacity: 1,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: 'transparent',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                  }}
                  resizeMode="cover"
                  progressiveRenderingEnabled={true}
                  blurRadius={0}
                  />
                )}
                </View>
              <Text className="text-slate-600 mt-2">
              {`AI is processing and creating tasks...`}
              </Text>
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
            </View>          ) : (
            <View className=" border-slate-200">
              {activeTab === 'generate' || (activeTab === 'scan' && !selectedImageUri) ? (
                <Text className="text-center text-sm text-black">
                  Or fill manually below
                </Text>
              ) : null}
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

const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomColor: '#362209',
  },
  tabText: {
    fontSize: 14,
    color: '#362209',
  }
});

export default AiTaskInputScreen;