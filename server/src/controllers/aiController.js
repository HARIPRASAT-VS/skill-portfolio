const { GoogleGenAI } = require('@google/genai');

// Initialize Gemini if API key is present
let ai;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

exports.chatWithAI = async (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!ai) {
      return res.status(200).json({ 
        reply: "I am a mocked response because the GEMINI_API_KEY is not configured in the server's .env file. But I see your message: " + message 
      });
    }

    // Prepare context for Gemini
    const systemInstruction = `You are a helpful AI Career Assistant for a student portfolio platform called SkillFolio. 
    Here is the user's context: ${JSON.stringify(context || {})}. 
    Be encouraging, concise, and offer actionable advice for improving their portfolio, skills, or job search.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.status(200).json({ reply: response.text });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ error: 'Failed to communicate with AI' });
  }
};
