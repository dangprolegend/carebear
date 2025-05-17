"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserIdByClerkId = exports.getUserNotifications = exports.getUserTasks = exports.deleteUser = exports.updateUser = exports.getUser = exports.getUserGroup = exports.provideAdditionalUserInfo = void 0;
const User_1 = __importDefault(require("../models/User"));
const Task_1 = __importDefault(require("../models/Task"));
const Notification_1 = __importDefault(require("../models/Notification"));
const provideAdditionalUserInfo = async (req, res) => {
    try {
        const userID = req.params.userID;
        const { firstName, lastName, dateOfBirth, gender, weight, height } = req.body;
        // Validate required fields
        if (!firstName || !lastName || !dateOfBirth || !gender || !weight || !height) {
            res.status(400).json({ message: 'Please fill out all fields to complete onboarding' });
            return;
        }
        // Find user and update onboarding data
        const updatedUser = await User_1.default.findByIdAndUpdate(userID, {
            $set: {
                firstName,
                lastName,
                dateOfBirth,
                gender,
                weight,
                height
            }
        }, { new: true, runValidators: true });
        if (!updatedUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.status(200).json({
            message: 'Additional info saved successfully',
            user: updatedUser
        });
    }
    catch (error) { }
};
exports.provideAdditionalUserInfo = provideAdditionalUserInfo;
// Get the groupID of a specific user
const getUserGroup = async (req, res) => {
    try {
        const { userID } = req.params;
        const user = await User_1.default.findById(userID).select('groupID');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json({
            groupID: user.groupID
        });
    }
    catch (error) {
        console.error('Error fetching user group:', error);
        return res.status(500).json({
            message: 'Failed to fetch user group',
            error: error.message
        });
    }
};
exports.getUserGroup = getUserGroup;
const getUser = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.userID);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.status(200).json(user);
    }
    catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getUser = getUser;
// PUT user info
const updateUser = async (req, res) => {
    try {
        const userId = req.params.userID;
        const updates = req.body;
        // Don't allow email changes through this endpoint to prevent security issues
        if (updates.email) {
            delete updates.email;
        }
        // Find user and update, returning the updated document
        const updatedUser = await User_1.default.findByIdAndUpdate(userId, { $set: updates }, { new: true, runValidators: true });
        if (!updatedUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.status(200).json(updatedUser);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.updateUser = updateUser;
// DELETE user
const deleteUser = async (req, res) => {
    try {
        const userID = req.params.userID;
        const deletedUser = await User_1.default.findByIdAndDelete(userID);
        if (!deletedUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.status(200).json({ message: 'User deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.deleteUser = deleteUser;
const getUserTasks = async (req, res) => {
    try {
        const tasks = await Task_1.default.find({ assignedTo: req.params.userID })
            .populate('assignedBy', 'name')
            .sort({ deadline: 1 });
        res.json(tasks);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getUserTasks = getUserTasks;
const getUserNotifications = async (req, res) => {
    try {
        const notifications = await Notification_1.default.find({ userID: req.params.userID })
            .populate('taskID', 'description')
            .sort({ createdAt: -1 });
        res.json(notifications);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getUserNotifications = getUserNotifications;
// Find user by clerkID
const getUserIdByClerkId = async (req, res) => {
    try {
        const { clerkID } = req.params;
        if (!clerkID) {
            res.status(400).json({ message: 'clerkID is required' });
            return;
        }
        // Ensure clerkID is treated as a string
        const user = await User_1.default.findOne({ clerkID: String(clerkID) });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.status(200).json({ userID: user._id });
    }
    catch (error) {
        console.error('Error fetching user by clerkID:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
exports.getUserIdByClerkId = getUserIdByClerkId;
// Get dashboard metrics for a user
// export const getUserMetrics = async (req: TypedRequest<any, { id: string }>, res: Response): Promise<void> => {
//   try {
//     // Tasks completed over time
//     const completedTasks = await Task.find({
//       assignedTo: req.params.userID,
//       status: 'done'
//     }).sort({ updatedAt: 1 });
//     // Get all dashboard entries for this user
//     const metrics = await Dashboard.find({ user: req.params.userID })
//       .populate('taskID', 'description')
//       .sort({ created_timestamp: -1 });
//     res.json({
//       completedTasks: completedTasks.length,
//       metrics
//     });
//   } catch (err: any) {
//     res.status(500).json({ error: err.message });
//   }
// };
