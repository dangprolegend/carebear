import { Task as FrontendTaskType } from '../app/(protected)/dashboard/mydashboard/task';


// Throttling mechanism to prevent rate limiting
const requestThrottles: Record<string, { lastRequest: number; pendingPromise: Promise<any> | null }> = {};

/**
 * Throttles API requests to the same endpoint to prevent rate limiting
 * @param key A unique key for the endpoint/request type
 * @param minInterval Minimum time between requests in milliseconds (default: 1000ms)
 * @param requestFn The function that makes the actual API request
 */
const throttleRequest = async <T>(
  key: string, 
  requestFn: () => Promise<T>, 
  minInterval: number = 1000
): Promise<T> => {
  const now = Date.now();
  const throttleData = requestThrottles[key] || { lastRequest: 0, pendingPromise: null };
  
  // If there's already a pending request for this key, return its promise
  if (throttleData.pendingPromise) {
    return throttleData.pendingPromise;
  }

  // Calculate time since last request
  const timeSinceLastRequest = now - throttleData.lastRequest;
  
  // If we need to wait, set a delay
  const timeToWait = Math.max(0, minInterval - timeSinceLastRequest);
  
  let resolvePromise: (value: T) => void;
  let rejectPromise: (reason: any) => void;
  
  // Create a new promise that will be resolved after the request completes
  const promise = new Promise<T>((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });
  
  // Store the promise in the throttle data
  requestThrottles[key] = { 
    lastRequest: now + timeToWait, 
    pendingPromise: promise 
  };

  try {
    // Wait if needed before making the request
    if (timeToWait > 0) {
      await new Promise(resolve => setTimeout(resolve, timeToWait));
    }
    
    // Make the actual request
    const result = await requestFn();
    resolvePromise!(result);
    return result;
  } catch (error) {
    // Handle rate limiting errors by adding additional delay for subsequent requests
    if (error instanceof ApiError && error.isRateLimitError && error.retryAfter) {
      const retryTime = error.retryAfter * 1000; // Convert to milliseconds
      console.log(`Rate limited. Setting next request to wait at least ${retryTime/1000}s`);
      requestThrottles[key].lastRequest = now + retryTime;
    }
    
    rejectPromise!(error);
    throw error;
  } finally {
    // Clear the pending promise
    requestThrottles[key].pendingPromise = null;
  }
};

const API_BASE_URL = "https://carebear-carebearvtmps-projects.vercel.app";


console.log("apiService.ts: Using API Base URL:", API_BASE_URL);

let clerkAuthToken: string | null = null;

export const setClerkAuthTokenForApiService = (token: string | null) => {
  clerkAuthToken = token;
  console.log("apiService: Clerk token updated.");
};

const getClerkToken = async (): Promise<string | null> => {
  if (!clerkAuthToken) {
    console.warn("apiService: getClerkToken() - No Clerk token available. Using placeholder or returning null.");
  }
  return clerkAuthToken;
};

// Payload to retrieve all tasks
interface BackendTask {
  _id: string;
  title: string;
  description?: string;
  groupID: string | { _id: string; name?: string };
  assignedBy: { _id: string; name?: string; email?: string };
  assignedTo?: { _id: string; name?: string; email?: string } | string | null;
  status: 'pending' | 'in-progress' | 'done';
  reminder?: {
    start_date?: string;
    end_date?: string | null;
    times_of_day?: string[];
    recurrence_rule?: string | null;
  };
  priority: 'low' | 'medium' | 'high' | null;
  createdAt: string;
  updatedAt: string;
  type?: string;
  image?: string | null;
  evidenceUrl?: string | null;
  completionMethod?: 'manual' | 'photo' | 'input';
}

interface AiGenerateTasksPayload {
  groupID: string;
  userID: string;
  prompt_text?: string;
  image_base64?: string;
}

interface AiGenerateTasksResponse {
  message: string;
  tasks: BackendTask[];
}

class ApiError extends Error {
  status?: number;
  data?: any;
  retryAfter?: number;
  isRateLimitError: boolean;
  
