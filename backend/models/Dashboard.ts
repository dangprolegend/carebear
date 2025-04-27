import mongoose, { Schema } from 'mongoose';
import { IDashboard } from '../types/models';

const dashboardSchema: Schema = new Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  metric: { type: String },
  metric_unit: {type: String},
  metric_value: { type: Number, default: 0 },
  created_timestamp: { type: Date, default: Date.now }
});

const Dashboard = mongoose.model<IDashboard>('Dashboard', dashboardSchema);
export default Dashboard;