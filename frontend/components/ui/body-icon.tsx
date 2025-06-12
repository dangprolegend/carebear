import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { cn } from '~/lib/utils';

interface BodyIconProps {
  body: 'energized' | 'sore' | 'tired' | 'sick' | 'relaxed' | 'tense';
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  onPress?: () => void;
}

const bodyEmojis = {
  energized: '⚡',
  sore: '🤕',
  tired: '😴',
  sick: '🤒',
  relaxed: '😌',
  tense: '😬',
};



export function BodyIcon({ body, size = 'md', selected = false, onPress }: BodyIconProps) {
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
      <Text className={sizeClasses[size].split(' ')[2]}>{bodyEmojis[body]}</Text>
    </Component>
  );
}
