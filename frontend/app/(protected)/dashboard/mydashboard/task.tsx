import React from 'react';
import { View, Text, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export type Task = {
  [x: string]: any;
  _id: string; 
  datetime: string; 
  type?: string;     
  title: string;
  description?: string | null; 
  detail?: string | null;      
  subDetail?: string | null;  
  checked?: boolean;         
  priority?: 'low' | 'medium' | 'high' | null; 
  status?: 'pending' | 'in-progress' | 'done';   
  assignedTo?: string | null; 

  onPress?: (task: Task) => void;
};

export type GroupedTask = {
  time: string; 
  type?: string;
  tasks: Task[];
};

export const groupTasksByTimeAndType = (tasks: Task[]): GroupedTask[] => {
  if (!tasks || tasks.length === 0) {
    return [];
  }

  const grouped = tasks.reduce<Record<string, GroupedTask>>((acc, task) => {
    if (!task.datetime) {
      console.warn("Task missing datetime, cannot group:", task.title, task._id);
      return acc; 
    }

    try {
      const taskDateObject = new Date(task.datetime);
      if (isNaN(taskDateObject.getTime())) { 
        console.warn("Task has invalid datetime, cannot group:", task.title, task._id, task.datetime);
        return acc;
      }

      const timeKey = taskDateObject.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }); 
      const typeKey = task.type || 'general';
      const key = `${timeKey}-${typeKey}`;

      if (!acc[key]) {
        acc[key] = {
          time: taskDateObject.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }), 
          type: task.type,
          tasks: []
        };
      }
      acc[key].tasks.push(task);
    } catch (e) {
      console.error("Error processing task datetime for grouping:", task.title, task.datetime, e);
    }
    return acc;
  }, {});

  return Object.values(grouped).sort((a, b) => {
    if (a.tasks.length > 0 && b.tasks.length > 0 && a.tasks[0].datetime && b.tasks[0].datetime) {
      try {
        return new Date(a.tasks[0].datetime).getTime() - new Date(b.tasks[0].datetime).getTime();
      } catch (e) {
        return 0; 
      }
    }
    return 0;
  });
};

interface TaskGroupProps {
  time: string;
  type?: string;
  tasks: Task[]; 
}

export const TaskGroup = ({
  time,
  type,
  tasks
}: TaskGroupProps) => (
  <View className="px-4 mb-6">
    {/* Time and Type Header */}
    <View className="flex-row items-center mb-3">
      <Text className="text-sm font-semibold text-slate-700 w-20">{time}</Text>
      {type && (
        <View className="px-2 py-0.5 bg-blue-100 rounded-full ml-2">
          <Text className="text-xs text-blue-700 font-medium">
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Text>
        </View>
      )}
    </View>

    <View className="space-y-3 w-full">
      {tasks.map((task) => (
        <Pressable
          key={task._id}
          className="p-4 rounded-lg border border-slate-200 w-full bg-white shadow-sm active:bg-slate-50"
          onPress={task.onPress ? () => task.onPress!(task) : undefined} // Call onPress with the task object
        >
          <View className="flex-row items-start justify-between w-full">
            {/* Task Content */}
            <View className="flex-1 mr-3">
              <Text className="text-base font-semibold text-slate-800 mb-0.5" numberOfLines={1} ellipsizeMode="tail">
                {task.title}
              </Text>
              {(task.detail || task.subDetail) && (
                <View className="flex-row items-center mt-0.5 flex-wrap">
                  {task.detail && (
                    <Text className="text-xs text-slate-500">
                      {task.detail}
                    </Text>
                  )}
                  {task.detail && task.subDetail && <Text className="text-xs text-slate-400 mx-1">•</Text>}
                  {task.subDetail && (
                    <Text className="text-xs text-slate-500">
                      {task.subDetail}
                    </Text>
                  )}
                </View>
              )}
            </View>

            {/* Checkbox Section */}
            <Pressable
              onPress={task.onPress ? () => task.onPress!(task) : undefined} 
              className="p-1 items-center justify-center w-6 h-6" 
            >
              {task.checked ? (
                <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
              ) : (
                <View className="w-5 h-5 border-2 border-slate-400 rounded-full bg-white" /> 
              )}
            </Pressable>
          </View>
        </Pressable>
      ))}
    </View>
  </View>
);