"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.updateTaskStatus = exports.updateTask = exports.getTask = exports.createTask = void 0;
const Task_1 = __importDefault(require("../models/Task"));
// Create a new task
const createTask = async (req, res) => {
    try {
        const { groupID, assignedBy, assignedTo, description, deadline, priority } = req.body;
        const newTask = new Task_1.default({
            groupID,
            assignedBy,
            assignedTo,
            description,
            deadline: deadline ? new Date(deadline) : undefined,
            priority
        });
        const savedTask = await newTask.save();
        res.status(201).json(savedTask);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.createTask = createTask;
// Get a specific task
const getTask = async (req, res) => {
    try {
        const task = await Task_1.default.findById(req.params.taskID);
        if (!task) {
            res.status(404).json({ message: 'Task not found' });
            return;
        }
        res.json(task);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getTask = getTask;
// Update a task
const updateTask = async (req, res) => {
    try {
        // Handle date conversion if deadline is provided
        const updateData = { ...req.body };
        if (req.body.deadline) {
            updateData.deadline = new Date(req.body.deadline);
        }
        const task = await Task_1.default.findByIdAndUpdate(req.params.taskID, { $set: updateData }, { new: true });
        if (!task) {
            res.status(404).json({ message: 'Task not found' });
            return;
        }
        res.json(task);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.updateTask = updateTask;
// Update task status
const updateTaskStatus = async (req, res) => {
    try {
        const task = await Task_1.default.findByIdAndUpdate(req.params.taskID, { status: req.body.status }, { new: true });
        if (!task) {
            res.status(404).json({ message: 'Task not found' });
            return;
        }
        res.json(task);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.updateTaskStatus = updateTaskStatus;
// Delete a task
const deleteTask = async (req, res) => {
    try {
        const task = await Task_1.default.findByIdAndDelete(req.params.taskID);
        if (!task) {
            res.status(404).json({ message: 'Task not found' });
            return;
        }
        res.json({ message: 'Task deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.deleteTask = deleteTask;
