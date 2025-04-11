import {View, Text, StyleSheet, TextInput, TouchableOpacity} from 'react-native';
import React from 'react';
import Colors from '@/constants/Colors';
import {useRouter} from 'expo-router';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import {auth} from '@/config/FirebaseConfig';
import { getAuth, signInWithPopup } from "firebase/auth";
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export default function SignUp() {
    const [email,setEmail] = React.useState('');
    const [password,setPassword] = React.useState('');
    const router= useRouter();

    React.useEffect(() => {
        GoogleSignin.configure({
            // Get this from Google Cloud Console
            webClientId: Constants.expoConfig?.extra?.WEB_CLIENT_ID,
        });
    }, []);

    const signInWithGoogle = async () => {
        try {
            // Check if running on web platform
            if (Platform.OS === 'web') {
                // Use Firebase popup sign-in for web
                const provider = new GoogleAuthProvider();
                const userCredential = await signInWithPopup(auth, provider);
                console.log('Signed in with Google!', userCredential.user);
                router.push('/login/signUp');
            } else {
                // Use Google Sign-In for native platforms
                await GoogleSignin.hasPlayServices();
                const userInfo = await GoogleSignin.signIn();
                const { accessToken } = await GoogleSignin.getTokens();
                const googleCredential = GoogleAuthProvider.credential(null, accessToken);
                const userCredential = await signInWithCredential(auth, googleCredential);
                console.log('Signed in with Google!', userCredential.user);
                router.push('/login/signUp');
            }
        } catch (error) {
            console.error('Google Sign-In Error:', error);
            alert('Failed to sign in with Google');
        }
    };


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

            <TouchableOpacity 
                style={[styles.button, styles.googleButton]} 
                onPress={signInWithGoogle}
            >
                <Text style={styles.buttonText}>Sign in with Google</Text>
            </TouchableOpacity>
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