import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

interface FeedLoadingProps {
  dataReady?: boolean;
  onFinish?: () => void;
  fastTransition?: boolean; // New prop to control transition speed
  visible?: boolean; // New prop to control visibility
}

const FeedLoading: React.FC<FeedLoadingProps> = ({ 
  dataReady = false, 
  onFinish,
  fastTransition = true, // Default to fast transitions
  visible = true // Default to visible
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

  // Don't render if not visible
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <BlurView intensity={20} style={styles.blurContainer}>
        <View style={styles.modalContent}>
          <View className="items-center">
            <Image 
              source={images[currentImageIndex]} 
              className="w-[300px] h-[97px]"
              style={{ opacity: 1 }}
              resizeMode="contain"
            />
            
            <Text className="text-[#623405] text-lg mt-4 font-medium">
              Loading...
            </Text>
          </View>
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    backgroundColor: 'rgba(175, 157, 134, 0.95)', // Increased opacity (was #AF9D86)
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'rgba(255,255,255,0.98)', // Increased opacity for modal background
    borderRadius: 20,
    borderColor: 'black', 
    borderWidth: 1, // Increased border line to 1px
    padding: 33,
    alignItems: 'center',
    elevation: 8,
    minWidth: 280,
    maxWidth: 320,
  },
});

export default FeedLoading;
