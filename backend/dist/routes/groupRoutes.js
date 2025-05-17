"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const groupController_1 = require("../controllers/groupController");
const router = express_1.default.Router();
router.post('/:userID', groupController_1.createGroup); // Migrated
router.get('/', groupController_1.getAllGroups); // Migrated
// Moving the specific route '/user/:id' before the general '/:id' route
router.get('/user/:userID', groupController_1.getUserGroups); // Migrated
router.get('/:groupID', groupController_1.getGroup); // Migrated
router.put('/:groupID', groupController_1.updateGroup); // Migrated
router.delete('/:groupID', groupController_1.deleteGroup); // Migrated
router.get('/:groupID/members', groupController_1.getGroupMembers); // Added new route to get members of a group
router.get('/:groupID/tasks', groupController_1.getGroupTasks); // Added new route to get tasks of a group
exports.default = router;
