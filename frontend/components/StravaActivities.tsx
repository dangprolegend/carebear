//@ts-nocheck
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useManualStrava } from '~/hooks/useManualStrava';

interface Activity {
  id: string;
  name: string;
  type: string;
  distance: number;
  moving_time: number;
  start_date: string;
  total_elevation_gain?: number;
}

interface WeeklySummary {
  count: number;
  distance: number;
  moving_time: number;
  elevation_gain: number;
}

const StravaActivities: React.FC = () => {
  const { getActivities, getWeeklySummary, isAuthenticated } = useManualStrava();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStravaData();
    }
  }, [isAuthenticated]);

  const fetchStravaData = async () => {
    try {
      setIsLoading(true);
      const [activitiesData, summaryData] = await Promise.all([
        getActivities(1, 10),
        getWeeklySummary()
      ]);
      
      setActivities(activitiesData);
      setWeeklySummary(summaryData);
    } catch (error) {
      console.error('Error fetching Strava data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDistance = (distance: number): string => {
    const miles = distance * 0.000621371;
    return `${miles.toFixed(2)} mi`;
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const formatSteps = (distance: number): string => {
    // Rough estimation: 1 mile ≈ 2000 steps
    const steps = Math.round(distance * 0.000621371 * 2000);
    return steps.toLocaleString();
  };

  const getActivityTypeLabel = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'run':
        return 'Run';
      case 'walk':
        return 'Walk';
      case 'ride':
        return 'Ride';
      case 'hike':
        return 'Hike';
      default:
        return type;
    }
  };

  const getActivityTypeColor = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'run':
        return '#FF6B6B';
      case 'walk':
        return '#4ECDC4';
      case 'ride':
        return '#45B7D1';
      case 'hike':
        return '#96CEB4';
      default:
        return '#DDA0DD';
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <View className="w-5/6 self-center mt-6">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-black font-lato text-[18px] font-extrabold leading-[32px] tracking-[0.3px]">
          Recent Activities
        </Text>
        {/* <Pressable onPress={() => setShowAllActivities(!showAllActivities)}>
          <View className="bg-white border border-gray-300 rounded-lg px-3 py-1">
            <Text className="text-black font-lato text-[14px] font-medium">
              {showAllActivities ? 'Show Less' : 'Activities >'}
            </Text>
          </View>
        </Pressable> */}
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center py-8">
          <ActivityIndicator size="large" color="#2A1800" />
        </View>
      ) : (
        <>
          {/* Weekly Summary */}
          {/* {weeklySummary && (
            <View className="bg-[#FAE5CA] rounded-lg p-4 mb-4">
              <Text className="text-[#2A1800] font-lato text-[16px] font-extrabold mb-2">
                This week
              </Text>
              <View className="flex-row justify-between">
                <View className="flex-1">
                  <Text className="text-[#2A1800] font-lato text-[14px] font-medium">
                    Activities
                  </Text>
                  <Text className="text-[#2A1800] font-lato text-[18px] font-extrabold">
                    {weeklySummary.count}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-[#2A1800] font-lato text-[14px] font-medium">
                    Distance
                  </Text>
                  <Text className="text-[#2A1800] font-lato text-[18px] font-extrabold">
                    {formatDistance(weeklySummary.distance)}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-[#2A1800] font-lato text-[14px] font-medium">
                    Steps
                  </Text>
                  <Text className="text-[#2A1800] font-lato text-[18px] font-extrabold">
                    {formatSteps(weeklySummary.distance)}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-[#2A1800] font-lato text-[14px] font-medium">
                    Time
                  </Text>
                  <Text className="text-[#2A1800] font-lato text-[18px] font-extrabold">
                    {formatTime(weeklySummary.moving_time)}
                  </Text>
                </View>
              </View>
            </View>
          )} */}

          {/* Activities List */}
          <View className="space-y-3">
            {activities.slice(0, showAllActivities ? activities.length : 2).map((activity) => (
              <View
                key={activity.id}
                className="bg-white rounded-lg p-4 border border-gray-200"
              >
                <View className="flex-row justify-between items-start mb-2">
                  <Text className="text-black font-lato text-[16px] font-extrabold flex-1">
                    {activity.name}
                  </Text>
                  <View
                    className="px-2 py-1 rounded-full"
                    style={{ backgroundColor: getActivityTypeColor(activity.type) }}
                  >
                    <Text className="text-white font-lato text-[12px] font-medium">
                      {getActivityTypeLabel(activity.type)}
                    </Text>
                  </View>
                </View>
                
                <View className="flex-row justify-between">
                  <View className="flex-1">
                    <Text className="text-gray-600 font-lato text-[12px] font-medium">
                      Distance
                    </Text>
                    <Text className="text-black font-lato text-[14px] font-bold">
                      {formatDistance(activity.distance)}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-600 font-lato text-[12px] font-medium">
                      Steps
                    </Text>
                    <Text className="text-black font-lato text-[14px] font-bold">
                      {formatSteps(activity.distance)}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-600 font-lato text-[12px] font-medium">
                      Time
                    </Text>
                    <Text className="text-black font-lato text-[14px] font-bold">
                      {formatTime(activity.moving_time)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {activities.length === 0 && (
            <View className="bg-gray-50 rounded-lg p-6 items-center">
              <Text className="text-gray-500 font-lato text-[16px] font-medium">
                No recent activities found
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
};

export default StravaActivities;