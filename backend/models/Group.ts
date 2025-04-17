import mongoose, { Schema } from 'mongoose';
import { IGroup } from '../types/models';

const groupSchema: Schema = new Schema({
  name: { type: String, required: true },
});

const Group = mongoose.model<IGroup>('Group', groupSchema);
export default Group;