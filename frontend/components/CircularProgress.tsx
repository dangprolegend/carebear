import { Heart } from 'lucide-react-native';
import { Image, View, Pressable } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

const CircularProgress = ({ 
  percentage, 
  size = 24, 
  onPress 
}: { 
  percentage: number; 
  size?: number; 
  onPress?: () => void;
}) => {
    const radius = size / 2;
    const centerX = size / 2;
    const centerY = size / 2;

      if (percentage >= 100) {
        return (
          <Pressable onPress={onPress} disabled={!onPress}>
            <View className="relative" style={{ width: size, height: size }}>
              <View
                className="bg-[#2A1800] rounded-full flex items-center justify-center"
                style={{ width: size, height: size }}
              >
              </View>
              {/* Full circle overlay */}
              <View
                className="absolute top-0 left-0 rounded-full overflow-hidden"
                style={{ width: size, height: size }}
              >
                <Svg width={size} height={size}>
                  <Circle
                    cx={centerX}
                    cy={centerY}
                    r={radius}
                    fill="#198AE9"
                    opacity={0.4}
                  />
                </Svg>
              </View>
              {/* Heart on top */}
              <View
                className="absolute top-0 left-0 rounded-full flex items-center justify-center"
                style={{ width: size, height: size }}
              >
                <Heart size={size * 0.67} color='#ffffff'/>
              </View>
            </View>
          </Pressable>
        );
      }
    
    // Calculate the end point of the arc based on percentage
    const angle = (percentage / 100) * 360 - 90; // Start from top (-90 degrees)
    const endX = centerX + radius * Math.cos((angle * Math.PI) / 180);
    const endY = centerY + radius * Math.sin((angle * Math.PI) / 180);
    
    // Large arc flag for arcs > 180 degrees
    const largeArcFlag = percentage > 50 ? 1 : 0;
    
    const pathData = percentage === 0 
      ? '' 
      : `M ${centerX} ${centerY} L ${centerX} ${centerY - radius} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;

    return (
      <Pressable onPress={onPress} disabled={!onPress}>
        <View className="relative" style={{ width: size, height: size }}>
          {/* Background circle */}
          <View 
            className="bg-[#2A1800] border border-[#FDFCFA] rounded-full flex items-center justify-center"
            style={{ width: size, height: size }}
          >
          </View>
          
          {/* Blue filled progress overlay with circular clipping */}
          {percentage > 0 && (
            <View 
              className="absolute top-0 left-0 rounded-full overflow-hidden"
              style={{ width: size, height: size }}
            >
              <Svg width={size} height={size}>
                <Path
                  d={pathData}
                  fill="#198AE9"
                  opacity={0.9}
                  stroke="#2A1800"
                  strokeWidth={4}
                />
              </Svg>
            </View>
          )}
          
          {/* Heart on top */}
          <View 
            className="absolute top-0 left-0 rounded-full flex items-center justify-center"
            style={{ width: size, height: size }}
          >
            <Heart size={size * 0.67} color='#ffffff'/>
          </View>
        </View>
      </Pressable>
    );
  };

export default CircularProgress