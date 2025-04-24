import React, { useState } from 'react';
import { View } from 'react-native';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
// Import SelectGroup
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Text } from '~/components/ui/text';
import { Toggle } from '~/components/ui/toggle';

// Ensure this type matches the actual structure used by your Select component
type Option = { value: string; label: string };

function HealthInputScreen() {
  // State for form inputs and unit selection
  const [units, setUnits] = useState<string>('metric'); // 'metric' or 'imperial'
  const [dob, setDob] = useState<string>('');
  const [gender, setGender] = useState<Option | null>(null);
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');

  const genderOptions: Option[] = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ];

  // TODO: Handlers for Date Picker interaction

  // Handler to update units state when a Toggle is pressed
  const handleUnitChange = (newUnit: 'metric' | 'imperial') => {
    setUnits(newUnit);
  };

  return (
    // Added justify-center and a test background color (bg-blue-100)
    <View className="flex-1 p-6 justify-center bg-black-100">

      {/* Added text-center and a test text color (text-purple-700) */}
      <Text className="text-2xl font-bold mb-6 text-black-700 text-center">
        Your Health input
      </Text>

      {/* --- Form Fields --- */}
      <View className="flex-row gap-4 mb-4">
        {/* Date of Birth */}
        <View className="flex-1">
          <Label nativeID="dobLabel">Date of birth</Label>
          {/* Remember to add onPressIn or similar to trigger a Date Picker */}
          <Input
            nativeID="dobLabel"
            placeholder="MM/DD/YYYY"
            value={dob}
            editable={false}
            // onPressIn={() => console.log('Open Date Picker')} // Example trigger
            // Added test border color
            className="border border-black-300"
          />
        </View>
        {/* Gender */}
        <View className="flex-1">
          <Label nativeID="genderLabel">Gender</Label>
          <Select
            value={gender}
            onValueChange={(option: Option | null) => option && setGender(option)}
          >
             {/* Added test border color */}
            <SelectTrigger nativeID="genderLabel" className="border border-black-300">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {/* Wrap the list of SelectItem components in SelectGroup */}
              <SelectGroup>
                {genderOptions.map((option) => (
                  <SelectItem key={option.value} value={option}>
                    {/* SelectItem usually renders the label itself */}
                    {/* If it expects a Text child, keep it, otherwise remove */}
                    <Text>{option.label}</Text>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </View>
      </View>

      {/* --- Units Selection using individual Toggles --- */}
      <View className="flex-row items-center justify-center gap-2 mb-4">
        {/* Metric Toggle */}
        <Toggle
          aria-label="Select metric units (kg/cm)"
          pressed={units === 'metric'}
          onPressedChange={(pressed) => {
            if (pressed) {
              handleUnitChange('metric');
            }
          }}
          // Added test background for pressed state
          className="data-[state=on]:bg-black-300"
        >
          <Text>kg/cm</Text>
        </Toggle>

        {/* Imperial Toggle */}
        <Toggle
          aria-label="Select imperial units (lb/ft)"
          pressed={units === 'imperial'}
          onPressedChange={(pressed) => {
            if (pressed) {
              handleUnitChange('imperial');
            }
          }}
           // Added test background for pressed state
          className="data-[state=on]:bg-black-300"
        >
          <Text>lb/ft</Text>
        </Toggle>
      </View>

      {/* Weight Input */}
      <View className="mb-4">
        <Label nativeID="weightLabel">Weight</Label>
        <Input
          nativeID="weightLabel"
          placeholder={units === 'metric' ? '00.0 kg' : '000.0 lb'}
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
          // Added test border color
          className="border border-black-300"
        />
      </View>

      {/* Height Input */}
      <View className="mb-6">
        <Label nativeID="heightLabel">Height</Label>
        <Input
           nativeID="heightLabel"
           placeholder={units === 'metric' ? '000.0 cm' : "0' 00\""}
           keyboardType="numeric"
           value={height}
           onChangeText={setHeight}
           // Added test border color
           className="border border-black-300"
        />
      </View>

      {/* --- Buttons --- */}
      <View className="flex-row justify-between items-center mt-8">
         {/* Added test border and text color */}
        <Button variant="outline" size="lg" className="border-black-500">
          <Text className="text-black-600">Back</Text>
        </Button>
 
        <Button variant="default" size="lg" className="bg-black-600">
          <Text className="text-black-600">Next</Text>
        </Button>
      </View>
    </View>
  );
}

export default HealthInputScreen;
