//@ts-nocheck
import { Response } from 'express';
import { TypedRequest } from '../types/express';
import mongoose from 'mongoose';
import Daily from '../models/Daily';

interface StatusSubmitBody {
  mood: 'happy' | 'excited' | 'sad' | 'angry' | 'nervous' | 'peaceful';
  body: 'energized' | 'sore' | 'tired' | 'sick' | 'relaxed' | 'tense';
}

interface UserParams {
  userID: string;
}

interface StatusParams {
  userID: string;
  statusID?: string;
}

interface StatusQueryParams {
  page?: string;
  limit?: string;
  days?: string;
}

// Submit daily status
export const submitDailyStatus = async (
  req: TypedRequest<StatusSubmitBody, UserParams>, 
  res: Response
): Promise<void> => {
  try {
    const { mood, body } = req.body;
    const { userID } = req.params;

    // Validate required fields
    if (!mood || !body) {
      res.status(400).json({
        success: false,
        message: 'Both mood and body status are required'
      });
      return;
    }

    // Validate enum values
    const validMoods = ['happy', 'excited', 'sad', 'angry', 'nervous', 'peaceful'];
    const validBodyStates = ['energized', 'sore', 'tired', 'sick', 'relaxed', 'tense'];

    if (!validMoods.includes(mood) || !validBodyStates.includes(body)) {
      res.status(400).json({
        success: false,
        message: 'Invalid mood or body status value'
      });
      return;
    }

    // Check if user already submitted today
    const hasSubmitted = await Daily.hasUserSubmittedToday(userID);
    if (hasSubmitted) {
      res.status(409).json({
        success: false,
        message: 'Daily status already submitted for today'
      });
      return;
    }

    const todayDate = Daily.getTodayDate();
    const newStatusEntry = {
      date: todayDate,
      mood,
      body,
      timestamp: new Date()
    };

    // Find existing user document and add status, or create new one
    const userStatus = await Daily.findOneAndUpdate(
      { userID: userID },
      {
        $push: { statusHistory: newStatusEntry },
        $set: { lastUpdated: new Date() }
      },
      { new: true, upsert: true }
    );

    // Get the newly added status entry
    const addedStatus = userStatus.statusHistory[userStatus.statusHistory.length - 1];

    res.status(201).json({
        id: addedStatus._id,
        mood: addedStatus.mood,
        body: addedStatus.body,
        date: addedStatus.date,
        timestamp: addedStatus.timestamp
    });

  } catch (err: any) {
    console.error('Error submitting daily status:', err);
    res.status(500).json({ error: err.message });
  }
};

// Check if user has submitted status today
export const checkTodayStatus = async (
  req: TypedRequest<any, UserParams>, 
  res: Response
): Promise<void> => {
  try {
    const { userID } = req.params;
    const hasSubmitted = await Daily.hasUserSubmittedToday(userID);

    res.json({
      hasSubmittedToday: hasSubmitted
    });

  } catch (err: any) {
    console.error('Error checking daily status:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get today's status for user
export const getTodayStatus = async (
  req: TypedRequest<any, UserParams>, 
  res: Response
): Promise<void> => {
  try {
    const { userID } = req.params;
    const todayStatus = await Daily.getTodayStatus(userID);

    if (!todayStatus) {
      res.status(404).json({
        success: false,
        message: 'No status found for today'
      });
      return;
    }

    res.json({
        id: todayStatus._id,
        mood: todayStatus.mood,
        body: todayStatus.body,
        date: todayStatus.date,
        timestamp: todayStatus.timestamp
    });

  } catch (err: any) {
    console.error('Error getting today\'s status:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get status history for user (with pagination)
export const getStatusHistory = async (
  req: TypedRequest<any, UserParams, StatusQueryParams>, 
  res: Response
): Promise<void> => {
  try {
    const { userID } = req.params;
    const page = parseInt(req.query.page || '1');
    const limit = parseInt(req.query.limit || '30');
    const skip = (page - 1) * limit;

    const userStatus = await Daily.findOne({ userID: userID });
    
    if (!userStatus || !userStatus.statusHistory.length) {
      res.json({
        data: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalRecords: 0,
          hasNextPage: false,
          hasPrevPage: false
        }
      });
      return;
    }

    // Sort by date descending (most recent first)
    const sortedHistory = userStatus.statusHistory
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(skip, skip + limit);

    const total = userStatus.statusHistory.length;

    res.json({
      data: sortedHistory,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });

  } catch (err: any) {
    console.error('Error getting status history:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get status statistics for user (for daily streaks and could be helpful for future AI analysis)
export const getStatusStats = async (
  req: TypedRequest<any, UserParams, StatusQueryParams>, 
  res: Response
): Promise<void> => {
  try {
    const { userID } = req.params;
    const days = parseInt(req.query.days || '7');
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const userStatus = await Daily.findOne({ userID: userID });
    
    if (!userStatus) {
      res.json({
          period: `${days} days`,
          totalEntries: 0,
          moodDistribution: {},
          bodyDistribution: {},
          recentEntries: []
      });
      return;
    }

    // Filter status history for the specified period
    const recentStatuses = userStatus.statusHistory.filter(status => 
      new Date(status.date) >= startDate
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate statistics
    const moodStats: Record<string, number> = {};
    const bodyStats: Record<string, number> = {};
    
    recentStatuses.forEach(status => {
      moodStats[status.mood] = (moodStats[status.mood] || 0) + 1;
      bodyStats[status.body] = (bodyStats[status.body] || 0) + 1;
    });

    res.json({
        period: `${days} days`,
        totalEntries: recentStatuses.length,
        moodDistribution: moodStats,
        bodyDistribution: bodyStats,
        recentEntries: recentStatuses.slice(-5)
    });

  } catch (err: any) {
    console.error('Error getting status statistics:', err);
    res.status(500).json({ error: err.message });
  }
};
