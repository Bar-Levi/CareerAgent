const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();
const fs = require("fs"); // Import the fs module for file system operations
const path = require("path");
const sessionHistory = new Map(); // Temporary in-memory storage

// Initialize the AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const prepromptFilePath = path.resolve(__dirname, "../prompts/preprompt.txt");
const preprompt = fs.readFileSync(prepromptFilePath, "utf-8");


const generateResponse = async (req, res) => {
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
  const input = `${preprompt}, ${formattedHistory}. Now tell me - ${prompt}`;

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

module.exports = { generateResponse };
