//@ts-nocheck
import { View, Text, Pressable, ScrollView, Alert, ActivityIndicator, TouchableOpacity, Modal, Image, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import AddFamily from './add_family';
import { useAuth } from '@clerk/clerk-expo';
import axios from 'axios';
import PillIcon from '../../../../assets/icons/pill.png';
import PillBotte from '../../../../assets/icons/pill-bottle.png';
import Moon from '../../../../assets/icons/moon.png';
import Scale from '../../../../assets/icons/scale.png';
import Foot from '../../../../assets/icons/footprints.png';
import Dumbbell from '../../../../assets/icons/dumbbell.png';
import UserIcon from '../../../../assets/icons/user-round-plus.png';
import Plus from '../../../../assets/icons/plus.png';
import UserPen from '../../../../assets/icons/user-pen.png';
import CareBear from '../../../../assets/icons/carebear.png';
import BabyBear from '../../../../assets/icons/babybear.png';
import BearBoss from '../../../../assets/icons/bearboss.png';
import Invitation from '../../../../assets/icons/bear-letter.png';

// Define the FamilyMember type
interface FamilyMember {
  name: string;
  age: number;
  status: string;
  isStarred?: boolean;
}

// Define the Family type
interface Family {
  id: string;
  name: string;
}

export default function Family() {
  const { isSignedIn, userId } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Family 1');
  const [modalVisible, setModalVisible] = useState(false);

  // Daily status modal states
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [selectedMood, setSelectedMood] = useState('');
  const [selectedBodyFeeling, setSelectedBodyFeeling] = useState('');
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [userID, setUserID] = useState(null);
  const [userImageURL, setUserImageURL] = useState<string | null>(null);
  const [userFullName, setUserFullName] = useState<string | null>(null);

  // Daily status display states (store both value and emoji for user)
  const [todayMoodValue, setTodayMoodValue] = useState<string>('');
  const [todayBodyValue, setTodayBodyValue] = useState<string>('');
  const [todayMoodEmoji, setTodayMoodEmoji] = useState<string>('');
  const [todayBodyEmoji, setTodayBodyEmoji] = useState<string>('');

   // Family members state
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isLoadingFamily, setIsLoadingFamily] = useState(false);

  // add member
  const [showAddMemberDropdown, setShowAddMemberDropdown] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [memberRelation, setMemberRelation] = useState('');
  const [selectedRole, setSelectedRole] = useState('CareBear');
  const [memberEmail, setMemberEmail] = useState('');

  // Invitation states
  const [isSendingInvitation, setIsSendingInvitation] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // save member data state
  const [isDataSaved, setIsDataSaved] = useState(false);
  const [savedMemberData, setSavedMemberData] = useState<{
    memberRelation: string;
    selectedRole: string;
    memberEmail: string;
  } | null>(null);

  // Available families 
  const [availableFamilies, setAvailableFamilies] = useState<Family[]>([
    { id: '1', name: 'Family 1' },
  ]);

  const moods = [
    { id: 'happy', emoji: '😊', label: 'Happy', value: 'happy' },
    { id: 'excited', emoji: '🤩', label: 'Excited', value: 'excited' },
    { id: 'sad',  emoji: '😢',label: 'Sad', value: 'sad' },
    { id: 'angry',  emoji: '😠',label: 'Angry', value: 'angry' },
    { id: 'nervous',  emoji: '😬',label: 'Nervous', value: 'nervous' },
    { id: 'peaceful',  emoji: '🧘',label: 'Peaceful', value: 'peaceful' },
  ];

  const bodyFeelings = [
    { id: 'energized',  emoji: '⚡',label: 'Energized', value: 'energized' },
    { id: 'sore',  emoji: '💪',label: 'Sore', value: 'sore' },
    { id: 'tired',  emoji: '😴',label: 'Tired', value: 'tired' },
    { id: 'sick',  emoji: '🤒',label: 'Sick', value: 'sick' },
    { id: 'relaxed',  emoji: '😌',label: 'Relaxed', value: 'relaxed' },
    { id: 'tense',  emoji: '😣',label: 'Tense', value: 'tense' },
  ];

  // Helper function to get emoji from value
  const getMoodEmoji = (moodValue: string): string => {
    if (moodValue === '') return '👤';
    const mood = moods.find(m => m.value === moodValue);
    return mood ? mood.emoji : '';
  };

  const getBodyEmoji = (bodyValue: string): string => {
    if (bodyValue === '') return '👤';
    const body = bodyFeelings.find(b => b.value === bodyValue);
    return body ? body.emoji : '';
  };

  // Fetch today's daily status
  const fetchTodayStatus = async (userID: string) => {
    try {
      const response = await axios.get(`https://carebear-backend.onrender.com/api/daily/today/${userID}`);
      if (response.data && response.data.mood && response.data.body) {
        setTodayMoodValue(response.data.mood);
        setTodayBodyValue(response.data.body);
        setTodayMoodEmoji(getMoodEmoji(response.data.mood));
        setTodayBodyEmoji(getBodyEmoji(response.data.body));
      } else {
        setTodayMoodValue('');
        setTodayBodyValue('');
        setTodayMoodEmoji('');
        setTodayBodyEmoji('');
      }
    } catch (error) {
      console.error('Error fetching today\'s status:', error);
      setTodayMoodValue('');
      setTodayBodyValue('');
      setTodayMoodEmoji('');
      setTodayBodyEmoji('');
    }
  };

  // Fetch family member's daily status
  const fetchMemberStatus = async (memberUserID: string) => {
    try {
      const response = await axios.get(`https://carebear-backend.onrender.com/api/daily/today/${memberUserID}`);
      if (response.data && response.data.mood && response.data.body) {
        return {
          mood: response.data.mood,
          body: response.data.body
        };
      }
      return { mood: '👤', body: '👤' };
    } catch (error) {
      // Handle 404 specifically - user hasn't submitted status today
      if (error.response && error.response.status === 404) {
        console.log(`Family member ${memberUserID} hasn't submitted status today`);
        return { mood: '', body: '' };
      }
      console.error('Error fetching member status:', error);
      return { mood: '', body: '' };
    }
  };

  // Fetch family members
  const fetchFamilyMembers = async (userID: string) => {
    try {
      setIsLoadingFamily(true);
      const response = await axios.get(`https://carebear-backend.onrender.com/api/users/${userID}/familyMembers`);
      console.log(`Fetched user ID: ${userID}`);

      // Fetch daily status for each family member
      const membersWithStatus = await Promise.all(
        response.data.map(async (member: any) => {
          const status = await fetchMemberStatus(member.userID);
          return {
            ...member,
            mood: status.mood,
            body: status.body
          };
        })
      );
      
      setFamilyMembers(membersWithStatus);
    } catch (error) {
      console.error('Error fetching family members:', error);
      setFamilyMembers([]);
    } finally {
      setIsLoadingFamily(false);
    }
  };

   // Handle saving member info (persist form data)
 const handleSaveMember = () => {
   if (!memberRelation.trim() || !memberEmail.trim()) {
     Alert.alert('Missing Information', 'Please fill in both relation and email fields.');
     return;
   }

   setSavedMemberData({
      memberRelation,
      selectedRole,
      memberEmail,
    });

   setIsDataSaved(true);
   Alert.alert('Success', 'Member information saved. You can now send the invitation anytime.');
 };

 // Handle sending invitation
 const handleSendInvitation = async () => {
   if (!memberRelation.trim() || !memberEmail.trim()) {
     Alert.alert('Missing Information', 'Please fill in both relation and email fields.');
     return;
   }

   if (!userID) {
     Alert.alert('Error', 'User ID not found. Please try again.');
     return;
   }

   try {
     setIsSendingInvitation(true);

     const invitationData = {
       email: memberEmail.trim(),
       role: selectedRole,
       familialRelation: memberRelation.trim(),
       inviterName: userFullName || 'A family member'
     };

     await axios.post(`https://carebear-backend.onrender.com/api/users/${userID}/invite`, invitationData);

     // Reset form after successful invitation
     setMemberRelation('');
     setMemberEmail('');
     setSelectedRole('CareBear');
     setIsDataSaved(false);
     setShowAddMemberDropdown(false);

     // Show success modal
     setShowSuccessModal(true);

   } catch (error) {
     console.error('Error sending invitation:', error);
     
     let errorMessage = 'Failed to send invitation. Please try again.';
     if (error.response?.data?.message) {
       errorMessage = error.response.data.message;
     }
     
     Alert.alert('Error', errorMessage);
   } finally {
     setIsSendingInvitation(false);
   }
 };

  // Check if user has submitted daily status
  useEffect(() => {
    const checkDailyStatus = async () => {
      if (isSignedIn && userId) {
        setIsCheckingStatus(true);
        try {
          // Step 1: Fetch userID using clerkID
          const userResponse = await axios.get(`https://carebear-backend.onrender.com/api/users/clerk/${userId}`);
          const fetchedUserID = userResponse.data.userID;
          setUserID(fetchedUserID);

          // Step 2: Check if user has submitted today
          const statusResponse = await axios.get(`https://carebear-backend.onrender.com/api/daily/check/${fetchedUserID}`);
          
          // If user has submitted today, fetch their status to display emojis
          if (statusResponse.data.hasSubmittedToday) {
            await fetchTodayStatus(fetchedUserID);
          } else {
            // If user hasn't submitted today, show the modal
            setShowDailyModal(true);
          }
        } catch (error) {
          console.error('Error checking daily status:', error);
          // Show modal on error to be safe
          setShowDailyModal(true);
        } finally {
          setIsCheckingStatus(false);
        }
      }
    };

    checkDailyStatus();
  }, [isSignedIn, userId]);

  // Fetch user imageURL and family members after userID is set
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (userID) {
        try {
          const res = await axios.get(`https://carebear-backend.onrender.com/api/users/${userID}/info`);
          setUserImageURL(res.data.imageURL);
          setUserFullName(res.data.fullName);
          
          // Fetch family members after getting user info
          await fetchFamilyMembers(userID);
        } catch (err) {
          console.error('Failed to fetch user info:', err);
        }
      }
    };
    fetchUserInfo();
  }, [userID]);


  // Handle daily status submission
  const handleSubmitDailyStatus = async () => {
    if (!selectedMood || !selectedBodyFeeling) {
      Alert.alert('Missing Information', 'Please select both your mood and body feeling.');
      return;
    }

    if (!userID) {
      Alert.alert('Error', 'User ID not found. Please try again.');
      return;
    }

    try {
      setIsSubmittingStatus(true);

      // Submit daily status to backend (userID in endpoint, only mood and body fields)
      await axios.post(`https://carebear-backend.onrender.com/api/daily/submit/${userID}`, {
        mood: selectedMood,
        body: selectedBodyFeeling,
      });

      // Immediately fetch and update today's status emojis after successful submission
      await fetchTodayStatus(userID);

      // Reset selections
      setSelectedMood('');
      setSelectedBodyFeeling('');

      // Hide modal
      setShowDailyModal(false);

      Alert.alert('Success', 'Your daily status has been updated!');
    } catch (error) {
      console.error('Error submitting daily status:', error);
      Alert.alert('Error', 'Failed to update your status. Please try again.');
    } finally {
      setIsSubmittingStatus(false);
    }
  };

  // Function to add a new family
  const handleAddFamily = (familyName: string) => {
    // Generate a new id
    const newId = (availableFamilies.length + 1).toString();
    
    // Create the new family
    const newFamily = {
      id: newId,
      name: familyName
    };
    
    // Add to families array
    const updatedFamilies = [...availableFamilies, newFamily];
    setAvailableFamilies(updatedFamilies);
    
    // Automatically switch to the new family tab
    setActiveTab(newFamily.name);
    
    // Close modal
    setModalVisible(false);
    
    // Show success message
    Alert.alert('Success', `Family "${newFamily.name}" has been created`);
  };

  const renderOptionButton = (
    option: { id: string; emoji: string; label: string; value: string },
    selectedValue: string,
    onSelect: (value: string) => void
  ) => (
    <TouchableOpacity
      key={option.id}
      className={`px-4 py-2 rounded-lg border-2 m-1 ${
        selectedValue === option.value 
          ? 'border border-[##2A1800]' 
          : 'border border-[#FAE5CA]'
      }`}
      onPress={() => onSelect(option.value)}
    >
      <View className='flex flex-col items-center'>
      <Text className="text-2xl">{option.emoji}</Text>
      <Text className="text-black font-lato text-base font-normal leading-6 tracking-[-0.1px]">
        {option.label}
      </Text>
      </View>
    </TouchableOpacity>
  );

  // FamilyMemberCard Component
