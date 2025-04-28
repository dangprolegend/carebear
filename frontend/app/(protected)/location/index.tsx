import React, { useState, useEffect } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import MapView, {Marker} from 'react-native-maps';

const LocationScreen = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    console.log('LocationScreen mounted, calling fetchLocation...'); // <-- Add log
    fetchLocation();
  }, []);

  const fetchLocation = async () => {
    setLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
      console.log('Attempting to get current position...'); // <-- Add log
      let locationData = await Location.getCurrentPositionAsync({});
      console.log('Got location data:', locationData); // <-- Add log
      setLocation(locationData);
    } catch (error) {
    console.error('Error fetching location:', error); // <-- Log the specific error
    setErrorMsg('Error fetching location');
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-red-500 text-center mb-4">{errorMsg}</Text>

        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  if (location) {
    // We only reach here if location is NOT null
    const currentLatitude = location.coords.latitude;
    const currentLongitude = location.coords.longitude;

    return (
      // Change container style approach
      <View style={styles.container}>
         {/* Remove the intermediate View with h-3/4 */}
          <MapView
            // Change map style approach
            style={styles.map}
            initialRegion={{
              latitude: currentLatitude,
              longitude: currentLongitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
          <Marker
              coordinate={{
                latitude: currentLatitude,
                longitude: currentLongitude,
              }}
              title={"My location"}
              description={"This is the spot!"}
            />
          </MapView>
        {/* Position the button appropriately, e.g., absolutely */}
        <View style={styles.buttonContainer}>
           <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  // Fallback if not loading, no error, but location is still null (initial state)
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-gray-500">Fetching location...</Text>
      <ActivityIndicator size="small" color="#888888" style={{marginTop: 10}} />
    </View>
  );
};

export default LocationScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1, // Make the main container fill the screen
    },
    map: {
      width: '100%', // Make map fill width
      height: '100%', // Make map fill height (adjust if button needs space below)
      // OR use StyleSheet.absoluteFillObject if map should be behind button
      // ...StyleSheet.absoluteFillObject,
    },
    buttonContainer: { // Example style to overlay button
      position: 'absolute',
      bottom: 30, // Adjust position as needed
      left: 0,
      right: 0,
      alignItems: 'center', // Center button horizontally
    },
    // Add other styles from Snippet 2 if needed, or adapt your existing ones
  });