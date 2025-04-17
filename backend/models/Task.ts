import mongoose, { Schema } from 'mongoose';
import { ITask } from '../types/models';

const taskSchema: Schema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' }, 
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'in-progress', 'done'], default: 'pending' },
  description: { type: String },
  deadline: { type: Date },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
});

const Task = mongoose.model<ITask>('Task', taskSchema);
export default Task;