import Group from "../models/Group.js";
import Member from "../models/Member.js";

// POST /groups
export const createGroup = async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: "Group name is required" });
    }
    const newGroup = new Group({ name });

    try {
        await newGroup.save();
        res.status(201).json(newGroup);
    } catch (error) {
        console.error("Error in creating group", error.message);
        res.status(400).json({ success: false, error: error.message });
    }
};

// GET /groups/:groupId
export const getGroup = async (req, res) => {
    const { groupID } = req.params;
    if (!groupID) {
        return res.status(400).json({ message: "Group ID is required" });
    }

    try {
        const group = await Group.findById(groupID);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }
        res.status(200).json({ success: true, data: group });
    } catch (error) {
        console.error("Error in fetching group", error.message);
        res.status(400).json({ success: false, error: error.message });
    }
};

// GET /groups/:groupID/members
export const getGroupMembers = async (req, res) => {
    const { groupID } = req.params;
    if (!groupID) {
        return res.status(400).json({ message: "Group ID is required" });
    }

    try {
        const members = await Member.find({ groupID: groupID })
                                    .populate('userID', 'name email');
        if (!members) {
            return res.status(404).json({ message: "Members not found" });
        }
        res.status(200).json(members);
    } catch (error) {
        console.error("Error in fetching group members", error.message);
        res.status(400).json({ success: false, error: error.message });
    }
};