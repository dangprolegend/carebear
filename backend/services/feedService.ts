import Daily from '../models/Daily';
import Task from '../models/Task';
import User from '../models/User';
import Group from '../models/Group';

export interface FeedItem {
  id: string;
  type: 'mood' | 'task';
  timestamp: Date;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  moods?: ('happy' | 'excited' | 'sad' | 'angry' | 'nervous' | 'peaceful')[];
  body?: ('energized' | 'sore' | 'tired' | 'sick' | 'relaxed' | 'tense')[];
  task?: {
    title: string;
    status: 'pending' | 'in-progress' | 'done';
    priority: 'low' | 'medium' | 'high' | null;
    completedAt?: Date;
  };
}

export interface FeedFilters {
  timeFilter?: 'today' | 'week' | 'month' | 'all';
  activityFilter?: 'mood' | 'task' | 'all';
  groupID?: string;
  userID?: string;
  limit?: number;
  offset?: number;
  requestingUserID?: string; 
}

export const getFeedData = async (filters: FeedFilters = {}): Promise<FeedItem[]> => {
  const {
    timeFilter = 'all',
    activityFilter = 'all',
    groupID,
    userID,
    limit = 50,
    offset = 0,
    requestingUserID
  } = filters;

  try {
    let allowedGroupIDs: string[] = [];
    let allowedUserIDs: string[] = [];
    
    if (requestingUserID && !groupID && !userID) {
      const requestingUser = await User.findById(requestingUserID).select('groupID');
      if (requestingUser && requestingUser.groupID) {
        allowedGroupIDs = [requestingUser.groupID.toString()];
        const groupMembers = await User.find({ 
          groupID: { $in: allowedGroupIDs } 
        }).select('_id');
        allowedUserIDs = groupMembers.map((user: any) => user._id.toString());
      }
    } else if (groupID) {
      if (requestingUserID) {
        const group = await Group.findById(groupID).select('members');
        if (!group || !group.members.some((m: any) => m.user.toString() === requestingUserID)) {
          throw new Error('Access denied: User does not belong to this group');
        }
      }
      allowedGroupIDs = [groupID];
      const groupMembers = await User.find({ groupID }).select('_id');
      allowedUserIDs = groupMembers.map((user: any) => user._id.toString());
    } else if (userID) {
      if (requestingUserID && requestingUserID !== userID) {
        const requestingUser = await User.findById(requestingUserID).select('groupID');
        const targetUser = await User.findById(userID).select('groupID');
        
        if (!requestingUser || !targetUser || 
            requestingUser.groupID?.toString() !== targetUser.groupID?.toString()) {
          throw new Error('Access denied: Users do not belong to the same group');
        }
      }
      allowedUserIDs = [userID];
    }

    const feedItems: FeedItem[] = [];
    
    const now = new Date();
    let startDate: Date | undefined;
    
    switch (timeFilter) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = undefined;
    }    

    if (activityFilter === 'all' || activityFilter === 'mood') {
      const moodQuery: any = {};
      
      if (allowedUserIDs.length > 0) {
        moodQuery.userID = { $in: allowedUserIDs };
      } else if (userID) {
        moodQuery.userID = userID;
      }
      
      if (startDate) {
        moodQuery['statusHistory.timestamp'] = { $gte: startDate };
      }      const dailyStatuses = await Daily.find(moodQuery).lean();
        for (const dailyStatus of dailyStatuses) {
        const user = await User.findById(dailyStatus.userID).select('firstName lastName imageURL').lean() as { firstName: string; lastName: string; imageURL?: string } | null;
        if (!user) continue;
          const filteredHistory = startDate 
          ? dailyStatus.statusHistory.filter((status: any) => status.timestamp >= startDate)
          : dailyStatus.statusHistory;
        for (const status of filteredHistory) {
          feedItems.push({
            id: status._id?.toString() || `${dailyStatus._id}-${status.date}`,
            type: 'mood',
            timestamp: status.timestamp,
            user: {
              id: dailyStatus.userID.toString(),
              name: `${user.firstName} ${user.lastName}`,
              avatar: user.imageURL
            },
            moods: [status.mood],
            body: [status.body] 
          });
        }
      }
    }    
    if (activityFilter === 'all' || activityFilter === 'task') {      
      const taskQuery: any = {};
      if (allowedGroupIDs.length > 0) {
        taskQuery.groupID = { $in: allowedGroupIDs };
      } else if (groupID) {
        taskQuery.groupID = groupID;
      }
      if (userID) {
        taskQuery.assignedTo = userID;
      }
      if (startDate) {
        taskQuery.$or = [
          { completedAt: { $gte: startDate } },
          { updatedAt: { $gte: startDate } },
          { createdAt: { $gte: startDate } }
        ];      }      const tasks = await Task.find(taskQuery)
        .populate('assignedTo', 'firstName lastName imageURL')
        .lean();
      for (const task of tasks) {
        // Check if assignedTo is populated (object) or just an ObjectId
        if (!task.assignedTo || typeof task.assignedTo === 'string' || 'toHexString' in task.assignedTo) continue;
        
        const assignedUser = task.assignedTo as { _id: string; firstName: string; lastName: string; imageURL?: string };
        if (!assignedUser.firstName || !assignedUser.lastName) continue;
        const timestamp = task.completedAt || task.updatedAt || task.createdAt;
        if (startDate && timestamp < startDate) continue;
        feedItems.push({
          id: task._id.toString(),
          type: 'task',
          timestamp: timestamp,
          user: {
            id: assignedUser._id.toString(),
            name: `${assignedUser.firstName} ${assignedUser.lastName}`,
            avatar: assignedUser.imageURL
          },
          task: {
            title: task.title,
            status: task.status,
            priority: task.priority,
            completedAt: task.completedAt
          }
        });
      }
    }

    feedItems.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return feedItems.slice(offset, offset + limit);

  } catch (error) {
    console.error('Error fetching feed data:', error);
    throw new Error('Failed to fetch feed data');
  }
};

