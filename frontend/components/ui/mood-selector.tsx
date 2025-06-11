import React, { useState } from 'react';
import { View, Modal, Pressable } from 'react-native';
import { Button } from './button';
import { Text } from './text';

type MoodType = 'happy' | 'excited' | 'sad' | 'angry' | 'nervous' | 'peaceful';
type BodyType = 'energized' | 'sore' | 'tired' | 'sick' | 'relaxed' | 'tense';
type SelectionType = MoodType | BodyType;

interface MoodSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (selections: { moods: MoodType[], body: BodyType[] }) => void;
  initialMoods?: MoodType[];
  initialBody?: BodyType[];
  maxSelections?: number;
}

interface MoodButtonProps {
  selection: SelectionType;
  emoji: string;
  label: string;
  color: string;
  isSelected: boolean;
  onPress: () => void;
}

const MoodButton: React.FC<MoodButtonProps> = ({ selection, emoji, label, color, isSelected, onPress }) => {
  const getColorClasses = (color: string, isSelected: boolean) => {
    if (!isSelected) {
      return 'border-gray-200 bg-white text-gray-700';
    }
    
    const colorMap: Record<string, string> = {
      green: 'border-green-400 bg-green-50 text-green-700',
      blue: 'border-blue-400 bg-blue-50 text-blue-700',
      yellow: 'border-yellow-400 bg-yellow-50 text-yellow-700',
      orange: 'border-orange-400 bg-orange-50 text-orange-700',
      red: 'border-red-400 bg-red-50 text-red-700',
      purple: 'border-purple-400 bg-purple-50 text-purple-700',
      teal: 'border-teal-400 bg-teal-50 text-teal-700',
      amber: 'border-amber-400 bg-amber-50 text-amber-700',
      pink: 'border-pink-400 bg-pink-50 text-pink-700',
      indigo: 'border-indigo-400 bg-indigo-50 text-indigo-700',
      emerald: 'border-emerald-400 bg-emerald-50 text-emerald-700',
    };
    
    return colorMap[color] || 'border-gray-400 bg-gray-50 text-gray-700';
  };

  const colorClasses = getColorClasses(color, isSelected);
  const [borderColor, bgColor, textColor] = colorClasses.split(' ');

  return (
    <Button
      variant={isSelected ? 'default' : 'outline'}
      onPress={onPress}
      className={`flex-1 h-20 rounded-2xl border-2 ${borderColor} ${bgColor}`}
    >
      <View className="items-center">
        <Text className="text-3xl mb-1">{emoji}</Text>
        <Text className={`font-medium text-sm font-['Lato'] ${textColor}`}>
          {label}
        </Text>
      </View>
    </Button>
  );
};

const moodOptions: Array<{
  selection: MoodType;
  emoji: string;
  label: string;
  color: string;
}> = [
  { selection: 'happy', emoji: '😊', label: 'Happy', color: 'green' },
  { selection: 'excited', emoji: '🤩', label: 'Excited', color: 'blue' },
  { selection: 'nervous', emoji: '😐', label: 'Nervous', color: 'yellow' },
  { selection: 'sad', emoji: '😟', label: 'Sad', color: 'orange' },
  { selection: 'angry', emoji: '😠', label: 'Angry', color: 'red' },
  { selection: 'peaceful', emoji: '🧘', label: 'Peaceful', color: 'purple' },
];

