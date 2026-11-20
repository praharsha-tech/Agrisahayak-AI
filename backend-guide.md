# AgriSahayak AI - Backend Integration Guide

## 1. Integration Architecture

The frontend is a React/Vite application. n8n acts as the backend automation layer and is the only place that stores API keys.

Recommended flow:

```text
React frontend
  -> n8n webhook
  -> weather API / Gemini API / mandi API
  <- formatted JSON response
  -> React UI
```

Do not call Gemini or weather API providers directly from the React frontend.

---

## 2. Required n8n Workflows

### Workflow 1: Crop Advisory

Purpose:

- Receive farmer form details.
- Convert a location into coordinates when necessary.
- Fetch weather data from Open-Meteo.
- Send farm and weather context to Gemini.
- Return formatted advisory JSON.

Webhook:

- Name: `agrisahayak-advisory`
- Method: `POST`
- Full URL example: `https://<n8n-host>/webhook/agrisahayak-advisory`

### Workflow 2: AI Chatbot

Purpose:

- Receive a farmer chat message.
- Preserve or restore optional conversation context.
- Send relevant agricultural context to Gemini.
- Return a short, understandable answer in English or Telugu.

Webhook:

- Name: `agrisahayak-chat`
- Method: `POST`
- Full URL example: `https://<n8n-host>/webhook/agrisahayak-chat`

### Workflow 3: Mandi Prices (Optional)

Purpose:

- Fetch market prices only from a reliable official or verified source.
- Return market name, crop, price, and date.
- Return an unavailable response instead of invented values.

Webhook:

- Name: `agrisahayak-mandi`
- Method: `POST` or `GET`
- Recommended method: `POST` for location and crop filters
- Full URL example: `https://<n8n-host>/webhook/agrisahayak-mandi`

A `POST` method is recommended because it can receive district, market, and crop filters consistently.

---

## 3. Crop Advisory Contract

### Request JSON

```json
{
  "location": "Guntur",
  "crop": "Rice",
  "soil": "Black soil",
  "question": "Why are my leaves turning yellow?",
  "language": "English"
}
```

Fields:

| Field | Required | Description |
|---|---:|---|
| `location` | Yes | Village, district, city, or pincode entered by the farmer |
| `crop` | Yes | Crop selected in the frontend |
| `soil` | Yes | Soil type selected in the frontend |
| `question` | Yes | Farmer's farming question |
| `language` | Yes | `English` or `Telugu` |

For better identification, include `farmerName` in a future payload if needed. The existing frontend does not send it because its current state is not included in the advisory request.

### Production Success Response

The production webhook response provided for this integration is a JSON object with an `output` string:

```json
{
  "output": "Your crop advisory will appear here. It includes weather information, irrigation suggestions and crop-care guidance."
}
```

