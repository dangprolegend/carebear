import { View, Text, TouchableOpacity, Alert, ScrollView, Switch, SafeAreaView, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Toggle } from '~/components/ui/toggle';
import DropDownPicker from 'react-native-dropdown-picker';
import { router } from 'expo-router';

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
    <View className="flex-row items-center flex-1">
      <View className="w-10 h-10 rounded-full bg-white items-center justify-center mr-4">
        <MaterialIcons name={icon} size={20} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 font-semibold text-base">{title}</Text>
        {description && (
          <Text className="text-gray-500 text-sm mt-0.5">{description}</Text>
        )}
      </View>
    </View>
    {showChevron && (
      <MaterialIcons 
        name={isExpanded ? "keyboard-arrow-up" : "chevron-right"} 
        size={24} 
        color="#d1d5db" 
      />
    )}
  </TouchableOpacity>
);

const DropdownSettingItem = ({ 
  icon, 
  title, 
  description, 
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
      <View className="flex-row items-center flex-1">
        <View className="w-10 h-10 rounded-full bg-white items-center justify-center mr-4">
          <MaterialIcons name={icon} size={20} color={iconColor} />
        </View>
        <View className="flex-1">
          <Text className="text-gray-900 font-semibold text-base">{title}</Text>
          {description && (
            <Text className="text-gray-500 text-sm mt-0.5">{description}</Text>
          )}
        </View>
      </View>
      <MaterialIcons 
        name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
        size={24} 
        color="#d1d5db" 
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
  <View className="flex-row items-center justify-between py-3">
    <View className="flex-1 mr-4">
      <Text className="text-gray-900 font-medium text-base">{title}</Text>
      {description && (
        <Text className="text-gray-500 text-sm mt-0.5">{description}</Text>
      )}
    </View>    
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: '#f59e0b', true: '#92400e' }}
      thumbColor="#ffffff"
      ios_backgroundColor="#f59e0b"
    />
  </View>
);

