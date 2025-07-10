//@ts-nocheck
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Image, ActivityIndicator } from 'react-native';
import { useManualStrava } from '~/hooks/useManualStrava';
import Strava from '~/assets/icons/strava.png'; 
import Tab from '~/assets/icons/Tab.png';

interface StravaConnectSectionProps {
  onConnectionChange?: (isConnected: boolean) => void;
}

const StravaConnectSection: React.FC<StravaConnectSectionProps> = ({ onConnectionChange }) => {
  const { 
    isAuthenticated, 
    isLoading, 
    athlete, 
    authenticate, 
    signOut, 
    getWeeklySummary,
    getHealthData,
    refreshAuthStatus 
  } = useManualStrava();
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [weeklySummary, setWeeklySummary] = useState<any>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  useEffect(() => {
    if (onConnectionChange) {
      onConnectionChange(isAuthenticated);
    }
  }, [isAuthenticated, onConnectionChange]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWeeklySummary();
    }
  }, [isAuthenticated]);

  const fetchWeeklySummary = async () => {
    try {
      setIsLoadingSummary(true);
      const summary = await getWeeklySummary();
      setWeeklySummary(summary);
    } catch (error) {
      console.error('Error fetching weekly summary:', error);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const result = await authenticate();
      if (result.success) {
        console.log('Successfully connected to Strava');
      } else {
        console.error('Failed to connect to Strava:', result.error);
      }
    } catch (error) {
      console.error('Error connecting to Strava:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await signOut();
      setWeeklySummary(null);
      console.log('Disconnected from Strava');
    } catch (error) {
      console.error('Error disconnecting from Strava:', error);
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

  if (isLoading) {
    return (
      <View className="w-5/6 self-center mt-10">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-black font-lato text-[18px] font-extrabold leading-[32px] tracking-[0.3px]">
            Automatic Tracking
          </Text>
          <ActivityIndicator size="small" color="#2A1800" />
        </View>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View className="w-5/6 self-center mt-10">
        <Text className="text-black font-lato text-[18px] font-extrabold leading-[32px] tracking-[0.3px] mb-4">
          Automatic Tracking
        </Text>
        
        <Text className="text-black font-lato text-[16px] font-[300px] leading-[24px] tracking-[-0.1px] mb-5">
          Connect Strava to sync your activities and health data automatically.
        </Text>
        
        <Pressable
          onPress={handleConnect}
          disabled={isConnecting}
          className="flex-row min-w-[80px] px-6 py-3 justify-center items-center gap-2 self-stretch rounded-full bg-[#2A1800]"
        >
          {isConnecting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Image source={Strava} className="w-6 h-6 mr-2" />
              <Text className="text-white font-lato text-[14px] font-[900px]">
                Connect to Strava
              </Text>
            </>
          )}
        </Pressable>
      </View>
    );
  }

  return (
    <View className="w-5/6 self-center mt-10">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-black font-lato text-[18px] font-extrabold leading-[32px] tracking-[0.3px]">
          Automatic Tracking
        </Text>
        <Pressable onPress={handleDisconnect}>
          <Image source={Tab} className="w-8 h-8" />
        </Pressable>
      </View>

      {/* Strava Connected Card */}
      <View className='flex flex-row items-center gap-10 self-stretch'>
        {/* Strava Info Row */}
        <View className="flex w-[79px] flex-col justify-center items-center gap-4 self-stretch">
          <View className="relative">
            <Image source={Strava} className="w-8 h-8" />
            {/* Green dot indicator */}
            <View className="absolute -top-2 -right-2 w-[10px] h-[10px] bg-green-500 rounded-full border-2 border-white" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-[#2A1800] text-center font-lato text-[14px] font-normal leading-[24px] tracking-[-0.1px]">
              Strava
            </Text>
          </View>
        </View>

        {/* This Week Header */}
        <View className='flex flex-col items-start gap-2 flex-1'>
          <Text className='text-black text-center font-lato text-[14px] font-black leading-[24px] tracking-[0.3px]'>
            This Week
          </Text>

        <View className="flex flex-row justify-between">
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
              Time
            </Text>
            <Text className="text-black text-center font-lato text-[14px] font-black leading-[24px] tracking-[0.3px]">
              {isLoadingSummary ? '-' : (weeklySummary?.allTime?.movingTime ? formatTime(weeklySummary.allTime.movingTime) : '0m')}
            </Text>
          </View>
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
  );
};

export default StravaConnectSection;