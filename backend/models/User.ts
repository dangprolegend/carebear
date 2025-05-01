import mongoose, { Schema } from 'mongoose';

const UserSchema: Schema = new Schema({
  clerkID: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
  },
  imageURL: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
export default User;