const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL

export async function requestAdvisory(payload) {
  if (!webhookUrl) {
    await new Promise((resolve) => setTimeout(resolve, 900))
    return {
      success: true,
      language: payload.language,
      isMock: true,
      weather: {
        temperature: 28,
        rainfall: 0,
        description: payload.language === 'Telugu' ? 'పాక్షికంగా మేఘావృతం' : 'Partly cloudy',
      },
      advisory:
        payload.language === 'Telugu'
          ? `${payload.crop || 'పంట'} కోసం నమూనా సలహా: పొలంలో తేమ స్థాయి తనిఖీ చేయండి, ముందుగానే వేసిన రోజువారీ పొలం పరిశీలనలను కొనసాగించండి మరియు పంటలో ఎలాంటి అనారోగ్య లక్షణాలు కనిపిస్తే స్థానిక వ్యవసాయ అధికారిని సంప్రదించండి.`
          : `Sample guidance for ${payload.crop || 'your crop'}: Check field moisture before watering, continue regular crop inspection, and consult a local agricultural officer if disease symptoms appear. Avoid unsupported pesticide or fertilizer use.`,
    }
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: payload.location,
      crop: payload.crop,
      soil: payload.soil,
      question: payload.question,
      language: payload.language,
    }),
  })

  if (!response.ok) {
    throw new Error(`The advisory service returned status ${response.status}.`)
  }

  const result = await response.json()
  if (typeof result?.output !== 'string' || !result.output.trim()) {
    throw new Error('The advisory response did not contain an output string.')
  }

  return { advisory: result.output, isMock: false }
}
