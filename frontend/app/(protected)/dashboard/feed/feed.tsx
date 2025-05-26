import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Dropdown } from '~/components/ui/dropdown';
import { FeedItemCard } from '~/components/ui/feed-item-card';
import { MoodIcon } from '~/components/ui/mood-icon';
import { EmptyState } from '~/components/ui/empty-state';

// Mock data - replace with actual API calls
const mockFeedData = [
  {
    id: '1',
    type: 'mood' as const,
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    user: { name: 'Sarah Johnson' },
    mood: 'happy' as const,
  },
  {
    id: '2',
    type: 'task' as const,
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    user: { name: 'Mike Chen' },
    task: {
      title: 'Complete morning exercise routine',
      status: 'done' as const,
      priority: 'medium' as const,
    },
  },
  {
    id: '3',
    type: 'mood' as const,
    timestamp: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
    user: { name: 'Emily Davis' },
    mood: 'excited' as const,
  },
  {
    id: '4',
    type: 'task' as const,
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    user: { name: 'Alex Brown' },
    task: {
      title: 'Take medication',
      status: 'in-progress' as const,
      priority: 'high' as const,
    },
  },
  {
    id: '5',
    type: 'mood' as const,
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    user: { name: 'Lisa Wilson' },
    mood: 'nervous' as const,
  },
  {
    id: '6',
    type: 'task' as const,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    user: { name: 'Tom Anderson' },
    task: {
      title: 'Water the plants',
      status: 'done' as const,
      priority: 'low' as const,
    },
  },
];

const timeFilterOptions = [
  { label: 'All Time', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
];

const peopleFilterOptions = [
  { label: 'Everyone', value: 'all' },
  { label: 'Family Members', value: 'family' },
  { label: 'Me Only', value: 'me' },
];

const activityFilterOptions = [
  { label: 'All Activities', value: 'all' },
  { label: 'Moods Only', value: 'mood' },
  { label: 'Tasks Only', value: 'task' },
];

// Helper function to group items by date
interface DateGroup {
  dateLabel: string;
  items: Array<typeof mockFeedData[0]>;
}

// Helper function to check if a date is today
function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() && 
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
}

function groupItemsByDate(items: Array<typeof mockFeedData[0]>): DateGroup[] {
  const groups: Record<string, Array<typeof mockFeedData[0]>> = {};
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86400000; // 24 hours in ms

  items.forEach(item => {
    const itemDate = new Date(item.timestamp);
    const itemDateStart = new Date(
      itemDate.getFullYear(), 
      itemDate.getMonth(), 
      itemDate.getDate()
    ).getTime();
    
    let dateLabel = '';
    if (itemDateStart === today) {
      dateLabel = 'Today';
    } else if (itemDateStart === yesterday) {
      dateLabel = 'Yesterday';
    } else {
      dateLabel = itemDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });
    }
    
    if (!groups[dateLabel]) {
      groups[dateLabel] = [];
    }
    
    groups[dateLabel].push(item);
  });

  // Convert the groups object to an array and sort by date
  return Object.keys(groups).map(dateLabel => ({
    dateLabel,
    items: groups[dateLabel]
  })).sort((a, b) => {
    // Sort in reverse chronological order (newest first)
    if (a.dateLabel === 'Today') return -1;
    if (b.dateLabel === 'Today') return 1;
    if (a.dateLabel === 'Yesterday') return -1;
    if (b.dateLabel === 'Yesterday') return 1;
    
    // For other dates, compare the first item's timestamp
    return b.items[0].timestamp.getTime() - a.items[0].timestamp.getTime();
  });
}

