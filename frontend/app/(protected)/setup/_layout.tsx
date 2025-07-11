//@ts-nocheck
import { View, Text } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const setupSteps = [
'health-input',
'roles-info',
'join-family',
'create-family',
'congrats'
];


const stepToProgressMap = {
  'health-input': 0,    // health-info - first dot
  'join-family': 1,     // join-family - second dot
  'create-family': 2,   // create-family - third dot
  'roles-info': 3,      // roles-info - fourth dot
  'congrats': 4         // congrats - fifth dot (default, will be overridden)
};

// Counter to track how many times we've seen congrats
let congratsCounter = 0;

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

  const pathname = router.pathname || '';
    
  const setupIndex = segments.indexOf('setup');
  let currentSegment;
  
  if (setupIndex !== -1 && segments[setupIndex + 1]) {
    currentSegment = segments[setupIndex + 1];
  } else if (segments[segments.length - 1] === 'setup') {
    currentSegment = 'health-input';
  } else {
    currentSegment = segments[segments.length - 1];
  }
  
  const currentStepIndex = setupSteps.indexOf(currentSegment ?? 'health-input');
  
  let visualProgressIndex = stepToProgressMap[currentSegment] ?? 0;
  
  // Handle congrats counter logic
  if (currentSegment === 'congrats') {
    congratsCounter++;
    console.log("DEBUG - Congrats counter:", congratsCounter);
    
    if (congratsCounter === 1) {
      // First time seeing congrats = health-input page
      visualProgressIndex = 0; // First dot
      console.log("DEBUG - First congrats = health-input (first dot)");
    } else {
      // Second time and beyond = actual congrats page
      visualProgressIndex = 4; // Last dot
      console.log("DEBUG - Second+ congrats = actual congrats (last dot)");
    }
  }
  
  console.log("DEBUG - Visual progress index:", visualProgressIndex);
  
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
          currentStepIndex={visualProgressIndex}
        />
        <View className="flex-1 pt-2">
          <Slot />
        </View>
      </View>
    </SafeAreaView>
  );
}