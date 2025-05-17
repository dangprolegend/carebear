"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notificationController_1 = require("../controllers/notificationController");
const router = express_1.default.Router();
router.post('/', notificationController_1.createNotification); // Done migrated
router.get('/user/:userID', notificationController_1.getUserNotifications); // Done migrated
router.delete('/:notificationID', notificationController_1.deleteNotification); // Done migrated
router.put('/:notificationID', notificationController_1.updateNotification);
router.get('/:notificationID', notificationController_1.getNotificationByID);
exports.default = router;
