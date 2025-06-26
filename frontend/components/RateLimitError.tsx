import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface RateLimitErrorProps {
  message: string;
  retryAfter?: number;
  onRetry?: () => void;
  onClose?: () => void;
}

const RateLimitError: React.FC<RateLimitErrorProps> = ({
  message,
  retryAfter,
  onRetry,
  onClose
}) => {
  // Format retry time in a human-readable way
  const getRetryTimeText = () => {
    if (!retryAfter) return '';
    
    if (retryAfter < 60) {
      return `Please try again in ${retryAfter} seconds.`;
    } else if (retryAfter < 3600) {
      const minutes = Math.ceil(retryAfter / 60);
      return `Please try again in ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}.`;
    } else {
      const hours = Math.ceil(retryAfter / 3600);
      return `Please try again in ${hours} ${hours === 1 ? 'hour' : 'hours'}.`;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="error-outline" size={32} color="#FF6B6B" />
        </View>
        
        <Text style={styles.title}>Rate Limit Exceeded</Text>
        
        <Text style={styles.message}>{message}</Text>
        
        {retryAfter && (
          <Text style={styles.retryText}>{getRetryTimeText()}</Text>
        )}
        
        <View style={styles.buttonContainer}>
          {onClose && (
            <Pressable 
              style={[styles.button, styles.closeButton]} 
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          )}
          
          {onRetry && (
            <Pressable 
              style={[styles.button, styles.retryButton]} 
              onPress={onRetry}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    color: '#555',
  },
  retryText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#777',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 8,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginHorizontal: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: '#f0f0f0',
  },
  closeButtonText: {
    color: '#555',
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: '#2A1800',
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default RateLimitError;
