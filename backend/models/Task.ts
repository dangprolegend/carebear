import mongoose, { Schema } from 'mongoose';
import { ITask } from '../types/models';

const taskSchema: Schema = new Schema({
  title: { type: String, required: true },

  groupID: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },   
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  status: { type: String, enum: ['pending', 'in-progress', 'done'], default: 'pending' },
  description: { type: String },
  deadline: { type: Date },
  reminder: {
    start_date: { type: Date },
    end_date: { type: Date },
    times_of_day: [{ type: String }], // Array of times in HH:MM format
    recurrence_rule: { type: String } // e.g., "FREQ=DAILY;INTERVAL=1" or "FREQ=WEEKLY;BYDAY=MO,WE,FR"
  },  
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  // Task tracking fields
  completedAt: { type: Date },
  acceptedAt: { type: Date },
  // Completion evidence fields
  completionMethod: { type: String, enum: ['manual', 'photo', 'input'] },
  completionNotes: { type: String },
  evidenceUrl: { type: String },
  // Task escalation field
  escalated: { type: Boolean, default: false }
}, {
  timestamps: true // Adds createdAt and updatedAt fields automatically
});

const Task = mongoose.model<ITask>('Task', taskSchema);
export default Task;
