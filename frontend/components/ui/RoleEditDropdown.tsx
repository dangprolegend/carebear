import React, { memo, useState } from 'react';
import { View, Text, Pressable, TextInput, Alert } from 'react-native';
import { Image } from 'react-native';
import axios from 'axios';
import CareBear from '../../assets/icons/carebear.png';
import BabyBear from '../../assets/icons/babybear.png';
import BearBoss from '../../assets/icons/bearboss.png';

interface FamilyMember {
  userID: string;
  fullName: string;
  imageURL: string;
  familialRelation: string | null;
  role: string;
  mood?: string;
  body?: string;
}

interface RoleEditDropdownProps {
  isOpen: boolean;
  member: FamilyMember;
  currentUserID: string;
  activeGroupID: string;
  onClose: () => void;
  onUpdate: (memberID: string, newRole: string, newRelation: string | null) => void;
}

const mapFrontendToBackendRole = (frontendRole: string): string => {
  switch (frontendRole) {
    case 'BearBoss':
      return 'admin';
    case 'CareBear':
      return 'caregiver';
    case 'BabyBear':
      return 'carereceiver';
    default:
      return frontendRole;
  }
};

const mapBackendToFrontendRole = (backendRole: string): string => {
  switch (backendRole) {
    case 'admin':
      return 'BearBoss';
    case 'caregiver':
      return 'CareBear';
    case 'carereceiver':
      return 'BabyBear';
    default:
      return backendRole;
  }
};