export default function Feed() {
  const [feedData, setFeedData] = useState(mockFeedData);
  const [filteredData, setFilteredData] = useState(mockFeedData);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter states
  const [timeFilter, setTimeFilter] = useState('all');
  const [peopleFilter, setPeopleFilter] = useState('all');
  const [activityFilter, setActivityFilter] = useState('all');
  
  // Quick mood selector state
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [showMoodPopup, setShowMoodPopup] = useState(false);
  const [selectedMood, setSelectedMood] = useState<'happy' | 'excited' | 'sad' | 'angry' | 'nervous' | null>(null);
    // Check if user has been away for at least an hour (for the mood popup)
  useEffect(() => {
    try {
      // In React Native, we should use AsyncStorage, but for this example we'll simulate the check
      // In a real app, you would use AsyncStorage.getItem() and AsyncStorage.setItem()
      const lastLoginTime = '0'; // Simulate first login to show the popup
      const currentTime = Date.now();
      
      if (!lastLoginTime || (currentTime - Number(lastLoginTime)) > 60 * 60 * 1000) { // 1 hour
        // Show mood popup after a short delay
        setTimeout(() => {
          setShowMoodPopup(true);
        }, 500);
      }
      
      // Update last login time
      // AsyncStorage.setItem('lastLoginTime', currentTime.toString());
    } catch (error) {
      console.error('Error accessing storage:', error);
    }
  }, []);

  useEffect(() => {
    applyFilters();
  }, [timeFilter, peopleFilter, activityFilter, feedData]);

  const applyFilters = () => {
    let filtered = [...feedData];

    // Time filter
    if (timeFilter !== 'all') {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(startOfDay.getTime() - (now.getDay() * 24 * 60 * 60 * 1000));
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      filtered = filtered.filter(item => {
        switch (timeFilter) {
          case 'today':
            return item.timestamp >= startOfDay;
          case 'week':
            return item.timestamp >= startOfWeek;
          case 'month':
            return item.timestamp >= startOfMonth;
          default:
            return true;
        }
      });
    }

    // Activity filter
    if (activityFilter !== 'all') {
      filtered = filtered.filter(item => item.type === activityFilter);
    }

    // People filter would need actual user data to implement properly
    // For now, it's a placeholder

    setFilteredData(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };
  const handleMoodSubmit = (mood: 'happy' | 'excited' | 'sad' | 'angry' | 'nervous') => {
    // In a real app, this would submit to the backend
    const newMoodEntry = {
      id: Date.now().toString(),
      type: 'mood' as const,
      timestamp: new Date(),
      user: { name: 'You' },
      mood: mood,
    };
    
    // Type assertion to match the expected type in the feed data
    setFeedData([newMoodEntry as typeof feedData[0], ...feedData]);
    setSelectedMood(null);
    setShowMoodSelector(false);
  };  return (
    <View className="flex-1 bg-gray-50">
      {/* Mood Popup Modal */}
      {showMoodPopup && (
        <Modal
          visible={showMoodPopup}
          transparent
          animationType="fade"
        >
          <View className="flex-1 bg-black/50 justify-center items-center p-4">
            <View className="bg-white rounded-xl p-5 w-full max-w-md shadow-xl">
              <View className="items-end">
                <Pressable 
                  onPress={() => setShowMoodPopup(false)}
                  className="p-1"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <MaterialIcons name="close" size={24} color="#666" />
                </Pressable>
              </View>
              
              <Text className="text-2xl font-bold text-gray-900 mb-4 text-center font-['Lato']">
                Welcome back!
              </Text>
              
              <Text className="text-lg text-gray-700 mb-5 text-center font-['Lato']">
                How are you feeling today?
              </Text>
              
              <View className="flex-row justify-around mb-6">
                {(['happy', 'excited', 'sad', 'angry', 'nervous'] as const).map((mood) => (
                  <MoodIcon
                    key={mood}
                    mood={mood}
                    size="lg"
                    selected={selectedMood === mood}
                    onPress={() => setSelectedMood(mood)}
                  />
                ))}
              </View>
              
              <Pressable
                onPress={() => {
                  if (selectedMood) {
                    handleMoodSubmit(selectedMood);
                    setShowMoodPopup(false);
                  } else {
                    setShowMoodPopup(false);
                  }
                }}
                className={`py-3 rounded-lg items-center ${
                  selectedMood ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <Text className={`font-medium text-base ${selectedMood ? 'text-white' : 'text-gray-500'}`}>
                  {selectedMood ? 'Share My Mood' : 'Maybe Later'}
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
      
      {/* Quick Action Bar */}
      <View className="bg-white border-b border-gray-200 px-4 py-3 flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-gray-900 font-['Lato']">Activity Feed</Text>
        
        <Pressable
          onPress={() => setShowMoodSelector(true)}
          className="flex-row items-center bg-blue-50 border border-blue-200 rounded-full px-3 py-1"
          accessibilityRole="button"
          accessibilityLabel="Share your mood"
          accessibilityHint="Opens mood selection options"
        >
          <MaterialIcons name="add" size={16} color="#3b82f6" />
          <Text className="ml-1 text-blue-600 font-medium text-sm font-['Lato']">Share Mood</Text>
        </Pressable>
      </View>
      
      {/* Mood Selector Sheet */}
      {showMoodSelector && (
        <Modal
          visible={showMoodSelector}
          transparent
          animationType="slide"
          onRequestClose={() => setShowMoodSelector(false)}
        >
          <View className="flex-1 justify-end">
            <Pressable 
              className="flex-1 bg-black/30" 
              onPress={() => {
                setShowMoodSelector(false);
                setSelectedMood(null);
              }}
            />
            <View className="bg-white rounded-t-xl p-5">
              <View className="w-10 h-1 bg-gray-300 rounded-full mb-5 self-center" />
              <Text className="text-xl font-bold text-gray-900 mb-4 font-['Lato']">
                How are you feeling right now?
              </Text>
              
              <View className="flex-row justify-around mb-6">
                {(['happy', 'excited', 'sad', 'angry', 'nervous'] as const).map((mood) => (
                  <MoodIcon
                    key={mood}
                    mood={mood}
                    size="lg"
                    selected={selectedMood === mood}
                    onPress={() => setSelectedMood(mood)}
                  />
                ))}
              </View>
              
              <View className="flex-row space-x-3">
                <Pressable
                  onPress={() => {
                    setShowMoodSelector(false);
                    setSelectedMood(null);
                  }}
                  className="flex-1 bg-gray-100 py-3 rounded-lg items-center"
                >
                  <Text className="text-gray-700 font-medium">Cancel</Text>
                </Pressable>
                
                <Pressable
                  onPress={() => {
                    if (selectedMood) {
                      handleMoodSubmit(selectedMood);
                    }
                  }}
                  disabled={!selectedMood}
                  className={`flex-1 py-3 rounded-lg items-center ${
                    selectedMood ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <Text className={`font-medium ${selectedMood ? 'text-white' : 'text-gray-500'}`}>
                    Share
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}      
      {/* Date and Filter Header */}
      <View className="px-4 py-3">
        <View className="flex-row left-3 justify-between items-center">
          <Text className="font-semibold text-lg text-gray-900 font-['Lato']">
            {isToday(new Date()) ? "Today" : new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
          
          <View className="w-40">
            <Dropdown
              options={[
                { label: 'All Activities', value: 'all' },
                { label: 'Moods Only', value: 'mood' },
                { label: 'Tasks Only', value: 'task' },
                { label: 'Divider', value: 'divider', divider: true },
                { label: 'Everyone', value: 'everyone' },
                { label: 'Family Only', value: 'family' },
                { label: 'Me Only', value: 'me' },
              ]}
              value={activityFilter}
              onValueChange={(value) => {
                if (value === 'all' || value === 'mood' || value === 'task') {
                  setActivityFilter(value);
                } else if (value === 'everyone' || value === 'family' || value === 'me') {
                  setPeopleFilter(value);
                }
              }}
              placeholder="Filter"
              icon="filter-list"
            />
          </View>
        </View>
      </View>
      {/* Feed Content */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingHorizontal: 0, paddingVertical: 16 }}
      >
        {filteredData.length === 0 ? (
          <EmptyState
            icon="feed"
            title="No activities to show"
            message="Try adjusting your filters or check back later"
          />
        ) : (
          <View className="px-4">
              {/* Group items by date */}
            {groupItemsByDate(filteredData).map((group, groupIndex) => (
              <View key={group.dateLabel} className="mb-6">
                  <View className="pl-3 relative">
                  {/* Continuous vertical thread for the entire day group */}
                  <View 
                    className="absolute left-9 top-2 bottom-0 w-0.5 bg-black" 
                    style={{ marginLeft: -0.5, zIndex: 0 }}
                  />
                  
                  {group.items.map((item, index) => (
                    <FeedItemCard 
                      key={item.id} 
                      item={item}
                      isLast={index === group.items.length - 1 && groupIndex === groupItemsByDate(filteredData).length - 1}
                      isFirst={index === 0 && groupIndex === 0}
                      onPress={() => {
                        // Handle item press - could navigate to details
                        console.log('Pressed item:', item.id);
                      }}
                    />
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}