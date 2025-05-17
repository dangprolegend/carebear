"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeMember = exports.updateMember = exports.addMember = void 0;
const Member_1 = __importDefault(require("../models/Member"));
const User_1 = __importDefault(require("../models/User"));
const Group_1 = __importDefault(require("../models/Group"));
// Add a member to a group
const addMember = async (req, res) => {
    try {
        const { groupID } = req.params;
        const { userID, role } = req.body;
        if (!userID || !role) {
            res.status(400).json({ message: "User ID and role fields are required" });
            return;
        }
        // Check if user exists
        const user = await User_1.default.findById(userID);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        // Check if group exists
        const group = await Group_1.default.findById(groupID);
        if (!group) {
            res.status(404).json({ message: 'Group not found' });
            return;
        }
        // Check if already a member
        const existingMember = await Member_1.default.findOne({ userID, groupID });
        if (existingMember) {
            res.status(400).json({ message: 'User is already a member of this group' });
            return;
        }
        // Add member to family group
        const newMember = new Member_1.default({ userID, groupID, role });
        await newMember.save();
        res.status(201).json(newMember);
    }
    catch (error) {
        console.error("Error in adding member", error.message);
        res.status(400).json({ success: false, error: error.message });
    }
};
exports.addMember = addMember;
// Update a member's role
const updateMember = async (req, res) => {
    const { groupID, userID } = req.params;
    const { role } = req.body;
    if (!groupID || !userID || !role) {
        res.status(400).json({
            success: false,
            message: "Group ID, User ID, and role fields are required"
        });
        return;
    }
    try {
        const member = await Member_1.default.findOne({
            userID: userID,
            groupID: groupID
        });
        if (!member) {
            res.status(404).json({
                success: false,
                message: "Member not found in this group"
            });
            return;
        }
        member.role = role;
        await member.save();
        res.status(200).json({ success: true, data: "Role updated successfully" });
    }
    catch (error) {
        console.error("Error updating member role:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.updateMember = updateMember;
// Remove a member from a group
const removeMember = async (req, res) => {
    const { groupID, userID } = req.params;
    if (!groupID || !userID) {
        res.status(400).json({ success: false, message: "Group ID and User ID fields are required" });
        return;
    }
    try {
        const result = await Member_1.default.findOneAndDelete({
            userID: userID,
            groupID: groupID
        });
        if (!result) {
            res.status(404).json({ success: false, message: "Member not found in this group" });
            return;
        }
        res.status(200).json({ success: true, message: "Member removed successfully" });
    }
    catch (error) {
        console.error("Error removing member from group:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.removeMember = removeMember;
