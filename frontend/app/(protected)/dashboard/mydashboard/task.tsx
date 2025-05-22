import { MaterialIcons } from "@expo/vector-icons";
import { View, Text, Pressable } from "react-native";

export type Task = {
    datetime: string; // ISO string, e.g., '2025-05-20T08:00:00'
    type?: string;
    title: string;
    detail?: string;
    subDetail?: string;
    checked?: boolean;
    onPress?: () => void;
};
  
export type GroupedTask = {
    time: string;
    type?: string;  // Remove the strict type constraint
    tasks: Task[];
};
  
export const groupTasksByTimeAndType = (tasks: Task[]): GroupedTask[] => {
    const grouped = tasks.reduce<Record<string, GroupedTask>>((acc, task) => {
    const key = `${task.datetime}-${task.type || 'default'}`;
    if (!acc[key]) {
        acc[key] = {
        time: new Date(task.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: task.type,
        tasks: []
        };
    }
    acc[key].tasks.push(task);
    return acc;
    }, {});
    return Object.values(grouped);
};

export const TaskGroup = ({ 
    time, 
    type,
    tasks
}: { 
    time: string;
    type?: string;
    tasks: Task[];
}) => (
    <View className="mb-6">
    {/* Time and Type Header */}
    <View className="flex-row items-center mb-2">
        <Text className="text-xs text-gray-500 w-20">{time}</Text>
        {type && (
        <Text className="text-xs text-gray-500 ml-2">
            {type.charAt(0).toUpperCase() + type.slice(1)}
        </Text>
        )}
    </View>

    <View className="space-y-4 w-full">
        {tasks.map((task, index) => (
        <Pressable 
            key={index}
            className="p-4 rounded-lg border-[1.5px] border-gray-300 w-full bg-[#F7F7F7]"
            onPress={task.onPress}
        >
            <View className="flex-row items-start justify-between w-full">
            {/* Task Content */}
            <View className="flex-1 mr-4">
                {/* Title */}
                <Text className="text-sm font-bold text-black">
                {task.title}
                </Text>
                {/* Detail and SubDetail in same row */}
                <View className="flex-row items-center mt-1">
                {task.detail && (
                    <Text className="text-xs text-gray-500">
                    {task.detail}
                    </Text>
                )}
                {task.subDetail && (
                    <Text className="text-xs text-gray-500 ml-2">
                    {task.subDetail}
                    </Text>
                )}
                </View>
            </View>

            {/* Checkbox moved to right */}
            {task.checked ? (
                <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
            ) : (
                <Pressable className="w-5 h-5 border-2 border-gray-300 rounded bg-white" />
            )}
            </View>
        </Pressable>
        ))}
    </View>
    </View>
);