const axios = require("axios");
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const API_KEY = "sk-proj-AsMf10CHSf3Rwb9FTBmjT3BlbkFJSaDwiClnfcEnMvmZBFVy"; // replace with your OpenAI API key

async function getResponse(message) {
  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Answer like a thoughtful and kind teacher!",
          },
          {
            role: "user",
            content: message,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error(error);
    return null;
  }
}

module.exports.getResponse = getResponse; // Export the getResponse function
