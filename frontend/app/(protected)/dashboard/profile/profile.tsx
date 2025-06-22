//@ts-nocheck
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, Pressable, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import axios from 'axios';
import PillIcon from '../../../../assets/icons/pill.png';
import PillBotte from '../../../../assets/icons/pill-bottle.png';
import Moon from '../../../../assets/icons/moon.png';
import Scale from '../../../../assets/icons/scale.png';
import Foot from '../../../../assets/icons/footprints.png';
import Dumbbell from '../../../../assets/icons/dumbbell.png';
import Settings from '../../../../assets/icons/settings.png';
import Heart from '../../../../assets/icons/heart.png';
import Plus from '../../../../assets/icons/plus.png';
import Steps from '../../../../assets/icons/steps.png';
import Fitbit from '../../../../assets/icons/fitbit.png';
import AppleHealth from '../../../../assets/icons/apple_health.png';
import AppleWatch from '../../../../assets/icons/apple_watch.png';
import CalendarStrip from '~/components/CalendarStrip';

export default function Profile() {
  const router = useRouter();
  const { user } = useUser();
  const { isSignedIn, userId } = useAuth();
  const [userID, setUserID] = useState(null);
  const [userImageURL, setUserImageURL] = useState<string | null>(null);
  const [userFullName, setUserFullName] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Daily status display states (store both value and emoji for user)
  const [todayMoodValue, setTodayMoodValue] = useState<string>('');
  const [todayBodyValue, setTodayBodyValue] = useState<string>('');
  const [todayMoodEmoji, setTodayMoodEmoji] = useState<string>('');
  const [todayBodyEmoji, setTodayBodyEmoji] = useState<string>('');
  const [isCheckingStatus, setIsCheckingStatus] = useState<boolean>(false);

  const moods = [
    { id: 'happy', emoji: '😊', label: 'Happy', value: 'happy' },
    { id: 'excited', emoji: '🤩', label: 'Excited', value: 'excited' },
    { id: 'sad',  emoji: '😢',label: 'Sad', value: 'sad' },
    { id: 'angry',  emoji: '😠',label: 'Angry', value: 'angry' },
    { id: 'nervous',  emoji: '😬',label: 'Nervous', value: 'nervous' },
    { id: 'peaceful',  emoji: '🧘',label: 'Peaceful', value: 'peaceful' },
  ];

  const bodyFeelings = [
    { id: 'energized',  emoji: '⚡',label: 'Energized', value: 'energized' },
    { id: 'sore',  emoji: '💪',label: 'Sore', value: 'sore' },
    { id: 'tired',  emoji: '😴',label: 'Tired', value: 'tired' },
    { id: 'sick',  emoji: '🤒',label: 'Sick', value: 'sick' },
    { id: 'relaxed',  emoji: '😌',label: 'Relaxed', value: 'relaxed' },
    { id: 'tense',  emoji: '😣',label: 'Tense', value: 'tense' },
  ];

  // Helper function to get emoji from value
  const getMoodEmoji = (moodValue: string): string => {
    if (moodValue === '') return '👤';
    const mood = moods.find(m => m.value === moodValue);
    return mood ? mood.emoji : '';
  };

  const getBodyEmoji = (bodyValue: string): string => {
    if (bodyValue === '') return '👤';
    const body = bodyFeelings.find(b => b.value === bodyValue);
    return body ? body.emoji : '';
  };

  // Fetch today's daily status
  const fetchTodayStatus = async (userID: string) => {
    try {
      const response = await axios.get(`https://carebear-backend.onrender.com/api/daily/today/${userID}`);
      if (response.data && response.data.mood && response.data.body) {
        setTodayMoodValue(response.data.mood);
        setTodayBodyValue(response.data.body);
        setTodayMoodEmoji(getMoodEmoji(response.data.mood));
        setTodayBodyEmoji(getBodyEmoji(response.data.body));
      } else {
        setTodayMoodValue('');
        setTodayBodyValue('');
        setTodayMoodEmoji('');
        setTodayBodyEmoji('');
      }
    } catch (error) {
      console.error('Error fetching today\'s status:', error);
      setTodayMoodValue('');
      setTodayBodyValue('');
      setTodayMoodEmoji('');
      setTodayBodyEmoji('');
    }
  };

  useEffect(() => {
    const getUserInfo = async () => {
      if (isSignedIn && userId) {
        try {
          const userResponse = await axios.get(`https://carebear-backend.onrender.com/api/users/clerk/${userId}`);
          const fetchedUserID = userResponse.data.userID;
          setUserID(fetchedUserID);

          const res = await axios.get(`https://carebear-backend.onrender.com/api/users/${fetchedUserID}/info`);
          setUserImageURL(res.data.imageURL);
          setUserFullName(res.data.fullName);
        } catch (error) {
          console.error('Error fetching user info:', error);
        } 
      }
    };

    getUserInfo();
  }, [isSignedIn, userId]);

  // Check if user has submitted daily status
  useEffect(() => {
    const checkDailyStatus = async () => {
      if (isSignedIn && userId) {
        setIsCheckingStatus(true);
        try {
          // Step 1: Fetch userID using clerkID
          const userResponse = await axios.get(`https://carebear-backend.onrender.com/api/users/clerk/${userId}`);
          const fetchedUserID = userResponse.data.userID;
          setUserID(fetchedUserID);

          // Step 2: Check if user has submitted today
          const statusResponse = await axios.get(`https://carebear-backend.onrender.com/api/daily/check/${fetchedUserID}`);
          
          // If user has submitted today, fetch their status to display emojis
          if (statusResponse.data.hasSubmittedToday) {
            await fetchTodayStatus(fetchedUserID);
          } 
        } catch (error) {
          console.error('Error checking daily status:', error);
        } finally {
          setIsCheckingStatus(false);
        }
      }
    };

    checkDailyStatus();
  }, [isSignedIn, userId]);

  // Show loading screen while checking status
    if (isCheckingStatus) {
      return (
        <View className="flex-1 justify-center items-center bg-gray-50">
          <ActivityIndicator size="large" color="#007AFF" />
          <Text className="mt-4 text-gray-600">Loading...</Text>
        </View>
      );
    }

  return (
    <ScrollView className="flex-1">
      <View className='flex flex-col items-center gap-4 mt-6'>
        <Image
          source={{ uri: userImageURL }}
          className='w-20 h-20 flex-shrink-0 aspect-square rounded-full border-2 border-[#2A1800] bg-cover bg-center'
          />

        <View className="flex flex-row items-center gap-4">
          <View className="w-6 h-6 bg-[#2A1800] rounded-full flex items-center justify-center">
            <Text className="text-xs">{todayMoodEmoji}</Text>
          </View>
          <View className="w-6 h-6 bg-[#2A1800] rounded-full flex items-center justify-center">
            <Text className="text-xs">{todayBodyEmoji}</Text>
          </View>
          <View className="w-6 h-6 bg-[#2A1800] rounded-full flex items-center justify-center">
            <Image source={PillIcon} className="w-3.5 h-3.5" />
          </View>
          <View className="w-6 h-6 bg-[#2A1800] rounded-full flex items-center justify-center">
            <Image source={PillBotte} className="w-3.5 h-3.5" />
          </View>
          <View className="w-6 h-6 bg-[#2A1800] rounded-full flex items-center justify-center">
            <Image source={Moon} className="w-3.5 h-3.5" />
          </View>
          <View className="w-6 h-6 bg-[#2A1800] rounded-full flex items-center justify-center">
            <Image source={Scale} className="w-3.5 h-3.5" />
          </View>
          <View className="w-6 h-6 bg-[#2A1800] rounded-full flex items-center justify-center">
            <Image source={Foot} className="w-3.5 h-3.5" />
          </View>
          <View className="w-6 h-6 bg-[#2A1800] rounded-full flex items-center justify-center">
            <Image source={Dumbbell} className="w-3.5 h-3.5" />
          </View>
        </View>
        </View>

      {/* User Info Section */}
      <View className="flex-row items-center w-5/6 self-center mt-8">
        <View className="flex-1 pr-4">
          <Text className="text-black font-lato text-[18px] font-extrabold leading-[32px] tracking-[0.3px]">
            {userFullName}
          </Text>
          <Text className="text-black font-lato text-[16px] font-normal leading-[24px] tracking-[-0.1px]" numberOfLines={1} ellipsizeMode="tail">
            {user?.emailAddresses[0]?.emailAddress}
          </Text>
        </View>
        <View className="items-center px-4">
          <Text className="text-black font-lato text-[18px] font-extrabold leading-[32px] tracking-[0.3px]">1</Text>
          <Text className="text-black font-lato text-[16px] font-normal leading-[24px] tracking-[-0.1px]">Family Group</Text>
        </View>
        <View className="pl-4">
          <Pressable onPress={() => router.push('/(protected)/dashboard/profile/settings')}>
            <Image source={Settings} className="w-6 h-6" />
          </Pressable>
        </View>
      </View>

      {/* Diary Section */}
      <View className="w-5/6 self-center mt-10">
        <View className="flex-row justify-between items-center">
          <Text className="text-black font-lato text-[18px] font-extrabold leading-[32px] tracking-[0.3px]">Diary</Text>
          <View className="flex-row items-center">
            <Text className="text-black font-lato text-[24px] font-extrabold leading-[32px] tracking-[0.3px]">39</Text>
            <Text className="text-black font-lato text-[14px] font-normal leading-[24px] tracking-[-0.1px] ml-2">Days</Text>
          </View>
        </View>

          <CalendarStrip selectedDate={selectedDate} setSelectedDate={setSelectedDate} userID={userID} />
      </View>

        <View className="flex flex-col items-start gap-[8px] p-4 rounded-lg bg-[#FAE5CA] mt-10 w-5/6 self-center">
          <View className="flex flex-row items-center gap-2">
            <View className="flex w-6 h-6 p-0.5 justify-center items-center gap-2 aspect-square rounded-full border border-[#2A1800] bg-[#198AE9]">
              <Image source={Heart} className='w-4 h-4'/>
            </View>
            <Text className='text-[#2A1800] font-lato text-[18px] font-extrabold leading-[32px] tracking-[0.3px]'>39</Text>
        </View>
          <Text className='text-[#2A1800] font-lato text-[16px] font-light leading-[24px] tracking-[-0.1px]'>Days Healthy</Text>
        </View>

        <View className="w-5/6 self-center mt-10">
          <View className="flex-row justify-between items-center">
            <Text className="text-black font-lato text-[18px] font-extrabold leading-[32px] tracking-[0.3px]">Automatic Tracking</Text>
            <View className="flex items-center justify-center p-[6px] gap-0 rounded-[100px] bg-[#2A1800]">
              <Image source={Plus} className="w-4 h-4" />
            </View>
          </View>

          <View className="flex flex-row items-center justify-around mt-[33px] gap-4">
            <View className="flex flex-col items-center gap-[14px]">
              <View className="relative">
                <View className="w-8 h-8 bg-[#2A1800] rounded-full flex items-center justify-center">
                  <Image source={Steps} className="w-6 h-6" />
                </View>
                <View className="absolute -top-1 -right-1 w-3 h-3 bg-[#4ADE80] rounded-full border-2 border-white" />
              </View>
              <Text className="text-[#2A1800] text-center font-lato text-[14px] font-normal leading-[24px] tracking-[-0.1px]">Steps iPhone</Text>
            </View>

            <View className="flex flex-col items-center gap-[14px]">
              <View className="relative">
                <View className="w-8 h-8 bg-[#2A1800] rounded-full flex items-center justify-center">
                  <Image source={AppleHealth} className="w-6 h-6" />
                </View>
                <View className="absolute -top-1 -right-1 w-3 h-3 bg-[#4ADE80] rounded-full border-2 border-white" />
              </View>
              <Text className="text-[#2A1800] text-center font-lato text-[14px] font-normal leading-[24px] tracking-[-0.1px]">Apple Health</Text>
            </View>

            <View className="flex flex-col items-center gap-[14px]">
              <View className="relative">
                <View className="w-8 h-8 bg-[#2A1800] rounded-full flex items-center justify-center">
                  <Image source={AppleWatch} className="w-6 h-6" />
                </View>
              </View>
              <Text className="text-[#2A1800] text-center font-lato text-[14px] font-normal leading-[24px] tracking-[-0.1px]">Apple Watch</Text>
            </View>

            <View className="flex flex-col items-center gap-[14px]">
              <View className="relative">
                <View className="w-8 h-8 bg-[#2A1800] rounded-full flex items-center justify-center">
                  <Image source={Fitbit} className="w-6 h-6" />
                </View>
              </View>
              <Text className="text-[#2A1800] text-center font-lato text-[14px] font-normal leading-[24px] tracking-[-0.1px]">FitBit</Text>
            </View>
          </View>
        </View>

    </ScrollView>
  );
}