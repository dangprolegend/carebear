import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { MoodIcon } from './mood-icon';
import { TimelineMarker } from './timeline-marker';
import { cn } from '~/lib/utils';

interface FeedItem {
  id: string;
  type: 'mood' | 'task';
  timestamp: Date;
  user: {
    name: string;
    avatar?: string;
  };
  mood?: 'happy' | 'excited' | 'sad' | 'angry' | 'nervous';
  task?: {
    title: string;
    status: 'pending' | 'in-progress' | 'done';
    priority: 'low' | 'medium' | 'high';
  };
}

interface FeedItemCardProps {
  item: FeedItem;
  onPress?: () => void;
  isLast?: boolean;
  isFirst?: boolean;
}

export function FeedItemCard({ item, onPress, isLast = false, isFirst = false }: FeedItemCardProps) {
  const timeAgo = formatTimeAgo(item.timestamp);
  
  const Component = onPress ? Pressable : View;
  return (
    <Component
      onPress={onPress}
      className={cn(
        'mb-0',
        onPress && 'active:opacity-80'
      )}
    >
      <View className="flex-row items-start">        
        {/* Timeline Marker with Avatar */}
        <View className="pr-3 w-16 flex-shrink-0">
          <TimelineMarker 
            type={item.type}
            isLast={isLast} 
            isFirst={isFirst}
            avatar={item.user.avatar}
            userName={item.user.name}
          />
        </View>

        {/* Content */}
        <View className="flex-1 pb-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-1">
            <View className="flex-row items-center space-x-2">
              <Text className="font-medium text-gray-900">{item.user.name}</Text>
              <Text className="text-sm text-gray-500">•</Text>
              <Text className="text-sm text-gray-500">{timeAgo}</Text>
            </View>
            
            {item.task && (
              <View className={cn(
                'px-2 py-1 rounded-full',
                item.task.priority === 'high' ? 'bg-red-100' :
                item.task.priority === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
              )}>
                <Text className={cn(
                  'text-xs font-medium',
                  item.task.priority === 'high' ? 'text-red-700' :
                  item.task.priority === 'medium' ? 'text-yellow-700' : 'text-green-700'
                )}>
                  {item.task.priority}
                </Text>
              </View>
            )}
          </View>          {/* Mood Content */}
          {item.type === 'mood' && item.mood && (
            <View className="mt-1 py-1">
              <View className="flex-row items-center space-x-3 mb-1">
                <Text className="text-gray-700 font-medium">is feeling</Text>
                <MoodIcon mood={item.mood} size="sm" />
                <Text className="text-gray-700 font-medium capitalize">{item.mood}</Text>
              </View>
              <Text className="text-gray-600 text-sm">
                {getMoodDescription(item.mood)}
              </Text>
            </View>
          )}

          {/* Task Content */}
          {item.type === 'task' && item.task && (
            <View className="mt-1 py-1">
              <View className="flex-row items-center space-x-2 mb-1">
                <MaterialIcons 
                  name={
                    item.task.status === 'done' ? 'check-circle' :
                    item.task.status === 'in-progress' ? 'pending' : 'radio-button-unchecked'
                  }
                  size={16}
                  color={
                    item.task.status === 'done' ? '#22c55e' :
                    item.task.status === 'in-progress' ? '#f59e0b' : '#6b7280'
                  }
                />
                <Text className="text-gray-700 font-medium">
                  {item.task.status === 'done' ? 'completed' : 'started working on'}
                </Text>
              </View>
              <Text className="font-medium text-gray-900 mb-1">{item.task.title}</Text>
              <Text className="text-gray-600 text-sm">
                {getTaskDescription(item.task)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Component>
  );
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return 'just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString();
}

function getMoodDescription(mood: 'happy' | 'excited' | 'sad' | 'angry' | 'nervous'): string {
  switch (mood) {
    case 'happy':
      return 'Feeling good and positive today. Everything is going well!';
    case 'excited':
      return 'Looking forward to upcoming events or opportunities!';
    case 'sad':
      return 'Feeling down today. Could use some support or encouragement.';
    case 'angry':
      return 'Experiencing frustration or annoyance with current circumstances.';
    case 'nervous':
      return 'Feeling anxious or worried about something coming up.';
    default:
      return '';
  }
}

function getTaskDescription(task: { title: string; status: string; priority: string }): string {
  const statusText = 
    task.status === 'done' ? 'This task has been successfully completed.' :
    task.status === 'in-progress' ? 'Currently working on this task.' :
    'This task is scheduled but not yet started.';
    
  const priorityText =
    task.priority === 'high' ? 'This is a high priority item that requires immediate attention.' :
    task.priority === 'medium' ? 'This is a medium priority task to be completed soon.' :
    'This is a low priority task with flexible timing.';
    
  return `${statusText} ${priorityText}`;
}
