"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cron_1 = require("cron");
const https_1 = __importDefault(require("https"));
// boot render every 14 minutes to prevent it from sleeping
// this is a workaround for the free plan of Render, which puts the app to sleep after 15 minutes of inactivity
const job = new cron_1.CronJob("*/14 * * * *", function () {
    https_1.default
        .get("https://carebear-backend.onrender.com", (res) => {
        if (res.statusCode === 200)
            console.log("GET request sent successfully");
        else
            console.log("GET request failed", res.statusCode);
    })
        .on("error", (err) => console.error("Error while sending request: ", err));
});
exports.default = job;
