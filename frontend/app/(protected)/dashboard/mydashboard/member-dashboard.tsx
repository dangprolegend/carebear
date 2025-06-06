import React, { useState, useEffect } from 'react';
import DashboardBase from './DashboardBase';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { fetchTasksForDashboard, getGroupID } from '../../../../service/apiServices';
import { Task } from './task';
import { ActivityIndicator, Text, View } from 'react-native';

const MemberDashboard = () => {
  const router = useRouter();
  const { userID } = useLocalSearchParams(); // Retrieve userID from query parameters
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTasks = async () => {
      if (!userID) {
        setError('User ID is missing.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        console.log('Fetching tasks for User ID:', userID);
        // Ensure userID is a string
        const validUserID = Array.isArray(userID) ? userID[0] : userID;
        // Fetch group ID for the user
        const groupID = await getGroupID(validUserID);

        console.log('Group ID:', groupID);
        // Fetch tasks for the group
        const tasksData = await fetchTasksForDashboard(groupID);
        setTasks(tasksData);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch tasks:', err);
        setError('Unable to load tasks. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [userID]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#FAE5CA" />
        <Text className="mt-4 text-gray-600">Loading tasks for the member...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-red-500 mb-4">{error}</Text>
        <Text className="text-gray-500">Using fallback data instead</Text>
        <DashboardBase tasks={[]} title="Member Dashboard" />
      </View>
    );
  }

  return <DashboardBase tasks={tasks} title="Member Dashboard" />;
};

export default MemberDashboard;