export const getGroupFeedData = async (groupID: string, filters: Omit<FeedFilters, 'groupID'> = {}): Promise<FeedItem[]> => {
  return getFeedData({ ...filters, groupID });
};

export const getUserFeedData = async (userID: string, filters: Omit<FeedFilters, 'userID'> = {}): Promise<FeedItem[]> => {
  return getFeedData({ ...filters, userID });
};

export const getActivityCount = async (groupID?: string, timeFilter: 'today' | 'week' | 'month' = 'today', requestingUserID?: string): Promise<{ moodCount: number; taskCount: number; totalCount: number }> => {
  const now = new Date();
  let startDate: Date;
  
  switch (timeFilter) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
  }

  try {
    let allowedUserIDs: string[] = [];
    
    if (groupID) {
      if (requestingUserID) {
        const group = await Group.findById(groupID).select('members');
        if (!group || !group.members.some((m: any) => m.user.toString() === requestingUserID)) {
          throw new Error('Access denied: User does not belong to this group');
        }
      }
      const groupMembers = await User.find({ groupID }).select('_id');
      allowedUserIDs = groupMembers.map((user: any) => user._id.toString());
    } else if (requestingUserID) {
      const requestingUser = await User.findById(requestingUserID).select('groupID');
      if (requestingUser && requestingUser.groupID) {        const groupMembers = await User.find({ 
          groupID: requestingUser.groupID 
        }).select('_id');
        allowedUserIDs = groupMembers.map((user: any) => user._id.toString());
      }
    }

    const moodQuery: any = {
      'statusHistory.timestamp': { $gte: startDate }
    };
    
    if (allowedUserIDs.length > 0) {
      moodQuery.userID = { $in: allowedUserIDs };
    }
    
    const moodCount = await Daily.countDocuments(moodQuery);

    const taskQuery: any = {
      $or: [
        { completedAt: { $gte: startDate } },
        { updatedAt: { $gte: startDate } }
      ]
    };
    
    if (groupID) {
      taskQuery.groupID = groupID;
    } else if (allowedUserIDs.length > 0) {
      taskQuery.assignedTo = { $in: allowedUserIDs };
    }
    
    const taskCount = await Task.countDocuments(taskQuery);

    return {
      moodCount,
      taskCount,
      totalCount: moodCount + taskCount
    };

  } catch (error) {
    console.error('Error getting activity count:', error);
    throw new Error('Failed to get activity count');
  }
};
