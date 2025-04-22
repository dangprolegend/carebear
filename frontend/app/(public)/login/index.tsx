import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import { auth } from '@/config/FirebaseConfig';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import debounce from 'lodash.debounce';

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
  });

  
  useEffect(() => {
    const debouncedhandleGoogleAuth = debounce(async () => {
      // console.log('Debounced function executed'); 
      // use this to test if debounce is working
      if (response?.type === 'success') {
        setLoading(true);
        try {
          const { authentication } = response;
          const googleCredential = GoogleAuthProvider.credential(
            null,
            authentication.accessToken
          );
          const userCredential = await signInWithCredential(
            auth,
            googleCredential
          );
          const user = userCredential.user;
          const idToken = await user.getIdToken();

          const body = {
            authID: user.uid,
            email: user.email,
            name: user.displayName ?? 'No Name',
            image: user.photoURL ?? 'https://example.com/default.jpg',
          };

          // POST to backend
          const res = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          });

          const resData = await res.json();
          console.log('Backend response:', resData);

          router.push('/home');
        } catch (error) {
          console.error('Google Sign-In Error:', error);
          alert('Failed to sign in with Google');
        } finally {
          setLoading(false);
        }
      }
    },500);

    debouncedhandleGoogleAuth();
  }, [response]);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/home');
    } catch (error) {
      console.error('Login Error:', error);
      alert('Failed to log in. Please check your credentials.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder='Email'
        value={email}
        onChangeText={setEmail}
        autoCapitalize='none'
      />
      <TextInput
        style={styles.input}
        placeholder='Password'
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login with Email</Text>
      </TouchableOpacity>

      <View style={{ marginVertical: 15 }} />

      {loading ? (
        <ActivityIndicator size='large' color='#0a7ea4' />
      ) : (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#4285F4' }]}
          disabled={!request}
          onPress={() => promptAsync()}
        >
          <Text style={styles.buttonText}>Login with Google</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
});
