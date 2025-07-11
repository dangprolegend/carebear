import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { cn } from '~/lib/utils';

interface MoodIconProps {
  mood: 'happy' | 'excited' | 'sad' | 'angry' | 'nervous' | 'peaceful';
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  onPress?: () => void;
}

const moodEmojis = {
  happy: '😆',
  excited: '😊',
  sad: '🙂',
  angry: '😌',
  nervous: '😞',
  peaceful: '😭',
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
        'rounded-full items-center justify-center',
        sizeClasses[size],
        onPress && 'active:scale-95'
      )}
    >
      <Text className={sizeClasses[size].split(' ')[2]}>{moodEmojis[mood]}</Text>
    </Component>
  );
}
