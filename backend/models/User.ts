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
  // New fields based on the registration screens
  dateOfBirth: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ['Female', 'Male', 'Non-binary'],
  },
  weight: {
    type: String, // Store as string including the unit (e.g., "70 kg" or "154 lb")
  },
  height: {
    type: String, // Store as string including the unit (e.g., "175 cm" or "5'9"")
  },
  groupID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
  },
  additionalGroups: [{
    groupID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group'
    }
  }],
  additionalGroups: [{
    groupID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
    },
  }]
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
export default User;