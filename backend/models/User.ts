import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '../types/models';

const UserSchema: Schema = new Schema({
  username: { type: String, unique: true, sparse: true }, 
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  image: String,
}, { timestamps: true });

// Pre-save hook to generate username if not provided
UserSchema.pre<IUser>('save', function(next) {
  if (!this.username) {
    // Generate username based on name and random string for uniqueness
    const namePart = this.name?.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10) || '';
    const randomPart = Math.random().toString(36).substring(2, 8);
    this.username = `${namePart}_${randomPart}`;
  }
  next();
});

const User = mongoose.model<IUser>('User', UserSchema);
export default User;