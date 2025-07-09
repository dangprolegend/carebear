//@ts-nocheck
import mongoose from 'mongoose';

const stravaSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // 1 Strava account per user
    index: true
  },
  accessToken: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  athlete: {
    id: Number,
    username: String,
    firstname: String,
    lastname: String,
    city: String,
    state: String,
    country: String,
    sex: String,
    premium: Boolean,
    summit: Boolean,
    profile_medium: String,
    profile: String,
    created_at: Date,
    updated_at: Date
  },
  scopes: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastSyncedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
stravaSchema.index({ userID: 1, isActive: 1 });

// Method to check if token is expired
stravaSchema.methods.isTokenExpired = function() {
  return new Date() >= this.expiresAt;
};

// Method to update tokens
stravaSchema.methods.updateTokens = function(tokenData) {
  this.accessToken = tokenData.access_token;
  this.refreshToken = tokenData.refresh_token;
  this.expiresAt = new Date(tokenData.expires_at * 1000);
  if (tokenData.athlete) {
    this.athlete = tokenData.athlete;
  }
  this.lastSyncedAt = new Date();
  return this.save();
};

// Static method to find by userId
stravaSchema.statics.findByUserId = function(userId) {
  return this.findOne({ userID, isActive: true });
};

const Strava = mongoose.model('Strava', stravaSchema);

export default Strava;