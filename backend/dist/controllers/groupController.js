"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinGroup = exports.getGroupTasks = exports.getGroupMembers = exports.getUserGroups = exports.deleteGroup = exports.updateGroup = exports.getGroup = exports.getAllGroups = exports.createGroup = void 0;
const Group_1 = __importDefault(require("../models/Group"));
const Member_1 = __importDefault(require("../models/Member"));
const mongoose_1 = __importDefault(require("mongoose"));
const Task_1 = __importDefault(require("../models/Task"));
const User_1 = __importDefault(require("../models/User"));
// Create a new group
const createGroup = async (req, res) => {
    try {
        const { userID } = req.params;
        const { name } = req.body;
        // Create the group with the user as the admin
        const newGroup = new Group_1.default({
            name,
            numberOfMembers: 1,
            members: [{ user: userID, role: 'admin' }],
        });
        const savedGroup = await newGroup.save();
        // Update the user's groupID
        const updatedUser = await User_1.default.findByIdAndUpdate(userID, { $set: { groupID: savedGroup._id } }, { new: true, runValidators: true });
        if (!updatedUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.status(201).json({
            message: 'Group created successfully',
            group: savedGroup,
            user: updatedUser,
        });
    }
    catch (err) {
        console.error('Error creating group:', err);
        res.status(500).json({ error: err.message });
    }
};
exports.createGroup = createGroup;
// Get all groups
// Done migration
const getAllGroups = async (req, res) => {
    try {
        const groups = await Group_1.default.find().exec();
        res.json(groups);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getAllGroups = getAllGroups;
// Get a specific group
// Done migration
const getGroup = async (req, res) => {
    try {
        const group = await Group_1.default.findById(req.params.groupID);
        if (!group) {
            res.status(404).json({ message: 'Group not found' });
            return;
        }
        res.json(group);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getGroup = getGroup;
// Update a group
// Done migrate
const updateGroup = async (req, res) => {
    try {
        const group = await Group_1.default.findByIdAndUpdate(req.params.groupID, { name: req.body.name }, { new: true });
        if (!group) {
            res.status(404).json({ message: 'Group not found' });
            return;
        }
        res.json(group);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.updateGroup = updateGroup;
// Delete a group
// Done migration
const deleteGroup = async (req, res) => {
    try {
        const group = await Group_1.default.findByIdAndDelete(req.params.groupID);
        if (!group) {
            res.status(404).json({ message: 'Group not found' });
            return;
        }
        // Delete all associated members
        await Member_1.default.deleteMany({ group: req.params.groupID });
        res.json({ message: 'Group deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.deleteGroup = deleteGroup;
// Get all groups for a user
// Done migration
const getUserGroups = async (req, res) => {
    try {
        const userID = new mongoose_1.default.Types.ObjectId(req.params.userID);
        const members = await Member_1.default.find({ userID: userID }).populate('groupID').exec();
        const groups = members.map(member => member.groupID);
        res.json(groups);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getUserGroups = getUserGroups;
// Added: Get all members of a group
const getGroupMembers = async (req, res) => {
    const { groupID } = req.params;
    if (!groupID) {
        res.status(400).json({ message: "Group ID is required" });
        return;
    }
    try {
        const members = await Member_1.default.find({ groupID: groupID })
            .populate('userID', 'name email');
        if (!members) {
            res.status(404).json({ message: "Members not found" });
            return;
        }
        res.status(200).json(members);
    }
    catch (error) {
        console.error("Error in fetching group members", error.message);
        res.status(400).json({ success: false, error: error.message });
    }
};
exports.getGroupMembers = getGroupMembers;
// Get all tasks in a group
const getGroupTasks = async (req, res) => {
    try {
        const tasks = await Task_1.default.find({ group: req.params.id })
            .populate('assignedTo')
            .populate('assignedBy')
            .sort({ deadline: 1 });
        res.json(tasks);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getGroupTasks = getGroupTasks;
// Join a group
const joinGroup = async (req, res) => {
    try {
        const { groupID } = req.body;
        const { userID } = req.params;
        // Find the group
        const group = await Group_1.default.findById(groupID);
        if (!group) {
            res.status(404).json({ message: 'Group not found' });
            return;
        }
        // Check if the user is already in the group
        const isMember = group.members.some((member) => member.user.toString() === userID);
        if (isMember) {
            res.status(400).json({ message: 'User is already a member of the group' });
            return;
        }
        // Determine the role (default to caregiver for now)
        const role = 'caregiver'; // This can be updated later based on additional logic
        // Add the user to the group's members array
        group.members.push({ user: userID, role });
        group.numberOfMembers += 1;
        const updatedGroup = await group.save();
        // Update the user's groupID
        const updatedUser = await User_1.default.findByIdAndUpdate(userID, { $set: { groupID: groupID } }, { new: true, runValidators: true });
        if (!updatedUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.status(200).json({
            message: 'User joined the group successfully',
            group: updatedGroup,
            user: updatedUser,
        });
    }
    catch (err) {
        console.error('Error joining group:', err);
        res.status(500).json({ error: err.message });
    }
};
exports.joinGroup = joinGroup;