const bodyOptions: Array<{
  selection: BodyType;
  emoji: string;
  label: string;
  color: string;
}> = [
  { selection: 'energized', emoji: '⚡', label: 'Energized', color: 'emerald' },
  { selection: 'sore', emoji: '🤕', label: 'Sore', color: 'red' },
  { selection: 'tired', emoji: '😴', label: 'Tired', color: 'indigo' },
  { selection: 'sick', emoji: '🤒', label: 'Sick', color: 'orange' },
  { selection: 'relaxed', emoji: '😌', label: 'Relaxed', color: 'teal' },
  { selection: 'tense', emoji: '😬', label: 'Tense', color: 'amber' },
];

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  visible,
  onClose,
  onSubmit,
  initialMoods = [],
  initialBody = [],
  maxSelections = 2
}) => {
  const [selectedMoods, setSelectedMoods] = useState<MoodType[]>(initialMoods);
  const [selectedBody, setSelectedBody] = useState<BodyType[]>(initialBody);

  const handleMoodSelection = (mood: MoodType) => {
    setSelectedMoods(prevMoods => {
      if (prevMoods.includes(mood)) {
        return prevMoods.filter(m => m !== mood);
      }
      
      if (prevMoods.length >= maxSelections) {
        return [prevMoods[1], mood];
      }
      
      return [...prevMoods, mood];
    });
  };

  const handleBodySelection = (body: BodyType) => {
    setSelectedBody(prevBody => {
      if (prevBody.includes(body)) {
        return prevBody.filter(b => b !== body);
      }
      
      if (prevBody.length >= maxSelections) {
        return [prevBody[1], body];
      }
      
      return [...prevBody, body];
    });
  };

  const handleSubmit = () => {
    if (selectedMoods.length > 0 || selectedBody.length > 0) {
      onSubmit({ moods: selectedMoods, body: selectedBody });
      setSelectedMoods([]);
      setSelectedBody([]);
    }
  };

  const handleCancel = () => {
    setSelectedMoods([]);
    setSelectedBody([]);
    onClose();
  };
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center bg-black/40 px-6">
        <View className="bg-white rounded-2xl p-8 mx-4 shadow-2xl">
          {/* Header Section */}
          <View className="items-center mb-8">
            <Text className="text-2xl font-bold text-gray-900 mb-2 font-['Lato'] text-center">
              Daily Check-in
            </Text>
            <Text className="text-gray-600 text-center font-['Lato'] leading-relaxed">
              Share how you're feeling today!
            </Text>
          </View>

          {/* Mood Selection Grid */}
          <View className="mb-8">
            <Text className="text-lg font-semibold text-gray-900 mb-2 font-['Lato'] text-center">
              How's your mood today?
            </Text>

            {/* Mood section*/}
            <View className="gap-4 mb-6">
              {/* First Row */}
              <View className="flex-row gap-4">
                {moodOptions.slice(0, 3).map((option) => (
                  <MoodButton
                    key={option.selection}
                    selection={option.selection}
                    emoji={option.emoji}
                    label={option.label}
                    color={option.color}
                    isSelected={selectedMoods.includes(option.selection)}
                    onPress={() => handleMoodSelection(option.selection)}
                  />
                ))}
              </View>

              {/* Second Row */}
              <View className="flex-row gap-4">
                {moodOptions.slice(3, 6).map((option) => (
                  <MoodButton
                    key={option.selection}
                    selection={option.selection}
                    emoji={option.emoji}
                    label={option.label}
                    color={option.color}
                    isSelected={selectedMoods.includes(option.selection)}
                    onPress={() => handleMoodSelection(option.selection)}
                  />
                ))}
              </View>
            </View>

            {/* Body section*/}
            <View className="gap-4">
              <Text className="text-lg font-semibold text-gray-900 mb-4 font-['Lato'] text-center">
                How's your body feeling?
              </Text>

              {/* Third Row */}
              <View className="flex-row gap-4">
                {bodyOptions.slice(0, 3).map((option) => (
                  <MoodButton
                    key={option.selection}
                    selection={option.selection}
                    emoji={option.emoji}
                    label={option.label}
                    color={option.color}
                    isSelected={selectedBody.includes(option.selection)}
                    onPress={() => handleBodySelection(option.selection)}
                  />
                ))}
              </View>

              {/* Fourth Row */}
              <View className="flex-row gap-4">
                {bodyOptions.slice(3, 6).map((option) => (
                  <MoodButton
                    key={option.selection}
                    selection={option.selection}
                    emoji={option.emoji}
                    label={option.label}
                    color={option.color}
                    isSelected={selectedBody.includes(option.selection)}
                    onPress={() => handleBodySelection(option.selection)}
                  />
                ))}
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="gap-3">
            <Button
              onPress={handleSubmit}
              disabled={selectedMoods.length === 0 && selectedBody.length === 0}
              variant={(selectedMoods.length > 0 || selectedBody.length > 0) ? 'default' : 'secondary'}
              className={`py-4 rounded-xl ${
                (selectedMoods.length > 0 || selectedBody.length > 0)
                  ? 'bg-gray-900' 
                  : 'bg-gray-300'
              }`}
            >
              <Text className={`font-semibold text-lg font-['Lato'] ${
                (selectedMoods.length > 0 || selectedBody.length > 0) ? 'text-white' : 'text-gray-500'
              }`}>
                Done
              </Text>
            </Button>

            <Button
              onPress={handleCancel}
              variant="ghost"
              className="py-3"
            >
              <Text className="text-gray-500 font-medium font-['Lato']">
                Cancel
              </Text>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};
