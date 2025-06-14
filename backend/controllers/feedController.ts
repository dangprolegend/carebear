import { Response } from 'express';
import { TypedRequest, UserRequest } from '../types/express';
import { getFeedData, getGroupFeedData, getUserFeedData, getActivityCount, FeedFilters } from '../services/feedService';

interface FeedQueryParams {
  timeFilter?: 'today' | 'week' | 'month' | 'all';
  activityFilter?: 'mood' | 'task' | 'all';
  limit?: string;
  offset?: string;
}

interface GroupFeedParams {
  userID: string;
  groupID: string;
}

interface UserFeedParams {
  userID: string;
  targetUserID: string;
}

interface ActivityCountParams {
  userID: string;
  groupID?: string;
}

interface ActivityCountQueryParams {
  timeFilter?: 'today' | 'week' | 'month';
}

/**
 * Get all activities for the requesting user (from their groups)
 */
export const getFeed = async (
  req: TypedRequest<{}, { userID: string }> & { query: FeedQueryParams },
  res: Response
): Promise<void> => {
  try {
    const { userID } = req.params;
    const { timeFilter, activityFilter, limit, offset } = req.query;
    
    const filters: FeedFilters = {
      timeFilter: timeFilter || 'all',
      activityFilter: activityFilter || 'all',
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
      requestingUserID: userID  // Add requesting user ID for access control
    };

    const feedData = await getFeedData(filters);

    res.status(200).json({
      success: true,
      data: feedData,
      pagination: {
        limit: filters.limit,
        offset: filters.offset,
        total: feedData.length
      }
    });

  } catch (error: any) {
    console.error('Error fetching feed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feed data',
      error: error.message
    });
  }
};

/**
 * Get feed data for a specific group (with access control)
 */
export const getGroupFeed = async (
  req: TypedRequest<{}, GroupFeedParams> & { query: FeedQueryParams },
  res: Response
): Promise<void> => {
  try {
    const { userID, groupID } = req.params;
    const { timeFilter, activityFilter, limit, offset } = req.query;
    
    const filters: FeedFilters = {
      timeFilter: timeFilter || 'all',
      activityFilter: activityFilter || 'all',
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
      groupID: groupID,
      requestingUserID: userID  // Add requesting user ID for access control
    };

    const feedData = await getFeedData(filters);

    res.status(200).json({
      success: true,
      data: feedData,
      pagination: {
        limit: filters.limit,
        offset: filters.offset,
        total: feedData.length
      },
      groupID
    });

  } catch (error: any) {
    console.error('Error fetching group feed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch group feed data',
      error: error.message
    });
  }
};

/**
 * Get feed data for a specific user (with access control)
 */
export const getUserFeed = async (
  req: TypedRequest<{}, UserFeedParams> & { query: FeedQueryParams },
  res: Response
): Promise<void> => {
  try {
    const { userID, targetUserID } = req.params;
    const { timeFilter, activityFilter, limit, offset } = req.query;
    
    const filters: FeedFilters = {
      timeFilter: timeFilter || 'all',
      activityFilter: activityFilter || 'all',
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
      userID: targetUserID,
      requestingUserID: userID  // Add requesting user ID for access control
    };

    const feedData = await getFeedData(filters);

    res.status(200).json({
      success: true,
      data: feedData,
      pagination: {
        limit: filters.limit,
        offset: filters.offset,
        total: feedData.length
      },
      userID: targetUserID
    });

  } catch (error: any) {
    console.error('Error fetching user feed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user feed data',
      error: error.message
    });
  }
};

/**
 * Get activity count for dashboard (with access control)
 */
export const getActivitySummary = async (
  req: TypedRequest<{}, ActivityCountParams> & { query: ActivityCountQueryParams },
  res: Response
): Promise<void> => {
  try {
    const { userID, groupID } = req.params;
    const { timeFilter } = req.query;
    
    const activityCount = await getActivityCount(groupID, timeFilter || 'today', userID);

    res.status(200).json({
      success: true,
      data: activityCount,
      timeFilter: timeFilter || 'today',
      groupID: groupID || null
    });

  } catch (error: any) {
    console.error('Error fetching activity summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity summary',
      error: error.message
    });
  }
};

/**
 * Update user's mood for today (called from feed "Update Mood" button)
 */
export const updateMood = async (
  req: TypedRequest<{ mood: string; body: string }, { userID: string }>,
  res: Response
): Promise<void> => {
  try {
    const { mood, body } = req.body;
    const { userID } = req.params;

    // Import the Daily model and use the same logic as dailyController
    const Daily = require('../models/Daily').default;

    // Validate required fields
    if (!mood || typeof mood !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Mood is required and must be a string'
      });
      return;
    }

    if (!body || typeof body !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Body is required and must be a string'
      });
      return;
    }

    const validMoods = ['happy', 'excited', 'sad', 'angry', 'nervous', 'peaceful'];
    const validBodyTypes = ['energized', 'sore', 'tired', 'sick', 'relaxed', 'tense'];
    
    if (!validMoods.includes(mood)) {
      res.status(400).json({
        success: false,
        message: 'Invalid mood value'
      });
      return;
    }

    if (!validBodyTypes.includes(body)) {
      res.status(400).json({
        success: false,
        message: 'Invalid body value'
      });
      return;
    }

    const todayDate = Daily.getTodayDate();
    
    // Find user's daily status document
    const userStatus = await Daily.findOne({ userID: userID });
    
    if (!userStatus) {
      res.status(404).json({
        success: false,
        message: 'No daily status found for user. Please submit initial daily status first.'
      });
      return;
    }

    // Find today's status entry
    const todayIndex = userStatus.statusHistory.findIndex((status: any) => 
      status.date.getTime() === todayDate.getTime()
    );

    if (todayIndex === -1) {
      res.status(404).json({
        success: false,
        message: 'No status found for today. Please submit initial daily status first.'
      });
      return;
    }    
    userStatus.statusHistory[todayIndex].mood = mood;
    userStatus.statusHistory[todayIndex].body = body;
    userStatus.statusHistory[todayIndex].timestamp = new Date();
    userStatus.lastUpdated = new Date();

    await userStatus.save();

    const updatedStatus = userStatus.statusHistory[todayIndex];

    res.status(200).json({
      success: true,
      message: 'Mood and body updated successfully',
      data: {
        id: updatedStatus._id,
        mood: updatedStatus.mood,
        body: updatedStatus.body,
        date: updatedStatus.date,
        timestamp: updatedStatus.timestamp
      }
    });

  } catch (error: any) {
    console.error('Error updating mood from feed:', error);    res.status(500).json({
      success: false,
      message: 'Failed to update mood and body',
      error: error.message
    });
  }
};
