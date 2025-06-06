const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();
const fs = require("fs"); // Import the fs module for file system operations
const path = require("path");
const { generateWithModelFallback } = require("../utils/modelUtils");

// Initialize preprompts
let analyzeCvPreprompt;
let careerAdvisorPreprompt;
let interviewerPreprompt;
let analyzeJobListingPreprompt;
let improveCvPreprompt;

let currentSessionId = null;
let sessionHistory = []; // Initialize an array to store session history

async function loadSessionHistory(convId, token) {
  if (currentSessionId !== convId) {
    sessionHistory = [];
    currentSessionId = convId;
  }
  try {
    // Call the API endpoint exposed by getMessagesByConvId
    const response = await fetch(`${process.env.BACKEND_URL}/api/bot-conversations/getMessagesByConvId?convId=${convId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Append fetched messages to the sessionHistory
    sessionHistory = sessionHistory.concat(data) || [];

  } catch (error) {
    console.error("Error loading session history:", error);
  }
}


// Read preprompts from files for each role
try {
  const analyzeCvPrepromptFilePath = path.resolve(__dirname, "../prompts/analyzeCvPreprompt.txt");
  analyzeCvPreprompt = fs.readFileSync(analyzeCvPrepromptFilePath, "utf-8");

  const careerAdvisorPrepromptFilePath = path.resolve(__dirname, "../prompts/careerAdvisorPreprompt.txt");
  careerAdvisorPreprompt = fs.readFileSync(careerAdvisorPrepromptFilePath, "utf-8");

  const interviewerPrepromptFilePath = path.resolve(__dirname, "../prompts/interviewerPreprompt.txt");
  interviewerPreprompt = fs.readFileSync(interviewerPrepromptFilePath, "utf-8");

  const analyzeJobListingPrepromptFilePath = path.resolve(__dirname, "../prompts/analyzeJobListingPreprompt.txt");
  analyzeJobListingPreprompt = fs.readFileSync(analyzeJobListingPrepromptFilePath, "utf-8");

  const improveCvPrepromptFilePath = path.resolve(__dirname, "../prompts/improveCvPreprompt.txt");
  improveCvPreprompt = fs.readFileSync(improveCvPrepromptFilePath, "utf-8");
} catch (e) {
  // On CI/CD it will throw an error because preprompts aren't included in the repository.
  console.error("Error reading prompts:", e);
  analyzeCvPreprompt = "";
  careerAdvisorPreprompt = "";
  interviewerPreprompt = "";
  analyzeJobListingPreprompt = "";
  improveCvPreprompt = "";
};


const sendToBot = async (req, res) => {
  let preprompt = null;
  const { prompt, sessionId, type } = req.body;
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (type === "careerAdvisor")
    preprompt = careerAdvisorPreprompt;
  else
    preprompt = interviewerPreprompt;

  if (!prompt || !sessionId) {
    return res.status(400).json({ error: "Prompt and sessionId are required" });
  }

  // Retrieve or initialize history for the session
  await loadSessionHistory(sessionId, token);


  // Construct the input with history, filtering out any null or invalid entries.
  const formattedHistory = sessionHistory
    .filter(entry => entry && entry.sender && entry.text)
    .map(entry => `${entry.sender}: ${entry.text}`)
    .join("\n");


  const input = `${preprompt}, ${formattedHistory}. Now tell me - ${prompt}`;

  try {
    // Use the fallback mechanism instead of direct model call
    const result = await generateWithModelFallback(input);

    const responseText = result.response.text();
    let prefixToRemove = ['bot:', 'assistant:']; // List of possible prefixes

    let lowerCaseResponseText = responseText.toLowerCase(); // Normalize to lowercase for comparison

    // Find the prefix to remove, if any
    let matchedPrefix = prefixToRemove.find(prefix => lowerCaseResponseText.startsWith(prefix));

    // Remove the matched prefix, or keep the text as is
    let processedResponseText = matchedPrefix
      ? responseText.slice(matchedPrefix.length).trim() // Remove prefix and trim whitespace
      : responseText; // Keep unchanged if no prefix matched

    // Append the new exchange to the history
    sessionHistory.push({ role: "user", content: prompt });
    sessionHistory.push({ role: "assistant", content: processedResponseText });


    res.status(200).json({ response: processedResponseText });
  } catch (error) {
    console.error("Error generating content:", error?.message || error);
    res.status(500).json({ error: "Failed to generate response" });
  }
};

const generateJsonFromCV = async (req, res) => {

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt and sessionId are required" });
  }

  const input = `${analyzeCvPreprompt}. Now tell me - ${prompt}`;

  try {
    // Use the fallback mechanism instead of direct model call
    const result = await generateWithModelFallback(input);

    const responseText = result.response.text();



    res.status(200).json({ response: responseText });
  } catch (error) {
    console.error("Error generating content:", error?.message || error);
    res.status(500).json({ error: "Failed to generate response" });
  }
};

const analyzeJobListing = async (req, res) => {

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt and sessionId are required" });
  }

  // Safety check - only call replace if prompt is a string
  const processedPrompt = typeof prompt === 'string' ? prompt.replace('.', ',') : prompt;

  const input = `${analyzeJobListingPreprompt}. Now tell me - ${processedPrompt}`;

  try {
    // Use the fallback mechanism instead of direct model call
    const result = await generateWithModelFallback(input);

    const responseText = result.response.text();

    res.status(200).json({ response: responseText });
  } catch (error) {
    console.error("Error generating content:", error?.message || error);
    res.status(500).json({ error: "Failed to generate response" });
  }
};

const improveCV = async (req, res) => {
  const { cvContent } = req.body;

  if (!cvContent) {
    return res.status(400).json({ error: "CV content is required" });
  }

  const prompt = `${improveCvPreprompt} Here's the CV content: ${cvContent}`;

  try {
    // Use the fallback mechanism instead of direct model call
    const result = await generateWithModelFallback(prompt);
    
    const responseText = result.response.text();

    res.status(200).json({ response: responseText });
  } catch (error) {
    console.error("Error generating CV improvement suggestions:", error?.message || error);
    res.status(500).json({ error: "Failed to generate CV improvement suggestions" });
  }
};

module.exports = {
  generateJsonFromCV,
  sendToBot,
  analyzeJobListing,
  improveCV
};
