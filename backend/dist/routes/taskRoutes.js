"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const taskController_1 = require("../controllers/taskController");
const router = express_1.default.Router();
router.post('/', taskController_1.createTask);
router.put('/:taskID/status', taskController_1.updateTaskStatus);
router.get('/:taskID', taskController_1.getTask);
router.put('/:taskID', taskController_1.updateTask);
router.delete('/:taskID', taskController_1.deleteTask);
exports.default = router;
