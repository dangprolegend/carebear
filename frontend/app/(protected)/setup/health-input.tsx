import React, { useState } from 'react';
import { View, Text, Pressable, TouchableOpacity } from 'react-native';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Toggle } from '~/components/ui/toggle';
import type { Option } from '@rn-primitives/select';
import DropDownPicker from 'react-native-dropdown-picker';
import { router } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

export default function HealthInputScreen() {
  const { userId } = useAuth();
  const [open, setOpen] = useState(false);  
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [dob, setDob] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');

  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>(''); 

  const [genderOptions, setGenderOptions] = useState([
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Non-binary', value: 'Non-binary' },
  ]);

  const handleUnitChange = (newUnit: 'metric' | 'imperial') => {
    setUnitSystem(newUnit);
  };

  const handleSubmit = () => {
    router.push('/setup/join-family');
  }
  return (
    <View>
      {/* Form title */}
      <Text className="mb-8 text-3xl font-bold text-foreground">
        Your Information
      </Text>

      {/* Form fields */}

      <View className="mb-6 flex flex-row gap-4">
        {/* First Name */}
        <View className="flex-1">
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
        {/* Last Name */}
        <View className="flex-1">
          <Label nativeID="firstName" className="mb-2 text-lg font-medium">
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

      <View className="mb-6 flex flex-row gap-4">
        {/* Date of Birth */}
        <View className="flex-1">
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
        {/* Gender */}
        <View className="flex-1">
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

      {/* Unit toggle */}
      <View className="mb-6 flex flex-row justify-center gap-2">
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

      {/* Weight field */}
      <View className="mb-6">
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

      {/* Height field */}
      <View className="mb-6">
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

        <View className="flex flex-row justify-between items-start self-stretch mt-[56px]">
            <TouchableOpacity 
              disabled={true}
              className="flex min-w-[80px] py-4 px-8 justify-center items-center gap-1 rounded-full border border-[#DDD]"
            >
            <Text className='text-[#0F172A] font-lato text-[16px] font-extrabold leading-6 tracking-[-0.1px]'>
              Back
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-[#0F172A] inline-flex min-w-[80px] py-4 px-8 justify-center items-center gap-1 rounded-full"
            onPress={handleSubmit}
          >
            <Text className="text-white text-center font-lato text-[16px] font-extrabold leading-[24px] tracking-[0.3px]">Next</Text>
          </TouchableOpacity>
        </View>
    </View>

  );
}
