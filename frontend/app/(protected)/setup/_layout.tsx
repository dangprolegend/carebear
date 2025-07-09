import React from 'react';
import { View, Text } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '~/components/ui/button';

const setupSteps = [
  'health-input',
  'roles-info',
  'join-family',
  'create-family' , 
  'congrats'
];

interface SetupProgressIndicatorProps {
  currentStepIndex: number; 
}

function SetupProgressIndicator({ currentStepIndex }: SetupProgressIndicatorProps) {
    const totalVisibleDots = 5;
    const nonNegativeIndex = Math.max(0, currentStepIndex);
    const lastVisibleDotIndex = totalVisibleDots - 1;
    let activeVisibleDotIndex;

    if (nonNegativeIndex >= lastVisibleDotIndex) {
      activeVisibleDotIndex = lastVisibleDotIndex;
    } else {
      activeVisibleDotIndex = nonNegativeIndex;
    }

  return (
    <View className="mb-12 mt-[-30px] flex-row items-center justify-center space-x-6 gap-2">
      {Array.from({ length: totalVisibleDots }).map((_, index) => {
        const isActive = index === activeVisibleDotIndex;
        const widthClass = isActive ? 'w-6' : 'w-2.5';
        const bgClass = isActive ? 'bg-[#2A1800] dark:bg-primary' : 'bg-[#2A1800] dark:bg-[#2A1800]';

        return (
          <View
            key={index}
            className={`h-2.5 rounded-full ${widthClass} ${bgClass}`}
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
                         ? 'health-input'
                         : segments[segments.length - 1];

  const currentStepIndex = setupSteps.indexOf(currentSegment ?? 'health-input');
  const totalSteps = setupSteps.length;
  const isJoinFamilyStep = currentSegment === 'join-family';

  const safeCurrentStepIndex = currentStepIndex === -1 ? 0 : currentStepIndex;

  if (currentStepIndex === -1) {
    console.warn(`Current segment "${currentSegment}" not found in setupSteps. Defaulting to first step visual.`);
     console.log("Segments:", segments);
     console.log("Calculated currentSegment:", currentSegment);
     console.log("Result of indexOf:", currentStepIndex);
  }

  const canGoBack = safeCurrentStepIndex > 0;
  const isLastStep = safeCurrentStepIndex === totalSteps - 1;

  const handleBack = () => {
    if (canGoBack) {
      const previousStep = setupSteps[safeCurrentStepIndex - 1];
      const path = `/setup/${previousStep}`;
      router.navigate(path as any);
    } else {
      console.log("Already on the first page");
    }
  };

  const handleNext = () => {
    if (!isLastStep) {
      const nextStep = setupSteps[safeCurrentStepIndex + 1];
      const path = `/setup/${nextStep}`;
      console.log(`Navigating from ${currentSegment} to ${path}`);
      router.navigate(path as any);
    } else {
      console.log("Setup Complete! Navigating away...");
      router.replace('/dashboard/mydashboard/dashboard');
    }
  };

  const handleCreateGroup = () => {
    console.log("Navigate to Create Family Group screen from layout");
    router.navigate('/setup/create-family');
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      <View className="flex-1 p-7">
        <SetupProgressIndicator
          currentStepIndex={safeCurrentStepIndex}
        />

        <View className="flex-1 pt-2">
          <Slot />
        </View>
        
      </View>
    </SafeAreaView>
  );
}
