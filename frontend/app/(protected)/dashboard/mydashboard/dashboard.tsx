import React, { useState, useEffect } from 'react';
import DashboardBase from './DashboardBase';
import MemberDashboard from './baby-dashboard';
import { 
  getBackendUserID, 
  getGroupID, 
  fetchTasksForDashboard,
  getUserRoleInGroup,
  setCurrentUserIDForApiService,
  setCurrentGroupIDForApiService
} from '../../../../service/apiServices';
import { Task } from './task';
import { ActivityIndicator, Text, View, Pressable } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import RateLimitError from '../../../../components/RateLimitError';

const Dashboard = () => {
  const { isSignedIn, userId: clerkID } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userRole, setUserRole] = useState<string>('member');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitError, setRateLimitError] = useState<{
    message: string;
    retryAfter?: number;
  } | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!isSignedIn || !clerkID) {
        setError('User is not signed in.');
        setLoading(false);
        return;
      }

    try {
      setLoading(true);
      setError(null);
      setRateLimitError(null);

        console.log('Fetching data for Clerk ID:', clerkID);
        
        // Step 1: Get backend user ID
        const backendUserID = await getBackendUserID(clerkID);
        console.log('Backend User ID:', backendUserID);

        // Step 2: Get group ID
        const groupID = await getGroupID(backendUserID);
        console.log('Group ID:', groupID);

        // Step 3: Set IDs for API service
        setCurrentUserIDForApiService(backendUserID);
        setCurrentGroupIDForApiService(groupID);

        // Step 4: Get user role
        const role = await getUserRoleInGroup(backendUserID);
        setUserRole(role);
        console.log('User Role:', role);

        // Step 5: Fetch tasks
        const tasksData = await fetchTasksForDashboard(groupID);
        setTasks(tasksData);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Unable to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [isSignedIn, clerkID]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#FAE5CA" />
        <Text className="mt-4 text-gray-600">Loading your dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-red-500 mb-4">{error}</Text>
        <Text className="text-gray-500">Using fallback data instead</Text>
        <DashboardBase tasks={[]} userRole={userRole} />
      </View>
    );
  }

  // Route to appropriate dashboard based on role
  if (userRole === 'carereceiver') {
    return <MemberDashboard tasks={tasks} userRole={userRole} />;
  }

  // Default dashboard for admin, caregiver, and other roles
  return <DashboardBase tasks={tasks} userRole={userRole} />;
};

export default Dashboard;