import { Task as FrontendTaskType } from '../app/(protected)/dashboard/mydashboard/task';

const API_BASE_URL = "https://dd41-2402-800-61ae-d326-5c64-a276-ac20-aadc.ngrok-free.app";

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
    type: bt.type ||
      (bt.title.toLowerCase().includes("appointment") ? "appointment" :
        bt.title.toLowerCase().includes("medication") || bt.title.toLowerCase().includes("pill") || bt.title.toLowerCase().includes("tablet") ? "medication" : undefined),
    detail: taskDetail,
    subDetail: taskSubDetail,
    checked: bt.status === 'done',
    priority: bt.priority,
    status: bt.status,
    assignedTo: bt.assignedTo,
    assignedBy: bt.assignedBy,
    reminder: bt.reminder,
    image: bt.image,
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
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/clerk/${clerkID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch backend user ID: ${response.statusText}`);
    }

    const user = await response.json();
    return user.userID;
  } catch (error) {
    console.error("Error fetching backend user ID:", error);
    throw new Error("Unable to retrieve backend user ID");
  }
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
    console.log("Fetched tasks:", backendTasks);
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
  const token = await getClerkToken();
  if (!token) throw new ApiError("Authentication token not found. Please log in.", 401);
  if (!taskID) throw new ApiError("Task ID is required to update a task.", 400);
  const url = `${API_BASE_URL}/api/tasks/${taskID}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const updatedBackendTask: BackendTask = await handleApiResponse(response);
  return mapBackendTaskToFrontend(updatedBackendTask);
};

export const updateTaskWithImage = async (
  taskID: string,
  payload: Partial<BackendTask> & { image?: string }
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
  const token = await getClerkToken();
  if (!token) throw new ApiError("Authentication token not found. Please log in.", 401);
  if (!groupID) throw new ApiError("Group ID is required to fetch users.", 400);
  const url = `${API_BASE_URL}/api/groups/${groupID}/users`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
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