"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// scripts/testOcr.ts
const fs = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
const ocrService_1 = require("../services/ocrService"); // Adjust if your src folder is elsewhere
// Optional: If you use dotenv
// import dotenv from 'dotenv';
// dotenv.config({ path: path.resolve(__dirname, '../../.env') });
console.log(">>> testOcr.ts script started <<<"); // START SCRIPT LOG
const testImage = async () => {
    console.log(">>> testImage function entered <<<"); // START FUNCTION LOG
    const imageFileName = 'Screenshot 2025-05-17 at 09.33.54.png';
    const currentWorkingDirectory = process.cwd();
    const imagePath = path_1.default.resolve(currentWorkingDirectory, 'scripts', imageFileName);
    console.log("--- Path Debugging ---");
    console.log("Current Working Directory (process.cwd()):", currentWorkingDirectory);
    console.log("Constructed imagePath to check:", imagePath);
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        console.error("ERROR: GOOGLE_APPLICATION_CREDENTIALS environment variable is not set.");
        console.log("Please ensure it points to your GCP service account key JSON file.");
        return; // Exit function if not set
    }
    console.log(`Using GOOGLE_APPLICATION_CREDENTIALS: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);
    try {
        console.log(`Checking for image existence at: ${imagePath}`);
        if (!fs.existsSync(imagePath)) {
            console.error(`ERROR: Image file not found at specified imagePath: ${imagePath}`);
            console.log(`Please ensure '${imageFileName}' exists in the '/Users/dahomita/Documents/carebear/backend/scripts/' directory.`);
            return; // Exit function if image not found
        }
        const imageBuffer = fs.readFileSync(imagePath);
        const imageBase64 = imageBuffer.toString('base64');
        console.log(`Successfully read image. Testing OCR with image: ${imagePath}`);
        const extractedText = await (0, ocrService_1.getTextFromImage)(imageBase64); // This calls the Google Vision API
        console.log("\n--- OCR Extracted Text ---");
        console.log(`"${extractedText}"`); // Enclose in quotes to see if it's empty string vs undefined
        console.log("--- End of OCR Text ---");
        if (extractedText.trim() === '') {
            console.warn("\nWarning: OCR returned empty text. Check image quality or GCP Vision API setup.");
        }
    }
    catch (error) {
        console.error("\nError during OCR test function:", error);
    }
    finally {
        console.log(">>> testImage function finished <<<"); // END FUNCTION LOG
    }
};
// Call the async function and handle its promise to ensure script doesn't exit silently on unhandled rejection
testImage()
    .then(() => {
    console.log(">>> testOcr.ts script execution completed (Promise resolved) <<<");
})
    .catch((err) => {
    console.error(">>> testOcr.ts script execution failed (Promise rejected): <<<", err);
})
    .finally(() => {
    console.log(">>> testOcr.ts script final block executed <<<");
});
