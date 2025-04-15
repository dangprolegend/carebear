import mongoose, { Schema } from 'mongoose';
import { INotification } from '../types/models';

const notificationSchema: Schema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model<INotification>('Notification', notificationSchema);
export default Notification;