import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@clerk/clerk-expo';
import axios from 'axios';
import { Dropdown } from '~/components/ui/dropdown';
import { FeedItemCard } from '~/components/ui/feed-item-card';
import { EmptyState } from '~/components/ui/empty-state';
import { MoodSelector } from '~/components/ui/mood-selector';
import FeedLoading from '~/components/ui/feed-loading';
import { 
  fetchFeedData, 
  fetchGroupFeedData, 
  FeedItem, 
  FeedFilters,
  setClerkAuthTokenForFeedService,
  fetchUserGroups
} from '~/service/apiServices_feed';
import { 
  getCurrentGroupID, 
  getCurrentUserID, 
  setCurrentUserIDForApiService,
  setCurrentGroupIDForApiService
} from '~/service/apiServices';

interface DateGroup {
  dateLabel: string;
  items: FeedItem[];
}

function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() && 
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
}

function groupItemsByDate(items: FeedItem[]): DateGroup[] {
  const groups: Record<string, FeedItem[]> = {};
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

  return Object.keys(groups).map(dateLabel => ({
    dateLabel,
    items: groups[dateLabel]
  })).sort((a, b) => {
    if (a.dateLabel === 'Today') return -1;
    if (b.dateLabel === 'Today') return 1;
    if (a.dateLabel === 'Yesterday') return -1;
    if (b.dateLabel === 'Yesterday') return 1;
    
    return b.items[0].timestamp.getTime() - a.items[0].timestamp.getTime();
  });
}

export default function Feed() {
  const { getToken, userId } = useAuth();
  
  const [feedData, setFeedData] = useState<FeedItem[]>([]);
  const [filteredData, setFilteredData] = useState<FeedItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);  const [loading, setLoading] = useState(true);
  const [dataReady, setDataReady] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [error, setError] = useState<string | null>(null);
    // Filter states
  const [timeFilter, setTimeFilter] = useState('all');
  const [peopleFilter, setPeopleFilter] = useState('all');
  const [activityFilter, setActivityFilter] = useState('all');
  const [showMoodSelector, setShowMoodSelector] = useState(false);    
  const [currentGroupName, setCurrentGroupName] = useState<string>('Family Group');
  const [currentGroupID, setCurrentGroupID] = useState<string | null>(null);
  const [availableGroups, setAvailableGroups] = useState<any[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);  
  useEffect(() => {
    const initializeUserAndAuth = async () => {
      try {
        if (userId && !isInitialized) {
          const token = await getToken();
          if (!token) {
            console.error("Feed component: No Clerk token available");
            return;
          }
          
          setClerkAuthTokenForFeedService(token);

          const userResponse = await axios.get(`https://carebear-backend-e1z6.onrender.com/api/users/clerk/${userId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          const backendUserID = userResponse.data.userID;
          setCurrentUserIDForApiService(backendUserID);

          const userGroups = await fetchUserGroups(backendUserID);
          setAvailableGroups(userGroups);

          const groupResponse = await axios.get(`https://carebear-backend-e1z6.onrender.com/api/users/${backendUserID}/group`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          const primaryGroupID = groupResponse.data.groupID;
          
          if (primaryGroupID) {
            setCurrentGroupID(primaryGroupID);
            setCurrentGroupIDForApiService(primaryGroupID);

            const primaryGroup = userGroups.find(group => group._id === primaryGroupID);
            if (primaryGroup) {
              setCurrentGroupName(primaryGroup.name || 'Family Group');
            } else {
              try {
                const groupDetailsResponse = await axios.get(`https://carebear-backend-e1z6.onrender.com/api/groups/${primaryGroupID}`, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                  },
                });
                setCurrentGroupName(groupDetailsResponse.data.name || 'Family Group');
              } catch (error) {
                console.error('Failed to fetch group details:', error);
                setCurrentGroupName('Family Group');
              }
            }
          } else if (userGroups.length > 0) {
            // If no primary group but user has groups, use the first one
            const firstGroup = userGroups[0];
            setCurrentGroupID(firstGroup._id);
            setCurrentGroupIDForApiService(firstGroup._id);
            setCurrentGroupName(firstGroup.name || 'Family Group');
          }
          
          setIsInitialized(true);
        }
      } catch (error) {
        console.error("Feed component: Failed to initialize user and auth:", error);
      }
    };
    
    if (userId && !isInitialized) {
      initializeUserAndAuth();
    }
  }, [getToken, userId]); 
  useEffect(() => {
    if (isInitialized && currentGroupID) {
      loadFeedData();
    }
  }, [isInitialized, currentGroupID]);
  
  useEffect(() => {
    if (isInitialized && currentGroupID && peopleFilter) {
      loadFeedData();
    }
  }, [peopleFilter, isInitialized, currentGroupID]);

  useEffect(() => {
    applyFilters();
  }, [timeFilter, activityFilter, feedData]);const handleGroupSwitch = async (groupID: string) => {
    try {
      const selectedGroup = availableGroups.find(group => group._id === groupID);
      if (selectedGroup) {
        setCurrentGroupID(groupID);
        setCurrentGroupName(selectedGroup.name || 'Family Group');
        setCurrentGroupIDForApiService(groupID);
      }
    } catch (error) {
      console.error('Error switching groups:', error);
    }
  };

