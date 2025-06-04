import React, { useState, useEffect } from 'react';
import DashboardBase from './DashboardBase';
import { getBackendUserID, getGroupID, fetchTasksForDashboard } from '../../../../service/apiServices';
import { Task } from './task';
import { ActivityIndicator, Text, View } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';

const Dashboard = () => {
  const { isSignedIn, userId: clerkID } = useAuth(); // Retrieve Clerk ID
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTasks = async () => {
      if (!isSignedIn || !clerkID) {
        setError('User is not signed in.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        console.log('Fetching tasks for Clerk ID:', clerkID);
        // Fetch backend user ID using Clerk ID
        const backendUserID = await getBackendUserID(clerkID);

        console.log('Backend User ID:', backendUserID);
        // Fetch group ID for the backend user
        const groupID = await getGroupID(backendUserID);

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
  }, [isSignedIn, clerkID]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#FAE5CA" />
        <Text className="mt-4 text-gray-600">Loading your tasks...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-red-500 mb-4">{error}</Text>
        <Text className="text-gray-500">Using fallback data instead</Text>
        <DashboardBase tasks={[]} />
      </View>
    );
  }

  return <DashboardBase tasks={tasks} />;
};

export default Dashboard;