const FamilyMemberCard = ({ 
  member, 
  isCurrentUser = false 
}: { 
  member: FamilyMember; 
  isCurrentUser?: boolean; 
}) => {
  const router = useRouter(); // Use router for navigation

  const handleCardPress = () => {
    // Navigate to the dashboard of the selected family member
    router.push(`/dashboard/mydashboard/member-dashboard?userID=${member.userID}`);
  };

  return (
    <Pressable
      onPress={handleCardPress} // Trigger navigation on card press
      className="flex flex-row p-4 items-center gap-4 rounded-lg border border-[#2A1800] mx-4 mt-4"
    >
      <Image
        source={{ uri: member.imageURL }}
        className="w-10 h-10 rounded-full flex-shrink-0"
      />
      <View className="flex flex-col justify-center items-start gap-2 flex-1">
        <View className="flex flex-row items-center gap-2">
          <Text className="text-[#222] font-lato text-base font-extrabold leading-6 tracking-[0.3px]">
            {member.fullName}
          </Text>
          {isCurrentUser && (
            <Text className="text-[#222] font-lato text-base font-normal leading-6 tracking-[-0.1px]">
              Me
            </Text>
          )}
        </View>
        
        <View className="flex flex-row items-center gap-2">
          <View className="w-6 h-6 bg-[#2A1800] rounded-full flex items-center justify-center">
            <Text className="text-xs">{getMoodEmoji(member.mood || '')}</Text>
          </View>
          <View className="w-6 h-6 bg-[#2A1800] rounded-full flex items-center justify-center">
            <Text className="text-xs">{getBodyEmoji(member.body || '')}</Text>
          </View>
          {/* Additional icons */}
          <View className="w-6 h-6 bg-[#2A1800] rounded-full flex items-center justify-center">
            <Image source={PillIcon} className="w-3.5 h-3.5" />
          </View>
          <View className="w-6 h-6 bg-[#2A1800] rounded-full flex items-center justify-center">
            <Image source={PillBotte} className="w-3.5 h-3.5" />
          </View>
          <View className="w-6 h-6 bg-[#2A1800] rounded-full flex items-center justify-center">
            <Image source={Moon} className="w-3.5 h-3.5" />
          </View>
          <View className="w-6 h-6 bg-[#2A1800] rounded-full flex items-center justify-center">
            <Image source={Scale} className="w-3.5 h-3.5" />
          </View>
          <View className="w-6 h-6 bg-[#2A1800] rounded-full flex items-center justify-center">
            <Image source={Foot} className="w-3.5 h-3.5" />
          </View>
          <View className="w-6 h-6 bg-[#2A1800] rounded-full flex items-center justify-center">
            <Image source={Dumbbell} className="w-3.5 h-3.5" />
          </View>
        </View>
      </View>
    </Pressable>
  );
};

  // Show loading screen while checking status
  if (isCheckingStatus) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#007AFF" />
        <Text className="mt-4 text-gray-600">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <ScrollView className="flex-1">
        <View className='px-4'>
          {/* User's Card */}
          <View className="mt-6">
            <FamilyMemberCard 
              member={{
                userID: userID || '',
                fullName: userFullName || '',
                imageURL: userImageURL || '',
                mood: todayMoodValue,
                body: todayBodyValue
              }}
              isCurrentUser={true}
            />
          </View>
        </View>

        {/* Family Management Header */}
        <View className="px-4 mt-8">
          <View className="flex-row justify-between items-center">
            <Text className="text-sm font-medium text-gray-800">{availableFamilies.length} {availableFamilies.length === 1 ? 'Family' : 'Families'}</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
            >
              {availableFamilies.map((family) => (
                <Pressable 
                  key={family.id}
                  className="px-4 py-2 active:opacity-80 relative"
                  onPress={() => setActiveTab(family.name)}
                >
                  <Text 
                    className={`text-sm font-medium ${activeTab === family.name ? 'text-[#1A0933]' : 'text-gray-500'}`}
                  >
                    {family.name}
                  </Text>
                  {activeTab === family.name && (
                    <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1A0933]" />
                  )}
                </Pressable>
              ))}
              <Pressable 
                className="px-3 py-2 active:opacity-70"
                onPress={() => setModalVisible(true)}
              >
                <Text className="text-sm text-[#AC6924]">Add Family</Text>
              </Pressable>
            </ScrollView>
          </View>
          {/* Family Members Cards */}
        {isLoadingFamily ? (
          <View className="flex-1 justify-center items-center py-8">
            <ActivityIndicator size="large" color="#2A1800" />
            <Text className="mt-4 text-gray-600">Loading family members...</Text>
          </View>
        ) : (
          familyMembers.map((member) => (
            <FamilyMemberCard 
              key={member.userID}
              member={member}
              isCurrentUser={false}
            />
          ))
        )}

        {/* Add Member Card */}
          <View className='flex flex-col mx-4 mt-4'>
            <View className='flex flex-row p-4 items-center gap-4 rounded-lg border border-[#2A1800]'>
              <View className='flex w-10 h-10 p-[2px] pb-[1px] justify-center items-center gap-2 aspect-square rounded-full border border-[#2A1800] bg-[#623405]'>
                <Image source={UserIcon} className="w-6 h-6" />
              </View>
              
              {!showAddMemberDropdown ? (
                <>
                  <Text className="text-[#222] font-lato text-base font-normal leading-6 tracking-[-0.1px] flex-1">
                    Add new member
                  </Text>
                  <Pressable 
                    className='flex w-8 h-8 p-[6px] justify-center items-center rounded-full bg-[#2A1800] ml-auto'
                    onPress={() => {
                      setShowAddMemberDropdown(true);
                      if (savedMemberData) {
                        setMemberRelation(savedMemberData.memberRelation);
                        setSelectedRole(savedMemberData.selectedRole);
                        setMemberEmail(savedMemberData.memberEmail);
                      }
                    }}
                  >
                    <Image source={Plus} className="w-4 h-4" />
                  </Pressable>
                </>
              ) : (
                <>
                  <View className="flex flex-row items-center gap-2">
                    <Text className="text-[#222] font-lato text-base font-extrabold leading-6 tracking-[0.3px]">
                      Member's Name
                    </Text>
                      <Text className='text-[#222] font-lato text-base font-normal leading-6 tracking-[-0.1px]'>
                        Relation
                      </Text>
                  </View>
                  <Pressable 
                    className='flex w-8 h-8 p-[6px] justify-center items-center rounded-full bg-[#2A1800] ml-auto'
                    onPress={() => {
                      setShowAddMemberDropdown(false);
                      setMemberName('');
                      setMemberRelation('');
                      setMemberEmail('');
                      setSelectedRole('CareBear');
                    }}
                  >
                    <Image source={UserPen} className="w-4 h-4" />
                  </Pressable>
                </>
              )}
            </View>

            {/* Dropdown Content */}
            {showAddMemberDropdown && (
              <View className="bg-white border-l border-r border-b border-[#2A1800] rounded-b-lg p-6 -mt-1">
                {/* Default Relationship */}
                  <View className="mb-6">
                    <Text className="text-[#222] font-lato text-lg font-semibold mb-3">Default Relationship</Text>
                    <TextInput
                      className="border border-[#FAE5CA] rounded-lg p-3 text-[#222] font-lato text-base"
                      placeholder="Ex: Mother, Grandfather, Daughter"
                      placeholderTextColor="#888"
                      value={memberRelation}
                      onChangeText={setMemberRelation}
                      keyboardType="default"
                      autoCapitalize="words"
                    />
                  </View>

                {/* Bear Role */}
                <View className="mb-6">
                  <Text className="text-[#222] font-lato text-lg font-semibold mb-4">Bear Role</Text>
                  
                  {/* CareBear Option */}
                  <Pressable 
                    className={`p-4 rounded-lg bg-[#E1F0FF] border-2 mb-3 flex-row items-center gap-3 ${
                      selectedRole === 'CareBear' ? 'border-[#2A1800]' : 'border-white'
                    }`}
                    onPress={() => setSelectedRole('CareBear')}
                  >
                    <View className="w-14 h-14 rounded-full flex items-center justify-center">
                      <Image source={CareBear} className="w-12 h-12 rounded-full" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[#222] font-lato text-lg font-semibold">CareBear</Text>
                      <Text className="text-[#666] font-lato text-sm">Care giver & receiver</Text>
                    </View>
                  </Pressable>

                  {/* BabyBear Option */}
                  <Pressable 
                    className={`p-4 rounded-lg bg-[#FAE5CA] border-2 mb-3 flex-row items-center gap-3 ${
                      selectedRole === 'BabyBear' ? 'border-[#2A1800]' : 'border-white'
                    }`}
                    onPress={() => setSelectedRole('BabyBear')}
                  >
                    <View className="w-14 h-14 rounded-full flex items-center justify-center">
                      <Image source={BabyBear} className="w-12 h-12 rounded-full" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[#222] font-lato text-lg font-semibold">BabyBear</Text>
                      <Text className="text-[#666] font-lato text-sm">Care receiver</Text>
                    </View>
                  </Pressable>

                  {/* BearBoss Option */}
                  <Pressable 
                    className={`p-4 rounded-lg bg-[#E1F0FF] border-2 mb-3 flex-row items-center gap-3 ${
                      selectedRole === 'BearBoss' ? 'border-[#2A1800]' : 'border-white'
                    }`}
                    onPress={() => setSelectedRole('BearBoss')}
                  >
                    <View className="w-14 h-14 rounded-full flex items-center justify-center">
                      <Image source={BearBoss} className="w-12 h-12 rounded-full" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[#222] font-lato text-lg font-semibold">BearBoss</Text>
                      <Text className="text-[#666] font-lato text-sm">Admin</Text>
                    </View>
                  </Pressable>
                </View>

                {/* Email Input */}
                <View className="mb-6">
                  <Text className="text-[#222] font-lato text-lg font-semibold mb-3">
                    Email<Text className="text-red-500">*</Text>
                  </Text>
                  <TextInput
                    className="border border-[#FAE5CA] rounded-lg p-3 text-[#222] font-lato text-base"
                    placeholder="abc@gmail.com"
                    placeholderTextColor="#888"
                    value={memberEmail}
                    onChangeText={setMemberEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {/* Display Save Status */}
               {isDataSaved && (
                 <View className="mb-6 p-3 bg-green-50 rounded-lg border border-green-200">
                   <Text className="text-green-700 font-lato text-sm text-center">
                     ✓ Information saved! You can now send the invitation.
                   </Text>
                 </View>
               )}

                {/* Action Buttons */}
                <View className="flex-row gap-3 mt-8 mb-6">
                  <Pressable 
                    className="flex-1 py-3 px-6 rounded-full border border-[#FAE5CA] bg-white flex items-center justify-center"
                    onPress={handleSaveMember}
                  >
                    <Text className={`font-lato text-base font-medium ${
                     isDataSaved ? 'text-green-700' : 'text-[#666]'
                   }`}>
                     {isDataSaved ? '✓ Saved' : 'Save'}
                   </Text>
                  </Pressable>
                  
                  <Pressable
                   className={`flex-1 py-3 px-6 rounded-full flex items-center justify-center ${
                     isSendingInvitation ? 'bg-gray-400' : 'bg-[#2A1800]'
                   }`}
                   onPress={handleSendInvitation}
                   disabled={isSendingInvitation}
                 >
                   {isSendingInvitation ? (
                     <ActivityIndicator size="small" color="white" />
                   ) : (
                     <Text className="text-white font-lato text-base font-medium">Send Invitation</Text>
                   )}
                 </Pressable>
                </View>
              </View>
            )}
          </View>

          {/* Success Modal */}
         <Modal
           visible={showSuccessModal}
           transparent={true}
           animationType="fade"
         >
           <View className="flex-1 justify-center items-center bg-black/50">
             <View className="bg-white rounded-lg p-6 mx-4 w-80">
               <View className="items-center mb-4">
                 <Image source={Invitation} className="w-10 h-10 mb-2" />
                 <Text className="text-[#222] font-lato text-xl font-semibold text-center">
                   Invitation Sent Successfully!
                 </Text>
               </View>
               <Text className="text-[#666] font-lato text-base text-center mb-6">
                 The invitation has been sent to the provided email address.
               </Text>
               <Pressable
                 className="bg-[#2A1800] py-3 px-6 rounded-full flex items-center justify-center"
                 onPress={() => setShowSuccessModal(false)}
               >
                 <Text className="text-white font-lato text-base font-medium">OK</Text>
               </Pressable>
             </View>
           </View>
         </Modal>
        </View>
      </ScrollView>
 
      {/* Add Family Modal Component */}
      <AddFamily
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAddFamily={handleAddFamily}
      />

      {/* Daily Status Modal */}
      <Modal
        visible={showDailyModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {}} // Prevent closing with back button
      >
        <View className="flex-1 bg-[#AF9D86] bg-opacity-50 justify-center items-center">
          <View className="bg-white flex w-[345px] p-6 flex-col items-center gap-6 rounded-lg">
            <Text className="text-black text-center font-lato text-2xl font-extrabold leading-8 tracking-[0.3px]">Daily Check-in</Text>
            <Text className="text-black text-center font-lato text-base font-normal leading-6 tracking-[-0.1px] mt-2">
              Before you continue, let's check in on how you're feeling today!
            </Text>

            {/* Mood Section */}
            <View className="w-full mb-6">
              <Text className="text-lg font-semibold mb-3 text-center">How is your mood today?</Text>
              <View className="flex-row flex-wrap justify-center">
                {moods.map((mood) =>
                  renderOptionButton(mood, selectedMood, setSelectedMood)
                )}
              </View>
            </View>

            {/* Body Feeling Section */}
            <View className="w-full mb-6">
              <Text className="text-lg font-semibold mb-3 text-center">How does your body feel?</Text>
              <View className="flex-row flex-wrap justify-center">
                {bodyFeelings.map((feeling) =>
                  renderOptionButton(feeling, selectedBodyFeeling, setSelectedBodyFeeling)
                )}
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              className={`w-full py-4 rounded-full items-center mt-2 ${
                (!selectedMood || !selectedBodyFeeling || isSubmittingStatus) 
                  ? 'bg-gray-300' 
                  : 'bg-[#2A1800]'
              }`}
              onPress={handleSubmitDailyStatus}
              disabled={!selectedMood || !selectedBodyFeeling || isSubmittingStatus}
            >
              {isSubmittingStatus ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-lg font-semibold">Done</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}