const loadFeedData = async () => {
    try {
      setLoading(true);
      setDataReady(false);
      setShowContent(false);
      setError(null);
      
      const groupID = currentGroupID; 
      const userID = getCurrentUserID();
      
      const filters: FeedFilters = {
        timeFilter: timeFilter as any,
        activityFilter: activityFilter as any,
        limit: 50
      };

      if (peopleFilter === 'me' && !!userID) {
        filters.userID = userID;
      }

      let data: FeedItem[];
      if (groupID) {
        data = await fetchGroupFeedData(groupID, filters);
      } else {
        console.warn('User has no group ID - cannot load feed data');
        setError('You must be part of a family group to view the feed');
        setFeedData([]);
        return;      }
      
      setFeedData(data);
    } catch (err) {
      console.error('Error loading feed data:', err);
      setError('Failed to load feed data');
      setFeedData([]);    } finally {
      setDataReady(true);
    }
  };const applyFilters = () => {
    let filtered = [...feedData];

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

    if (activityFilter !== 'all') {
      filtered = filtered.filter(item => item.type === activityFilter);
    }  
    setFilteredData(filtered);
  };const onRefresh = async () => {
    setRefreshing(true);
    await loadFeedData();
    setRefreshing(false);
  };  
  return (
    <View className="flex-1 bg-white">    
      <View className="px-3 py-3">        
        
        <View className="flex-row justify-between items-center">
          <Text className="font-semibold left-4 text-lg text-gray-900 font-['Lato']">
            {!!isToday(new Date()) ? "Today" : new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
          <View className="w-32">            
            <Dropdown
            options={availableGroups.map(group => ({
              label: group.name || 'Unnamed Group',
              value: group._id
            }))}
            value={currentGroupID || ''}
            onValueChange={handleGroupSwitch}
            placeholder="Select Group"
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
        contentContainerStyle={{ paddingHorizontal: 0, paddingVertical: 16 }}      >{loading || !showContent ? (
          <FeedLoading 
            dataReady={dataReady}
            onFinish={() => {
              setLoading(false);
              setShowContent(true);
            }}
          />
        ) : filteredData.length === 0 ? (
          <EmptyState
            icon="feed"
            title="No activities to show"
            message="Try adjusting your filters or check back later"
          />
        ) : (
          <View className="px-4">
            {groupItemsByDate(filteredData).map((group, groupIndex) => (
              <View key={group.dateLabel} className="mb-6">
                {groupIndex ? (
                  <View className="mb-4 pl-2">
                    <Text className="text-lg font-semibold text-black font-['Lato']">
                      {typeof group.dateLabel === 'string' ? group.dateLabel : ''}
                    </Text>
                  </View>
                ) : null}

                <View className="pl-3 relative">
                  <View
                    className="absolute left-9 top-2 bottom-0 w-0.5 bg-[#2A1800]"
                    style={{ marginLeft: -0.5, zIndex: 0 }}
                  />

                  {group.items.map((item, index) => (
                    <FeedItemCard
                      key={item.id}
                      item={item}
                      isLast={
                        index === group.items.length - 1 &&
                        groupIndex === groupItemsByDate(filteredData).length - 1
                      }
                      isFirst={index === 0 && groupIndex === 0}
                      onPress={() => {}}
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
