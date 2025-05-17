"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const groupController_1 = require("../controllers/groupController");
const router = express_1.default.Router();
router.get('/:userID/group', userController_1.getUserGroup);
router.patch('/:userID/onboarding', userController_1.provideAdditionalUserInfo);
router.get('/clerk/:clerkID', userController_1.getUserIdByClerkId);
router.post('/:userID/createGroup', groupController_1.createGroup);
router.patch('/:userID/joinGroup', groupController_1.joinGroup);
exports.default = router;
