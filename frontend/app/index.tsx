import { useRouter } from 'expo-router';
import {View, Text, StyleSheet} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import React, { useEffect } from 'react';

const Index = () => {
  useEffect(() => {
    console.log("Dangdz");
  }, []);
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Care Bear</Text>
      <TouchableOpacity style={styles.button} onPress={() => router.push('/login/signUp')}>
        <Text style={styles.buttonText}>Go to Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}
export default Index;

const styles = StyleSheet.create({
  container: {
    flex:1, 
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center'
  },
  text:{
    fontSize: 20,
    color: 'white' ,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});