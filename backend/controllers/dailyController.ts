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