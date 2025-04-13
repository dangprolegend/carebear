import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: String,
  image: String,
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
export default User;
