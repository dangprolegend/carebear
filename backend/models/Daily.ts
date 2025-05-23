import mongoose from "mongoose";
import Status from "./Status";

const dailyStatusSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // One document per user
  },
  statusHistory: [Status.schema], // Array of status entries
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Daily = mongoose.model('Daily', dailyStatusSchema);
export default Daily;