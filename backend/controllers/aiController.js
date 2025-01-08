

const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();
const fs = require("fs"); // Import the fs module for file system operations
const path = require("path");

// Initialize the AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

let analyzeCvPreprompt;
let careerAdvisorPreprompt;
let interviewerPreprompt;
let currentSessionId = null;
let sessionHistory = []; // Initialize an array to store session history

async function loadSessionHistory(convId) {
    if (currentSessionId !== convId) {
      sessionHistory = [];
      currentSessionId = convId;
    }
    try {
        // Call the API endpoint exposed by getMessagesByConvId
        const response = await fetch(`${process.env.BACKEND_URL}/api/conversations/getMessagesByConvId?convId=${convId}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        console.log("\n\n-Data: " + JSON.stringify(data));

        // Append fetched messages to the sessionHistory
        sessionHistory = sessionHistory.concat(data) || [];

        console.log("Session history loaded:", sessionHistory);
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
} catch (e) {
  // On CI/CD it will throw an error because preprompts aren't included
  // in the repository.
  console.error("Error reading prompts:", e);
  analyzeCvPreprompt = "";
  careerAdvisorPreprompt = "";
  interviewerPreprompt = "";
};


const sendToBot = async (req, res) => {
  console.log('req.body: ' + JSON.stringify(req.body));
  let preprompt = null;
  const { prompt, sessionId, type} = req.body;

  if (type === "careerAdvisor")
    preprompt = careerAdvisorPreprompt;
  else
    preprompt = interviewerPreprompt;

  if (!prompt || !sessionId) {
    return res.status(400).json({ error: "Prompt and sessionId are required" });
  }

  // Retrieve or initialize history for the session
  await loadSessionHistory(sessionId);
  console.log('\n\nsessionHistory: ' + sessionHistory);


  // Construct the input with history
  const formattedHistory = sessionHistory?.map((entry) => `${entry.sender}: ${entry.text}`)
    .join("\n");

  console.log('\n\nformattedHistory: ' + JSON.stringify(formattedHistory) + '\n');
  const input = `${preprompt}, ${formattedHistory}. Now tell me - ${prompt}`;

  try {
    console.log("Input: " + JSON.stringify(input));
    // Correct the request format for the model
    const result = await model.generateContent(input);

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
    console.error("Error generating content:", error);
    res.status(500).json({ error: "Failed to generate response" });
  }
};

const generateJsonFromCV = async (req, res) => {
  console.log('req.body: ' + JSON.stringify(req.body));

  const { prompt, sessionId } = req.body;

  if (!prompt || !sessionId) {
    return res.status(400).json({ error: "Prompt and sessionId are required" });
  }

  // Retrieve or initialize history for the session
  if (!sessionHistory.has(sessionId)) {
    sessionHistory.set(sessionId, []);
  }
  const history = sessionHistory.get(sessionId);

  // Construct the input with history
  const formattedHistory = history
    .map((entry) => `${entry.role}: ${entry.content}`)
    .join("\n");
  const input = `${analyzeCvPreprompt}, ${formattedHistory}. Now tell me - ${prompt}`;

  try {
    console.log("Input: " + JSON.stringify(input));
    // Correct the request format for the model
    const result = await model.generateContent(input);

    const responseText = result.response.text();

    console.log("Response: " + JSON.stringify(responseText));
    // Append the new exchange to the history
    history.push({ role: "user", content: prompt });
    history.push({ role: "assistant", content: responseText });

    // Save updated history
    sessionHistory.set(sessionId, history);

    res.status(200).json({ response: responseText });
  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).json({ error: "Failed to generate response" });
  }
};


module.exports = { 
  generateJsonFromCV,
  sendToBot,
};
