Project Specification – AgriSahayak AI

1. Project Overview

Project Name: AgriSahayak AI

Track: Climate, Resource Infrastructure & Global Supply Resilience

Project Type: AI-powered Multilingual Agricultural Assistant

AgriSahayak AI is a web application designed to help farmers access agricultural information through AI. It provides weather information, crop guidance and answers to farming-related questions in regional languages.

2. Problem Statement

Farmers often face difficulties accessing timely weather information, crop guidance and agricultural market information. Information is scattered across different sources, and language barriers make it difficult for some farmers to understand technical agricultural advice.

3. Proposed Solution

Develop an AI-powered agricultural assistant that allows farmers to enter their farming details and receive simple, understandable agricultural guidance in their preferred language.

The application will combine available weather information, farmer inputs and AI-generated responses.

4. Main Objectives

- Make agricultural information easier to access.
- Provide AI-based crop guidance.
- Support Telugu and English languages.
- Display useful weather information.
- Create a simple and user-friendly application for farmers.

5. Main Features

Feature 1: Farmer Information Form

Collect the following information:

- Farmer's name (optional)
- Location
- Crop name
- Soil type
- Farming-related question

Feature 2: Weather Information

- Display current weather information.
- Show temperature and rainfall information when available.
- Use a weather API for real data.
- Display the location of the weather information.

Feature 3: AI Crop Advisory

- Analyse farmer inputs.
- Consider available weather information.
- Generate simple crop-related guidance.
- Explain recommendations clearly.

Feature 4: Multilingual AI Assistant

- Support Telugu and English.
- Allow farmers to select their preferred language.
- Generate responses in the selected language.

Feature 5: AI Chatbot

- Allow farmers to ask agricultural questions.
- Provide simple and understandable answers.
- Display responses in a clean chat interface.

Feature 6: Mandi Price Information (Optional)

- Display agricultural market prices when a reliable data source is available.
- Show the market name, crop, price and date.
- Never display invented prices.

6. Technology Stack

- Frontend: React and CSS (Vite).
- AI Coding Assistant: Codex.
- Backend Automation: n8n.
- AI Model: Gemini API through n8n.
- Weather API: Open-Meteo.
- Version Control: GitHub.

7. Frontend Requirements

Create a modern, attractive and responsive web application.

Design preferences:

- Green, white and light-blue colour combination.
- Clean agricultural-themed design.
- Simple navigation.
- Easy-to-read text.
- Professional dashboard.
- Responsive layout for mobile and desktop.

Required sections:

1. Home page.
2. Farmer dashboard.
3. Farmer information form.
4. Weather information section.
5. AI crop advisory section.
6. AI chatbot.
7. Language selection (Telugu/English).

8. Backend Integration Requirements

The frontend must be prepared for integration with an n8n webhook.

The frontend should send:

- Location
- Crop name
- Soil type
- Farmer's question
- Selected language

The n8n workflow will:

1. Receive information through a webhook.
2. Process the farmer's inputs.
3. Fetch available weather information.
4. Send relevant information to the Gemini AI model.
5. Generate agricultural guidance.
6. Return the response to the frontend.

Use an environment variable for the webhook URL. Never expose API keys in frontend code.

9. API Response Format

Prepare the frontend to handle a JSON response in this format:

{
"output": "AI-generated agricultural guidance"
}

Display the `output` string as the crop advisory.

Handle loading, errors and unavailable information properly.

Use mock responses during initial frontend development.

10. Important Requirements

- Do not create fake weather or market information.
- Clearly identify sample data.
- Do not provide unsupported pesticide or fertilizer recommendations.
- Show helpful error messages when APIs fail.
- Keep the code organised and easy to understand.
- All buttons and forms must work.
- Keep frontend and backend integration separate.
- Do not hardcode API keys.

11. Expected Final Output

Build a complete frontend application with:

- All required pages and features.
- Responsive design.
- Working forms and chatbot interface.
- Mock data for initial testing.
- Prepared n8n webhook integration.
- Clean and organised source code.

The final application should be easy to use, visually attractive and suitable for demonstrating an AI-powered agricultural assistant during a hackathon.

12. Project Goal

The main goal of AgriSahayak AI is to make agricultural information more accessible to farmers through artificial intelligence, automation and multilingual communication.