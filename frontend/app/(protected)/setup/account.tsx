import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
// Note: No Button import needed here, handled by layout

export default function AccountSetupScreen() {
  const [name, setName] = useState<string>('');
  const [contact, setContact] = useState<string>(''); // For Phone Number / Email
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  // --- NO Navigation Buttons or Progress Indicator needed here ---
  // TODO: Add state management logic here if needed to pass data
  return (
    // Container for just the content of this step
    <View>
      <Text className="mb-8 text-3xl font-bold text-foreground">
        Set up your Account
      </Text>
      <View className="mb-6">
        <Label nativeID="nameLabel" className="mb-2 text-lg font-medium">
          Name
        </Label>
        <Input
          nativeID="nameLabel"
          placeholder="First and Last Name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words" 
          className="p-3" 
        />
      </View>

      {/* Phone Number / Email field */}
      <View className="mb-6">
        <Label nativeID="contactLabel" className="mb-2 text-lg font-medium">
          Phone Number / Email
        </Label>
        <Input
          nativeID="contactLabel"
          placeholder="(000) 000-0000 or abc@gmail.com"
          value={contact}
          onChangeText={setContact}
          keyboardType="email-address" 
          autoCapitalize="none"
          className="p-3"
        />
      </View>

      {/* Password field */}
      <View className="mb-6">
        <Label nativeID="passwordLabel" className="mb-2 text-lg font-medium">
          Password
        </Label>
        <Input
          nativeID="passwordLabel"
          placeholder="••••••••" 
          value={password}
          onChangeText={setPassword}
          secureTextEntry 
          autoCapitalize="none"
          className="p-3"
        />
      </View>

      {/* Confirm Password field */}
      <View className="mb-6">
        <Label nativeID="confirmPasswordLabel" className="mb-2 text-lg font-medium">
          Confirm Password
        </Label>
        <Input
          nativeID="confirmPasswordLabel"
          placeholder="••••••••"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry 
          autoCapitalize="none"
          className="p-3"
        />
      </View>
    </View>
  );
}
