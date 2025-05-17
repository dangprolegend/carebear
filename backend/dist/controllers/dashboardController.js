"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMetric = exports.updateMetric = exports.getMetricByMetricID = exports.getMetricByUserID = exports.addMetric = void 0;
const Dashboard_1 = __importDefault(require("../models/Dashboard"));
const mongoose_1 = __importDefault(require("mongoose"));
// Add metric data to dashboard
const addMetric = async (req, res) => {
    try {
        const { userID, metric, metric_unit, metric_value } = req.body;
        const newMetric = new Dashboard_1.default({
            userID,
            metric,
            metric_unit,
            metric_value,
            created_timestamp: new Date()
        });
        const savedMetric = await newMetric.save();
        res.status(201).json(savedMetric);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.addMetric = addMetric;
// Get dashboard metrics by userID
const getMetricByUserID = async (req, res) => {
    try {
        const userID = new mongoose_1.default.Types.ObjectId(req.params.userID);
        const metrics = await Dashboard_1.default.find({ userID });
        res.json(metrics);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getMetricByUserID = getMetricByUserID;
// Get dashboard metric by dashboardID
const getMetricByMetricID = async (req, res) => {
    try {
        const metricID = new mongoose_1.default.Types.ObjectId(req.params.metricID);
        const metrics = await Dashboard_1.default.findById(metricID);
        res.json(metrics);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getMetricByMetricID = getMetricByMetricID;
// Update dashboard metrics by dashboardID
const updateMetric = async (req, res) => {
    try {
        const dashboard = await Dashboard_1.default.findByIdAndUpdate(req.params.metricID, {
            userID: req.body.userID,
            metric: req.body.metric,
            metric_unit: req.body.metric_unit,
            metric_value: req.body.metric_value
        }, { new: true });
        if (!dashboard) {
            res.status(404).json({ message: 'Dashboard not found' });
            return;
        }
        res.json(dashboard);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.updateMetric = updateMetric;
// Delete dashboard metrics by dashboardID
const deleteMetric = async (req, res) => {
    try {
        const metrics = await Dashboard_1.default.findByIdAndDelete(req.params.metricID);
        if (!metrics) {
            res.status(404).json({ message: 'Metric not found' });
            return;
        }
        res.json({ message: 'Metric deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.deleteMetric = deleteMetric;
