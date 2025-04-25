import React from 'react';
import { View, Text } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '~/components/ui/button';

const setupSteps = [
  'account', // "Set up your Account"
  'health-input', // "health input screen"
  'join-family', // "family group join/..."
  'congrats', //  "congrats screen"
];

interface SetupProgressIndicatorProps {
  totalSteps: number;
  currentStepIndex: number;
}

function SetupProgressIndicator({ totalSteps, currentStepIndex }: SetupProgressIndicatorProps) {
  return (
    <View className="mb-8 flex flex-row items-center justify-center space-x-1 p-4"> {/* scroll dot*/}
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isActive = index === currentStepIndex;
        const widthClass = isActive ? 'w-6' : 'w-2';
        const bgClass = isActive ? 'bg-primary dark:bg-primary' : 'bg-gray-300 dark:bg-gray-600'; // Added dark:bg-primary

        return (
          <View
            key={index}
            className={`h-2 rounded-full ${widthClass} ${bgClass}`}
          />
        );
      })}
    </View>
  );
}

export default function SetupLayout() {
  const router = useRouter();
  const segments = useSegments();

  const currentSegment = segments[segments.length - 1] === 'setup'
                         ? 'account' 
                         : segments[segments.length - 1];

  const currentStepIndex = setupSteps.indexOf(currentSegment ?? 'account');
  const totalSteps = setupSteps.length;
  const isJoinFamilyStep = currentSegment === 'join-family';

  if (currentStepIndex === -1) {
    console.warn(`Current segment "${currentSegment}" not found in setupSteps. Defaulting to first step.`);
  }

  const canGoBack = currentStepIndex > 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  const handleBack = () => {
    if (canGoBack) {
      const previousStep = setupSteps[currentStepIndex - 1];
      const path = `/setup/${previousStep}`;
      router.navigate(path as any); 
    } else {
      console.log("Already on the first page");
    }
  };

  const handleNext = () => {
    if (!isLastStep) {
      const nextStep = setupSteps[currentStepIndex + 1];
      const path = `/setup/${nextStep}`;
      router.navigate(path as any); 
    } else {
      console.log("Setup Complete! Navigating away...");
      router.replace('/home'); 
    }
  };

  const handleCreateGroup = () => {
    console.log("Navigate to Create Family Group screen from layout");
    router.navigate('/(protected)/admin/create-family');
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      <View className="flex-1 p-6 pt-12">
        <SetupProgressIndicator
          totalSteps={totalSteps}
          currentStepIndex={currentStepIndex}
        />

        <View className="flex-1 pt-12">
          <Slot />
        </View>

        <View className="flex flex-row justify-between items-center pt-4 pb-12">
          <Button
            variant="outline"
            size="lg"
            onPress={handleBack}
            disabled={!canGoBack}
            className={`rounded-full px-10 py-3 ${!canGoBack ? 'opacity-50' : ''}`}
          >
            <Text>Back</Text>
          </Button>

          {isJoinFamilyStep ? (
            <Button
              variant="default"
              size="lg"
              onPress={handleCreateGroup}
              className="rounded-full bg-foreground px-10 py-3"
            >
              <Text className="text-primary-foreground">Create Group</Text>
            </Button>
          ) : (
            <Button
              variant="default"
              size="lg"
              onPress={handleNext}
              className="rounded-full bg-foreground px-10 py-3"
            >
              <Text className="text-primary-foreground">{isLastStep ? 'Finish' : 'Next'}</Text>
            </Button>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
