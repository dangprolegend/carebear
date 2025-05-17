"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dashboardController_1 = require("../controllers/dashboardController");
const router = express_1.default.Router();
router.post('/', dashboardController_1.addMetric);
router.get('/user/:userID', dashboardController_1.getMetricByUserID);
router.get('/:metricID', dashboardController_1.getMetricByMetricID);
router.put('/:metricID', dashboardController_1.updateMetric);
router.delete('/:metricID', dashboardController_1.deleteMetric);
exports.default = router;
