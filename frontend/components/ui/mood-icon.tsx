import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { cn } from '~/lib/utils';

interface MoodIconProps {
  mood: 'happy' | 'excited' | 'sad' | 'angry' | 'nervous';
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  onPress?: () => void;
}

const moodEmojis = {
  happy: '😊',
  excited: '🤩',
  sad: '😢',
  angry: '😡',
  nervous: '😰',
};

const moodColors = {
  happy: 'bg-green-100 border-green-300',
  excited: 'bg-yellow-100 border-yellow-300',
  sad: 'bg-blue-100 border-blue-300',
  angry: 'bg-red-100 border-red-300',
  nervous: 'bg-purple-100 border-purple-300',
};

export function MoodIcon({ mood, size = 'md', selected = false, onPress }: MoodIconProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-3xl',
  };

  const Component = onPress ? Pressable : View;

  return (
    <Component
      onPress={onPress}
      className={cn(
        'rounded-full border-2 items-center justify-center',
        sizeClasses[size],
        selected ? 'border-gray-800' : moodColors[mood],
        onPress && 'active:scale-95'
      )}
    >
      <Text className={sizeClasses[size].split(' ')[2]}>{moodEmojis[mood]}</Text>
    </Component>
  );
}