  constructor(message: string, status?: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.isRateLimitError = status === 429;
    
    // Extract retry-after information if it exists
    if (status === 429) {
      if (data && data.retryAfter) {
        this.retryAfter = data.retryAfter;
      } else if (data && data.errors && data.errors[0] && data.errors[0].code === "too_many_requests") {
        // Try to parse retry time from error message
        const message = data.errors[0].message;
        const retryMatch = message.match(/try again in (\d+)/i);
        if (retryMatch && retryMatch[1]) {
          this.retryAfter = parseInt(retryMatch[1], 10);
        }
      }
    }
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
    
    // Special handling for rate limit errors (429)
    if (response.status === 429) {
      console.error(`Rate limit exceeded (429): ${errorMessage}`);
      
      // Get retry-after header if available
      const retryAfter = response.headers.get('retry-after') || responseData?.retryAfter;
      if (retryAfter) {
        console.log(`Retry after ${retryAfter} seconds`);
      }
      
      // Format a more user-friendly message
      let userMessage = "Too many requests. Please try again later.";
      if (retryAfter) {
        const seconds = parseInt(retryAfter, 10);
        if (seconds < 60) {
          userMessage = `Too many requests. Please try again in ${seconds} seconds.`;
        } else if (seconds < 3600) {
          userMessage = `Too many requests. Please try again in ${Math.ceil(seconds / 60)} minutes.`;
        } else {
          userMessage = `Too many requests. Please try again in ${Math.ceil(seconds / 3600)} hours.`;
        }
      }
      
      throw new ApiError(userMessage, response.status, responseData);
    } else {
      console.error(`API Error (${response.status}):`, errorMessage, "Response Data:", responseData);
      throw new ApiError(errorMessage, response.status, responseData);
    }
  }
  return responseData;
};

const mapBackendTaskToFrontend = (bt: BackendTask): FrontendTaskType => {
  let taskDatetime = new Date().toISOString();
  let taskDetail = '';
  let taskSubDetail = '';

  if (bt.reminder) {
    if (bt.reminder.start_date) {
      const startDate = new Date(bt.reminder.start_date);
      if (bt.reminder.times_of_day && bt.reminder.times_of_day.length > 0) {
        const [hours, minutes] = bt.reminder.times_of_day[0].split(':');
        startDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
      } else {
        startDate.setHours(0, 0, 0, 0);
      }
      taskDatetime = startDate.toISOString();
    }
    taskDetail = bt.reminder.times_of_day?.join(' & ') || 'Anytime';
    taskSubDetail = bt.reminder.recurrence_rule && bt.reminder.recurrence_rule !== "NONE"
      ? bt.reminder.recurrence_rule
      : '';
  }

  return {
    _id: bt._id,
    title: bt.title,
    description: bt.description,
    datetime: taskDatetime,
    groupID: bt.groupID,
    // Add this fix to apiServices.ts, in the mapBackendTaskToFrontend function
    type: bt.type ||
      (bt.title && bt.title.toLowerCase().includes("appointment") ? "appointment" :
      bt.title && (bt.title.toLowerCase().includes("medication") || 
                    bt.title.toLowerCase().includes("pill") || 
                    bt.title.toLowerCase().includes("tablet")) ? "medication" : 
      undefined),
    detail: taskDetail,
    subDetail: taskSubDetail,
    checked: bt.status === 'done',
    priority: bt.priority,
    status: bt.status,
    assignedTo: bt.assignedTo,
    assignedBy: bt.assignedBy,
    reminder: bt.reminder,
    image: bt.image,
    evidenceUrl: bt.evidenceUrl,
  } as FrontendTaskType;
};

let currentUserID: string | null = null;
let currentGroupID: string | null = null;

export const setCurrentUserIDForApiService = (userID: string | null) => {
  currentUserID = userID;
  console.log("apiService: UserID updated.", userID);
};

export const setCurrentGroupIDForApiService = (groupID: string | null) => {
  currentGroupID = groupID;
  console.log("apiService: GroupID updated.", groupID);
};

export const getCurrentUserID = () => currentUserID;
export const getCurrentGroupID = () => currentGroupID;

export const getBackendUserID = async (clerkID: string): Promise<string> => {
  return throttleRequest(`getBackendUserID:${clerkID}`, async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/clerk/${clerkID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        if (response.status === 429) {
          const data = await response.json();
          throw new ApiError(
            "Rate limit exceeded when retrieving user ID. Please try again later.",
            429,
            data
          );
        }
        throw new Error(`Failed to fetch backend user ID: ${response.statusText}`);
      }

      const user = await response.json();
      return user.userID;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error("Error fetching backend user ID:", error);
      throw new Error("Unable to retrieve backend user ID");
    }
  }, 2000); // Set a 2-second minimum interval between these requests
};

