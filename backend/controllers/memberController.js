import Member from '../models/Member.js';
import User from '../models/User.js';
import Group from '../models/Group.js';

// POST /groups/:groupID/members
export const addMember = async (req, res) => {
    try {
        const { groupID } = req.params;
        const { userID, role } = req.body;

        if (!userID || !role) {
            return res.status(400).json({ message: "User ID and role fields are required" });
        }

        // Check if user exists
        const user = await User.findById(userID);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Check if group exists
        const group = await Group.findById(groupID);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        
        // Check if already a member
        const existingMember = await Member.findOne({ userID, groupID });
        if (existingMember) {
            return res.status(400).json({ message: 'User is already a member of this group' });
        }

        // Add member to family group
        const newMember = new Member({ userID, groupID, role });
        await newMember.save();
        res.status(201).json(newMember);
    } catch (error) {
        console.error("Error in adding member", error.message);
        res.status(400).json({ success: false, error: error.message });
    }
};

// GET /groups/:groupId/members/:userId
export const getMember = async (req, res) => {
    const { groupID, userID } = req.params;
  
    if (!groupID || !userID) {
        return res.status(400).json({ 
            success: false, 
            message: "Group ID and User ID fields are required" 
        });
    }
  
    try {
        const member = await Member.findOne({ 
            userID: userID, 
            groupID: groupID
        }).populate('userID', 'name email'); 

        if (!member) {
            return res.status(404).json({ success: false, message: "Member not found in this group"});
        };
    
        res.status(200).json({ success: true, data: member});
    } catch (error) {
        console.error("Error fetching group member:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};

// PUT /groups/:groupID/members/:userID
export const updateMemberRole = async (req, res) => {
    const { groupID, userID } = req.params;
    const { role } = req.body;
  
    if (!groupID || !userID || !role) {
        return res.status(400).json({ 
            success: false, 
            message: "Group ID, User ID, and role fields are required" 
        });
    }
  
    try {
        const member = await Member.findOne({ 
            userID: userID, 
            groupID: groupID 
        });
    
        if (!member) {
            return res.status(404).json({
            success: false,
            message: "Member not found in this group"
            });
        }
    
        member.role = role;
        await member.save();
    
        res.status(200).json({ success: true, data: "Role updated successfully" });
    } catch (error) {
        console.error("Error updating member role:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};

// DELETE /groups/:groupID/members/:userID
export const removeMember = async (req, res) => {
    const { groupID, userID } = req.params;
  
    if (!groupID || !userID) {
        return res.status(400).json({ success: false, message: "Group ID and User ID fields are required" });
    }
  
    try {
        const result = await Member.findOneAndDelete({ 
            userID: userID, 
            groupID: groupID 
        });
    
        if (!result) {
            return res.status(404).json({ success: false, message: "Member not found in this group" });
        }
    
        res.status(200).json({ success: true, message: "Member removed successfully"});
    } catch (error) {
        console.error("Error removing member from group:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};
  