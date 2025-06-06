import React from 'react';
import { View, Text, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { cn } from '~/lib/utils';

export interface TimelineMarkerProps {
  isLast?: boolean;
  isFirst?: boolean;
  type?: 'mood' | 'task' | 'event';
  avatar?: string;
  userName?: string;
}

export function TimelineMarker({ isLast = false, isFirst = false, type = 'mood', avatar, userName = '' }: TimelineMarkerProps) {  const iconName = 
    type === 'mood' ? 'sentiment-satisfied-alt' :
    type === 'task' ? 'check-circle' : 'event';
  
  const initials = userName
    ? userName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : '';

  return (
    <View className="flex-col items-center relative">
      <View className={cn(
        "relative w-10 h-10 rounded-full overflow-hidden border-2 z-10 my-2",
        type === 'mood' ? 'border-amber-400' :
        type === 'task' ? 'border-green-400' : 
        'border-purple-400'
      )}>
        {avatar ? (
          <Image 
            source={{ uri: avatar }} 
            className="w-full h-full" 
            resizeMode="cover"
          />
        ) : (          <View className={cn(
            "w-full h-full items-center justify-center",
            type === 'mood' ? 'bg-blue-100' :
            type === 'task' ? 'bg-green-100' : 
            'bg-purple-100'
          )}>
            {initials && initials.length > 0 ? (
              <Text className="font-bold text-sm text-gray-700">{initials}</Text>
            ) : (
              <MaterialIcons 
                name={iconName} 
                size={20} 
                color={
                  type === 'mood' ? '#3b82f6' :
                  type === 'task' ? '#22c55e' : 
                  '#8b5cf6'
                } 
              />
            )}
          </View>
        )}
        
        {/* Small indicator icon on the avatar */}
        <View className={cn(
          "absolute bottom-0 right-0 w-4 h-4 rounded-full items-center justify-center",
          type === 'mood' ? 'bg-blue-400' :
          type === 'task' ? 'bg-green-400' : 
          'bg-purple-400'
        )}>
          <MaterialIcons 
            name={iconName} 
            size={10} 
            color="#ffffff" 
          />
        </View>
      </View>
    </View>
  );
}