The frontend displays `output` in the existing crop advisory card. The sample response does not include separate weather fields, so the frontend does not infer or map any weather data from it.

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "WEATHER_UNAVAILABLE",
    "message": "Weather information is currently unavailable."
  }
}
```

Suggested error codes:

| Code | Use |
|---|---|
| `VALIDATION_ERROR` | Required fields are missing or invalid |
| `LOCATION_NOT_FOUND` | Location could not be converted to coordinates |
| `WEATHER_UNAVAILABLE` | Open-Meteo or geocoding failed |
| `AI_UNAVAILABLE` | Gemini could not generate an answer |
| `UPSTREAM_TIMEOUT` | An external API timed out |
| `INTERNAL_ERROR` | Unexpected n8n workflow failure |

The frontend treats non-2xx responses and responses without a non-empty `output` string as failures. Keep detailed workflow errors in n8n logs and return a non-2xx status when the advisory cannot be generated.

---

## 4. Chatbot Contract

### Request JSON

```json
{
  "message": "My cotton leaves are turning yellow",
  "language": "English",
  "conversationHistory": [
    {
      "role": "assistant",
      "text": "Namaste! Ask me a farming question."
    }
  ]
}
```

Fields:

| Field | Required | Description |
|---|---:|---|
| `message` | Yes | Latest farmer question |
| `language` | Yes | `English` or `Telugu` |
| `conversationHistory` | No | Previous chat messages for context |

### Success Response

```json
{
  "success": true,
  "language": "English",
  "reply": "Check the crop stage, symptoms, and recent watering. Avoid applying a pesticide until the problem is identified by a local expert."
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "AI_UNAVAILABLE",
    "message": "The farming assistant is temporarily unavailable."
  }
}
```

n8n should restrict chatbot answers to agriculture and farming. Gemini prompts should discourage unsupported chemical recommendations and encourage verification by a local agricultural officer.

---

## 5. Mandi Price Contract

### Request JSON

```json
{
  "location": "Guntur",
  "cropName": "Rice",
  "language": "English"
}
```

### Success Response

```json
{
  "success": true,
  "language": "English",
  "prices": [
    {
      "marketName": "Guntur Mandi",
      "crop": "Rice",
      "price": 2450,
      "currency": "INR",
      "unit": "quintal",
      "date": "2026-11-18"
    }
  ]
}
```

### Unavailable Response

```json
{
  "success": true,
  "language": "English",
  "prices": [],
  "message": "Reliable market prices are currently unavailable."
}
```

Never return fabricated, approximate, or demo mandi prices as live values. The frontend should keep a sample/unavailable state until a reliable source is connected.

---

## 6. Required APIs and Services

### Open-Meteo Weather API

Purpose:

- Retrieve current temperature and rainfall information.
- Provide weather context to Gemini.

n8n responsibilities:

1. Resolve the farmer's location.
2. Convert the location to latitude and longitude if coordinates are not supplied.
3. Request current weather values from Open-Meteo.
4. Map returned values to:
   - `temperature`
   - `rainfall`
   - `description`

Example Open-Meteo request pattern:

```text
https://api.open-meteo.com/v1/forecast
  ?latitude=<latitude>
  &longitude=<longitude>
  &current=temperature_2m,rain
