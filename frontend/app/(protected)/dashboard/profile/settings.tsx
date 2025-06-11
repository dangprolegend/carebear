
//@ts-nocheck
import { View, Text, TouchableOpacity, Alert, ScrollView, Switch, SafeAreaView, Modal, Image, TextInput, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';

import { useAuth, useUser } from '@clerk/clerk-expo';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Toggle } from '~/components/ui/toggle';
import DropDownPicker from 'react-native-dropdown-picker';

import CameraIcon from '../../../../assets/icons/camera.png';
import Bell from '../../../../assets/icons/bell.png';
import Privacy from '../../../../assets/icons/pocket.png';
import Profile from '../../../../assets/icons/circle-user-round.png';
import Account from '../../../../assets/icons/user-cog.png';
import Help from '../../../../assets/icons/circle-help.png';
import Google from '../../../../assets/images/google.png';
import axios from 'axios';

interface SettingsPageProps {
  onBack?: () => void;

}

interface SettingItemProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description?: string;
  onPress: () => void;
  showChevron?: boolean;
  iconColor?: string;
  isExpanded?: boolean;
}

interface DropdownSettingItemProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description?: string;
  iconColor?: string;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  children: React.ReactNode;
}


const SettingItem = ({ 
  icon, 
  title, 
  description, 
  onPress, 
  showChevron = true, 
  iconColor = "#6366f1", 
  isExpanded 
}: SettingItemProps) => (

  <TouchableOpacity 
    onPress={onPress}
    className="flex-row items-center justify-between py-4 px-2"
  >

    <View className="flex-row items-center flex-1 ml-2">
          <Image source={icon} className="w-5 h-5 mr-3" />
          <Text className="text-black font-lato text-[16px] font-normal leading-[24px] tracking-[-0.1px]">{title}</Text>
        </View>
      <View className="flex-1">

        {description && (
          <Text className="text-gray-500 text-sm mt-0.5">{description}</Text>
        )}
      </View>


    {showChevron && (
      <MaterialIcons 
        name={isExpanded ? "keyboard-arrow-up" : "chevron-right"} 
        size={24} 

        color="#2A1800" 

      />
    )}
  </TouchableOpacity>
);


const DropdownSettingItem = ({ 
  icon, 
  title, 
  iconColor = "#6366f1", 
  isExpanded, 
  onToggleExpanded, 
  children 
}: DropdownSettingItemProps) => (

  <View>
    <TouchableOpacity 
      onPress={onToggleExpanded}
      className="flex-row items-center justify-between py-4 px-2"
    >

      <View className="flex-row items-center flex-1 ml-2">
          <Image source={icon} className="w-5 h-5 mr-3" />
          <Text className="text-black font-lato text-[16px] font-normal leading-[24px] tracking-[-0.1px]">{title}</Text>
        </View>
      <MaterialIcons 
        name={isExpanded ? "keyboard-arrow-down" : "chevron-right"} 
        size={24} 
        color="#2A1800" 
      />
    </TouchableOpacity>
    {isExpanded && (

      <View className="px-4 pb-4">
        {children}
      </View>
    )}
  </View>
);


const ToggleSetting = ({ 
  title, 
  description, 
  value, 
  onValueChange 
}: { 

  title: string; 
  description?: string; 
  value: boolean; 
  onValueChange: (value: boolean) => void; 
}) => (

  <View className="flex-row items-center justify-between">
    <View className="flex-1 mr-4">
      <Text className="text-black font-lato text-[16px] font-normal leading-[24px] tracking-[-0.1px]">{title}</Text>

    </View>    
    <Switch
      value={value}
      onValueChange={onValueChange}

      trackColor={{ false: '#FAE5CA', true: '#2A1800' }}
      thumbColor="#ffffff"

      ios_backgroundColor="#f59e0b"
    />
  </View>
);


