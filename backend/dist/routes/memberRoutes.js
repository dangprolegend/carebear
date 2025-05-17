"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const memberController_1 = require("../controllers/memberController");
const router = express_1.default.Router();
router.post('/:groupID/members', memberController_1.addMember); // Migrated
// Moving specific routes before the pattern-matching route
router.put('/:groupID/members/:userID', memberController_1.updateMember); // Migrated
router.delete('/:groupID/members/:userID', memberController_1.removeMember); // Migrated
exports.default = router;
