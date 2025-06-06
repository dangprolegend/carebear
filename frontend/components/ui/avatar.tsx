import React from 'react';
import { View, Text, Image } from 'react-native';
import { cn } from '~/lib/utils';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-yellow-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-red-500',
    'bg-teal-500'
  ];

  // Generate consistent color based on name
  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  const bgColor = colors[colorIndex];

  return (
    <View
      className={cn(
        'rounded-full items-center justify-center',
        sizeClasses[size],
        !src && bgColor,
        className
      )}
    >
      {src ? (
        <Image 
          source={{ uri: src }} 
          className="w-full h-full rounded-full"
        />
      ) : (
        <Text className={cn('font-medium text-white', sizeClasses[size].split(' ')[2])}>
          {initials}
        </Text>
      )}
    </View>
  );
}
