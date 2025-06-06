import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { cn } from '~/lib/utils';

interface EmptyStateProps {
  icon?: keyof typeof MaterialIcons.glyphMap;
  title: string;
  message?: string;
  className?: string;
}

export function EmptyState({ 
  icon = 'sentiment-dissatisfied', 
  title, 
  message,
  className 
}: EmptyStateProps) {
  return (
    <View className={cn(
      "flex-1 items-center justify-center py-12",
      className
    )}>
      <MaterialIcons name={icon} size={48} color="#9ca3af" />
      
      <Text className="text-lg font-medium text-gray-700 mt-4 text-center">{title}</Text>
      {message && (
        <Text className="text-gray-500 text-center mt-2 max-w-xs">{message}</Text>
      )}
    </View>
  );
}