export default function SettingsPage({ onBack }: SettingsPageProps) {
  const { signOut, isSignedIn, userId } = useAuth();
  const [userID, setUserID] = useState(null);
  const [userImageURL, setUserImageURL] = useState<string | null>(null);
  const [userFullName, setUserFullName] = useState<string | null>(null);

  const { user } = useUser();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [isUpdating, setIsUpdating] = useState(false);

  // Store original values to track changes
  const [originalValues, setOriginalValues] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    weight: '',
    height: ''
  });

  // Dropdown states

  const [isPrivacyExpanded, setIsPrivacyExpanded] = useState(false);
  const [isNotificationsExpanded, setIsNotificationsExpanded] = useState(false);
  const [isProfileDetailsExpanded, setIsProfileDetailsExpanded] = useState(false);
  const [isAccountExpanded, setIsAccountExpanded] = useState(false);


  // Profile Details

  const [open, setOpen] = useState(false);
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [dob, setDob] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [genderOptions, setGenderOptions] = useState([
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Non-binary', value: 'Non-binary' },
  ]);

  // Account 
  const [email, setEmail] = useState(user?.emailAddresses[0]?.emailAddress || '');

  // Privacy 
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);


  // Notifications
  const [doNotDisturb, setDoNotDisturb] = useState(false);
  const [newFeed, setNewFeed] = useState(true);
  const [newActivity, setNewActivity] = useState(true);
  const [invites, setInvites] = useState(true);


  const [signOutModalVisible, setSignOutModalVisible] = useState(false);
  const handleSignOut = () => {
    setSignOutModalVisible(true);
  };
  const handleSignOutConfirm = () => {
    setSignOutModalVisible(false);
    signOut();
  };
  const handleSignOutCancel = () => {
    setSignOutModalVisible(false);
  };

  const handleUnitChange = (newUnit: 'metric' | 'imperial') => {
    setUnitSystem(newUnit);
  };

  const handleConnectSocial = (provider: 'facebook' | 'google' | 'apple') => {
    Alert.alert(
      'Connect Account',
      `Connect your ${provider} account for easier sign-in`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Connect',
          onPress: () => {
            Alert.alert('Coming Soon', `${provider} connection will be available in a future update`);
          },
        },
      ]
    );
  };

  const handleUpdateEmail = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsUpdating(true);
    try {
      Alert.alert('Coming Soon', 'Email update will be available in a future update');
    } catch (error) {
      console.error('Error updating email:', error);
      Alert.alert('Error', 'Failed to update email. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };


  const handleUpdateProfile = async () => {
    if (!userID) {
      Alert.alert('Error', 'User ID not found. Please try again.');
      return;
    }

    setIsUpdating(true);
    
    try {
      const updateData = {};
      
      if (firstName.trim() !== originalValues.firstName) {
        updateData.firstName = firstName.trim();
      }
      
      if (lastName.trim() !== originalValues.lastName) {
        updateData.lastName = lastName.trim();
      }
      
      if (dob !== originalValues.dob) {
        updateData.dateOfBirth = dob;
      }
      
      if (gender !== originalValues.gender) {
        updateData.gender = gender;
      }
      
      if (weight !== originalValues.weight) {
        updateData.weight = weight;
      }
      
      if (height !== originalValues.height) {
        updateData.height = height;
      }

      if (Object.keys(updateData).length === 0) {
        Alert.alert('No Changes', 'No changes were made to update.');
        setIsUpdating(false);
        return;
      }

      console.log('Updating profile with data:', updateData);
      
      const response = await axios.patch(
        `https://carebear-backend.onrender.com/api/users/${userID}/update`,
        updateData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        setOriginalValues({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          dob: dob,
          gender: gender,
          weight: weight,
          height: height
        });

        setUserFullName(`${firstName.trim()} ${lastName.trim()}`);

        setFirstName('');
        setLastName('');
        setDob('');
        setGender('');
        setWeight('');
        setHeight('');

        Alert.alert('Success', 'Profile updated successfully!');
        
        // If first name or last name changed, also update Clerk user
        if (updateData.firstName || updateData.lastName) {
          try {
            await user?.update({
              firstName: firstName.trim() || user.firstName,
              lastName: lastName.trim() || user.lastName,
            });
          } catch (clerkError) {
            console.error('Error updating Clerk user:', clerkError);
          }
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      
      let errorMessage = 'Failed to update profile. Please try again.';
      
      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      Alert.alert('Error', errorMessage);

    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateName = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Error', 'Please enter both first and last name');
      return;
    }

    setIsUpdating(true);
    try {
      await user?.update({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });


      Alert.alert('Success', 'Name updated successfully');
    } catch (error) {
      console.error('Error updating name:', error);
      Alert.alert('Error', 'Failed to update name. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };


  useEffect(() => {
    const getUserInfo = async () => {
      if (isSignedIn && userId) {
        try {
          const userResponse = await axios.get(`https://carebear-backend.onrender.com/api/users/clerk/${userId}`);
          const fetchedUserID = userResponse.data.userID;
          setUserID(fetchedUserID);

          const res = await axios.get(`https://carebear-backend.onrender.com/api/users/${fetchedUserID}/info`);
          setUserImageURL(res.data.imageURL);
          setUserFullName(res.data.fullName);
        } catch (error) {
          console.error('Error fetching user info:', error);
        } 
      }
    };

    getUserInfo();
  }, [isSignedIn, userId]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Header Section */}
        <View className="px-6 py-5 pt-12">
          {/* Avatar */}
          <View className='flex flex-col mt-6 items-center gap-4'>
            <View className="relative">
              <Image
                source={{ uri: userImageURL }}
                className='w-20 h-20 flex-shrink-0 aspect-square rounded-full border-2 border-[#2A1800] bg-cover bg-center'
              />
              {/* Camera icon overlay */}
              <View className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#2A1800] rounded-full flex items-center justify-center border-2 border-white">
                <Image source={CameraIcon} className="w-3.5 h-3.5" />
              </View>
            </View>
            <Text className="text-black font-lato text-[18px] font-extrabold leading-[32px] tracking-[0.3px]">
            {userFullName}
          </Text>
          </View>
        </View>    

        {/* Profile */}
        <View className="mb-8 px-6 mt-8">
          <Text className="text-black font-lato text-[18px] font-extrabold leading-[32px] tracking-[0.3px] mb-4">Settings</Text>

          <View className="border border-[#623405] px-0.5 py-0.5 rounded-lg">
            <View className="bg-white rounded-lg">
              <DropdownSettingItem
                icon={Profile}
                title="Profile Details"
                iconColor="#78350f"
                isExpanded={isProfileDetailsExpanded}
                onToggleExpanded={() => setIsProfileDetailsExpanded(!isProfileDetailsExpanded)}
              >
                <View className="mb-6 flex-row gap-4">
                  <View className="flex-1">
                    <Label nativeID="firstName" className="mb-2 text-lg font-medium">
                      <Text>First Name</Text>
                    </Label>
                    <Input
                      nativeID="firstName"
                      placeholder="First Name"
                      value={firstName}
                      onChangeText={setFirstName}
                      className="p-3 text-gray-500" 
                    />
                  </View>
                  <View className="flex-1">
                    <Label nativeID="lastName" className="mb-2 text-lg font-medium">
                      <Text>Last Name</Text>
                    </Label>
                    <Input
                      nativeID="lastName"
                      placeholder="Last Name"
                      value={lastName}
                      onChangeText={setLastName}
                      className="p-3 text-gray-500" 
                    />
                  </View>
                </View>

                <View className="mb-6 flex-row gap-4">
                  <View className="flex-1">
                    <Label nativeID="dobLabel" className="mb-2 text-lg font-medium">
                      <Text>Date of birth</Text>
                    </Label>
                    <Input
                      nativeID="dobLabel"
                      placeholder="YYYY-MM-DD"
                      value={dob}
                      onChangeText={setDob} 
                      className="p-3 text-gray-500" 
                    />
                  </View>
                  <View className="flex-1">
                    <Label nativeID="genderLabel" className="mb-2 text-lg font-medium">
                      <Text>Gender</Text>
                    </Label>
                    <DropDownPicker
                      open={open}
                      value={gender}
                      setValue={setGender}
                      items={genderOptions} 
                      setOpen={setOpen}
                      setItems={setGenderOptions}
                      placeholder="Select"
                      listMode="SCROLLVIEW"
                      multiple={false}
                      style={{
                        minHeight: 43,
                        borderWidth: 1,
                        borderColor: '#e5e5e5',
                        borderRadius: 6,
                        paddingHorizontal: 12,
                        backgroundColor: 'white',
                      }}
                      textStyle={{
                        fontSize: 16,
                        color: '#6b7280',
                      }}
                    />
                  </View>
                </View>

                <View className="mb-6 flex-row justify-center gap-2">
                  <Toggle
                    aria-label="Select metric units (kg/cm)"
                    pressed={unitSystem === 'metric'}
                    onPressedChange={(pressed) => pressed && handleUnitChange('metric')}
                    className={`py-2 px-4 border-b-2 ${unitSystem === 'metric' ? 'border-foreground' : 'border-transparent'}`}
                  >
                    <Text className={unitSystem === 'metric' ? 'font-medium text-foreground' : 'text-muted-foreground'}>
                      kg/cm
                    </Text>
                  </Toggle>
                  <Toggle
                    aria-label="Select imperial units (lb/ft)"
                    pressed={unitSystem === 'imperial'}
                    onPressedChange={(pressed) => pressed && handleUnitChange('imperial')}
                    className={`py-2 px-4 border-b-2 ${unitSystem === 'imperial' ? 'border-foreground' : 'border-transparent'}`}
                  >
                    <Text className={unitSystem === 'imperial' ? 'font-medium text-foreground' : 'text-muted-foreground'}>
                      lb/ft
                    </Text>
                  </Toggle>
                </View>

                <View className="mb-6 flex-row gap-4">
                  <View className="flex-1">
                    <Label nativeID="weightLabel" className="mb-2 text-lg font-medium">
                      <Text>Weight</Text>
                    </Label>
                    <Input
                      nativeID="weightLabel"
                      placeholder={unitSystem === 'metric' ? '00.0 kg' : '00.0 lb'}
                      value={weight}
                      onChangeText={setWeight}
                      keyboardType="numeric"
                      className="p-3 text-gray-500" 
                    />
                  </View>
                  <View className="flex-1">
                    <Label nativeID="heightLabel" className="mb-2 text-lg font-medium">
                      <Text>Height</Text>
                    </Label>
                    <Input
                      nativeID="heightLabel"
                      placeholder={unitSystem === 'metric' ? '000.0 cm' : "0'00\""}
                      value={height}
                      onChangeText={setHeight}
                      keyboardType="numeric"
                      className="p-3 text-gray-500" 
                    />
                  </View>
                </View>

                <TouchableOpacity
                  className={`bg-[#2A1800] py-2 px-7 rounded-lg flex-row items-center justify-center ${isUpdating ? 'opacity-70' : ''}`}
                  onPress={handleUpdateProfile}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                      <Text className="text-white text-center font-extrabold text-base">Updating...</Text>
                    </>
                  ) : (
                    <Text className="text-white text-center font-extrabold text-base">Update Profile</Text>
                  )}
                </TouchableOpacity>
              </DropdownSettingItem>

              <View className="bg-[#FAE5CA] mx-2 h-px" />

              <DropdownSettingItem
                icon={Account}
                title="Account"
                iconColor="#78350f"
                isExpanded={isAccountExpanded}
                onToggleExpanded={() => setIsAccountExpanded(!isAccountExpanded)}
              >
                <View className="flex flex-col items-start gap-6 px-6 py-0 self-stretch">
                  {/* Email Section */}
                  <View className="flex flex-col items-start gap-2 p-0 self-stretch">
                    <Text className="text-[#2A1800] font-lato text-[16px] font-extrabold leading-[24px] tracking-[0.3px]">Email</Text>
                    <TextInput
                      className="w-full px-4 py-3 rounded-lg border border-[#2A1800] bg-white text-[#623405] font-lato text-[16px]"
                      placeholder={email}
                      placeholderTextColor="#623405"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  {/* Connect Accounts Section */}
                  <View className="w-full rounded-xl p-4">
                    <View className="items-center mb-4">
                      <Text className="text-[#2A1800] font-lato text-[16px] font-light leading-[24px] tracking-[-0.1px]">Connect with your other accounts</Text>
                    </View>
                    <View className="flex-row justify-center gap-6">
                      <TouchableOpacity
                        className="w-8 h-8 rounded-full items-center justify-center border border-[#2A1800] bg-white"
                        onPress={() => handleConnectSocial('google')}
                      >
                        <Image source={Google} className="w-4 h-4" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="w-8 h-8 rounded-full items-center justify-center border border-[#2A1800] bg-white"
                        onPress={() => handleConnectSocial('apple')}
                      >
                        <MaterialIcons name="apple" size={16} color="#000000" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="w-8 h-8 rounded-full items-center justify-center border border-[#2A1800] bg-white"
                        onPress={() => handleConnectSocial('facebook')}
                      >
                        <MaterialIcons name="facebook" size={16} color="#1877f2" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </DropdownSettingItem>
            </View>
          </View>
        </View>          

        <View className="mb-8 px-6">
          <View className="border border-[#623405] px-0.5 py-0.5 rounded-lg">
            <View className="bg-white rounded-lg">
              <DropdownSettingItem
                icon={Bell}
                title="Notifications"
                iconColor="#78350f"
                isExpanded={isNotificationsExpanded}
                onToggleExpanded={() => setIsNotificationsExpanded(!isNotificationsExpanded)}
              >
                <View className="flex flex-col items-start gap-4 px-6 py-0 self-stretch">
                <ToggleSetting
                  title="Do Not Disturb"
                  value={doNotDisturb}
                  onValueChange={setDoNotDisturb}
                />
                <ToggleSetting
                  title="New Feed"
                  value={newFeed}
                  onValueChange={setNewFeed}
                />
                <ToggleSetting
                  title="New Activity"
                  value={newActivity}
                  onValueChange={setNewActivity}
                />
                <ToggleSetting
                  title="Invites"
                  value={invites}
                  onValueChange={setInvites}
                />
                 </View>
              </DropdownSettingItem>

              <View className="bg-[#FAE5CA] mx-2 h-px" />    
              
              <DropdownSettingItem
                icon={Privacy}
                title="Privacy"
                iconColor="#78350f"
                isExpanded={isPrivacyExpanded}
                onToggleExpanded={() => setIsPrivacyExpanded(!isPrivacyExpanded)}
              >
                <View className="flex flex-col items-start gap-4 px-6 py-0 self-stretch">
                  <ToggleSetting
                    title="Show Online Status"
                    value={showOnlineStatus}
                    onValueChange={setShowOnlineStatus}
                  />
                </View>
              </DropdownSettingItem>

              <View className="bg-[#FAE5CA] mx-2 h-px" />

              <SettingItem
                icon={Help}
                title="Help"
                onPress={() => Alert.alert('Coming Soon', 'Help & Support will be available in a future update')}
                iconColor="#78350f"
              />                
            </View>
          </View>
        </View>    

        {/* Sign Out*/}
        <View className="mb-4 px-6">
          <View className="border border-[#623405] px-0.5 py-0.5 rounded-lg">
            <View className="bg-white rounded-lg">
              <TouchableOpacity 
                onPress={handleSignOut}
                className="flex-row items-center justify-between py-4 px-2"
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 rounded-full bg-white items-center justify-center">
                    <MaterialIcons name="logout" size={20} color="#2A1800" />
                  </View>
                    <Text className="text-black font-lato text-[16px] font-normal leading-[24px] tracking-[-0.1px]">Log Out</Text>
                </View>
              </TouchableOpacity>
              {/* Sign Out Modal */}
              <Modal
                visible={signOutModalVisible}
                transparent
                animationType="fade"
                onRequestClose={handleSignOutCancel}
              >
                <View className="flex-1 bg-black/40 justify-center items-center">
                  <View className="bg-white rounded-xl p-6 w-80 items-center">
                    <Text className="text-xl font-bold text-[#2A1800] mb-2">Sign Out</Text>
                    <Text className="text-gray-700 text-base mb-6 text-center">
                      Are you sure you want to sign out?
                    </Text>
                    <View className="flex-row justify-between w-full">
                      <TouchableOpacity
                        onPress={handleSignOutCancel}
                        className="flex-1 mr-2 py-2 rounded-lg bg-gray-100 items-center"
                      >
                        <Text className="text-gray-700 font-semibold text-base">Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleSignOutConfirm}
                        className="flex-1 ml-2 py-2 rounded-lg bg-[#2A1800] items-center"
                      >
                        <Text className="text-white font-semibold text-base">Sign Out</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

