import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, Modal, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { Flag } from 'lucide-react-native';
import { ListChecks} from 'lucide-react-native';
import { ClipboardList } from 'lucide-react-native';
import CircularProgress from './CircularProgress';

interface Task {
  _id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'done';
  deadline?: string;
  assignedBy?: {
    name: string;
    email: string;
  };
}

interface TaskDetailModalProps {
  isVisible: boolean;
  onClose: () => void;
  userID: string;
  groupID?: string; 
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isVisible,
  onClose,
  userID,
  groupID
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalTasks, setTotalTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const router = useRouter();

  // Calculate task completion percentage based on completed tasks
  const taskCompletion = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;


  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#EF4444'; // Red
      case 'medium':
        return '#F59E0B'; // Yellow
      case 'low':
        return '#3B82F6'; // Blue
      default:
        return '#3B82F6';
    }
  };

  const getPriorityIcon = (priority: string) => {
    const color = getPriorityColor(priority);
    return (
      <View 
        className="w-4 h-4 rounded-full mr-2"
        style={{ backgroundColor: color }}
      />
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const fetchTodayTasks = async () => {
    if (!userID) return;
    
    setLoading(true);
    try {
      // Get all user tasks across all groups
      const response = await axios.get(`https://carebear-4ju68wsmg-carebearvtmps-projects.vercel.app/api/tasks/user/${userID}`);
      const userTasks = response.data;
      
      setTasks(userTasks);
      setTotalTasks(userTasks.length);
      setCompletedTasks(userTasks.filter((task: Task) => task.status === 'done').length);
    } catch (error) {
      console.error('Error fetching user tasks:', error);
      setTasks([]);
      setTotalTasks(0);
      setCompletedTasks(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible && userID) {
      fetchTodayTasks();
    }
  }, [isVisible, userID]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return '#10B981'; 
      case 'in-progress':
        return '#F59E0B'; 
      case 'pending':
        return '#6B7280'; 
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'done':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-[#AF9D86]/60 justify-center items-center">
        <View className="bg-white border border-[#2A1800] rounded-xl w-11/12 max-h-4/5 p-6">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-1" />
            <Text className="text-black font-lato text-xl font-extrabold">
              Today Tasks Tracking
            </Text>
            <View className="flex-1 items-end">
              <Pressable onPress={onClose}>
                <Text className="text-[#2A1800] text-3xl font-semibold">×</Text>
              </Pressable>
            </View>
          </View>

          {/* Progress Summary */}
          <View className="border border-[#2A1800] rounded-xl p-4 mb-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-[#2A1800] font-lato text-lg font-bold">
                Tasks
              </Text>
              <Text className="text-[#2A1800] font-lato text-xl font-extrabold">
                {Math.round(taskCompletion)}%
              </Text>
            </View>
            
            <View className="items-center mb-3">
              <CircularProgress
                percentage={taskCompletion}
                size={60}
              />
            </View>
            <View className="flex-row justify-between">
            <View className="flex-row items-center">
              <ListChecks size={16} color='#2A1800'/>
              <Text className="text-[#2A1800] font-lato text-base ml-2 font-bold">
                {completedTasks} 
              </Text>
              <Text className="text-[#2A1800] font-lato text-base ml-2 mr-2 font-bold">
                / 
              </Text>
              <ClipboardList size={16} color='#2A1800' className='ml-2'/>
              <Text className="text-[#2A1800] font-lato text-base ml-2 font-bold">
                {totalTasks}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <View className="flex-row items-center mr-3">
                <Flag size={16} color="#2A1800" fill="#FF5555" className="mr-3" />
                <Text className="text-base font-bold text-[#2A1800]">{tasks.filter(task => task.priority === 'high').length}</Text>
              </View>
              <View className="flex-row items-center mr-3">
                <Flag size={16} color="#2A1800" fill="#FFCC00" className="mr-3" />
                <Text className="text-base font-bold text-[#2A1800]">{tasks.filter(task => task.priority === 'medium').length}</Text>
              </View>
              <View className="flex-row items-center">
                <Flag size={16} color="#2A1800" fill="#198AE9" className="mr-3" />
                <Text className="text-base font-bold text-[#2A1800]">{tasks.filter(task => task.priority === 'low').length}</Text>
              </View>
            </View>
            </View>
          </View>
          {/* Go to task button*/}
          <Pressable
            className="bg-[#2A1800] rounded-full p-3 mb-4"
            onPress={() => router.push('/(protected)/dashboard/mydashboard/dashboard')}
          >
            <Text className="text-white font-lato text-center text-lg font-bold">
              Go to Your Tasks
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default TaskDetailModal;
