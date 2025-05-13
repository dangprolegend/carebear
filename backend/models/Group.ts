import mongoose, { Schema } from 'mongoose';
import { IGroup } from '../types/models';

const groupSchema: Schema = new Schema({
  name: { type: String, required: true },
  numberOfMembers: { type: Number, default: 0 },
  members: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      role: { type: String, enum: ['admin', 'carereceiver', 'caregiver'], required: true },
    },
  ],
}, { timestamps: true });

const Group = mongoose.model<IGroup>('Group', groupSchema);
export default Group;