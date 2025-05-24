import mongoose, { Schema } from 'mongoose';

const statusEntrySchema = new Schema({
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

const dailyStatusSchema = new Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // One document per user
  },
  statusHistory: [statusEntrySchema],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Define TypeScript interfaces for statics
interface DailyStatusModel extends mongoose.Model<any> {
  getTodayDate(): Date;
  hasUserSubmittedToday(userID: mongoose.Types.ObjectId): Promise<boolean>;
  getTodayStatus(userID: mongoose.Types.ObjectId): Promise<any>;
}

// Method to get today's date in YYYY-MM-DD format
dailyStatusSchema.statics.getTodayDate = function(this: mongoose.Model<any>) {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
};

// Method to check if user has submitted status today
dailyStatusSchema.statics.hasUserSubmittedToday = async function(this: mongoose.Model<any>, userID: mongoose.Types.ObjectId) {
  const todayStart = (this as any).getTodayDate();
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const userStatus = await this.findOne({
    userID,
    'statusHistory.date': {
      $gte: todayStart,
      $lt: todayEnd
    }
  });

  return !!userStatus;
};

// Method to get today's status for a user
dailyStatusSchema.statics.getTodayStatus = async function(this: mongoose.Model<any>, userID: mongoose.Types.ObjectId) {
  const todayStart = (this as any).getTodayDate();
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const userStatus = await this.findOne(
    {
      userID,
      'statusHistory.date': {
        $gte: todayStart,
        $lt: todayEnd
      }
    },
    {
      'statusHistory.$': 1 // Only return the matching status entry
    }
  );

  return userStatus?.statusHistory[0] || null;
};

const Daily = mongoose.model('Daily', dailyStatusSchema);
export default Daily;