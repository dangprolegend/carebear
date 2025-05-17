"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNotification = exports.deleteNotification = exports.getNotificationByID = exports.getUserNotifications = exports.createNotification = void 0;
const Notification_1 = __importDefault(require("../models/Notification"));
const mongoose_1 = __importDefault(require("mongoose"));
// Create a new notification
// Done migrated
const createNotification = async (req, res) => {
    try {
        const { userID, taskID } = req.body;
        const newNotification = new Notification_1.default({
            userID,
            taskID,
            createdAt: new Date()
        });
        const savedNotification = await newNotification.save();
        res.status(201).json(savedNotification);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.createNotification = createNotification;
// Get notifications for a user
// Done migrated
const getUserNotifications = async (req, res) => {
    try {
        const userID = new mongoose_1.default.Types.ObjectId(req.params.userID);
        const notifications = await Notification_1.default.find({ userID }).populate('taskID').sort({ createdAt: -1 });
        res.json(notifications);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getUserNotifications = getUserNotifications;
// Get notification by notificationID
const getNotificationByID = async (req, res) => {
    try {
        const notificationID = new mongoose_1.default.Types.ObjectId(req.params.notificationID);
        const notifications = await Notification_1.default.findById(notificationID);
        res.json(notifications);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getNotificationByID = getNotificationByID;
// Delete a notification
// Done migrated
const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification_1.default.findByIdAndDelete(req.params.notificationID);
        if (!notification) {
            res.status(404).json({ message: 'Notification not found' });
            return;
        }
        res.json({ message: 'Notification deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.deleteNotification = deleteNotification;
// Update a notification by notificationID
const updateNotification = async (req, res) => {
    try {
        const notification = await Notification_1.default.findByIdAndUpdate(req.params.notificationID, {
            userID: req.body.userID,
            taskID: req.body.taskID,
        }, { new: true });
        if (!notification) {
            res.status(404).json({ message: 'Notification not found' });
            return;
        }
        res.json(notification);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.updateNotification = updateNotification;
