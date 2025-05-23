import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  username?: string; // Optional since it can be auto-generated
  email: string;
  name?: string;
  image?: string;
  clerkID: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date;
  gender?: 'Female' | 'Male';  weight?: string;
  height?: string;
  groupID?: Types.ObjectId | string;
<<<<<<< HEAD
  role: 'admin' | 'caregiver' | 'carereceiver';
=======
>>>>>>> 2f10c3a (refactor group and remove membertable)
  pushToken?: string;
  pushNotificationsEnabled?: boolean;
  phoneNumber?: string;
  smsAlertsEnabled?: boolean;
}

export interface IGroup extends Document {
  name: string;
<<<<<<< HEAD
  numberOfMembers?: number;
=======
  numberOfMembers: number;
>>>>>>> 2f10c3a (refactor group and remove membertable)
  members: {
    user: Types.ObjectId | string;
    role: 'admin' | 'caregiver' | 'carereceiver';
  }[];
<<<<<<< HEAD
}

export interface IMember extends Document {
  userID: Types.ObjectId | string; // Reference to User _id
  groupID: Types.ObjectId | string; // Reference to Group _id
  role: 'admin' | 'caregiver' | 'carereceiver';
=======
>>>>>>> 2f10c3a (refactor group and remove membertable)
}

export interface IReminder_setup {
  start_date?: Date;
  end_date?: Date;
  times_of_day?: string[]; // Array of times in HH:MM format
  recurrence_rule?: string; // e.g., "FREQ=DAILY;INTERVAL=1" or "FREQ=WEEKLY;BYDAY=MO,WE,FR"
}

export interface ITask extends Document {
  title: string;
  group: Types.ObjectId | string; // Reference to Group _id
  user: Types.ObjectId | string; // Reference to User _id

  assignedBy: Types.ObjectId | string; // Reference to User _id
  assignedTo?: Types.ObjectId | string; // Reference to User _id
  status: 'pending' | 'in-progress' | 'done';
  description: string;
  deadline?: Date;
  reminder?: IReminder_setup;
  priority: 'low' | 'medium' | 'high';
  completedAt?: Date;
  acceptedAt?: Date;
  completionMethod?: 'manual' | 'photo' | 'input';
  completionNotes?: string;
  evidenceUrl?: string;
  escalated?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface INotification extends Document {
  user: Types.ObjectId | string; // Reference to User _id
  task: Types.ObjectId | string; // Reference to Task _id
  createdAt: Date;
}

export interface IDashboard extends Document {
  user: Types.ObjectId | string; // Reference to User _id
  task: Types.ObjectId | string; // Reference to Task _id
  metric_value: number;
  created_timestamp: Date;
}
