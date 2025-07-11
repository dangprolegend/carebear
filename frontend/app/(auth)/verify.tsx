import {
    StyleSheet,
    Text,
    KeyboardAvoidingView,
    Platform,
    View,
    SafeAreaView,
    TouchableOpacity,
  } from 'react-native';
  import CustomInput from '@/components/CustomInput';
  
  import { useForm } from 'react-hook-form';
  import { z } from 'zod';
  import { zodResolver } from '@hookform/resolvers/zod';  
  import { isClerkAPIResponseError, useSignUp } from '@clerk/clerk-expo';
import { router, Stack } from 'expo-router';
  
  const verifySchema = z.object({
    code: z.string({ message: 'Code is required' }).length(6, 'Invalid code'),
  });
  
  type VerifyFields = z.infer<typeof verifySchema>;
  
  const mapClerkErrorToFormField = (error: any) => {
    switch (error.meta?.paramName) {
      case 'code':
        return 'code';
      default:
        return 'root';
    }
  };
  
  export default function VerifyScreen() {
    const {
      control,
      handleSubmit,
      setError,
      formState: { errors },
    } = useForm<VerifyFields>({
      resolver: zodResolver(verifySchema),
    });
  
    const { signUp, isLoaded, setActive } = useSignUp();
  
    const onVerify = async ({ code }: VerifyFields) => {
      if (!isLoaded) return;
  
      try {
        console.log('Attempting email verification with code:', code);
        const signUpAttempt = await signUp.attemptEmailAddressVerification({
          code,
        });
  
        console.log('Verification status:', signUpAttempt.status);
        console.log('Full verification response:', JSON.stringify(signUpAttempt, null, 2));
  
        if (signUpAttempt.status === 'complete') {
          console.log('Verification complete, setting active session');
          await setActive({ session: signUpAttempt.createdSessionId });
          
          console.log('Session activated, redirecting to root to let the index router handle redirection');
          // Redirect to root, which will then redirect to the appropriate route based on user state
          router.replace('/');
        } else {
          console.log('Verification failed');
          console.log(signUpAttempt);
          setError('root', { message: 'Could not complete the sign up' });
        }
      } catch (err) {
        if (isClerkAPIResponseError(err)) {
          err.errors.forEach((error) => {
            const fieldName = mapClerkErrorToFormField(error);
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
                  Verify Your Email
              </Text> 

              <View className='flex flex-col items-start gap-2 self-stretch p-0 mt-[78px]'>
                  <Text className=" text-black font-lato text-[16px] font-extrabold leading-[24px] tracking-[0.3px]">
                    Verified Code
                  </Text>
          
                <View className='w-full mt-[8px]'>
                  <CustomInput
                    control={control}
                    name='code'
                    placeholder='123456'
                    autoFocus
                    autoCapitalize='none'
                    keyboardType='number-pad'
                    autoComplete='one-time-code'
                  />
                </View>
                <Text className='text-[14px] font-lato font-light leading-[24px] tracking-[-0.1px] text-[#5E5E5E]'>
                  Please check your email and enter verification code
                </Text>
              </View>

              <View className="flex flex-row justify-between items-start self-stretch mt-[286px]">
                <TouchableOpacity 
                  onPress={() => router.replace('/sign-up')}
                  className="flex min-w-[80px] py-4 px-8 justify-center items-center gap-1 rounded-full border border-[#DDD]"
                >
                <Text className='text-[#0F172A] font-lato text-[16px] font-extrabold leading-6 tracking-[-0.1px]'>
                  Back
                </Text>
              </TouchableOpacity>

                <TouchableOpacity
                    className="bg-[#2A1800] inline-flex min-w-[80px] py-4 px-8 justify-center items-center gap-1 rounded-full"
                    onPress={handleSubmit(onVerify)}
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