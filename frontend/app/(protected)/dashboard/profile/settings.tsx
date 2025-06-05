import { View, Text, Modal, TouchableOpacity, Alert, TextInput, ScrollView, Animated, Switch } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useState, useEffect, useRef } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Toggle } from '~/components/ui/toggle';
import DropDownPicker from 'react-native-dropdown-picker';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
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

const SettingItem = ({ icon, title, description, onPress, showChevron = true, iconColor = "#6366f1", isExpanded }: SettingItemProps) => (
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

const DropdownSettingItem = ({ icon, title, description, iconColor = "#6366f1", isExpanded, onToggleExpanded, children }: DropdownSettingItemProps) => (
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

const ToggleSetting = ({ title, description, value, onValueChange }: { 
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
      thumbColor={value ? '#ffffff' : '#ffffff'}
      ios_backgroundColor="#f59e0b"
    />
  </View>
);

export default function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const { signOut } = useAuth();
  const { user } = useUser();
  const [isEditingName, setIsEditingName] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Dropdown 
  const [isPrivacyExpanded, setIsPrivacyExpanded] = useState(false);
  const [isNotificationsExpanded, setIsNotificationsExpanded] = useState(false);
  const [isProfileDetailsExpanded, setIsProfileDetailsExpanded] = useState(false);
  const [isAccountExpanded, setIsAccountExpanded] = useState(false);

  // Profile Details (copy from health-input.tsx)
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

  // Notification 
  const [doNotDisturb, setDoNotDisturb] = useState(false);
  const [newFeed, setNewFeed] = useState(true);
  const [newActivity, setNewActivity] = useState(true);
  const [invites, setInvites] = useState(true);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);
  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            signOut();
            onClose();
          },
        },
      ]
    );
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
      setIsEditingName(false);
      Alert.alert('Success', 'Name updated successfully');
    } catch (error) {
      console.error('Error updating name:', error);
      Alert.alert('Error', 'Failed to update name. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setFirstName(user?.firstName || '');
    setLastName(user?.lastName || '');
    setIsEditingName(false);
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent={false}
      presentationStyle="fullScreen"
    >      <Animated.View 
        className="flex-1 bg-white"
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {/* Header Section */}
          <View className="px-6 py-5 pt-12">
            <View className="flex-row items-center justify-between mb-6">
              <TouchableOpacity onPress={onClose} className="p-2">
                <MaterialIcons name="arrow-back" size={24} color="#374151" />
              </TouchableOpacity>
              <Text className="text-2xl font-bold text-gray-900 flex-1 text-center mr-10">Settings</Text>
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
                  <View className="mb-6" style={{ flexDirection: 'row', gap: 16 }}>
                    <View style={{ flex: 1 }}>
                      <Label nativeID="firstName" className="mb-2 text-lg font-medium">
                        First Name
                      </Label>
                      <Input
                        nativeID="firstName"
                        placeholder="First Name"
                        value={firstName}
                        onChangeText={setFirstName}
                        className="p-3 text-gray-500" 
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Label nativeID="lastName" className="mb-2 text-lg font-medium">
                        Last Name
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

                  <View className="mb-6" style={{ flexDirection: 'row', gap: 16 }}>
                    <View style={{ flex: 1 }}>
                      <Label nativeID="dobLabel" className="mb-2 text-lg font-medium">
                        Date of birth
                      </Label>
                      <Input
                        nativeID="dobLabel"
                        placeholder="YYYY-MM-DD"
                        value={dob}
                        onChangeText={setDob} 
                        className="p-3 text-gray-500" 
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Label nativeID="genderLabel" className="mb-2 text-lg font-medium">
                        Gender
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

                  <View className="mb-6" style={{ flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
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

                  <View className="mb-6" style={{ flexDirection: 'row', gap: 16 }}>
                    <View style={{ flex: 1 }}>
                      <Label nativeID="weightLabel" className="mb-2 text-lg font-medium">
                        Weight
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
                    <View style={{ flex: 1 }}>
                      <Label nativeID="heightLabel" className="mb-2 text-lg font-medium">
                        Height
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
                    className="bg-amber-900 py-2 px-7 rounded-lg"
                    onPress={handleUpdateProfile}
                    disabled={isUpdating}
                    style={{ opacity: isUpdating ? 0.7 : 1 }}
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
                      Email Address
                    </Label>
                    <Input
                      nativeID="emailLabel"
                      placeholder="Enter email address"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      className="p-2text-amber-700" 
                    />
                    <TouchableOpacity
                      className="bg-amber-900 py-2 px-4 rounded-lg mt-2"
                      onPress={handleUpdateEmail}
                      disabled={isUpdating}
                      style={{ opacity: isUpdating ? 0.7 : 1 }}
                    >
                      <Text className="text-white text-center font-semibold text-sm">
                        {isUpdating ? 'Updating...' : 'Update Email'}
                      </Text>
                    </TouchableOpacity>
                  </View>                  
                  <View>
                    <View style={{ alignItems: 'center' }}>
                      <Text className="text-lg font-medium text-gray-900 mb-4">Connect Accounts</Text>
                    </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 20 }}>                      
                        <TouchableOpacity
                        className="w-12 h-12 rounded-full items-center justify-center"
                        onPress={() => handleConnectSocial('facebook')}
                        style={{ borderWidth: 1, borderColor: '#b45309' }}
                      >
                        <MaterialIcons name="facebook" size={28} color="#1877f2" />
                      </TouchableOpacity>                      
                      <TouchableOpacity
                        className="w-12 h-12 rounded-full items-center justify-center"
                        onPress={() => handleConnectSocial('google')}
                        style={{ borderWidth: 1, borderColor: '#b45309' }}
                      >
                        <MaterialIcons name="email" size={28} color="#db4437" />
                      </TouchableOpacity>                      
                      <TouchableOpacity
                        className="w-12 h-12 rounded-full items-center justify-center"
                        onPress={() => handleConnectSocial('apple')}
                        style={{ borderWidth: 1, borderColor: '#b45309' }}
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
              </View>
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}
