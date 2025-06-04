import { Task as FrontendTaskType } from '../app/(protected)/dashboard/mydashboard/task';

// Define BackendTask type according to your backend API response structure
type BackendTask = {
  _id: string;
  title: string;
  description?: string;
  type?: string;
  priority?: string;
  status?: string;
  assignedTo?: string;
  assignedBy?: string;
  reminder?: {
    start_date?: string;
    times_of_day?: string[];
    recurrence_rule?: string;
  };
};

const API_BASE_URL = "https://0b8e-2402-800-61ae-d326-6494-772f-23df-fb01.ngrok-free.app";

console.log("apiService.ts: Using API Base URL:", API_BASE_URL);

// --- Helper: Generic API Error Handling ---
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
    const errorMessage =
      responseData?.error ||
      responseData?.message ||
      responseData ||
      `HTTP error ${response.status}`;
    console.error(
      `API Error (${response.status}):`,
      errorMessage,
      "Response Data:",
      responseData
    );
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
    taskSubDetail =
      bt.reminder.recurrence_rule && bt.reminder.recurrence_rule !== "NONE"
        ? bt.reminder.recurrence_rule
        : '';
  }

  return {
    _id: bt._id,
    title: bt.title,
    description: bt.description,
    datetime: taskDatetime,
    type:
      bt.type ||
      (bt.title.toLowerCase().includes("appointment")
        ? "appointment"
        : bt.title.toLowerCase().includes("medication") ||
          bt.title.toLowerCase().includes("pill") ||
          bt.title.toLowerCase().includes("tablet")
        ? "medication"
        : undefined),
    detail: taskDetail,
    subDetail: taskSubDetail,
    checked: bt.status === 'done',
    priority: bt.priority,
    status: bt.status,
    assignedTo: bt.assignedTo,
    assignedBy: bt.assignedBy,
  } as FrontendTaskType;
};

// --- API Functions ---
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
    return user.userID; // Assuming the backend user object contains `_id`
  } catch (error) {
    console.error("Error fetching backend user ID:", error);
    throw new Error("Unable to retrieve backend user ID");
  }
};

export const getGroupID = async (userID: string): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${userID}/group`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch group for user: ${response.statusText}`);
    }

    const group = await response.json();
    return group._id || group.id; // Assuming the group object contains `_id`
  } catch (error) {
    console.error("Error fetching group ID:", error);
    throw new Error("Unable to retrieve group ID");
  }
};

export const fetchTasksForDashboard = async (groupID: string): Promise<FrontendTaskType[]> => {
  try {
    const url = `${API_BASE_URL}/api/groups/${groupID}/tasks`;

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