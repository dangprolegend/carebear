import OpenAI from 'openai';

const nebiusApiKey = process.env.NEBIUS_API_KEY;
const nebiusApiBaseUrl = process.env.NEBIUS_API_BASE_URL;

if (!nebiusApiKey) {
  console.warn("NEBIUS_API_KEY is not set. LLM service (Nebius AI) will not function properly.");
}
if (!nebiusApiBaseUrl) {
  console.warn("NEBIUS_API_BASE_URL is not set. LLM service (Nebius AI) will not function properly.");
}

const nebiusClient = new OpenAI({
  apiKey: nebiusApiKey,
  baseURL: nebiusApiBaseUrl,
});

export interface AiTaskSuggestion { 
  title: string;
  description: string;
  start_date: string; // YYYY-MM-DD
  end_date?: string | null; // YYYY-MM-DD or null
  times_of_day: string[]; // Array of HH:MM strings
  recurrence_rule?: string | null; // e.g., "DAILY", "WEEKLY", "NONE", or RRULE
  assignedTo: null; 
  priority: 'low' | 'high' | null; 
}

export const generateTaskSuggestions = async (prompt: string): Promise<AiTaskSuggestion[]> => {
  if (!nebiusApiKey || !nebiusApiBaseUrl) {
    throw new Error('Nebius AI API key or base URL is not configured.');
  }

  try {
    const modelIdentifier = "meta-llama/Meta-Llama-3.1-8B-Instruct-fast"; 
    console.log(`Sending prompt to Nebius AI LLM (Model: ${modelIdentifier})...`);

    const completion = await nebiusClient.chat.completions.create({
      model: modelIdentifier,
      messages: [
        {
          role: 'system',
          content: `You are an expert assistant for the CareBear app. Your primary goal is to analyze user input and return a list of care tasks.
You MUST return your response as a JSON array of task objects. Each object in the array should represent a single task.
Do not include any other text, conversation, or explanation outside of this JSON array.
Adhere strictly to the requested JSON structure for each task object.
Each task object must have the following fields: "title" (string), "description" (string), "start_date" (string, YYYY-MM-DD), "end_date" (string YYYY-MM-DD or null), "times_of_day" (array of strings, HH:MM format), "recurrence_rule" (string like "DAILY", "WEEKLY", "NONE", or null), "assignedTo" (must be null), "priority" (string "low", "high", or null).`
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2, // Lower temperature for more deterministic, structured output
    });

    const content = completion.choices[0]?.message?.content;

    if (!content || content.trim() === '') {
      console.error("Nebius AI LLM returned empty or null content string.");
      throw new Error('Nebius AI LLM returned empty content string.');
    }

    let jsonString = content.trim();

    if (jsonString.startsWith("```json") && jsonString.endsWith("```")) {
        jsonString = jsonString.substring(7, jsonString.length - 3).trim();
        console.log("Stripped ```json wrapper. New jsonString:", jsonString);
    } else if (jsonString.startsWith("```") && jsonString.endsWith("```")) {
        jsonString = jsonString.substring(3, jsonString.length - 3).trim();
        console.log("Stripped ``` wrapper. New jsonString:", jsonString);
    }


    let parsedJson: any;
    try {
      parsedJson = JSON.parse(jsonString);
      //console.log("Successfully parsed JSON from LLM. Parsed structure:", JSON.stringify(parsedJson, null, 2));
    } catch (jsonError: any) {
      console.error("Failed to parse Nebius AI LLM response as JSON. Processed string was:", jsonString, "Raw content was (from variable 'content'):", content, "Error:", jsonError.message);
      throw new Error(`Nebius AI LLM response was not valid JSON: ${jsonError.message}`);
    }

    if (Array.isArray(parsedJson)) {
      const tasksArray = parsedJson as AiTaskSuggestion[];

      const isValidStructure = tasksArray.every(
        (task: AiTaskSuggestion) => (
          typeof task.title === 'string' &&
          typeof task.description === 'string' &&
          typeof task.start_date === 'string' && 
          (task.end_date === null || typeof task.end_date === 'string' || typeof task.end_date === 'undefined') &&
          Array.isArray(task.times_of_day) &&
          (task.recurrence_rule === null || typeof task.recurrence_rule === 'string' || typeof task.recurrence_rule === 'undefined') &&
          task.assignedTo === null &&
          (task.priority === null || task.priority === 'low' || task.priority === 'high')
        )
      );

      if (isValidStructure) {
        console.log("LLM response is a direct array of tasks and structure seems valid.");
        return tasksArray;
      } else {
        console.error("One or more tasks in the LLM response (direct array) are missing required fields or have incorrect types. Tasks array:", JSON.stringify(tasksArray, null, 2));
        throw new Error('Nebius AI LLM returned tasks with an invalid structure within the array.');
      }
    } else {
      console.error("Nebius AI LLM response was not a direct array of tasks as expected. Parsed JSON:", JSON.stringify(parsedJson, null, 2));
      throw new Error('Nebius AI LLM response structure was not a direct array of tasks.');
    }
  } catch (error: any) {
    console.error('Nebius AI LLM Error in generateTaskSuggestions:', error.response?.data || error.message || error);
    const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to generate task suggestions from Nebius AI LLM.';
    throw new Error(errorMessage);
  }
};