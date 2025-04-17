import {View, Text, TextInput, TouchableOpacity, StyleSheet, Touchable} from 'react-native';
import {useRouter} from 'expo-router';
import {useState} from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/config/FirebaseConfig';

export default function LoginScreen(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async() => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/home');
    } catch (error) {
      console.error('Login Error:', error);
      alert('Failed to log in. Please check your credentials.');
    }
  }
  return (
    <View style={styles.container}>
      <Text style = {styles.text}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}  
        secureTextEntry
        onChangeText={setPassword}
      />    

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  )
}
const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,   
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 15,
        paddingHorizontal: 10,
        width: '80%',
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
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    }
});