// Replace the existing getGroupID function with this improved version:

export const getGroupID = async (userID: string): Promise<string> => {
  try {
    console.log('getGroupID - Starting with userID:', userID);
    
    if (!userID || userID === 'undefined') {
      throw new Error('Invalid userID provided to getGroupID');
    }

    const response = await fetch(`${API_BASE_URL}/api/users/${userID}/group`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

      if (!response.ok) {
        if (response.status === 429) {
          const data = await response.json();
          throw new ApiError(
            "Rate limit exceeded when retrieving group ID. Please try again later.",
            429,
            data
          );
        }
        const errorText = await response.text();
      console.error('getGroupID - API Error:', response.status, errorText);
      throw new Error(`Failed to fetch group for user: ${response.statusText}`);
      }

    const group = await response.json();
    console.log('getGroupID - Group response:', group);
    
    const groupId = group.groupID || group._id || group.id;
    
    if (!groupId || groupId === 'undefined') {
      throw new Error('No valid group ID found in response');
    }
    
    console.log('getGroupID - Final groupID:', groupId);
    return groupId;
  } catch (error) {
    console.error("getGroupID - Error fetching group ID:", error);
    throw new Error("Unable to retrieve group ID");
  }
};

export const fetchTasksForDashboard = async (groupID: string): Promise<FrontendTaskType[]> => {
  try {
    const url = `${API_BASE_URL}/api/tasks/group/${groupID}`;
    console.log(`Fetching tasks from: ${url}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const backendTasks: BackendTask[] = await handleApiResponse(response);
    return backendTasks.map(mapBackendTaskToFrontend);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw new Error("Unable to retrieve tasks");
  }
};

export const processAndCreateAiTasksAPI = async (payload: AiGenerateTasksPayload): Promise<AiGenerateTasksResponse> => {
  const token = await getClerkToken();
  if (!token) throw new ApiError("Authentication token not found. Please log in.", 401);
  const groupID = payload.groupID || getCurrentGroupID();
  const userID = payload.userID || getCurrentUserID();
  if (!userID || !groupID) throw new ApiError("userID and groupID are required.", 400);
  const requestBody = {
    groupID,
    userID,
    prompt_text: payload.prompt_text,
    image_base64: payload.image_base64,
  };
  console.log(`Sending AI task generation request to: ${API_BASE_URL}/api/ai/suggest-tasks`);
  const response = await fetch(`${API_BASE_URL}/api/ai/suggest-tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(requestBody),
  });
  const responseData: AiGenerateTasksResponse = await handleApiResponse(response);
  return responseData;
};

export const updateTask = async (
  taskID: string,
  payload: Partial<BackendTask>
): Promise<FrontendTaskType> => {
  if (!taskID) throw new ApiError("Task ID is required to update a task.", 400);
  const url = `${API_BASE_URL}/api/tasks/${taskID}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const updatedBackendTask: BackendTask = await handleApiResponse(response);
  return mapBackendTaskToFrontend(updatedBackendTask);
};

export const updateTaskWithImage = async (
  taskID: string,
  payload: Partial<BackendTask> & { image?: string, evidenceUrl?: string }
): Promise<FrontendTaskType> => {
  if (!taskID) throw new ApiError("Task ID is required to update a task.", 400);
  
  // Make sure we're sending both image fields for compatibility
  const updatedPayload = { ...payload };
  if (payload.image && !payload.evidenceUrl) {
    updatedPayload.evidenceUrl = payload.image;
  } else if (payload.evidenceUrl && !payload.image) {
    updatedPayload.image = payload.evidenceUrl;
  }
  
  console.log("Updating task with image, payload keys:", Object.keys(updatedPayload));
  
  const url = `${API_BASE_URL}/api/tasks/${taskID}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedPayload),
  });
  const updatedBackendTask: BackendTask = await handleApiResponse(response);
  return mapBackendTaskToFrontend(updatedBackendTask);
};

export const deleteTask = async (
  taskID: string
): Promise<{ success: boolean; message: string }> => {
  if (!taskID) throw new ApiError("Task ID is required to delete a task.", 400);
  
  const url = `${API_BASE_URL}/api/tasks/${taskID}`;
  const response = await fetch(url, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      `Failed to delete task: ${response.statusText}`,
      response.status,
      errorData
    );
  }
  
  return { success: true, message: "Task deleted successfully" };
};

