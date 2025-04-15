import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  username?: string; // Optional since it can be auto-generated
  email: string;
  name?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGroup extends Document {
  name: string;
}

export interface IMember extends Document {
  user: Types.ObjectId | string; // Reference to User _id
  group: Types.ObjectId | string; // Reference to Group _id
  role: 'admin' | 'caregiver' | 'carereceiver';
}

export interface ITask extends Document {
  user: Types.ObjectId | string; // Reference to User _id
  group: Types.ObjectId | string; // Reference to Group _id
  assignedBy: Types.ObjectId | string; // Reference to User _id
  assignedTo: Types.ObjectId | string; // Reference to User _id
  status: 'pending' | 'in-progress' | 'done';
  description: string;
  deadline?: Date;
  priority: 'low' | 'medium' | 'high';
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