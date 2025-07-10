//@ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useManualStrava } from '~/hooks/useManualStrava';

const StravaHealthScreen = () => {
  const {
    isAuthenticated,
    isLoading,
    athlete,
    authenticate,
    signOut,
    getHealthData,
    getWeeklySummary,
  } = useManualStrava();

  const [healthData, setHealthData] = useState([]);
  const [weeklySummary, setWeeklySummary] = useState(null);
  const [loadingData, setLoadingData] = useState(false);

  // Load health data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadHealthData();
    }
  }, [isAuthenticated]);

  const loadHealthData = async () => {
    try {
      setLoadingData(true);
      const [activities, summary] = await Promise.all([
        getHealthData(7), // Last 7 days
        getWeeklySummary(),
      ]);
      setHealthData(activities);
      setWeeklySummary(summary);
    } catch (error) {
      console.error('Error loading health data:', error);
      Alert.alert('Error', 'Failed to load health data');
    } finally {
      setLoadingData(false);
    }
  };

  const handleAuthenticate = async () => {
    const result = await authenticate();
    if (!result.success) {
      // Alert.alert('Authentication Failed', result.error);
    }
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const formatDistance = (meters) => {
    const km = (meters / 1000).toFixed(1);
    return `${km} km`;
  };

  const renderActivity = ({ item }) => (
    <View className="bg-white mx-5 mb-2.5 rounded-lg p-4 shadow-md shadow-black/20 flex flex-col">
      <View className="flex-row justify-between items-center mb-2.5">
        <Text style={{ fontFamily: 'Lato' }} className="text-base font-bold flex-1">{item.name}</Text>
        <Text style={{ fontFamily: 'Lato' }} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{item.type}</Text>
      </View>
      <View className="flex-row justify-between">
        <View className="items-center">
          <Text style={{ fontFamily: 'Lato' }} className="text-xs text-gray-500 mb-0.5">Distance</Text>
          <Text style={{ fontFamily: 'Lato' }} className="text-sm font-bold">{formatDistance(item.distance)}</Text>
        </View>
        <View className="items-center">
          <Text style={{ fontFamily: 'Lato' }} className="text-xs text-gray-500 mb-0.5">Duration</Text>
          <Text style={{ fontFamily: 'Lato' }} className="text-sm font-bold">{formatDuration(item.duration)}</Text>
        </View>
        {item.calories && (
          <View className="items-center">
            <Text style={{ fontFamily: 'Lato' }} className="text-xs text-gray-500 mb-0.5">Calories</Text>
            <Text style={{ fontFamily: 'Lato' }} className="text-sm font-bold">{Math.round(item.calories)}</Text>
          </View>
        )}
        {item.averageHeartRate && (
          <View className="items-center">
            <Text style={{ fontFamily: 'Lato' }} className="text-xs text-gray-500 mb-0.5">Avg HR</Text>
            <Text style={{ fontFamily: 'Lato' }} className="text-sm font-bold">{Math.round(item.averageHeartRate)} bpm</Text>
          </View>
        )}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#FC4C02" />
        <Text style={{ fontFamily: 'Lato' }}>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View className="flex-1 bg-gray-100">
        <View className="flex-1 justify-center items-center p-5">
          <Text style={{ fontFamily: 'Lato' }} className="text-2xl font-bold mb-2 text-center">Connect with Strava</Text>
          <Text style={{ fontFamily: 'Lato' }} className="text-base text-gray-500 text-center mb-7 leading-6">
            Connect your Strava account to automatically track your activities and health data.
          </Text>
          <TouchableOpacity className="bg-[#FC4C02] px-8 py-4 rounded-lg" onPress={handleAuthenticate}>
            <Text style={{ fontFamily: 'Lato' }} className="text-white text-base font-bold">Connect to Strava</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      <View className="flex-row justify-between items-center p-5 bg-white">
        <View>
          <Text style={{ fontFamily: 'Lato' }} className="text-lg font-bold">Welcome, {athlete?.firstname}!</Text>
          {weeklySummary && (
            <Text style={{ fontFamily: 'Lato' }} className="text-sm text-gray-500 mt-1">
              This week: {weeklySummary.thisWeek.activities} activities, {' '}
              {formatDistance(weeklySummary.thisWeek.distance)}
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={signOut} className="p-2">
          <Text style={{ fontFamily: 'Lato' }} className="text-[#FC4C02] text-sm">Sign Out</Text>
        </TouchableOpacity>
      </View>

      {loadingData ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FC4C02" />
          <Text style={{ fontFamily: 'Lato' }}>Loading activities...</Text>
        </View>
      ) : (
        <>
          <View className="flex-row justify-between items-center px-5 py-3.5">
            <Text style={{ fontFamily: 'Lato' }} className="text-lg font-bold">Recent Activities</Text>
            <TouchableOpacity onPress={loadHealthData}>
              <Text style={{ fontFamily: 'Lato' }} className="text-[#FC4C02] text-sm">Refresh</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={healthData}
            renderItem={renderActivity}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={{ fontFamily: 'Lato' }} className="text-center text-gray-500 text-base mt-12">No recent activities found</Text>
            }
          />
        </>
      )}
    </View>
  );
};

export default StravaHealthScreen;