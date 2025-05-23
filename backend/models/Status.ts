import mongoose from "mongoose";

const statusEntrySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  mood: {
    type: String,
    required: true,
    enum: ['happy', 'excited', 'sad', 'angry', 'nervous', 'peaceful']
  },
  body: {
    type: String,
    required: true,
    enum: ['energized', 'sore', 'tired', 'sick', 'relaxed', 'tense']
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: true }); // Keep _id for individual status entries

const Status = mongoose.model('Status', statusEntrySchema);
export default Status;