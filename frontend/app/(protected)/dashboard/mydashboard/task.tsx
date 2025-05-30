// task.tsx (or wherever you define these: e.g., src/components/tasks/task.tsx)
import React from 'react';
import { View, Text, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

// This Task type is what your TaskGroup component will consume.
// It should align with the output of mapBackendTaskToFrontendListType in your apiService.ts
export type Task = {
  _id: string; // From MongoDB, crucial for keys and navigation/actions
  datetime: string; // ISO string for filtering by date and grouping by time
  type?: string;     // e.g., "medication", "appointment" - can be inferred or from backend
  title: string;
  description?: string | null; // Full description, useful for TaskCard or if no detail/subDetail
  detail?: string | null;      // Shorter detail for list view (e.g., times, dosage summary)
  subDetail?: string | null;   // Additional short detail (e.g., recurrence summary, brief note)
  checked?: boolean;         // Usually derived from backendTask.status === 'done'
  priority?: 'low' | 'medium' | 'high' | null; // From backend
  status?: 'pending' | 'in-progress' | 'done';   // From backend
  assignedTo?: string | null; // User ID string for assignment (added for AI review flow)

  // Optional: If you need to pass down original backend objects or more complex data
  // assignedBy?: { _id: string; name?: string; email?: string };

  // This onPress will be attached by the parent component (e.g., DashboardBase)
  // and will likely trigger navigation or open a detail modal, passing this task object or its _id.
  onPress?: (task: Task) => void;
};

export type GroupedTask = {
  time: string; // Formatted time string like "08:00 AM"
  type?: string;
  tasks: Task[]; // Array of the refined Task type
};

export const groupTasksByTimeAndType = (tasks: Task[]): GroupedTask[] => {
  if (!tasks || tasks.length === 0) {
    return [];
  }

  const grouped = tasks.reduce<Record<string, GroupedTask>>((acc, task) => {
    if (!task.datetime) {
      console.warn("Task missing datetime, cannot group:", task.title, task._id);
      return acc; // Skip tasks without a datetime
    }

    try {
      const taskDateObject = new Date(task.datetime);
      if (isNaN(taskDateObject.getTime())) { // Check for invalid date
        console.warn("Task has invalid datetime, cannot group:", task.title, task._id, task.datetime);
        return acc;
      }

      // Group by HH:MM time and type for distinct groups within the same hour if types differ
      const timeKey = taskDateObject.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }); // e.g., "08:00"
      const typeKey = task.type || 'general';
      const key = `${timeKey}-${typeKey}`;

      if (!acc[key]) {
        acc[key] = {
          time: taskDateObject.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }), // e.g., "8:00 AM"
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

  // Sort groups by the original datetime of the first task in each group
  return Object.values(grouped).sort((a, b) => {
    if (a.tasks.length > 0 && b.tasks.length > 0 && a.tasks[0].datetime && b.tasks[0].datetime) {
      try {
        return new Date(a.tasks[0].datetime).getTime() - new Date(b.tasks[0].datetime).getTime();
      } catch (e) {
        return 0; // Fallback if date parsing fails during sort
      }
    }
    return 0;
  });
};

interface TaskGroupProps {
  time: string;
  type?: string;
  tasks: Task[]; // Expects an array of the refined Task type
}

export const TaskGroup = ({
  time,
  type,
  tasks
}: TaskGroupProps) => (
  <View className="mb-6">
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

    {/* Task Items Container */}
    <View className="space-y-3 w-full">
      {tasks.map((task) => ( // task here is of type Task
        <Pressable
          key={task._id} // Use the unique _id from the database
          className="p-4 rounded-lg border border-slate-200 w-full bg-white shadow-sm active:bg-slate-50"
          onPress={task.onPress ? () => task.onPress!(task) : undefined} // Call onPress with the task object
        >
          <View className="flex-row items-start justify-between w-full">
            {/* Task Content */}
            <View className="flex-1 mr-3">
              <Text className="text-base font-semibold text-slate-800 mb-0.5" numberOfLines={1} ellipsizeMode="tail">
                {task.title}
              </Text>
              {/* Detail and SubDetail in same row, only if they exist */}
              {(task.detail || task.subDetail) && (
                <View className="flex-row items-center mt-0.5 flex-wrap">
                  {task.detail && (
                    <Text className="text-xs text-slate-500">
                      {task.detail}
                    </Text>
                  )}
                  {/* Separator only if both detail and subDetail exist */}
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
              onPress={task.onPress ? () => task.onPress!(task) : undefined} // Or a dedicated toggleCheck function
              className="p-1 items-center justify-center w-6 h-6" // Ensure checkbox area is consistently sized
            >
              {task.checked ? (
                <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
              ) : (
                <View className="w-5 h-5 border-2 border-slate-400 rounded-full bg-white" /> // Slightly darker border for unchecked
              )}
            </Pressable>
          </View>
        </Pressable>
      ))}
    </View>
  </View>
);