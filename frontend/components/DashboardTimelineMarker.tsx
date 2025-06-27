import React from 'react';
import { View, Text } from 'react-native';

type DashboardTimelineMarkerProps = {
  time: string;
  isFirst?: boolean;
  isLast?: boolean;
};

const DashboardTimelineMarker = ({
  time,
  isFirst = false,
  isLast = false,
}: DashboardTimelineMarkerProps) => {
  return (
    <View className="flex-row items-start">
      {/* Timeline */}
      <View className="w-[24px] flex items-center">
        {/* Vertical Line */}
        <View
          style={{
            flex: 1,
            width: 2,
            backgroundColor: '#623405'
          }}
        />
        {/* Marker */}
        <View className="absolute w-[8px] h-[8px] bg-[#623405] rounded-full z-10" />
      </View>
    </View>
  );
};

export default DashboardTimelineMarker;