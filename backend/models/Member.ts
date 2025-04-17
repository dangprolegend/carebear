import mongoose, { Schema } from 'mongoose';
import { IMember } from '../types/models';

const memberSchema: Schema = new Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  groupID: {
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