import React from 'react';
import { Modal, View, Text, TouchableOpacity, Alert, Pressable, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { X } from 'lucide-react-native';

interface ImagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onImageSelected: (imageUri: string) => void;
  userImageURL?: string;
}

export default function ImagePickerModal({ visible, onClose, onImageSelected, userImageURL }: ImagePickerModalProps) {
  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant permission to access camera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onImageSelected(result.assets[0].uri);
      onClose();
    }
  };

  const openImageLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onImageSelected(result.assets[0].uri);
      onClose();
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-[#AF9D86]/60">
        <View className="bg-white border border-[#2A1800] rounded-xl w-11/12 max-h-4/5 p-6">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-1" />
            <Text className="text-black font-lato text-xl font-extrabold">
              Upload Profile Picture
            </Text>
            <View className="flex-1 items-end">
              <Pressable onPress={onClose}>
                <X />
              </Pressable>
            </View>
          </View>
          
          <View className="gap-3 bg-[#FAE5CA] p-2 rounded-lg items-center">
            {userImageURL && (
              <Image
                source={{ uri: userImageURL }}
                className='w-48 h-48 flex-shrink-0 aspect-square rounded-full border-2 border-[#2A1800] bg-cover bg-center mt-6 mb-6'
              />
            )}
            <View className="flex-row justify-between items-center mb-6">
            <TouchableOpacity
              onPress={openCamera}
              className="bg-white border border-[#2A1800] py-3 rounded-full w-32 mr-5"
            >
              <Text className="text-[#2A1800] text-center font-semibold">
                Camera
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={openImageLibrary}
              className="bg-[#2A1800] border border-[#2A1800] py-3 rounded-full w-32"
            >
              <Text className="text-white text-center font-semibold">
                Browse
              </Text>
            </TouchableOpacity>
            </View>
            <Text className="text-[#2A1800] text-center mb-6">Supported formates: JPEG, PNG, and JPG</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}