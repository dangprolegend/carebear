import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
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

const Member = mongoose.model('Member', memberSchema);
export default Member;