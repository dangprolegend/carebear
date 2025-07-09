import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    SafeAreaView,
  } from 'react-native';
  import CustomInput from '@/components/CustomInput';
  import Line from '../../assets/icons/line.png';
  
  import { useForm } from 'react-hook-form';
  import { z } from 'zod';
  import { zodResolver } from '@hookform/resolvers/zod';
  import { Link, router, Stack } from 'expo-router';
  
  import { isClerkAPIResponseError, useSignUp } from '@clerk/clerk-expo';
  import SignInWith from '@/components/SignInWith';

  const signUpSchema = z.object({
    email: z.string({ message: 'Email is required' }).email('Invalid email'),
    password: z
      .string({ message: 'Password is required' })
      .min(8, 'Password should be at least 8 characters long'),
  });
  
  type SignUpFields = z.infer<typeof signUpSchema>;
  
  const mapClerkErrorToFormField = (error: any) => {
    switch (error.meta?.paramName) {
      case 'email_address':
        return 'email';
      case 'password':
        return 'password';
      default:
        return 'root';
    }
  };
  
  export default function SignUpScreen() {
    const {
      control,
      handleSubmit,
      setError,
      formState: { errors },
    } = useForm<SignUpFields>({
      resolver: zodResolver(signUpSchema),
    });
  
    const { signUp, isLoaded } = useSignUp();
  
    const onSignUp = async (data: SignUpFields) => {
      if (!isLoaded) return;
  
      try {
        console.log('Starting sign-up process with email:', data.email);
        
        const signUpResult = await signUp.create({
          emailAddress: data.email,
          password: data.password,
        });
        
        console.log('Sign-up creation result:', JSON.stringify(signUpResult, null, 2));
  
        const verificationResult = await signUp.prepareVerification({ strategy: 'email_code' });
        console.log('Verification preparation result:', JSON.stringify(verificationResult, null, 2));
  
        console.log('Redirecting to verification screen');
        router.replace('/verify');
      } catch (err) {
        console.log('Sign up error: ', err);
        if (isClerkAPIResponseError(err)) {
          err.errors.forEach((error) => {
            console.log('Error: ', JSON.stringify(error, null, 2));
            const fieldName = mapClerkErrorToFormField(error);
            console.log('Field name: ', fieldName);
            setError(fieldName, {
              message: error.longMessage,
            });
          });
        } else {
          setError('root', { message: 'Unknown error' });
        }
      }
    };
  
    return (
      <>
      {/* Add this Stack.Screen component to hide the header */}
      <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView> 
          <View className="items-center justify-center h-screen bg-white">
            <View className="flex flex-col items-start w-[345px]"> 
              <Text className="text-black font-lato text-[32px] font-extrabold leading-9 tracking-[0.3px]">
                  Set Up Your Account
              </Text> 
              <Text className="mt-[40px] text-black font-lato text-[16px] font-extrabold leading-9 tracking-[0.3px]">
                Email
              </Text>
      
            <View className='w-full mt-[8px]'>
              <CustomInput
                control={control}
                name='email'
                placeholder='abc@gmail.com'
                autoFocus
                autoCapitalize='none'
                keyboardType='email-address'
                autoComplete='email'
              />
            </View>

            <Text className=" text-black font-lato text-[16px] font-extrabold leading-9 tracking-[0.3px]">
                Password
            </Text>
            <View className='w-full mt-[8px]'>
              <CustomInput
                control={control}
                name='password'
                placeholder='•••••••••'
                secureTextEntry
                />
            </View>

              {errors.root && (
                <Text style={{ color: 'crimson' }}>{errors.root.message}</Text>
              )}
             
    
          {/* Sign in with social providers (Google, Facebook, Apple) */}
            <View className="flex flex-col items-center gap-4 self-stretch mt-[40px] w-[345px]">
              <View className='flex flex-row justify-center items-center gap-2 self-stretch'>
                <Image source={Line} className="w-[150px]"/>
                <Text className="text-black font-lato text-base font-light leading-6 tracking-[-0.1px]">or</Text>
                <Image source={Line} className="w-[150px]"/>
              </View>
              <View className="flex flex-col gap-4 w-full">
                <SignInWith strategy='oauth_google' />
                <SignInWith strategy='oauth_apple' />
                <SignInWith strategy='oauth_facebook' />
              </View>
            </View>

              <View className="flex flex-row justify-between items-start self-stretch mt-[56px] gap-[35px]">
                <TouchableOpacity 
                  onPress={() => router.replace('/sign-in')}
                  className="flex min-w-[80px] py-4 px-12 justify-center items-center gap-1 rounded-full border border-black"
                >
                <Text className='text-[#0F172A] font-lato text-[16px] font-extrabold leading-6 tracking-[-0.1px]'>
                  Back
                </Text>
              </TouchableOpacity>

                <TouchableOpacity
                    className="bg-[#2A1800] inline-flex min-w-[80px] py-4 px-12 justify-center items-center gap-1 rounded-full"
                    onPress={handleSubmit(onSignUp)}
                  >
                    <Text className="text-white text-center font-lato text-[16px] font-extrabold leading-[24px] tracking-[0.3px]">Next</Text>
                  </TouchableOpacity>
              </View>
            </View> 
            </View> 
        </SafeAreaView>
      </>
    );
  }
  