export const fetchRecentTasksForGroup = async (
  groupID: string,
  limit: number = 5
): Promise<FrontendTaskType[]> => {
  const token = await getClerkToken();
  if (!token) throw new ApiError("Authentication token not found. Please log in.", 401);
  if (!groupID) throw new ApiError("Group ID is required to fetch recent tasks.", 400);
  const url = `${API_BASE_URL}/api/tasks/group/${groupID}/recent?limit=${limit}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  const backendTasks: BackendTask[] = await handleApiResponse(response);
  return backendTasks.map(mapBackendTaskToFrontend);
};

export const createManualTaskAPI = async (
  payload: Partial<BackendTask>
): Promise<FrontendTaskType> => {
  const token = await getClerkToken();
  if (!token) throw new ApiError("Authentication token not found. Please log in.", 401);
  const url = `${API_BASE_URL}/api/tasks`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const createdBackendTask: BackendTask = await handleApiResponse(response);
  return mapBackendTaskToFrontend(createdBackendTask);
};

export const fetchUsersInGroup = async (groupID: string): Promise<any[]> => {
  if (!groupID) throw new ApiError("Group ID is required to fetch users.", 400);
  
  // Get the current user ID
  const userID = getCurrentUserID();
  if (!userID) throw new ApiError("User ID is required to fetch family members.", 400);
  
  // Use the familyMembers endpoint instead of the groups endpoint
  const url = `${API_BASE_URL}/api/users/${userID}/familyMembers?groupID=${groupID}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  });
  
  const users = await handleApiResponse(response);
  return users;
};

export const fetchUserInfoById = async (userID: string): Promise<any> => {
  if (!userID) throw new ApiError("User ID is required to fetch user info.", 400);
  const url = `${API_BASE_URL}/api/users/${userID}/info`;
  const response = await fetch(url, { method: 'GET' });
  return handleApiResponse(response);
};

export const fetchTaskById = async (
  taskID: string
): Promise<FrontendTaskType> => {
  if (!taskID) throw new ApiError("Task ID is required to fetch a task.", 400);
  const url = `${API_BASE_URL}/api/tasks/${taskID}`;
  const response = await fetch(url, { method: 'GET' });
  const backendTask: BackendTask = await handleApiResponse(response);
  
  // Log the complete task data to help with debugging
  console.log("Backend task raw data:", JSON.stringify(backendTask, null, 2));
  
  // Specifically log image-related fields
  console.log("Task image fields:", {
    hasImage: !!backendTask.image,
    hasEvidenceUrl: !!backendTask.evidenceUrl,
    imageType: backendTask.image ? typeof backendTask.image : null,
    evidenceUrlType: backendTask.evidenceUrl ? typeof backendTask.evidenceUrl : null,
    completionMethod: backendTask.completionMethod
  });
  
  return mapBackendTaskToFrontend(backendTask);
};

export const fetchUserNameByID = async (userID: string): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${userID}/info`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch user name: ${response.statusText}`);
    }
    const userData = await handleApiResponse(response);
    return userData.fullName || 'Unknown User';
  } catch (error) {
    console.error('Error fetching user name:', error);
    throw new Error('Unable to retrieve user name');
  }
};

export const markTaskAsRead = async (taskID: string, userID: string): Promise<void> => {
  try {
    const url = `${API_BASE_URL}/api/tasks/${taskID}/read`;
    console.log(`Marking task ${taskID} as read by user ${userID}`);
    
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userID }),
    });
  } catch (error) {
    console.error(`Error marking task ${taskID} as read:`, error);
  }
};

