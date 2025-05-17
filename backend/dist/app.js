"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
// Import database connection
const db_1 = __importDefault(require("./config/db"));
// Import routes
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const groupRoutes_1 = __importDefault(require("./routes/groupRoutes"));
const memberRoutes_1 = __importDefault(require("./routes/memberRoutes"));
const taskRoutes_1 = __importDefault(require("./routes/taskRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const aiRoutes_1 = __importDefault(require("./routes/aiRoutes"));
const cron_1 = __importDefault(require("./config/cron"));
// Load environment variables
dotenv_1.default.config();
// Connect to database
(0, db_1.default)();
// Initialize Express app
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '5000');
// cron job for render
cron_1.default.start();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(body_parser_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Define routes
app.use('/api/webhooks', authRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/groups', groupRoutes_1.default);
app.use('/api/groups', memberRoutes_1.default);
app.use('/api/tasks', taskRoutes_1.default);
app.use('/api/notifications', notificationRoutes_1.default);
app.use('/api/dashboard', dashboardRoutes_1.default);
app.use('/api/ai', aiRoutes_1.default);
// Health check route
app.get('/', (req, res) => {
    res.send('CareBear API is running');
});
// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'An unexpected error occurred',
        error: process.env.NODE_ENV === 'production' ? {} : err.message
    });
});
// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
exports.default = app;
