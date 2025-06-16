import React, { useState, useEffect } from 'react';
import DashboardBase from './DashboardBase';
import { getBackendUserID, getGroupID, fetchTasksForDashboard } from '../../../../service/apiServices';
import { Task } from './task';
import { ActivityIndicator, Text, View, Pressable } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import RateLimitError from '../../../../components/RateLimitError';

const Dashboard = () => {
  const { isSignedIn, userId: clerkID } = useAuth(); // Retrieve Clerk ID
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitError, setRateLimitError] = useState<{
    message: string;
    retryAfter?: number;
  } | null>(null);

  const loadTasks = async () => {
    if (!isSignedIn || !clerkID) {
      setError('User is not signed in.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setRateLimitError(null);

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
    } catch (err: any) {
      console.error('Failed to fetch tasks:', err);
      
      // Check if this is a rate limit error
      if (err.status === 429 || (err.data && err.data.errors && 
          err.data.errors.some((e: any) => e.code === 'too_many_requests'))) {
        
        // Handle rate limiting
        setRateLimitError({
          message: err.message || 'Too many requests. Please try again later.',
          retryAfter: err.retryAfter || err.data?.retryAfter || 60 // Default to 60 seconds if no retry time provided
        });
      } else {
        setError('Unable to load tasks. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  return (
    <>
      {rateLimitError ? (
        <RateLimitError
          message={rateLimitError.message}
          retryAfter={rateLimitError.retryAfter}
          onRetry={loadTasks}
          onClose={() => setRateLimitError(null)}
        />
      ) : null}
      
      {error ? (
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-red-500 mb-4">{error}</Text>
          <Text className="text-gray-500">Using fallback data instead</Text>
          <DashboardBase tasks={[]} />
        </View>
      ) : (
        <DashboardBase tasks={tasks} />
      )}
    </>
  );
};

export default Dashboard;