// --- Feed API Functions ---
import { getCurrentUserID } from './apiServices';

const API_BASE_URL = "https://carebear-backend-e1z6.onrender.com/api"; 



let clerkAuthToken: string | null = null;

export const setClerkAuthTokenForFeedService = (token: string | null) => {
    clerkAuthToken = token;
};

const getClerkToken = async (): Promise<string | null> => {
  if (!clerkAuthToken) {
    console.warn("apiService: getClerkToken() - No Clerk token available. Using placeholder or returning null.");
  }
  return clerkAuthToken;
};

class ApiError extends Error {
  status?: number;
  data?: any;
  constructor(message: string, status?: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const handleApiResponse = async (response: Response) => {
  const contentType = response.headers.get("content-type");
  let responseData;
  if (contentType && contentType.includes("application/json")) {
    responseData = await response.json();
  } else {
    responseData = await response.text(); 
  }

  if (!response.ok) {
    const errorMessage = responseData?.error || responseData?.message || responseData || `HTTP error ${response.status}`;
    console.error(`API Error (${response.status}):`, errorMessage, "Response Data:", responseData);
    throw new ApiError(errorMessage, response.status, responseData);
  }
  return responseData;
};

export interface FeedItem {
  id: string;
  type: 'mood' | 'task';
  timestamp: Date;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  moods?: ('happy' | 'excited' | 'sad' | 'angry' | 'nervous' | 'peaceful')[];
  body?: ('energized' | 'sore' | 'tired' | 'sick' | 'relaxed' | 'tense')[];
  task?: {
    title: string;
    status: 'pending' | 'in-progress' | 'done';
    priority: 'low' | 'medium' | 'high';
    completedAt?: Date;
  };
}

export interface FeedFilters {
  timeFilter?: 'today' | 'week' | 'month' | 'all';
  activityFilter?: 'mood' | 'task' | 'all';
  groupID?: string;
  userID?: string;
  limit?: number;
  offset?: number;
}

/**
 * Fetches feed data with optional filters.
 * @param filters Optional filters for the feed data.
 * @returns A promise that resolves to an array of feed items.
 */
export const fetchFeedData = async (filters: FeedFilters = {}): Promise<FeedItem[]> => {
  const token = await getClerkToken();
  if (!token) throw new ApiError("Authentication token not found. Please log in.", 401);

  const queryParams = new URLSearchParams();
  if (filters.timeFilter && filters.timeFilter !== 'all') queryParams.append('timeFilter', filters.timeFilter);
  if (filters.activityFilter && filters.activityFilter !== 'all') queryParams.append('activityFilter', filters.activityFilter);
  if (filters.groupID) queryParams.append('groupID', filters.groupID);
  if (filters.userID) queryParams.append('userID', filters.userID);
  if (filters.limit) queryParams.append('limit', filters.limit.toString());
  if (filters.offset) queryParams.append('offset', filters.offset.toString());  const url = `${API_BASE_URL}/feed${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const feedData = await handleApiResponse(response);
  
  const feedItems = feedData.data || feedData;
  
  return feedItems.map((item: any) => ({
    ...item,
    timestamp: new Date(item.timestamp),
    user: {
      id: item.user.id || item.user._id || 'unknown',
      name: item.user.name,
      avatar: item.user.avatar
    },
    task: item.task && item.task.completedAt ? {
      ...item.task,
      priority: item.task.priority || 'medium', 
      completedAt: new Date(item.task.completedAt)
    } : item.task ? {
      ...item.task,
      priority: item.task.priority || 'medium' 
    } : item.task
  }));
};

/**
 * Fetches feed data for a specific group.
 * @param groupID The ID of the group to fetch feed data for.
 * @param filters Optional additional filters.
 * @returns A promise that resolves to an array of feed items.
 */
export const fetchGroupFeedData = async (groupID: string, filters: Omit<FeedFilters, 'groupID'> = {}): Promise<FeedItem[]> => {
  const token = await getClerkToken();
  if (!token) throw new ApiError("Authentication token not found. Please log in.", 401);
  if (!groupID) throw new ApiError("Group ID is required to fetch group feed data.", 400);

  const userID = getCurrentUserID();
  if (!userID) throw new ApiError("User ID is required to fetch group feed data.", 400);

  const queryParams = new URLSearchParams();
  if (filters.timeFilter && filters.timeFilter !== 'all') queryParams.append('timeFilter', filters.timeFilter);
  if (filters.activityFilter && filters.activityFilter !== 'all') queryParams.append('activityFilter', filters.activityFilter);
  if (filters.userID) queryParams.append('userID', filters.userID);
  if (filters.limit) queryParams.append('limit', filters.limit.toString());
  if (filters.offset) queryParams.append('offset', filters.offset.toString());

  const url = `${API_BASE_URL}/feed/${userID}/group/${groupID}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const feedData = await handleApiResponse(response);
  
  const feedItems = feedData.data || feedData;
  
  return feedItems.map((item: any) => ({
    ...item,
    timestamp: new Date(item.timestamp),
    user: {
      id: item.user.id || item.user._id || 'unknown',
      name: item.user.name,
      avatar: item.user.avatar
    },
    task: item.task && item.task.completedAt ? {
      ...item.task,
      priority: item.task.priority || 'medium', 
      completedAt: new Date(item.task.completedAt)
    } : item.task ? {
      ...item.task,
      priority: item.task.priority || 'medium' 
    } : item.task
  }));
};

/**
 * Fetches feed data for a specific user.
 * @param userID The ID of the user to fetch feed data for.
 * @param filters Optional additional filters.
 * @returns A promise that resolves to an array of feed items.
 */
export const fetchUserFeedData = async (userID: string, filters: Omit<FeedFilters, 'userID'> = {}): Promise<FeedItem[]> => {
  const token = await getClerkToken();
  if (!token) throw new ApiError("Authentication token not found. Please log in.", 401);
  if (!userID) throw new ApiError("User ID is required to fetch user feed data.", 400);

  const queryParams = new URLSearchParams();
  if (filters.timeFilter && filters.timeFilter !== 'all') queryParams.append('timeFilter', filters.timeFilter);
  if (filters.activityFilter && filters.activityFilter !== 'all') queryParams.append('activityFilter', filters.activityFilter);
  if (filters.groupID) queryParams.append('groupID', filters.groupID);
  if (filters.limit) queryParams.append('limit', filters.limit.toString());
  if (filters.offset) queryParams.append('offset', filters.offset.toString());
  const url = `${API_BASE_URL}/feed/user/${userID}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  const feedData = await handleApiResponse(response);
  
  const feedItems = feedData.data || feedData;
  
  return feedItems.map((item: any) => ({
    ...item,
    timestamp: new Date(item.timestamp),
    user: {
      id: item.user.id || item.user._id || 'unknown',
      name: item.user.name,
      avatar: item.user.avatar
    },
    task: item.task && item.task.completedAt ? {
      ...item.task,
      priority: item.task.priority || 'medium', 
      completedAt: new Date(item.task.completedAt)
    } : item.task ? {
      ...item.task,
      priority: item.task.priority || 'medium' 
    } : item.task
  }));
};

/**
 * Fetches activity count summary for a group or general feed.
 * @param groupID Optional group ID to get activity count for a specific group.
 * @param timeFilter Time filter for the activity count (defaults to 'today').
 * @returns A promise that resolves to activity count data.
 */
export const fetchActivityCount = async (
  groupID?: string, 
  timeFilter: 'today' | 'week' | 'month' = 'today'
): Promise<{ moodCount: number; taskCount: number; totalCount: number }> => {
  const token = await getClerkToken();
  if (!token) throw new ApiError("Authentication token not found. Please log in.", 401);

  const queryParams = new URLSearchParams();
  queryParams.append('timeFilter', timeFilter);

  let url: string;  if (groupID) {
    url = `${API_BASE_URL}/feed/group/${groupID}/activity-summary?${queryParams.toString()}`;
  } else {
    url = `${API_BASE_URL}/feed/activity-summary?${queryParams.toString()}`;
  }
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const activityData = await handleApiResponse(response);
  
  // Backend returns data in { success, data } format, extract the data
  return activityData.data || activityData;
};

/**
 * Updates a user's mood and body status with single values
 * @param userID The user ID
 * @param mood The new mood value (single mood)
 * @param body The new body value (single body type)
 * @returns A promise that resolves to the updated mood and body data
 */
export const updateUserMood = async (
  userID: string, 
  mood: 'happy' | 'excited' | 'sad' | 'angry' | 'nervous' | 'peaceful',
  body: 'energized' | 'sore' | 'tired' | 'sick' | 'relaxed' | 'tense'
): Promise<{ success: boolean; message: string; data: any }> => {
  const token = await getClerkToken();
  if (!token) throw new ApiError("Authentication token not found. Please log in.", 401);
  const url = `${API_BASE_URL}/feed/update-mood/${userID}`;
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ mood, body }),
  });

  return await handleApiResponse(response);
};

/**
 * Updates existing daily mood/body status for a user
 * @param userID The ID of the user
 * @param mood The mood value to update
 * @param body The body feeling value to update
 * @returns Promise resolving to the updated status data
 */
export const updateDailyStatus = async (userID: string, mood: string, body: string) => {
  const token = await getClerkToken();
  if (!token) throw new ApiError("Authentication token not found. Please log in.", 401);

  const response = await fetch(`${API_BASE_URL}/daily/update/${userID}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ mood, body }),
  });

  return await handleApiResponse(response);
};

