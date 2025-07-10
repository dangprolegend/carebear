import React, { useState, useEffect } from 'react';
import DashboardBase from './DashboardBase';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { 
  fetchTasksForDashboard, 
  getGroupID, 
  getUserRoleInGroup,
  setCurrentUserIDForApiService,
  setCurrentGroupIDForApiService 
} from '../../../../service/apiServices';
import { Task } from './task';
import { Text, View } from 'react-native';
import FeedLoading from '../../../../components/ui/feed-loading';

const MemberDashboard = () => {
  const router = useRouter();
  const { userID } = useLocalSearchParams(); // Retrieve userID from query parameters
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userRole, setUserRole] = useState<string>('member');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMemberData = async () => {
      if (!userID) {
        setError('User ID is missing.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('MemberDashboard - Fetching data for User ID:', userID);
        
        // Ensure userID is a string
        const validUserID = Array.isArray(userID) ? userID[0] : userID;
        
        if (!validUserID || validUserID === 'undefined') {
          throw new Error('Invalid user ID provided');
        }

        console.log('MemberDashboard - Valid User ID:', validUserID);

        // Step 1: Fetch group ID for the user
        const groupID = await getGroupID(validUserID);
        console.log('MemberDashboard - Group ID:', groupID);

        if (!groupID || groupID === 'undefined') {
          throw new Error('Failed to get valid group ID');
        }

        // Step 2: Set IDs for API service
        setCurrentUserIDForApiService(validUserID);
        setCurrentGroupIDForApiService(groupID);

        // Step 3: Get user role
        try {
          const role = await getUserRoleInGroup(validUserID);
          setUserRole(role);
          console.log('MemberDashboard - User Role:', role);
        } catch (roleError) {
          console.warn('MemberDashboard - Failed to get user role, using default:', roleError);
          setUserRole('member'); // Use default role if role fetching fails
        }

        // Step 4: Fetch tasks for the group
        const tasksData = await fetchTasksForDashboard(groupID);
        setTasks(tasksData);
        setError(null);
      } catch (err: any) {
        console.error('MemberDashboard - Failed to fetch member data:', err);
        setError(`Unable to load member data: ${err.message}`);
        // Set default values to allow partial functionality
        setUserRole('member');
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    loadMemberData();
  }, [userID]);

  if (loading) {
    return (
      <FeedLoading 
        visible={true}
        dataReady={false}
        fastTransition={true}
        onFinish={() => {}}
      />
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-red-500 mb-4">{error}</Text>
        <Text className="text-gray-500">Using fallback data instead</Text>
        <DashboardBase 
          tasks={[]} 
          title="Member Dashboard" 
          userRole={userRole}
          showHighPrioritySection={false}
        />
      </View>
    );
  }

  // Determine dashboard configuration based on role
  const getDashboardConfig = () => {
    switch (userRole) {
      case 'care-receiver':
        console.log('MemberDashboard - Rendering Care Receiver Dashboard');
        return {
          title: 'Care Receiver Dashboard',
          showHighPrioritySection: false
        };
      case 'caregiver':
        console.log('MemberDashboard - Rendering Caregiver Dashboard');
        return {
          title: 'Caregiver Dashboard',
          showHighPrioritySection: true
        };
      case 'admin':
        console.log('MemberDashboard - Rendering Admin Dashboard');
        return {
          title: 'Admin Dashboard',
          showHighPrioritySection: true
        };
      default:
        return {
          title: 'Member Dashboard',
          showHighPrioritySection: false
        };
    }
  };

  const dashboardConfig = getDashboardConfig();

  return (
    <DashboardBase 
      tasks={tasks} 
      title={dashboardConfig.title}
      userRole={userRole}
      showHighPrioritySection={dashboardConfig.showHighPrioritySection}
    />
  );
};

export default MemberDashboard;
