//@ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
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
    <View style={styles.activityCard}>
      <View style={styles.activityHeader}>
        <Text style={styles.activityName}>{item.name}</Text>
        <Text style={styles.activityType}>{item.type}</Text>
      </View>
      <View style={styles.activityStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Distance</Text>
          <Text style={styles.statValue}>{formatDistance(item.distance)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Duration</Text>
          <Text style={styles.statValue}>{formatDuration(item.duration)}</Text>
        </View>
        {item.calories && (
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Calories</Text>
            <Text style={styles.statValue}>{Math.round(item.calories)}</Text>
          </View>
        )}
        {item.averageHeartRate && (
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Avg HR</Text>
            <Text style={styles.statValue}>{Math.round(item.averageHeartRate)} bpm</Text>
          </View>
        )}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FC4C02" />
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.authContainer}>
          <Text style={styles.title}>Connect with Strava</Text>
          <Text style={styles.subtitle}>
            Connect your Strava account to automatically track your activities and health data.
          </Text>
          <TouchableOpacity style={styles.stravaButton} onPress={handleAuthenticate}>
            <Text style={styles.buttonText}>Connect to Strava</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome, {athlete?.firstname}!</Text>
          {weeklySummary && (
            <Text style={styles.summaryText}>
              This week: {weeklySummary.thisWeek.activities} activities, {' '}
              {formatDistance(weeklySummary.thisWeek.distance)}
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={signOut} style={styles.signOutButton}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {loadingData ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#FC4C02" />
          <Text>Loading activities...</Text>
        </View>
      ) : (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <TouchableOpacity onPress={loadHealthData}>
              <Text style={styles.refreshText}>Refresh</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={healthData}
            renderItem={renderActivity}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No recent activities found</Text>
            }
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  stravaButton: {
    backgroundColor: '#FC4C02',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  signOutButton: {
    padding: 8,
  },
  signOutText: {
    color: '#FC4C02',
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  refreshText: {
    color: '#FC4C02',
    fontSize: 14,
  },
  activityCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 8,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  activityName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  activityType: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  activityStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 50,
  },
});

export default StravaHealthScreen;