```

Open-Meteo should be called by n8n, not the browser.

For text locations, an n8n geocoding step is required. Use an approved geocoding service that the n8n workflow can safely connect to. Store all geocoding credentials in n8n.

### Gemini API

Purpose:

- Generate crop advisory.
- Generate multilingual chatbot responses.
- Combine farm details with available weather context.

Gemini API credentials must be stored only in n8n credentials or n8n environment variables.

Suggested advisory prompt inputs:

- Location
- Crop name
- Soil type
- Farmer question
- Weather temperature
- Rainfall
- Weather description
- Selected language

Suggested system constraints:

- Return short, practical advice.
- Answer in the selected language.
- Explain recommendations clearly.
- Do not invent weather or market data.
- Do not provide unsupported pesticide or fertilizer dosage instructions.
- Encourage confirmation by a local agricultural officer for important decisions.

### Mandi Data API or Data Source

Purpose:

- Supply reliable market prices for the optional mandi section.

Use only an official government, recognized agricultural market, or contractually verified source. Do not depend on screen scraping or unlicensed third-party APIs without validation.

The mandi API provider's credentials and update schedule are workflow configuration, not frontend configuration.

---

## 7. Frontend Environment Variables

Create a frontend `.env` file from `.env.example`:

```text
VITE_N8N_ADVISORY_WEBHOOK_URL=https://<n8n-host>/webhook/agrisahayak-advisory
VITE_N8N_CHAT_WEBHOOK_URL=https://<n8n-host>/webhook/agrisahayak-chat
VITE_N8N_MANDI_WEBHOOK_URL=https://<n8n-host>/webhook/agrisahayak-mandi
```

The current frontend currently supports only:

```text
VITE_N8N_WEBHOOK_URL
```

That variable is used for crop advisory and currently also acts as the fallback integration entry point.

For a staged migration:

```text
VITE_N8N_WEBHOOK_URL=https://<n8n-host>/webhook/agrisahayak-advisory
VITE_N8N_CHAT_WEBHOOK_URL=https://<n8n-host>/webhook/agrisahayak-chat
VITE_N8N_MANDI_WEBHOOK_URL=https://<n8n-host>/webhook/agrisahayak-mandi
```

Rules:

- Prefix browser variables with `VITE_` only for public webhook URLs.
- Never add Gemini API keys to `.env` or React code.
- Never add Open-Meteo secrets to the frontend unless the provider explicitly requires them.
- Never add mandi provider credentials to the frontend.
- Restart the Vite development server after changing environment variables.

---

## 8. Frontend Feature Connection Map

### Farmer Information Form

Frontend action:

- The form posts location, crop, soil, question, and language.

n8n workflow:

- `agrisahayak-advisory`

HTTP method:

- `POST`

Frontend service:

- `src/services/advisoryService.js`

Frontend result:

- Sets the loading state.
- Displays advisory text.
- Updates the weather card.
- Displays a sample-data label until `isMock` is false.

### Weather Card

Before backend integration:

- Displays hardcoded, clearly labelled sample weather values.

After backend integration:

- Uses `weather.temperature`, `weather.rainfall`, and `weather.description` from the advisory response.
- Displays the location from the submitted farmer data or a geocoded canonical location.

### Crop Advisory Card

Before backend integration:

- Displays mock guidance from `advisoryService.js`.

After backend integration:

- Displays `advisory.advisory` from the crop advisory webhook.
- Displays the live-response label when `isMock` is not true.

### Language Selector

The frontend sends `English` or `Telugu` in the request payload.

n8n must:

- Generate Gemini output in the requested language.
- Return matching `language` in the JSON response.
- Keep weather labels and UI text in sync with the selected interface language.

### Chatbot

The current chatbot is frontend-only and uses local topic matching.

Required backend connection:

- Send the user's latest message to `agrisahayak-chat`.
- Include `language` and optional `conversationHistory`.
- Replace the local mock reply with `response.reply`.

The frontend currently does not call a chat webhook. It requires frontend service and state changes during backend implementation.

### Mandi Price Section

The frontend currently displays a clear unavailable state and no invented data.

Required backend connection:

- Call `agrisahayak-mandi` using location and crop filters.
- Map `marketName`, `crop`, `price`, `currency`, `unit`, and `date` into the UI.
- Hide or retain the unavailable state when `prices` is empty.

### Loading and Error States

n8n integration must preserve:

- Loading indication while a webhook is pending.
- Validation errors for incomplete form fields.
- Helpful connection/API error messages.
- Partial weather success or unavailable weather handling.
- A clear distinction between sample and live data.

---

## 9. Suggested n8n Workflow Node Sequence

### Advisory Workflow Nodes

1. Webhook receives `POST` request.
2. Edit/Set node validates required fields.
3. IF node checks that location, crop, soil, question, and language are present.
4. HTTP Request node calls the geocoder or uses supplied coordinates.
5. HTTP Request node calls Open-Meteo.
6. Code node normalizes temperature, rainfall, location, and weather description.
7. Gemini node receives the normalized farm context and strict prompt instructions.
8. Code node prepares the final JSON response.
9. Respond to Webhook returns success or structured failure JSON.

### Chat Workflow Nodes

1. Webhook receives `POST` request.
2. Validation checks message and language.
3. Optional chat history is normalized.
4. Gemini receives message, history, and agricultural guardrails.
5. Code node prepares the reply JSON.
6. Respond to Webhook returns success or structured failure JSON.

### Mandi Workflow Nodes

1. Webhook receives `POST` request.
2. Validation checks location and crop filters.
3. HTTP Request calls the approved mandi data provider.
4. Code node filters, validates, and normalizes records.
5. Respond to Webhook returns live prices or an empty unavailable result.

---

## 10. Security and Reliability Checklist

- Keep Gemini, mandi, and geocoding credentials in n8n credentials or n8n environment variables.
- Enable CORS only for the frontend origin in n8n when required.
- Validate incoming JSON before external API calls.
- Use request timeouts for weather, Gemini, geocoding, and mandi providers.
- Do not expose internal provider responses or API keys.
- Never return fabricated weather or mandi data.
- Use HTTPS for all public webhook URLs.
- Avoid saving unnecessary farmer personal information.
- Clearly identify sample data during frontend development.
- Log failed requests for debugging without storing sensitive farmer questions unnecessarily.
- Add retry only for recoverable upstream failures and keep response latency practical.
