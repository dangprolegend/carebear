import mongoose, { Schema } from 'mongoose';
import { IGroup } from '../types/models';

const groupSchema: Schema = new Schema({
  name: { type: String, required: true },
  numberOfMembers: { type: Number, default: 0 },
  members: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      role: { type: String, enum: ['admin', 'carereceiver', 'caregiver'], required: true },
      familialRelation: { type: String, required: false }, // e.g., "Mother", "Grandfather", "Daughter"
    },
  ],
  pendingInvitations: [
    {
      email: { type: String, required: true },
      role: { type: String, enum: ['admin', 'carereceiver', 'caregiver'], required: true },
      familialRelation: { type: String, required: false },
      invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      invitedAt: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

const Group = mongoose.model<IGroup>('Group', groupSchema);
export default Group;