/**
 * Submits new daily mood/body status for a user  
 * @param userID The ID of the user
 * @param mood The mood value to submit
 * @param body The body feeling value to submit
 * @returns Promise resolving to the submitted status data
 */
export const submitDailyStatus = async (userID: string, mood: string, body: string) => {
  const token = await getClerkToken();
  if (!token) throw new ApiError("Authentication token not found. Please log in.", 401);

  const response = await fetch(`${API_BASE_URL}/daily/submit/${userID}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ mood, body }),
  });

  return await handleApiResponse(response);
};

/**
 * Checks if user has already submitted daily status for today
 * @param userID The ID of the user
 * @returns Promise resolving to boolean indicating if status was submitted today
 */
export const checkTodayStatus = async (userID: string) => {
  const token = await getClerkToken();
  if (!token) throw new ApiError("Authentication token not found. Please log in.", 401);

  const response = await fetch(`${API_BASE_URL}/daily/check/${userID}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await handleApiResponse(response);
  return data.hasSubmittedToday;
};

/**
 * Fetches all groups that a user belongs to.
 * @param userID The ID of the user to fetch groups for.
 * @returns A promise that resolves to an array of group objects.
 */
export const fetchUserGroups = async (userID: string): Promise<any[]> => {
  const token = await getClerkToken();
  if (!token) throw new ApiError("Authentication token not found. Please log in.", 401);
  if (!userID) throw new ApiError("User ID is required to fetch user groups.", 400);

  try {
    const url = `${API_BASE_URL}/groups/user/${userID}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    const groups = await handleApiResponse(response);
    
    if (groups && groups.length > 0) {
      return groups;
    }
        
    const allGroupsUrl = `${API_BASE_URL}/groups`;
    const allGroupsResponse = await fetch(allGroupsUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    const allGroups = await handleApiResponse(allGroupsResponse);
    
    if (allGroups && allGroups.length > 0) {
      const userGroups = allGroups.filter((group: any) => {
        return group.members && group.members.some((member: any) => 
          member.user && member.user.toString() === userID
        );
      });
      
      if (userGroups.length > 0) {
        return userGroups;
      }
    }
    
    const userUrl = `${API_BASE_URL}/users/${userID}/group`;
    const userResponse = await fetch(userUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    const userGroupData = await handleApiResponse(userResponse);
    
    if (userGroupData && userGroupData.groupID) {
      const groupUrl = `${API_BASE_URL}/groups/${userGroupData.groupID}`;
      const groupResponse = await fetch(groupUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const groupDetails = await handleApiResponse(groupResponse);
      return [groupDetails]; 
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching user groups:', error);
    throw error;
  }
};
