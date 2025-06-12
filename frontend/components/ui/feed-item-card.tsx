import { View, Text, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { MoodIcon } from './mood-icon';
import { BodyIcon } from './body-icon';
import { TimelineMarker } from './timeline-marker';
import { cn } from '~/lib/utils';

interface FeedItem {
  id: string;
  type: 'mood' | 'task';
  timestamp: Date;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  moods?: ('happy' | 'excited' | 'sad' | 'angry' | 'nervous' | 'peaceful')[];
  body?: ('energized' | 'sore' | 'tired' | 'sick' | 'relaxed' | 'tense')[];
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
        <View className="pr-3 w-16 flex-shrink-0">
          <TimelineMarker 
            type={item.type}
            isLast={isLast} 
            isFirst={isFirst}
            avatar={item.user.avatar}
            userName={item.user.name}
          />
        </View>
        <View className="flex-1 pb-4">
          <View className="flex-row items-center justify-between mb-1">
            <View className="flex-row items-center">
              <Text className="font-medium text-gray-900">{item.user.name}</Text>
              <Text className="text-sm text-black ml-2">
                {item.type === 'mood' 
                  ? 'updated mood and health' 
                  : item.task?.status === 'done' 
                    ? `completed ${item.task?.priority || 'unknown'} priority task`
                    : item.task?.status === 'in-progress' 
                      ? `started working on ${item.task?.priority || 'unknown'} priority task`
                      : `added ${item.task?.priority || 'unknown'} priority task`
                }
              </Text>
            </View>
          </View>
          
          {/* Time */}
          <View className="mb-2">
            <Text className="text-sm text-gray-500">{timeAgo}</Text>
          </View>
          
          {/* Mood Content */}
          {item.type === 'mood' && item.moods && item.moods.length > 0 && (
            <View className="mt-1 py-1">
              <View>
                <View className="flex-row items-center flex-wrap mb-1">
                  <Text className="text-gray-700 font-medium">I feel </Text>
                  {item.moods.map((mood, index) => (
                    <View key={mood + '-' + index} className="flex-row items-center">
                      <MoodIcon mood={mood} size="sm" />
                      <Text className="text-gray-700 font-medium capitalize ml-1">{mood}</Text>
                      {index < item.moods!.length - 1 && (
                        <Text className="text-gray-700 font-medium">
                          {index === item.moods!.length - 2 ? ' and ' : ', '}
                        </Text>
                      )}
                    </View>
                  ))}
                  <Text className="text-gray-700 font-medium ml-1">today</Text>
                </View>
                
                {/* Body feelings */}
                {item.body && item.body.length > 0 && (
                  <View className="flex-row items-center flex-wrap mt-1">
                    <Text className="text-gray-700 font-medium">My body feels </Text>
                    {item.body.map((bodyFeeling, index) => (
                      <View key={bodyFeeling + '-' + index} className="flex-row items-center">
                        <BodyIcon body={bodyFeeling} size="sm" />
                        <Text className="text-gray-700 font-medium capitalize ml-1">{bodyFeeling}</Text>
                        {index < item.body!.length - 1 && (
                          <Text className="text-gray-700 font-medium">
                            {index === item.body!.length - 2 ? ' and ' : ', '}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}
          
          {item.type === 'task' && item.task && (
            <View className="mt-1 py-1">
              <Text className="font-medium text-gray-900 mb-1">{item.task.title}</Text>
            </View>
          )}
        </View>
      </View>
    </Component>
  );
}

