import { Response } from 'express';
import { TypedRequest, UserRequest } from '../types/express'; 
import { getTextFromImage } from '../services/ocrService'; 
import { generateTaskSuggestions, AiTaskSuggestion } from '../services/llmService'; 
import User from '../models/User';
import Task from '../models/Task';

interface AiSuggestBody {
  userID: string;
  groupID: string;
  prompt_text?: string;
  image_base64?: string; 
}

export const suggestTasksFromInput = async (req: UserRequest, res: Response): Promise<void> => {
  try {
    const { userID, groupID, prompt_text, image_base64 } = req.body;

    if (!userID || !groupID) {
        res.status(400).json({ message: 'userID and groupID are required.' });
        return;
    }
    if (!prompt_text && !image_base64) {
      res.status(400).json({ message: 'Either prompt_text or image_base64 must be provided.' });
      return;
    }

    let combinedInputText = prompt_text || '';

    if (image_base64) {
      try {
        const base64Data = image_base64.startsWith('data:')
          ? image_base64.substring(image_base64.indexOf(',') + 1)
          : image_base64;

        const ocrText = await getTextFromImage(base64Data); 
        if (ocrText && ocrText.trim()) {
          combinedInputText += `\n\n[Content from image]:\n${ocrText.trim()}`;
        } else {
          combinedInputText += "\n\n[Note: Image processed by Google Vision, but no text was extracted or image was empty.]";
        }
      } catch (ocrError: any) {
        console.error('OCR processing (Google Vision) failed in controller:', ocrError);
        combinedInputText += "\n\n[Note: Google Vision image processing encountered an error.]";
      }
    }

    if (!combinedInputText.trim()) {
      res.status(400).json({ message: 'After processing, no text input was available for AI suggestions.' });
      return;
    }

    const today = new Date(); 
    const currentDateFormatted = today.toLocaleDateString('en-CA'); 

    const llmPrompt = `
      You are an expert assistant for the CareBear app. Your goal is to help users create caregiving tasks (strictly less than or equal to 5 tasks, no more than 5 tasks generated).
      Today's date is ${currentDateFormatted}.
      The user making this request has ID: ${userID}.
      They are in group ID: ${groupID}.
      Analyze the following input. Identify all individual care tasks.
      For each task, you MUST provide a JSON object with the following fields ONLY:
      - "title": A concise string for the task title.
      - "description": A detailed string describing the task and its instructions.
      - "start_date": A string representing the task's start date in YYYY-MM-DD format.
      - "end_date": A string representing the task's end date in YYYY-MM-DD format. This can be null if the task is for a single day or has no defined end.
      - "times_of_day": An array of strings, where each string is a specific time in HH:MM format (24-hour) for when the task should occur on a given day (e.g., ["08:00", "14:30", "20:00"]).
      - "recurrence_rule": A string describing the recurrence. Use simple terms like "DAILY", "WEEKLY", "MONTHLY", "NONE", or a more specific iCalendar RRULE if applicable (e.g., "FREQ=WEEKLY;BYDAY=MO,WE,FR"). If no recurrence, use "NONE" or null.
      - "assignedTo": This MUST be null.
      - "priority": This can strictly either be 'low','high' or null. You can suggest.
      Based on the input, also try to suggest 4 other relevant ancillary tasks if appropriate (e.g., "Refill prescription for [Medicine Name]", "Schedule follow-up appointment with doctor"). These ancillary tasks should also follow the same JSON object structure.
      Return your entire response as 1 or many JSONs object depends on how many task you think of and suggest. Each with one top-level key:: "tasks". The value of "tasks" MUST be an array of these task JSON objects. Do not include any other text or explanation outside of the JSON object.
      User's Input:
      """
      ${combinedInputText}
      """
    `;

    const aiSuggestedTasks: AiTaskSuggestion[] = await generateTaskSuggestions(llmPrompt); 
    if (!aiSuggestedTasks || aiSuggestedTasks.length === 0) {
      res.status(200).json({ message: "AI processed the input but did not suggest any tasks to create.", tasks: [] });
      return;
    }
    
    const creator = await User.findById(userID);
    if (!creator) {
      res.status(400).json({ message: 'User initiating task creation not found (creator check).' });
      return;
    }


  const createdTasksPromises = aiSuggestedTasks.map(async (aiTask) => {
      let validAssigneeId: string | undefined = undefined;
      if (aiTask.assignedTo) { // AI currently defaults assignedTo to null
        const assignee = await User.findById(aiTask.assignedTo) as (typeof User.prototype & { _id: any }) | null;
        if (assignee) {
          validAssigneeId = assignee._id.toString();
        } else {
          console.warn(`AI Task: Suggested assignee ID ${aiTask.assignedTo} not found for task "${aiTask.title}". Task will be unassigned.`);
        }
      }

      const reminderDataFormatted = {
        start_date: aiTask.start_date ? new Date(aiTask.start_date) : undefined,
        end_date: aiTask.end_date ? new Date(aiTask.end_date) : undefined,
        times_of_day: aiTask.times_of_day && aiTask.times_of_day.length > 0 ? aiTask.times_of_day : [],
        recurrence_rule: aiTask.recurrence_rule || undefined,
      };

      const newTask = new Task({
        title: aiTask.title,
        groupID,
        assignedBy: userID,
        assignedTo: validAssigneeId, // Use validated assignee ID
        description: aiTask.description,
        priority: aiTask.priority || 'medium',
        reminder: reminderDataFormatted || null,
        status: 'pending',
      });
      return newTask.save();
    });

    const savedTasks = await Promise.all(createdTasksPromises);
    const populatedTasks = await Task.find({ _id: { $in: savedTasks.map(t => t._id) } })
                                     .populate('assignedTo', 'name email role')
                                     .populate('assignedBy', 'name email role');

    res.status(201).json({
      message: `${populatedTasks.length} tasks suggested by AI were created successfully.`,
      tasks: populatedTasks,
    });

  } catch (error: any) {
    console.error('Error in processAndCreateAiTasks controller:', error);
    res.status(500).json({ error: `Failed to process AI input and create tasks. ${error.message || 'Unknown error'}` });
  }
};