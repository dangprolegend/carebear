const mongoose = require('mongoose');

const dashboardSchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  taskID: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  metric_value: { type: Number, default: 0 },
  created_timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Dashboard', dashboardSchema);
