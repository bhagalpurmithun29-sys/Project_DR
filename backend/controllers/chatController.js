const axios = require('axios');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Strict diabetes-only system instruction
const SYSTEM_INSTRUCTION = `You are DiabetesAI, a highly specialized and compassionate medical assistant embedded within the RetinaAI clinical platform. Your ONLY purpose is to answer questions strictly related to diabetes and diabetic conditions.

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

If a user asks something unrelated to diabetes, respond politely: "I'm DiabetesAI, specialized exclusively in diabetes-related questions. I'm not able to help with that topic, but I'm happy to answer any questions you have about diabetes management, symptoms, or treatment."

Always be:
- Medically accurate but easy to understand
- Empathetic and patient-friendly
- Clear that you are an AI and users should consult their doctor for personal medical decisions
- Concise (2-5 sentences per response unless more detail is clearly needed)`;

/**
 * @desc    Send a message to the Diabetes AI chatbot (powered by Groq)
 * @route   POST /api/chat/message
 * @access  Public
 */
const sendMessage = async (req, res) => {
    const { message, history = [] } = req.body;

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
        // Keep the last 8 conversation turns for context
        const recentHistory = history.slice(-8);

        const messages = [
            { role: 'system', content: SYSTEM_INSTRUCTION },
            ...recentHistory.map(turn => ({
                // Groq uses 'assistant' instead of 'model'
                role: turn.role === 'model' ? 'assistant' : 'user',
                content: turn.text,
            })),
            { role: 'user', content: message.trim() },
        ];

        const payload = {
            model: 'llama-3.3-70b-versatile',  // Fast, powerful Groq model
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
            return res.status(502).json({ success: false, message: 'AI returned an empty response. Please try again.' });
        }

        return res.status(200).json({ success: true, reply: aiText.trim() });

    } catch (error) {
        // Log the full Groq error for debugging
        const groqError = error.response?.data;
        console.error('❌ Groq Chatbot Error:', groqError || error.message);

        if (error.code === 'ECONNABORTED') {
            return res.status(504).json({ success: false, message: 'AI request timed out. Please try again.' });
        }

        if (error.response?.status === 429) {
            return res.status(429).json({ success: false, message: 'AI is temporarily busy (rate limit). Please wait a moment and try again.' });
        }

        if (error.response?.status === 401) {
            return res.status(500).json({ success: false, message: 'Invalid Groq API key. Please check your .env file.' });
        }

        const errMsg = groqError?.error?.message || error.message || 'Failed to get AI response.';
        return res.status(500).json({ success: false, message: errMsg });
    }
};

module.exports = { sendMessage };
