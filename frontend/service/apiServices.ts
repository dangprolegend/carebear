import { Task as FrontendTaskType } from '../app/(protected)/dashboard/mydashboard/task'; 

const API_BASE_URL = "https://df27-222-253-53-128.ngrok-free.app" ; 


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
  assignedTo?: { _id: string; name?: string; email?: string } | null;
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
}

// Payload for AI-task-generate
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

// --- Helper: Generic API Error Handling & Response Mapping ---
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

// --- Helper: Task Data Mapping ---
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

export const fetchTasksForDashboard = async (groupID?: string): Promise<FrontendTaskType[]> => {
  const token = await getClerkToken();
  if (!token) throw new ApiError("Authentication token not found. Please log in.", 401);

  let url = `${API_BASE_URL}/api/tasks`;
  if (groupID) {
    url = `${API_BASE_URL}/api/tasks/group/${groupID}`; 
  } else {
    console.warn("fetchTasksForDashboard: groupID not provided, calling general tasks endpoint.");
  }

  console.log(`Workspaceing tasks from: ${url}`);
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