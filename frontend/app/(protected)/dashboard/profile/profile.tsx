//@ts-nocheck
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, Pressable, Image, ScrollView } from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import axios from 'axios';
import CalendarStrip from '~/components/CalendarStrip';
import CircularProgress from '~/components/CircularProgress';
import Settings from '../../../../assets/icons/settings.png';
import Heart from '../../../../assets/icons/heart.png';
import FeedLoading from '~/components/ui/feed-loading';

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

  const [userCreatedDate, setUserCreatedDate] = useState<Date | null>(null);
  const [daysHealthy, setDaysHealthy] = useState<number>(0);

  const [taskCompletionByDate, setTaskCompletionByDate] = useState<{[dateKey: string]: number}>({});
  const [primaryGroupId, setPrimaryGroupId] = useState<string | null>(null);
  const [daysWithHearts, setDaysWithHearts] = useState<number>(0);
  const [isLoadingDaysWithHearts, setIsLoadingDaysWithHearts] = useState<boolean>(false);

  const [taskCompletion, setTaskCompletion] = useState<number>(0);
  const [numFamilies, setNumFamilies] = useState<number>(0);

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

  const getDayText = (count: number): string => {
    return count === 1 ? 'Day' : 'Days';
  };

  const getGroupText = (count: number): string => {
    return count === 1 ? 'Group' : 'Groups';
  };

  const calculateDaysDifference = (startDate: Date, endDate: Date): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    const timeDifference = end.getTime() - start.getTime();
    const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
    
    return Math.max(0, daysDifference); 
  };

  const fetchNumGroups = async (userID: string) => {
      try {
        const response = await axios.get(`https://carebear-carebearvtmps-projects.vercel.app/api/users/${userID}/allGroups`);
        const numGroups = response.data.totalGroups || 0;
        setNumFamilies(numGroups);
        return numGroups;
      } catch (error) {
        console.error('Error fetching:', error);
        return 0;
      }
    };
  
  const fetchTaskCompletion = async (userID: string, groupID: string) => {
      try {
        const response = await axios.get(`https://carebear-carebearvtmps-projects.vercel.app/api/tasks/user/${userID}/group/${groupID}/completion`);
        const percentage = response.data.completionPercentage || 0;
        setTaskCompletion(percentage);
        return percentage;
      } catch (error) {
        console.error('Error fetching task completion:', error);
        return 0;
      }
    };

  // Fetch user created date
  const fetchUserCreatedDate = async (userID: string) => {
    try {
      const response = await axios.get(`https://carebear-carebearvtmps-projects.vercel.app/api/users/${userID}`);
      const createdDate = new Date(response.data.createdAt);
      setUserCreatedDate(createdDate);
      
      const today = new Date();
      const daysSinceCreation = calculateDaysDifference(createdDate, today);
      setDaysHealthy(daysSinceCreation);

      const groupID = await fetchPrimaryGroupId(userID);
      if (groupID) {
        setPrimaryGroupId(groupID);
        setIsLoadingDaysWithHearts(true);
        await countDaysWithHearts(userID, groupID, createdDate);
        setIsLoadingDaysWithHearts(false);
      }
      
      return createdDate;
    } catch (error) {
      console.error('Error fetching user created date:', error);
      setIsLoadingDaysWithHearts(false);
      return null;
    }
  };

  // Fetch today's daily status
  const fetchTodayStatus = async (userID: string) => {
    try {
      const response = await axios.get(`https://carebear-carebearvtmps-projects.vercel.app/api/daily/today/${userID}`);
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

  const fetchPrimaryGroupId = async (userID: string) => {
    try {
      const response = await axios.get(`https://carebear-carebearvtmps-projects.vercel.app/api/users/${userID}/group`);
      setPrimaryGroupId(response.data.groupID);
      return response.data.groupID;
    } catch (error) {
      console.error('Error fetching primary group ID:', error);
      return null;
    }
  };

  // Helper function to format date as YYYY-MM-DD
  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchTaskCompletionForDate = async (userID: string, groupID: string, date: Date) => {
    try {
      const dateKey = formatDateForAPI(date); // Use helper function for consistent formatting
      const response = await axios.get(`https://carebear-carebearvtmps-projects.vercel.app/api/tasks/user/${userID}/group/${groupID}/completion`, {
        params: {
          date: dateKey 
        }
      });
      const percentage = response.data.completionPercentage || 0;
      setTaskCompletionByDate(prev => ({
        ...prev,
        [dateKey]: percentage
      }));
      return percentage;
    } catch (error) {
      console.error(error);
      setTaskCompletionByDate(prev => ({
        ...prev,
        [formatDateForAPI(date)]: 0
      }));
      return 0;
    }
  };

  const countDaysWithHearts = async (userID: string, groupID: string, createdDate: Date) => {
    const today = new Date();
    const promises = [];
    let currentDate = new Date(createdDate);
    
    currentDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    while (currentDate <= today) {
      promises.push(fetchTaskCompletionForDate(userID, groupID, new Date(currentDate)));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    try {
      const completionPercentages = await Promise.all(promises);
      const daysWithCompletion = completionPercentages.filter(percentage => percentage > 0).length;
      setDaysWithHearts(daysWithCompletion);
      return daysWithCompletion;
    } catch (error) {
      console.error('Error counting days with hearts:', error);
      setDaysWithHearts(0);
      return 0;
    }
  };

  useEffect(() => {
    const getUserInfo = async () => {
      if (isSignedIn && userId) {
        try {
          const userResponse = await axios.get(`https://carebear-carebearvtmps-projects.vercel.app/api/users/clerk/${userId}`);
          const fetchedUserID = userResponse.data.userID;
          setUserID(fetchedUserID);

          const res = await axios.get(`https://carebear-carebearvtmps-projects.vercel.app/api/users/${fetchedUserID}/info`);
          setUserImageURL(res.data.imageURL);
          setUserFullName(res.data.fullName);

          fetchUserCreatedDate(fetchedUserID);
          const groupID = await fetchPrimaryGroupId(fetchedUserID);
          fetchTaskCompletion(fetchedUserID, groupID);
          fetchNumGroups(fetchedUserID);
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
          const userResponse = await axios.get(`https://carebear-carebearvtmps-projects.vercel.app/api/users/clerk/${userId}`);
          const fetchedUserID = userResponse.data.userID;
          setUserID(fetchedUserID);

          // Step 2: Check if user has submitted today
          const statusResponse = await axios.get(`https://carebear-carebearvtmps-projects.vercel.app/api/daily/check/${fetchedUserID}`);
          
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
        <FeedLoading 
          dataReady={false}
          onFinish={() => setIsCheckingStatus(false)}
        />
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
          <CircularProgress
              percentage={taskCompletion} 
              size={24} 
            />
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
          <Text className="text-black font-lato text-[18px] font-extrabold leading-[32px] tracking-[0.3px]">{numFamilies}</Text>
          <Text className="text-black font-lato text-[16px] font-normal leading-[24px] tracking-[-0.1px]">Family {getGroupText(numFamilies)}</Text>
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
            {isLoadingDaysWithHearts ? (
              <View className="w-5 h-5 rounded-full bg-gray-300 animate-pulse" />
            ) : (
              <Text className="text-black font-lato text-[24px] font-extrabold leading-[32px] tracking-[0.3px]">{daysWithHearts}</Text>
            )}
            <Text className="text-black font-lato text-[14px] font-normal leading-[24px] tracking-[-0.1px] ml-2">{getDayText(daysWithHearts)}</Text>
          </View>
        </View>

          <CalendarStrip selectedDate={selectedDate} setSelectedDate={setSelectedDate} userID={userID} />
      </View>

        <View className="flex flex-col items-start gap-[8px] p-4 rounded-lg bg-[#FAE5CA] mt-10 w-5/6 self-center">
          <View className="flex flex-row items-center gap-2">
            <View className="flex w-6 h-6 p-0.5 justify-center items-center gap-2 aspect-square rounded-full border border-[#2A1800] bg-[#198AE9]">
              <Image source={Heart} className='w-4 h-4'/>
            </View>
            <Text className='text-[#2A1800] font-lato text-[18px] font-extrabold leading-[32px] tracking-[0.3px]'>{daysHealthy}</Text>
        </View>
          <Text className='text-[#2A1800] font-lato text-[16px] font-light leading-[24px] tracking-[-0.1px]'>{getDayText(daysHealthy)} Healthy</Text>
        </View>

    </ScrollView>
  );
}