const RoleEditDropdown: React.FC<RoleEditDropdownProps> = memo(({
  isOpen,
  member,
  currentUserID,
  activeGroupID,
  onClose,
  onUpdate
}) => {
  const [selectedRole, setSelectedRole] = useState(mapBackendToFrontendRole(member.role));
  const [familialRelation, setFamilialRelation] = useState(member.familialRelation || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [clickedRole, setClickedRole] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setClickedRole(role);
  };

  const toggleRoleDescription = (role: string) => {
    setExpandedRole(expandedRole === role ? null : role);
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'CareBear':
        return 'Assign tasks to yourself and to BabyBear members. You can edit any tasks you\'ve assigned. You can also receive care like a BabyBear, meaning others can assign tasks to you.';
      case 'BabyBear':
        return 'Receive tasks from CareBear and manage your own tasks. You cannot edit tasks assigned to you by others.';
      case 'BearBoss':
        return 'Admin of the family group. You can take on both CareBear and BabyBear roles, and also manage the group by adding or removing members.';
      default:
        return '';
    }
  };

  const handleUpdateRole = async () => {
    if (!currentUserID || !activeGroupID) {
      Alert.alert('Error', 'Missing required information to update role.');
      return;
    }

    try {
      setIsUpdating(true);

      const backendRole = mapFrontendToBackendRole(selectedRole);
      
      const updateData = {
        role: backendRole,
        familialRelation: familialRelation.trim() || null,
        groupID: activeGroupID
      };

      await axios.patch(
        `https://carebear-backend-e1z6.onrender.com/api/users/${currentUserID}/update-role/${member.userID}`,
        updateData
      );

      onUpdate(member.userID, backendRole, updateData.familialRelation);

      onClose();

      Alert.alert('Success', `Member information updated successfully!`);

    } catch (error: any) {
      console.error('Error updating user role:', error);
      
      let errorMessage = 'Failed to update member information. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setSelectedRole(mapBackendToFrontendRole(member.role));
    setFamilialRelation(member.familialRelation || '');
    onClose();
  };

  return (
    <View className="bg-white border border-[#2A1800] rounded-lg p-6 -mt-2">   
      <View className="mb-6">
        <Text className="text-[#2A1800] font-lato text-lg font-semibold mb-3">Default Relationship</Text>
        <TextInput
          className="border border-[#2A1800] rounded-lg p-3 text-[#222] font-lato text-base"
          placeholder="Ex: Mother, Grandfather, Daughter"
          placeholderTextColor="#623405"
          value={familialRelation}
          onChangeText={setFamilialRelation}
          keyboardType="default"
          autoCapitalize="words"
        />
      </View>        
      
      {/* Bear Role Options */}
      <View className="mb-6">
        <Text className="text-[#222] font-lato text-lg font-bold mb-4">Bear Role</Text>
        
        {/* CareBear Option */}
        <View className="mb-3">
          <Pressable 
            className={`p-4 rounded-lg bg-[#E1F0FF] border-b-4 border-2 flex-row items-center gap-3 ${
              selectedRole === 'CareBear' ? 'border-[#2A1800]' : 'border-white'
            }`}
            onPress={() => handleRoleSelect('CareBear')}
          >
            <View className="w-14 h-14 rounded-full flex items-center justify-center">
              <Image source={CareBear} className="w-14 h-14" />
            </View>
            <View className="flex-1">
              <Text className="text-[#222] font-lato text-lg font-semibold">CareBear</Text>
              <Text className="text-[#666] font-lato text-sm">Care giver & receiver</Text>
            </View>
            {clickedRole === 'CareBear' && (
              <Pressable
                className="p-2"
                onPress={() => toggleRoleDescription('CareBear')}
              >
                <Text className="text-[#2A1800] font-lato text-lg">
                  {expandedRole === 'CareBear' ? '^' : '›'}
                </Text>
              </Pressable>
            )}
          </Pressable>
          {expandedRole === 'CareBear' && (
            <View className=" -mt-2 p-4 rounded-b-lg border-r border-l border-b border-[#2A1800]">
              <Text className="text-[#2A1800] font-lato text-sm leading-5">
                {getRoleDescription('CareBear')}
              </Text>
            </View>
          )}
        </View>

        {/* BabyBear Option */}
        <View className="mb-3">
          <Pressable 
            className={`p-4 rounded-lg bg-[#FAE5CA] border-b-4 border-2 flex-row items-center gap-3 ${
              selectedRole === 'BabyBear' ? 'border-[#2A1800]' : 'border-white'
            }`}
            onPress={() => handleRoleSelect('BabyBear')}
          >
            <View className="w-14 h-14 rounded-full flex items-center justify-center">
              <Image source={BabyBear} className="w-14 h-14" />
            </View>
            <View className="flex-1">
              <Text className="text-[#222] font-lato text-lg font-semibold">BabyBear</Text>
              <Text className="text-[#666] font-lato text-sm">Care receiver</Text>
            </View>
            {clickedRole === 'BabyBear' && (
              <Pressable
                className="p-2"
                onPress={() => toggleRoleDescription('BabyBear')}
              >
                <Text className="text-[#2A1800] font-lato text-lg">
                  {expandedRole === 'BabyBear' ? '^' : '›'}
                </Text>
              </Pressable>
            )}
          </Pressable>
          {expandedRole === 'BabyBear' && (
            <View className=" -mt-2 p-4 rounded-b-lg border-r border-l border-b border-[#2A1800]">
              <Text className="text-[#2A1800] font-lato text-sm leading-5">
                {getRoleDescription('BabyBear')}
              </Text>
            </View>
          )}
        </View>

        {/* BearBoss Option */}
        <View className="mb-3">
          <Pressable 
            className={`p-4 rounded-lg bg-[#E1F0FF] border-b-4 border-2 flex-row items-center gap-3 ${
              selectedRole === 'BearBoss' ? 'border-[#2A1800]' : 'border-white'
            }`}
            onPress={() => handleRoleSelect('BearBoss')}
          >
            <View className="w-14 h-14 rounded-full flex items-center justify-center">
              <Image source={BearBoss} className="w-14 h-14" />
            </View>
            <View className="flex-1">
              <Text className="text-[#222] font-lato text-lg font-semibold">BearBoss</Text>
              <Text className="text-[#666] font-lato text-sm">Admin</Text>
            </View>
            {clickedRole === 'BearBoss' && (
              <Pressable
                className="p-2"
                onPress={() => toggleRoleDescription('BearBoss')}
              >
                <Text className="text-[#2A1800] font-lato text-lg">
                  {expandedRole === 'BearBoss' ? '^' : '›'}
                </Text>
              </Pressable>
            )}
          </Pressable>
          {expandedRole === 'BearBoss' && (
            <View className=" -mt-2 p-4 rounded-b-lg border-r border-l border-b border-[#2A1800]">
              <Text className="text-[#2A1800] font-lato text-sm leading-5">
                {getRoleDescription('BearBoss')}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-3">
        <Pressable 
          className="flex-1 py-3 px-6 rounded-full border border-[#2A1800] bg-white flex items-center justify-center"
          onPress={handleCancel}
        >
          <Text className="font-lato text-sm font-bold text-[#666]">
            Cancel
          </Text>
        </Pressable>
        
        <Pressable
          className={`flex-1 py-3 px-6 rounded-full flex items-center justify-center ${
            isUpdating ? 'bg-gray-400' : 'bg-[#2A1800]'
          }`}
          onPress={handleUpdateRole}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <View className="w-3 h-3 mr-1 bg-gray-300 rounded-full animate-pulse" />
          ) : (
            <Text className="text-white font-lato text-sm font-medium">Save</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
});

RoleEditDropdown.displayName = 'RoleEditDropdown';

export default RoleEditDropdown;
