import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image } from 'react-native';

interface FeedLoadingProps {
  dataReady?: boolean;
  onFinish?: () => void;
}

const FeedLoading: React.FC<FeedLoadingProps> = ({ dataReady = false, onFinish }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const intervalRef = useRef<number | null>(null);
  
  const images = [
    require('../../assets/images/1.png'),
    require('../../assets/images/2.png'), 
    require('../../assets/images/3.png'),
    require('../../assets/images/4.png'),
    require('../../assets/images/5.png'),
    require('../../assets/images/6.png') 
  ];

  useEffect(() => {
    if (dataReady && currentImageIndex !== images.length - 1) {
      setCurrentImageIndex(images.length - 1);
      setTimeout(() => {
        onFinish?.();
      }, 800); // Show carebear for 800ms then finish
      
      return;
    }
    
    if (dataReady && currentImageIndex === images.length - 1) {
      setTimeout(() => {
        onFinish?.();
      }, 800);
      
      return;
    }

    // Normal cycling through images
    intervalRef.current = setInterval(() => {
      setCurrentImageIndex((prev) => {
        if (prev === images.length - 1) {
          return images.length - 1; // Stay on last image
        }
        return (prev + 1) % images.length;
      });
    }, 800);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [dataReady, currentImageIndex, onFinish]);

  return (
    <View className="flex-1 justify-center items-center bg-white">
        <View className="items-center">
        <Image 
          source={images[currentImageIndex]} 
          className="w-40 h-40"
          resizeMode="contain"
        />
        
        <Text className="text-[#623405] text-lg mt-4 font-medium">
          Loading your feed...
        </Text>
      </View>
    </View>
  );
};

export default FeedLoading;
