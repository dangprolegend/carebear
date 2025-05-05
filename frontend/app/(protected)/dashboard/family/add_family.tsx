import { View, Text, Modal, TouchableOpacity, Alert, TextInput, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useState, useRef } from 'react';

interface AddFamilyProps {
  visible: boolean;
  onClose: () => void;
  onAddFamily: (familyName: string) => void;
}

export default function AddFamily({ visible, onClose, onAddFamily }: AddFamilyProps) {
  const [showMembersInput, setShowMembersInput] = useState(false);
  const [tempFamilyName, setTempFamilyName] = useState('');
  const [numMembers, setNumMembers] = useState(1); 
  
  // Track the family name
  const familyNameInputRef = useRef<TextInput>(null);
  
  // Function to proceed to members input screen
  const handleContinueToMembers = () => {
    if (tempFamilyName.trim() === '') {
      Alert.alert('Error', 'Please enter a family name');
      return;
    }
    
    // Show the members input screen
    setShowMembersInput(true);
  };

  // Function to complete family creation
  const handleAddFamily = () => {
    if (tempFamilyName.trim() === '') {
      Alert.alert('Error', 'Please enter a family name');
      return;
    }
    
    // Call the parent component's handler to add the family
    onAddFamily(tempFamilyName.trim());
    
    // Reset state
    setTempFamilyName('');
    setShowMembersInput(false);
  };
  
  // Function to go back to family creation screen
  const handleBackToFamilyCreation = () => {
    setShowMembersInput(false);
  };

  // Function to handle cancellation
  const handleCancel = () => {
    setTempFamilyName('');
    setShowMembersInput(false);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white w-4/5 p-6 rounded-2xl" style={{ maxHeight: '80%' }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {!showMembersInput ? (
              <View>
                {/* Hidden shadow input to track values */}
                <TextInput
                  ref={familyNameInputRef}
                  style={{ display: 'none' }}
                  value={tempFamilyName}
                  onChangeText={setTempFamilyName}
                />
                
                {/* Create Family Group UI */}
                <View>
                  <Text className="mb-8 text-3xl font-bold text-foreground">Create Family Group</Text>
                  
                  <View className="mb-6">
                    <Text className="mb-2 text-lg font-medium">Group Name</Text>
                    <TextInput
                      placeholder="Group name"
                      value={tempFamilyName}
                      onChangeText={setTempFamilyName}
                      autoCapitalize="words"
                      className="border border-gray-300 rounded-lg px-4 py-2"
                    />
                  </View>
                  
                  <View className="mb-6">
                    <Text className="mb-2 text-lg font-medium">Number of Members</Text>
                    <View className="border border-gray-300 rounded-lg px-4 py-2 flex-row justify-between items-center">
                      <Text>{numMembers}</Text>
                      <View className="flex-row">
                        <TouchableOpacity 
                          onPress={() => setNumMembers(prev => Math.max(1, prev - 1))}
                          className="px-3 py-1"
                        >
                          <Text className="text-lg">-</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          onPress={() => setNumMembers(prev => Math.min(10, prev + 1))}
                          className="px-3 py-1"
                        >
                          <Text className="text-lg">+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            ) : (
              /* Step 2: Members Input  */
              <View>
                <Text className="mb-8 text-3xl font-bold text-foreground">Member Information</Text>
                
                <View className="space-y-4">
                  {Array.from({ length: numMembers }, (_, i) => (
                    <View
                      key={i}
                      className="flex-row items-center justify-between p-4 border border-gray-300 rounded-lg bg-white"
                    >
                      <View className="flex-row items-center">
                        <View className="h-6 w-6 border-2 border-gray-400 rounded mr-3" />
                        <Text className="text-lg">Member {i + 1}</Text>
                      </View>
                      <MaterialIcons name="chevron-right" size={24} color="#666" />
                    </View>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
          
          <View className="flex-row justify-between mt-6">
            {!showMembersInput ? (
              <>
                <TouchableOpacity 
                  className="bg-gray-200 py-3 px-6 rounded-lg"
                  onPress={handleCancel}
                >
                  <Text className="text-gray-800 font-medium">Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className="bg-blue-950 py-3 px-8 rounded-lg"
                  onPress={handleContinueToMembers}
                >
                  <Text className="text-white font-medium">Next</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity 
                  className="bg-gray-200 py-3 px-6 rounded-lg"
                  onPress={handleBackToFamilyCreation}
                >
                  <Text className="text-gray-800 font-medium">Back</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className="bg-blue-950 py-3 px-8 rounded-lg"
                  onPress={handleAddFamily}
                >
                  <Text className="text-white font-medium">Create Family</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}