export const getUnreadTasksCount = async (userID: string, groupID: string): Promise<number> => {
  try {
    const url = `${API_BASE_URL}/api/tasks/user/${userID}/group/${groupID}/unread`;
    console.log(`Fetching unread tasks count for user ${userID} in group ${groupID}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await handleApiResponse(response);
    console.log('Unread tasks count:', data.count);
    return data.count;
  } catch (error) {
    console.error(`Error fetching unread tasks count:`, error);
    return 0; // Return 0 on error
  }
};

export const markAllTasksAsRead = async (userID: string, groupID: string): Promise<void> => {
  try {
    // Use the dedicated endpoint to mark all tasks as read in one go
    const url = `${API_BASE_URL}/api/tasks/user/${userID}/group/${groupID}/mark-all-read`;
    console.log(`Marking all tasks as read for user ${userID} in group ${groupID}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error(`Failed to mark all tasks as read: ${response.status}`);
      
      // Fallback to marking tasks one by one if the bulk endpoint fails
      console.log('Fallback: marking tasks individually');
      
      // Get all tasks for the group
      const groupTasksUrl = `${API_BASE_URL}/api/tasks/group/${groupID}`;
      const groupTasksResponse = await fetch(groupTasksUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!groupTasksResponse.ok) {
        console.error(`Failed to fetch group tasks: ${groupTasksResponse.status}`);
        return;
      }
      
      const groupTasksData = await groupTasksResponse.json();
      const tasks = groupTasksData.tasks || [];
      console.log(`Found ${tasks.length} tasks in group ${groupID}`);
      
      // Mark each task as read
      const markReadPromises = tasks.map((task: any) => 
        markTaskAsRead(task._id, userID)
      );
      
      await Promise.all(markReadPromises);
      console.log(`Marked ${tasks.length} tasks as read for user ${userID}`);
    } else {
      const data = await response.json();
      console.log(`Successfully marked all tasks as read: ${data.message || 'Success'}`);
    }
  } catch (error) {
    console.error(`Error marking all tasks as read:`, error);
  }
};




// Add these interfaces and function at the end of the file

interface GroupMember {
  user: string; // ObjectId as string
  role: 'admin' | 'caregiver' | 'carereceiver' | string;
  _id: string;
}

interface GroupData {
  _id: string;
  name: string;
  numberOfMembers: number;
  members: GroupMember[];
  createdAt: string;
  updatedAt: string;
}


// Replace the existing getUserRoleInGroup function with this improved version:

export const getUserRoleInGroup = async (userID: string): Promise<string> => {
  try {
    console.log('getUserRoleInGroup - Starting with userID:', userID);
    
    if (!userID || userID === 'undefined') {
      console.error('getUserRoleInGroup - Invalid userID:', userID);
      return 'member';
    }

    const token = await getClerkToken();
    
    // First get the user's group
    console.log('getUserRoleInGroup - Fetching group for userID:', userID);
    const groupID = await getGroupID(userID);
    console.log('getUserRoleInGroup - Received groupID:', groupID);
    
    if (!groupID || groupID === 'undefined' || groupID === undefined) {
      console.error('getUserRoleInGroup - Invalid groupID received:', groupID);
      return 'member';
    }
    
    // Then fetch the group details to get the role
    const url = `${API_BASE_URL}/api/groups/${groupID}`;
    console.log(`getUserRoleInGroup - Fetching group data from: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });
    
    if (!response.ok) {
      console.error('getUserRoleInGroup - API response not ok:', response.status, response.statusText);
      return 'member';
    }
    
    const groupData: GroupData = await handleApiResponse(response);
    console.log('getUserRoleInGroup - Group data received:', groupData);
    
    // Find the user's role in the members array
    const userMember = groupData.members.find(member => {
      console.log('Comparing member.user:', member.user, 'with userID:', userID);
      return member.user === userID;
    });
    
    const role = userMember?.role || 'member';
    console.log('getUserRoleInGroup - Final role:', role);
    
    return role;
  } catch (error) {
    console.error("getUserRoleInGroup - Error fetching user role:", error);
    return 'member'; // Default fallback
  }
};
// Update task status (skip/complete)
export const updateTaskStatus = async (taskID: string, status: 'pending' | 'in-progress' | 'done' | 'skipped'): Promise<FrontendTaskType> => {
  const token = await getClerkToken();
  if (!token) throw new ApiError("Authentication token not found. Please log in.", 401);
  
  const url = `${API_BASE_URL}/api/tasks/${taskID}/status`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  
  const updatedBackendTask: BackendTask = await handleApiResponse(response);
  return mapBackendTaskToFrontend(updatedBackendTask);
};

// Complete task with completion method
export const completeTaskWithMethod = async (taskID: string, method: 'manual' | 'photo' | 'input', notes?: string): Promise<FrontendTaskType> => {
  const token = await getClerkToken();
  if (!token) throw new ApiError("Authentication token not found. Please log in.", 401);
  
  const url = `${API_BASE_URL}/api/tasks/${taskID}/complete`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ 
      completionMethod: method,
      notes: notes || ''
    }),
  });
  
  const updatedBackendTask: BackendTask = await handleApiResponse(response);
  return mapBackendTaskToFrontend(updatedBackendTask);
};