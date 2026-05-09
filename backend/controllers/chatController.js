const axios = require('axios');
const Chat = require('../models/Chat');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Strict diabetes-only system instruction
const SYSTEM_INSTRUCTION = `You are DiabetesAI, a highly specialized and compassionate medical assistant embedded within the Retinal AI clinical platform. Your ONLY purpose is to answer questions strictly related to diabetes and diabetic conditions.

Topics you CAN discuss:
- Types of diabetes (Type 1, Type 2, gestational diabetes, LADA, MODY)
- Blood sugar / glucose levels, HbA1c
- Insulin types, dosing strategies, and administration
- Diabetic retinopathy, neuropathy, nephropathy, and other complications
- Dietary guidance, carbohydrate counting, and glycemic index for diabetics
- Medications for diabetes (metformin, GLP-1 agonists, SGLT2 inhibitors, etc.)
- Exercise and lifestyle management for diabetics
- Hypoglycemia and hyperglycemia: symptoms and management
- Diabetic wound care and foot health
- Monitoring devices (CGMs, glucometers)
- Prevention of diabetes and prediabetes guidance

Topics you MUST DECLINE:
- Any question not related to diabetes or its direct complications
- General medical advice unrelated to diabetes
- Personal, legal, financial, or non-medical topics

Language and Reply Requirements:
- First, analyze the patient's query to detect the language and script style used.
- If the patient's query is in proper English, you MUST reply ONLY in English.
- If the patient uses Hindi, a mix of Hindi and English (Hinglish), or Hindi written in Latin script (e.g., "sugar control kaise kare", "HbA1c level normal kaise hoga", "mujhe eye pain hai"), you MUST reply in Hinglish (Hindi written in the Roman/Latin script, incorporating English medical/lifestyle terms naturally so it is very easy for a Hinglish speaker to read). Do NOT reply in Devanagari script (Hindi characters) unless explicitly asked.

If a user asks something unrelated to diabetes:
- In English (if they asked in English): "I'm DiabetesAI, specialized exclusively in diabetes-related questions. I'm not able to help with that topic, but I'm happy to answer any questions you have about diabetes management, symptoms, or treatment."
- In Hinglish (if they asked in Hindi/Hinglish): "Main DiabetesAI hoon, aur main sirf diabetes se related sawalo ke answers de sakta hoon. Main is topic me help nahi kar paunga, par agar aapko diabetes management, symptoms, ya treatment ke baare me kuch puchna hai toh main help kar sakta hoon."

Always be:
- Medically accurate but easy to understand
- Empathetic and patient-friendly
- Clear that you are an AI and users should consult their doctor for personal medical decisions. The disclaimer/consultation line MUST match the language style of the rest of your reply:
  * For English replies: The last line/disclaimer must be in English (e.g., "Please consult your doctor for personalized medical advice.").
  * For Hinglish replies: The last line/disclaimer must be in Hinglish (e.g., "Kripya apne doctor se salah lein taaki aapko sahi guidance mil sake.").
  * Do NOT use Devanagari script (Hindi characters like "कृपया अपने...") under any circumstances.
- Concise (2-5 sentences per response unless more detail is clearly needed)`;

const formatTime = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

/**
 * @desc    Send a message to the Diabetes AI chatbot (powered by Groq)
 * @route   POST /api/chat/message
 * @access  Private (Patient)
 */
const sendMessage = async (req, res) => {
    const { message, history = [] } = req.body;
    const userId = req.user?._id;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    if (message.trim().length > 1000) {
        return res.status(400).json({ success: false, message: 'Message too long. Please keep it under 1000 characters.' });
    }

    if (!GROQ_API_KEY) {
        console.error('❌ GROQ_API_KEY is missing from .env');
        return res.status(500).json({ success: false, message: 'AI service is not configured. GROQ_API_KEY missing.' });
    }

    try {
        // Build OpenAI-compatible message array
        const recentHistory = history.slice(-8);

        const messages = [
            { role: 'system', content: SYSTEM_INSTRUCTION },
            ...recentHistory.map(turn => ({
                role: turn.role === 'model' ? 'assistant' : 'user',
                content: turn.text,
            })),
            { role: 'user', content: message.trim() },
        ];

        const payload = {
            model: 'llama-3.3-70b-versatile',
            messages,
            temperature: 0.4,
            max_tokens: 512,
            top_p: 0.95,
            stream: false,
        };

        const response = await axios.post(GROQ_API_URL, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`,
            },
            timeout: 25000,
        });

        const aiText = response.data?.choices?.[0]?.message?.content;

        if (!aiText) {
            return res.status(502).json({ success: false, message: 'AI returned an empty response.' });
        }

        const reply = aiText.trim();

        // PERSIST TO MONGODB if user is logged in
        if (userId) {
            const userMsg = { role: 'user', text: message.trim(), time: formatTime(new Date()), id: Date.now().toString() };
            const modelMsg = { role: 'model', text: reply, time: formatTime(new Date()), id: (Date.now() + 1).toString() };

            await Chat.findOneAndUpdate(
                { userId },
                { 
                    $push: { messages: { $each: [userMsg, modelMsg] } },
                    $set: { updatedAt: new Date() }
                },
                { upsert: true, new: true }
            );
        }

        return res.status(200).json({ success: true, reply });

    } catch (error) {
        console.error('❌ Chatbot Error:', error.response?.data || error.message);
        const errMsg = error.response?.data?.error?.message || 'Failed to get AI response.';
        return res.status(500).json({ success: false, message: errMsg });
    }
};

/**
 * @desc    Get chat history for the logged-in user
 * @route   GET /api/chat/history
 * @access  Private
 */
const getChatHistory = async (req, res) => {
    try {
        const chat = await Chat.findOne({ userId: req.user._id });
        res.status(200).json({ success: true, messages: chat ? chat.messages : [] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch chat history' });
    }
};

/**
 * @desc    Clear chat history for the logged-in user
 * @route   DELETE /api/chat/history
 * @access  Private
 */
const clearChatHistory = async (req, res) => {
    try {
        await Chat.findOneAndDelete({ userId: req.user._id });
        res.status(200).json({ success: true, message: 'Chat history cleared' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to clear history' });
    }
};

module.exports = { sendMessage, getChatHistory, clearChatHistory };
