import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image } from 'react-native';

interface FeedLoadingProps {
  dataReady?: boolean;
  onFinish?: () => void;
  fastTransition?: boolean; // New prop to control transition speed
}

const FeedLoading: React.FC<FeedLoadingProps> = ({ 
  dataReady = false, 
  onFinish,
  fastTransition = true // Default to fast transitions
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const images = [
    require('../../assets/images/1.png'),
    require('../../assets/images/2.png'), 
    require('../../assets/images/3.png'),
    require('../../assets/images/4.png'),
    require('../../assets/images/5.png'),
    require('../../assets/images/6.png') 
  ];

  useEffect(() => {
    // Use different timings based on fastTransition setting
    const transitionDelay = fastTransition ? 150 : 800;
    const intervalDelay = fastTransition ? 100 : 800;
    
    // Skip to the end immediately if data is ready and fastTransition is true
    if (dataReady) {
      if (currentImageIndex !== images.length - 1) {
        setCurrentImageIndex(images.length - 1);
      }
      
      setTimeout(() => {
        onFinish?.();
      }, transitionDelay);
      
      return;
    }

    // Normal cycling through images - faster transitions
    intervalRef.current = setInterval(() => {
      setCurrentImageIndex((prev) => {
        if (prev === images.length - 1) {
          return images.length - 1; // Stay on last image
        }
        return (prev + 1) % images.length;
      });
    }, intervalDelay);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [dataReady, currentImageIndex, onFinish, fastTransition, images.length]);

  return (
    <View className="flex-1 justify-center items-center bg-white">
        <View className="items-center">
        <Image 
          source={images[currentImageIndex]} 
          className="w-40 h-40"
          style={{ opacity: 1 }}
          resizeMode="contain"
        />
        
        <Text className="text-[#623405] text-lg mt-4 font-medium">
          Loading...
        </Text>
      </View>
    </View>
  );
};

export default FeedLoading;
