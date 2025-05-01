import { CronJob } from "cron";
import https from "https";

// boot render every 14 minutes to prevent it from sleeping
// this is a workaround for the free plan of Render, which puts the app to sleep after 15 minutes of inactivity
const job = new CronJob("*/14 * * * *", function () {
    https
    .get("https://carebear-backend.onrender.com", (res: any) => {
        if (res.statusCode === 200) console.log("GET request sent successfully");
        else console.log("GET request failed", res.statusCode);
    })
    .on("error", (err: any) => console.error("Error while sending request: ", err));
});

export default job;