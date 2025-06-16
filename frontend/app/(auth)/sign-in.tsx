import {
    Text,
    View,
    Image,
    SafeAreaView,
    TouchableOpacity,
  } from 'react-native';
  import CustomInput from '@/components/CustomInput';
  import { Link, router } from 'expo-router';

  import Line from '../../assets/icons/line.png';
  
  import { useForm } from 'react-hook-form';
  import { z } from 'zod';
  import { zodResolver } from '@hookform/resolvers/zod';
  
  import { isClerkAPIResponseError, useSignIn } from '@clerk/clerk-expo';
  import SignInWith from '@/components/SignInWith';
  
  const signInSchema = z.object({
    email: z.string({ message: 'Email is required' }).email('Invalid email'),
    password: z
      .string({ message: 'Password is required' })
      .min(8, 'Password should be at least 8 characters long'),
  });
  
  type SignInFields = z.infer<typeof signInSchema>;
  
  const mapClerkErrorToFormField = (error: any) => {
    switch (error.meta?.paramName) {
      case 'identifier':
        return 'email';
      case 'password':
        return 'password';
      default:
        return 'root';
    }
  };
  
  export default function SignInScreen() {
    const {
      control,
      handleSubmit,
      setError,
      formState: { errors },
    } = useForm<SignInFields>({
      resolver: zodResolver(signInSchema),
    });
  
    console.log('Sign-in screen rendering, form errors: ', JSON.stringify(errors, null, 2));
  
    const { signIn, isLoaded, setActive } = useSignIn();
    console.log('Sign-in hooks - isLoaded:', isLoaded);
  
    const onSignIn = async (data: SignInFields) => {
      console.log('Sign-in attempt starting with email:', data.email);
      
      if (!isLoaded) {
        console.log('Sign-in hooks not loaded yet');
        return;
      }
      
      try {
        console.log('Creating sign-in attempt...');
        const signInAttempt = await signIn.create({
          identifier: data.email,
          password: data.password,
        });

        console.log('Sign-in attempt result:', JSON.stringify(signInAttempt, null, 2));

        if (signInAttempt.status === 'complete') {
          console.log('Sign-in complete, setting active session with ID:', signInAttempt.createdSessionId);
          await setActive({ session: signInAttempt.createdSessionId });
          
          console.log('Session activated, redirecting to root');
          // Explicit navigation to the home route after authentication
          router.replace('/');
        } else {
          console.log('Sign in failed');
          setError('root', { message: 'Sign in could not be completed' });
        }
      } catch (err) {
        console.log('Sign in error: ', JSON.stringify(err, null, 2));
  
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
  
      console.log('Sign in: ', data.email, data.password);
    };
  
    return (
      <SafeAreaView> 
         <View className="items-center justify-center h-screen bg-white">
          <View className="flex flex-col items-start w-[345px]"> 
            <Text className="text-black font-lato text-[32px] font-extrabold leading-9 tracking-[0.3px]">
                Sign In
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
          </View>  
  
        {/* Sign in with social providers (Google, Facebook, Apple) */}
          <View className="flex flex-col items-start gap-8 self-stretch mt-[40px]">
            <View className='flex flex-row justify-center items-center gap-2 self-stretch'>
              <Image source={Line} className="w-[40px]"/>
              <Text className="text-black font-lato text-base font-light leading-6 tracking-[-0.1px]">Or Sign In With</Text>
              <Image source={Line} className="w-[40px]"/>
              </View>
            <View style={{ flexDirection: 'row', gap: 32, marginHorizontal: 'auto' }}>
              <SignInWith strategy='oauth_google' />
              <SignInWith strategy='oauth_facebook' />
              <SignInWith strategy='oauth_apple' />
            </View>
          </View>

            <View className='items-center gap-[16px]'>
              <TouchableOpacity
                  className="bg-[#0F172A] inline-flex min-w-[80px] py-4 px-8 justify-center items-center gap-1 rounded-full mt-[68px]"
                  onPress={handleSubmit(onSignIn)}
                >
                  <Text className="text-white text-center font-lato text-[16px] font-extrabold leading-[24px] tracking-[0.3px]">Sign In</Text>
                </TouchableOpacity>
                <View className='flex flex-row items-center gap-3'>
                  <Text className='text-black font-lato text-base font-light leading-6 tracking-[-0.1px]'>
                    Don't have an account? 
                  </Text>
                  <TouchableOpacity onPress={() => router.replace('/sign-up')}>
                    <Text className='text-[#0F172A] font-lato text-base font-extrabold leading-6 tracking-[-0.1px]'>
                      Sign Up
                    </Text>
                  </TouchableOpacity>
                </View>

            </View>
          </View> 
        </SafeAreaView>
    );
  }
 