export default function SettingsPage({ onBack }: SettingsPageProps) {
  const { signOut } = useAuth();
  const { user } = useUser();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [isUpdating, setIsUpdating] = useState(false);

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
    setIsUpdating(true);
    try {
      Alert.alert('Success', 'Profile details updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
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

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Header Section */}
        <View className="px-6 py-5 pt-12">
          <View className="flex-row items-center justify-between mb-6">
            {onBack && (
              <TouchableOpacity onPress={onBack} className="p-2">
                <MaterialIcons name="arrow-back" size={24} color="#374151" />
              </TouchableOpacity>
            )}
            {/* <Text className="text-2xl font-bold text-gray-900 flex-1 text-center mr-10">
              Settings
            </Text> */}
          </View>

          {/* Avatar */}
          <View className="items-center mb-6">
            <TouchableOpacity 
              className="relative"
              onPress={() => Alert.alert('Coming Soon', 'Avatar upload will be available in a future update')}
            >
              <View className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center">
                <Text className="text-white text-2xl font-bold">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </Text>
              </View>
              <View className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-amber-900 items-center justify-center border-2 border-white">
                <MaterialIcons name="camera-alt" size={16} color="white" />
              </View>
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-900 mt-3">
              {user?.firstName} {user?.lastName}
            </Text>
            <Text className="text-gray-500 text-sm">
              {user?.emailAddresses[0]?.emailAddress}
            </Text>
          </View>
        </View>    

        {/* Profile */}
        <View className="mb-8 px-6">
          <Text className="text-lg font-bold text-gray-900 mb-5">Profile Information</Text>

          <View className="bg-amber-900 px-0.5 py-0.5 rounded-lg">
            <View className="bg-white rounded-lg">
              <DropdownSettingItem
                icon="person"
                title="Profile Details"
                description="Edit your personal information and physical details"
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
                  className={`bg-amber-900 py-2 px-7 rounded-lg ${isUpdating ? 'opacity-70' : ''}`}
                  onPress={handleUpdateProfile}
                  disabled={isUpdating}
                >
                  <Text className="text-white text-center font-extrabold text-base">
                    {isUpdating ? 'Updating...' : 'Update Profile'}
                  </Text>
                </TouchableOpacity>
              </DropdownSettingItem>

              <View className="h-px bg-amber-700 mx-2" />

              <DropdownSettingItem
                icon="account-circle"
                title="Account"
                description="Manage your account settings and connections"
                iconColor="#78350f"
                isExpanded={isAccountExpanded}
                onToggleExpanded={() => setIsAccountExpanded(!isAccountExpanded)}
              >
                <View className="mb-6">
                  <Label nativeID="emailLabel" className="mb-2 text-lg font-medium">
                    <Text>Email Address</Text>
                  </Label>
                  <Input
                    nativeID="emailLabel"
                    placeholder="Enter email address"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    className="p-2 text-amber-700" 
                  />
                  <TouchableOpacity
                    className={`bg-amber-900 py-2 px-4 rounded-lg mt-2 ${isUpdating ? 'opacity-70' : ''}`}
                    onPress={handleUpdateEmail}
                    disabled={isUpdating}
                  >
                    <Text className="text-white text-center font-semibold text-sm">
                      {isUpdating ? 'Updating...' : 'Update Email'}
                    </Text>
                  </TouchableOpacity>
                </View>                  
                <View>
                  <View className="items-center">
                    <Text className="text-lg font-medium text-gray-900 mb-4">Connect Accounts</Text>
                  </View>
                  <View className="flex-row justify-center gap-5">                      
                    <TouchableOpacity
                      className="w-12 h-12 rounded-full items-center justify-center border border-amber-600"
                      onPress={() => handleConnectSocial('facebook')}
                    >
                      <MaterialIcons name="facebook" size={28} color="#1877f2" />
                    </TouchableOpacity>                      
                    <TouchableOpacity
                      className="w-12 h-12 rounded-full items-center justify-center border border-amber-600"
                      onPress={() => handleConnectSocial('google')}
                    >
                      <MaterialIcons name="email" size={28} color="#db4437" />
                    </TouchableOpacity>                      
                    <TouchableOpacity
                      className="w-12 h-12 rounded-full items-center justify-center border border-amber-600"
                      onPress={() => handleConnectSocial('apple')}
                    >
                      <MaterialIcons name="apple" size={28} color="#000000" />
                    </TouchableOpacity>
                  </View>
                </View>
              </DropdownSettingItem>
            </View>
          </View>
        </View>          

        {/* Preferences */}
        <View className="mb-8 px-6">
          <Text className="text-lg font-bold text-gray-900 mb-5">Preferences</Text>

          <View className="bg-amber-900 px-0.5 py-0.5 rounded-lg">
            <View className="bg-white rounded-lg">
              <DropdownSettingItem
                icon="privacy-tip"
                title="Privacy Settings"
                description="Control your visibility and privacy"
                iconColor="#78350f"
                isExpanded={isPrivacyExpanded}
                onToggleExpanded={() => setIsPrivacyExpanded(!isPrivacyExpanded)}
              >
                <ToggleSetting
                  title="Show Online Status"
                  description="Let others see when you're active"
                  value={showOnlineStatus}
                  onValueChange={setShowOnlineStatus}
                />
              </DropdownSettingItem>

              <View className="h-px bg-amber-700 mx-2" />                
              <DropdownSettingItem
                icon="notifications"
                title="Notifications"
                description="Manage your notification preferences"
                iconColor="#78350f"
                isExpanded={isNotificationsExpanded}
                onToggleExpanded={() => setIsNotificationsExpanded(!isNotificationsExpanded)}
              >
                <ToggleSetting
                  title="Do Not Disturb"
                  description="Pause all notifications"
                  value={doNotDisturb}
                  onValueChange={setDoNotDisturb}
                />
                <ToggleSetting
                  title="New Feed"
                  description="Notifications for new feed posts"
                  value={newFeed}
                  onValueChange={setNewFeed}
                />
                <ToggleSetting
                  title="New Activity"
                  description="Notifications for new activities"
                  value={newActivity}
                  onValueChange={setNewActivity}
                />
                <ToggleSetting
                  title="Invites"
                  description="Notifications for group invites"
                  value={invites}
                  onValueChange={setInvites}
                />
              </DropdownSettingItem>

              <View className="h-px bg-amber-700 mx-2" />

              <SettingItem
                icon="help"
                title="Help"
                onPress={() => Alert.alert('Coming Soon', 'Help & Support will be available in a future update')}
                iconColor="#78350f"
              />                
            </View>
          </View>
        </View>    

        {/* Sign Out*/}
        <View className="mb-4 px-6">
          <Text className="text-lg font-bold text-gray-900 mb-5">Danger Zone</Text>

          <View className="bg-amber-900 px-0.5 py-0.5 rounded-lg">
            <View className="bg-white rounded-lg">
              <TouchableOpacity 
                onPress={handleSignOut}
                className="flex-row items-center justify-between py-4 px-2"
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 rounded-full bg-white items-center justify-center mr-4">
                    <MaterialIcons name="logout" size={20} color="#dc2626" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-red-600 font-semibold text-base">Sign Out</Text>
                    <Text className="text-red-500 text-sm mt-0.5">Sign out of your account</Text>
                  </View>
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
                    <Text className="text-xl font-bold text-red-600 mb-2">Sign Out</Text>
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
                        className="flex-1 ml-2 py-2 rounded-lg bg-red-600 items-center"
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