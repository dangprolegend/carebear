import mongoose, { Schema } from 'mongoose';
import { IMember } from '../types/models';

const memberSchema: Schema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'caregiver', 'carereceiver']}
});

const Member = mongoose.model<IMember>('Member', memberSchema);
export default Member;