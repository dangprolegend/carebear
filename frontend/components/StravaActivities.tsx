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
  thisWeek?: {
    activities: number;
    distance: number;
    movingTime: number;
  };
}

const StravaActivities: React.FC = () => {
  const { getActivities, getWeeklySummary, isAuthenticated } = useManualStrava();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStravaData();
    }
  }, [isAuthenticated]);

  const fetchStravaData = async () => {
    try {
      setIsLoading(true);
      setIsLoadingSummary(true);
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
      setIsLoadingSummary(false);
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
    <View className='bg-[#FAE5CA]'>
      <View className="px-6 py-4 mt-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-[#2A1800] text-center font-lato text-[16px] font-black leading-[24px] tracking-[0.3px]">
            Recent Activities
          </Text>
        </View>

        {isLoading ? (
          <View className="flex-1 justify-center items-center py-8">
            <ActivityIndicator size="large" color="#2A1800" />
          </View>
        ) : (
          <>
            {/* This Week Summary Component */}
            <View className="mb-6">
              <View className='flex flex-col items-start gap-2 flex-1'>
                <Text className='text-black text-center font-lato text-[14px] font-black leading-[24px] tracking-[0.3px]'>
                  This Week
                </Text>

                <View className="flex flex-row justify-between w-full">
                  <View className="flex flex-col items-start gap-px">
                    <Text className="text-black text-center font-lato text-[14px] font-normal leading-[24px] tracking-[-0.1px]">
                      Activities
                    </Text>
                    <Text className="text-black text-center font-lato text-[14px] font-black leading-[24px] tracking-[0.3px]">
                      {isLoadingSummary ? '-' : (weeklySummary?.allTime?.activities || 0)}
                    </Text>
                  </View>
                  
                  <View className="flex-1">
                    <Text className="text-black text-center font-lato text-[14px] font-normal leading-[24px] tracking-[-0.1px]">
                      Distance
                    </Text>
                    <Text className="text-black text-center font-lato text-[14px] font-black leading-[24px] tracking-[0.3px]">
                      {isLoadingSummary ? '-' : (weeklySummary?.allTime?.distance ? formatDistance(weeklySummary.allTime.distance) : '0.00 mi')}
                    </Text>
                  </View>

                  <View className="flex-1">
                    <Text className="text-black text-center font-lato text-[14px] font-normal leading-[24px] tracking-[-0.1px]">
                      Steps
                    </Text>
                    <Text className="text-black text-center font-lato text-[14px] font-black leading-[24px] tracking-[0.3px]">
                      {isLoadingSummary ? '-' : (weeklySummary?.allTime?.distance ? formatSteps(weeklySummary.allTime.distance) : '0')}
                    </Text>
                  </View>
                  
                  <View className="flex-1">
                    <Text className="text-black text-center font-lato text-[14px] font-normal leading-[24px] tracking-[-0.1px]">
                      Time
                    </Text>
                    <Text className="text-black text-center font-lato text-[14px] font-black leading-[24px] tracking-[0.3px]">
                      {isLoadingSummary ? '-' : (weeklySummary?.allTime?.movingTime ? formatTime(weeklySummary.allTime.movingTime) : '0m')}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Loading indicator for summary */}
              {isLoadingSummary && (
                <View className="absolute inset-0 flex-1 justify-center items-center bg-white/50 rounded-lg">
                  <ActivityIndicator size="small" color="#2A1800" />
                </View>
              )}
            </View>

            {/* Activities List */}
            <View className="gap-4">
              {activities.slice(0, showAllActivities ? activities.length : 2).map((activity) => (
                <View
                  key={activity.id}
                  className="flex px-4 py-3 items-start gap-2.5 self-stretch rounded-lg border border-[#2A1800] bg-white"
                >
                  <View className="flex-row justify-between items-start">
                    <Text className="text-black font-lato text-[16px] font-extrabold flex-1">
                      {activity.name}
                    </Text>
                    <View
                      className="px-2 py-1 rounded-full"
                      style={{ backgroundColor: '#FAE5CA' }}
                    >
                      <Text className="text-[#2A1800] font-lato text-[14px] font-normal leading-[24px] tracking-[-0.1px]">
                        {getActivityTypeLabel(activity.type)}
                      </Text>
                    </View>
                  </View>
                  
                  <View className="flex-row gap-2">
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
    </View>
  );
};

export default StravaActivities;