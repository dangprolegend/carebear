import {View, Text, StyleSheet, TextInput, Button} from 'react-native';
import {Gesture, TouchableOpacity} from 'react-native-gesture-handler';
import React from 'react';
import Colors from '@/constants/Colors';
import {useRouter} from 'expo-router';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import {auth} from '@/config/FirebaseConfig';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';

WebBrowser.maybeCompleteAuthSession();

export default function SignUp() {
    const [email,setEmail] = React.useState('');
    const [password,setPassword] = React.useState('');
    const router= useRouter();
    
    // Google Auth Request
    const [request, response, promptAsync] = Google.useAuthRequest({
        iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
        webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
    });
    useEffect(() => {
        if (response?.type === 'success') {
            const { authentication } = response;
            if (authentication?.accessToken) {
                const googleCredential = GoogleAuthProvider.credential(null, authentication.accessToken);
                signInWithCredential(auth, googleCredential)
                    .then((userCredential) => {
                        console.log('Signed in with Google!', userCredential.user);
                        router.push('/home'); // Navigate to home screen
                    })
                    .catch((error) => {
                        console.error('Google Sign-In Error:', error);
                        alert('Failed to sign in with Google');
                    });
            }
        }
    }, [response]);


    const OnCreateAccount = async () => {
        if (!email || !password) {
            alert('Please fill in all fields');
            return;
        }
    
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log('Account created!', userCredential.user);
            router.push('/login/signUp'); // Navigate to home screen after successful signup
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                alert('Email already in use');
            } else if (error.code === 'auth/invalid-email') {
                alert('Invalid email address');
            } else if (error.code === 'auth/weak-password') {
                alert('Password should be at least 6 characters');
            } else {
                console.error('Error creating account:', error);
                alert('Error creating account');
            }
        }
    };
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign Up</Text>
            <Text>Email</Text>
            <TextInput 
                style={styles.input} 
                placeholder="Enter your email" 
                value={email}
                onChangeText={setEmail}
            />
            <Text>Password</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter your password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />
            
            <TouchableOpacity style={styles.button} onPress={OnCreateAccount}>
                <Text style={styles.buttonText}>Create Account</Text>
            </TouchableOpacity>

            <Button
                disabled={!request}
                title="Sign in with Google"
                onPress={async () => {
                    try {
                      await promptAsync();
                    } catch (error) {
                      console.error('Google Sign-In Error:', error);
                    }
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    // ... existing styles ...
    googleButton: {
        backgroundColor: '#4285F4',
        marginTop: 10,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.light.background,
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
});