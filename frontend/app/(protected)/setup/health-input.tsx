import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Toggle } from '~/components/ui/toggle';
import type { Option } from '@rn-primitives/select';

export default function HealthInputScreen() {
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [dob, setDob] = useState<string>('');
  const [gender, setGender] = useState<Option | null>(null);
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');

  const genderOptions: Option[] = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ];

  const handleDobFocus = () => {
    console.log("Trigger Date Picker");
  };

  const handleUnitChange = (newUnit: 'metric' | 'imperial') => {
    setUnitSystem(newUnit);
  };


  return (
    <View>
      {/* Form title */}
      <Text className="mb-8 text-3xl font-bold text-foreground">
        Your Health input
      </Text>

      {/* Form fields */}
      <View className="mb-6 flex flex-row gap-4">
        {/* Date of Birth */}
        <View className="flex-1">
          <Label nativeID="dobLabel" className="mb-2 text-lg font-medium">
            Date of birth
          </Label>
          <Pressable onPress={handleDobFocus}>
            <Input
              nativeID="dobLabel"
              placeholder="MM/DD/YYYY"
              value={dob}
              editable={false}
              className="p-3 text-gray-500" 
            />
          </Pressable>
        </View>
        {/* Gender */}
        <View className="flex-1">
          <Label nativeID="genderLabel" className="mb-2 text-lg font-medium">
            Gender
          </Label>
          <Select
            value={gender || { value: '', label: 'Select' }}
            onValueChange={(option) => setGender(option as Option)}
          >
            <SelectTrigger nativeID="genderLabel">
              <SelectValue
                placeholder="Select"
                className="text-gray-500" 
              />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {genderOptions.map((option) => (
                  <SelectItem key={option?.value ?? ''} value={option?.value ?? ''} label={option?.label ?? ''} />
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
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
    </View>
  );
}
