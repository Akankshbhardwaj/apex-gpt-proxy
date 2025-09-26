const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// OpenAI API token stored as environment variable in Render
const OPENAI_KEY = process.env.OPENAI_KEY;

app.use(bodyParser.json());

// Health check route
app.get('/health', (req, res) => res.send('OK'));

// GPT-4o-mini summarization / explanation route
app.post('/summarize', async (req, res) => {
    const inputText = req.body.inputs;

    if (!inputText || typeof inputText !== 'string') {
        return res.status(400).json({ error: "Missing or invalid 'inputs' in request body." });
    }

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
               model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant.' },
                    { role: 'user', content: inputText }
                ],
                temperature: 0.7
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENAI_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

       const summaryRaw = response.data.choices[0].message.content;
// Remove newlines and bold markdown
const summaryClean = summaryRaw.replace(/\n/g, ' ').replace(/\*\*/g, '');
res.json({ summary: summaryClean });


    } catch (error) {
        if (error.response && error.response.data) {
            return res.status(error.response.status || 500).json({
                error: error.response.data.error || error.response.data
            });
        }
        res.status(500).json({ error: error.message || error.toString() });
    }
});

// Start server
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
