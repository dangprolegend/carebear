//@ts-nocheck
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Image, ActivityIndicator } from 'react-native';
import { useManualStrava } from '~/hooks/useManualStrava';
import Strava from '~/assets/icons/strava.png'; 


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
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-black font-lato text-[18px] font-extrabold leading-[32px] tracking-[0.3px]">
          Automatic Tracking
        </Text>
        <Pressable onPress={handleDisconnect}>
          <Text className="text-[#2A1800] font-lato text-[14px] font-medium underline">
            Disconnect
          </Text>
        </Pressable>
      </View>

      {/* Connected Status */}
      <View className="flex-row items-center mb-4">
        <View className="w-3 h-3 bg-green-500 rounded-full mr-2" />
        <Text className="text-black font-lato text-[16px] font-medium">
          Connected as {athlete?.firstname} {athlete?.lastname}
        </Text>
      </View>

      {/* Weekly Summary */}
      {/* {isLoadingSummary ? (
        <View className="bg-[#FAE5CA] rounded-lg p-4 mb-4 items-center">
          <ActivityIndicator size="small" color="#2A1800" />
        </View>
      ) : weeklySummary ? (
        <View className="bg-[#FAE5CA] rounded-lg p-4 mb-4">
          <Text className="text-[#2A1800] font-lato text-[16px] font-extrabold mb-3">
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
                Time
              </Text>
              <Text className="text-[#2A1800] font-lato text-[18px] font-extrabold">
                {formatTime(weeklySummary.moving_time)}
              </Text>
            </View>
          </View>
          
          <View className="flex-row items-center justify-between mt-4">
            <View className="flex-row items-center">
              <View className="w-4 h-4 bg-[#FC4C02] rounded mr-2" />
              <Text className="text-[#2A1800] font-lato text-[14px] font-medium">
                Strava
              </Text>
            </View>
            <Pressable onPress={handleDisconnect}>
              <Text className="text-[#2A1800] font-lato text-[14px] font-medium underline">
                Disconnect
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null} */}
    </View>
  );
};

export default StravaConnectSection;