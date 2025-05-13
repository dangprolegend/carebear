import { View, Text } from "react-native";

// Health metric component
export const HealthMetric = ({ label, value, detail }: {
  label: string;
  value: string;
  detail: string;
}) => (
  <View className="w-[48%] bg-gray-100 p-4 rounded-lg mb-4">
    <Text className="text-sm font-medium">{label}</Text>
    <Text className="text-lg font-bold mt-2">{value}</Text>
    <Text className="text-xs text-gray-500 mt-1">{detail}</Text>
  </View>
);