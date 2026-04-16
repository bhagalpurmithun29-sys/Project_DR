const axios = require('axios');

/**
 * Service to call Groq API (Llama) for Clinical Summary Generation
 */
const generateClinicalSummary = async (scanData) => {
    const apiKey = process.env.GROQ_API_KEY;
    
    console.log('[AI Service] Initializing Groq (Llama) call for:', scanData.patientName);
    
    if (!apiKey) {
        console.error('[AI Service] CRITICAL ERROR: GROQ_API_KEY is missing from .env');
        return "System error: Clinical summary generation blocked due to missing credentials.";
    }

    const { riskLevel, findings, patientName, eyeSide } = scanData;
    
    const prompt = `
        You are an expert Ophthalmologist specializing in Diabetic Retinopathy (DR).
        Patient Name: ${patientName || 'Anonymous Patient'}
        Scan Detail: ${eyeSide === 'OD' ? 'Right Eye (OD)' : 'Left Eye (OS)'}
        AI Detection Status: ${riskLevel}
        Findings: ${findings && findings.length > 0 ? findings.join(', ') : 'No lesions detected'}

        Task: Generate a concise, highly professional medical summary for a diagnostic report.
        
        Structure your response clearly with these headers:
        1. **Clinical Impression**: A summary of the AI detection in medical terms.
        2. **Patient Explanation**: A patient-friendly explanation of what this means for their eyes.
        3. **Recommendations**: 3 bulleted medical recommendations for the clinician.

        Tone: Clinical, precise, and authoritative.
    `;

    try {
        const url = `https://api.groq.com/openai/v1/chat/completions`;
        
        const response = await axios.post(url, {
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: "You are a professional medical assistant specializing in ophthalmology." },
                { role: "user", content: prompt }
            ],
            temperature: 0.1,
            max_tokens: 1024,
            top_p: 1
        }, {
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            timeout: 15000 
        });

        if (response.data && response.data.choices && response.data.choices[0].message) {
            console.log('[AI Service] Groq (Llama 3.1) successfully generated summary.');
            return response.data.choices[0].message.content;
        } else {
            console.error('[AI Service] Unexpected payload structure from Groq:', JSON.stringify(response.data));
            throw new Error('Incomplete data received from Groq model.');
        }
    } catch (error) {
        const errMsg = error.response?.data?.error?.message || error.message;
        console.error(`[AI Service] Groq API FAILURE: ${errMsg}`);
        
        return `Automated clinical summary is currently unavailable (Provider Error: ${errMsg}). Results confirmed as: ${riskLevel}. Findings: ${findings.join(', ')}.`;
    }
};

module.exports = { generateClinicalSummary };
