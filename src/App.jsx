import { useRef, useState } from 'react'
import {
  CloudSun,
  Droplets,
  Leaf,
  MapPin,
  Menu,
  MessageCircle,
  Send,
  Sprout,
  ThermometerSun,
  TrendingUp,
  User,
  X,
} from 'lucide-react'
import { requestAdvisory } from './services/advisoryService'

const copy = {
  English: {
    navDashboard: 'Dashboard', navAdvice: 'Crop Advisory', navChat: 'Ask Assistant',
    greeting: 'Good morning', location: 'Guntur, Andhra Pradesh', season: 'Kharif Season',
    title: 'Your farm, informed.', subtitle: 'Weather and practical crop guidance for today.',
    weatherTitle: 'Today’s weather', sample: 'Sample data', live: 'Live response',
    temperature: 'Temperature', rainfall: 'Rainfall', feels: 'Field conditions are suitable',
    formTitle: 'Get crop guidance', formSubtitle: 'Tell us about your farm', name: 'Farmer name (optional)',
    locationLabel: 'Location', crop: 'Crop name', soil: 'Soil type', question: 'What is your farming question?',
    placeholders: { name: 'Enter your name', location: 'Village or district', crop: 'Select crop', soil: 'Select soil', question: 'Example: Why are my leaves turning yellow?' },
    submit: 'Get guidance', submitLoading: 'Preparing guidance...', advisoryTitle: 'Crop advisory',
    advisorySubtitle: 'AI guidance based on your farm details', advisoryEmpty: 'Your personalised crop guidance will appear here.',
    chatTitle: 'Farm assistant', chatOnline: 'Ready to help', chatPlaceholder: 'Ask about crops, weather or pests...', chatSend: 'Send',
    chatIntro: 'Namaste! Ask me a farming question. I can help you prepare questions for your local agricultural officer.',
    mandiTitle: 'Mandi prices', mandiUnavailable: 'Market prices are unavailable', mandiDetail: 'Connect a reliable price source before displaying market data.',
    errorTitle: 'Could not get guidance', errorText: 'Please check your connection and try again.',
  },
  Telugu: {
    navDashboard: 'డాష్బోర్డ్', navAdvice: 'పంట సలహా', navChat: 'ప్రశ్న అడగండి',
    greeting: 'శుభోదయం', location: 'గుంటూరు, ఆంధ్రప్రదేశ్', season: 'ఖరీఫ్ సీజన్',
    title: 'మీ పొలానికి, సరైన సమాచారం.', subtitle: 'ఈ రోజు వాతావరణం మరియు ఆచరణాత్మక పంట మార్గదర్శకం.',
    weatherTitle: 'ఈ రోజు వాతావరణం', sample: 'నమూనా సమాచారం', live: 'లైవ్ ప్రతిస్పందన',
    temperature: 'ఉష్ణోగ్రత', rainfall: 'వర్షపాతం', feels: 'పొల పరిస్థితులు అనుకూలంగా ఉన్నాయి',
    formTitle: 'పంట సలహా పొందండి', formSubtitle: 'మీ పొలం గురించి చెప్పండి', name: 'రైతు పేరు (ఐచ్ఛికం)',
    locationLabel: 'స్థలం', crop: 'పంట పేరు', soil: 'నేల రకం', question: 'మీ వ్యవసాయ ప్రశ్న ఏమిటి?',
    placeholders: { name: 'మీ పేరు', location: 'గ్రామం లేదా జిల్లా', crop: 'పంట ఎంచుకోండి', soil: 'నేల ఎంచుకోండి', question: 'ఉదాహరణ: ఆకులు పసుపు ఎందుకు మారుతున్నాయి?' },
    submit: 'సలహా పొందండి', submitLoading: 'సలహా తయారవుతోంది...', advisoryTitle: 'పంట సలహా',
    advisorySubtitle: 'మీ పొల వివరాల ఆధారంగా మార్గదర్శకం', advisoryEmpty: 'మీ వ్యక్తిగత పంట మార్గదర్శకం ఇక్కడ కనిపిస్తుంది.',
    chatTitle: 'పొల సహాయకుడు', chatOnline: 'సహాయం కోసం సిద్ధం', chatPlaceholder: 'పంటలు, వాతావరణం లేదా పురుగుల గురించి అడగండి...', chatSend: 'పంపు',
    chatIntro: 'నమస్కారం! వ్యవసాయ ప్రశ్న అడగండి. స్థానిక వ్యవసాయ అధికారితో మాట్లాడే ప్రశ్నను తయారు చేయడంలో సహాయం చేస్తాను.',
    mandiTitle: 'మండి ధరలు', mandiUnavailable: 'మార్కెట్ ధరలు లభ్యం కావడం లేదు', mandiDetail: 'నమ్మదగిన మార్కెట్ డేటా అందుబాటులోకి రాకముందు ధరలు ప్రదర్శించబడవు.',
    errorTitle: 'సలహా పొందడం సాధ్యం కాలేదు', errorText: 'కనెక్షన్ తనిఖీ చేసి మళ్లీ ప్రయత్నించండి.',
  },
}

const initialChat = (language) => ({
  role: 'assistant',
  text: copy[language].chatIntro,
})

export default function App() {
  const [language, setLanguage] = useState('English')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [form, setForm] = useState({ name: '', location: 'Guntur', crop: '', soil: '', question: '' })
  const [advisory, setAdvisory] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [messages, setMessages] = useState([initialChat('English')])
  const [chatInput, setChatInput] = useState('')
  const chatEndRef = useRef(null)
  const t = copy[language]

  function changeLanguage(nextLanguage) {
    setLanguage(nextLanguage)
    setMessages([initialChat(nextLanguage)])
  }

  function updateForm(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function submitForm(event) {
    event.preventDefault()
    if (!form.location.trim() || !form.crop.trim() || !form.soil.trim() || !form.question.trim()) {
      setError(language === 'Telugu' ? 'స్థలం, పంట, నేల రకం మరియు ప్రశ్న తప్పనిసరి.' : 'Please complete location, crop, soil type, and question.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const result = await requestAdvisory({
        location: form.location,
        crop: form.crop,
        soil: form.soil,
        question: form.question,
        language,
      })
      setAdvisory(result)
    } catch (requestError) {
      setError(requestError.message || t.errorText)
    } finally {
      setLoading(false)
    }
  }

  function sendChat(event) {
    event.preventDefault()
    const text = chatInput.trim()
    if (!text) return

    const userMessage = { role: 'user', text }
    const isTelugu = language === 'Telugu'
    const lowerText = text.toLowerCase()
    let reply

    if (/water|irrigat|నీరు|నీట/.test(lowerText)) {
      reply = isTelugu
        ? 'ముందుగా నేలలోని తేమను తనిఖీ చేయండి. నాట్లు లేదా పైరుల వయస్సు బట్టి నీటిపారుదల అవసరం మారుతుంది. సులభమైన నీటి కాలాన్ని ఎంచుకోకుండా స్థానిక వ్యవసాయ సలహాదారుతో చర్చించండి.'
        : 'Check soil moisture before watering. Irrigation needs vary with crop stage and weather, so confirm the schedule with a local agricultural adviser.'
    } else if (/pest|disease|yellow|purugu|ఆకు|రోగ/.test(lowerText)) {
      reply = isTelugu
        ? 'లక్షణాల ఫోటో, పంట వయస్సు మరియు ఇంతకు ముందు ఉపయోగించిన మార్గాలను జ్ఞాపకం ఉంచండి. గుర్తింపు చేసుకోకుండా పురుగు మందు లేదా ఎరువు ఇవ్వవద్దు.'
        : 'Note the crop stage, symptoms, and any recent treatment. Avoid pesticide or fertilizer use without identifying the problem with a local expert.'
    } else {
      reply = isTelugu
        ? 'మీ ప్రశ్నను మీ పంట, వేరియటీ, దశ మరియు ఎక్కడ కనిపిస్తున్నదో వివరించడం ద్వారా మరింత స్పష్టంగా అడగండి.'
        : 'Please include the crop, variety, growth stage, and where the problem appears. This will help you prepare a clearer question for an agricultural expert.'
    }

    setMessages((current) => [...current, userMessage, { role: 'assistant', text: reply }])
    setChatInput('')
    window.setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileOpen(false)
  }

  const weather = advisory?.weather

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => scrollTo('dashboard')} aria-label="AgriSahayak home">
          <span className="brand-mark"><Sprout size={21} /></span>
          <span>AgriSahayak <strong>AI</strong></span>
        </button>

        <nav className={mobileOpen ? 'nav-links nav-open' : 'nav-links'}>
          <button onClick={() => scrollTo('dashboard')}>{t.navDashboard}</button>
          <button onClick={() => scrollTo('advisory')}>{t.navAdvice}</button>
          <button onClick={() => scrollTo('chat')}>{t.navChat}</button>
        </nav>

        <div className="header-actions">
          <div className="language-switch" aria-label="Select language">
            {['English', 'తెలుగు'].map((label) => {
              const value = label === 'తెలుగు' ? 'Telugu' : 'English'
              return (
                <button
                  key={value}
                  className={language === value ? 'active' : ''}
                  onClick={() => changeLanguage(value)}
                >
                  {label}
                </button>
              )
            })}
          </div>
          <button className="mobile-menu" onClick={() => setMobileOpen((open) => !open)} aria-label="Toggle menu">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <main>
        <section className="hero" id="dashboard">
          <div className="hero-copy">
            <p className="eyebrow">{t.greeting}, Ramesh</p>
            <h1>{t.title}</h1>
            <p className="hero-subtitle">{t.subtitle}</p>
            <div className="location-row"><MapPin size={16} /> {t.location} <span>•</span> {t.season}</div>
          </div>

          <div className="weather-card">
            <div className="weather-head">
              <div>
                <p>{t.weatherTitle}</p>
                <strong>{form.location || t.location}</strong>
              </div>
              <span className={advisory && !advisory.isMock && weather ? 'status-chip' : 'status-chip sample'}>
                {advisory && !advisory.isMock && weather ? t.live : t.sample}
              </span>
            </div>
            <div className="weather-body">
              <CloudSun size={54} strokeWidth={1.5} />
              <div className="temperature">{weather?.temperature ?? 28}<sup>°C</sup></div>
              <p>{weather?.description ?? (language === 'Telugu' ? 'పాక్షికంగా మేఘావృతం' : 'Partly cloudy')}</p>
            </div>
            <div className="weather-details">
              <div><ThermometerSun size={18} /><span>{t.feels}</span></div>
              <div><Droplets size={18} /><span>{t.rainfall}: {weather?.rainfall ?? 0} mm</span></div>
            </div>
          </div>
        </section>

        <section className="workspace-grid">
          <aside className="form-card" id="advice-form">
            <div className="section-heading">
              <div className="section-icon"><Leaf size={20} /></div>
              <div><h2>{t.formTitle}</h2><p>{t.formSubtitle}</p></div>
            </div>

            <form onSubmit={submitForm}>
              <label>{t.name}<input name="name" value={form.name} onChange={updateForm} placeholder={t.placeholders.name} /></label>
              <label>{t.locationLabel}<div className="input-with-icon"><MapPin size={16} /><input name="location" value={form.location} onChange={updateForm} placeholder={t.placeholders.location} required /></div></label>
              <div className="form-row">
                <label>{t.crop}
                  <select name="crop" value={form.crop} onChange={updateForm} required>
                    <option value="">{t.placeholders.crop}</option>
                    <option value="Rice">Rice / వరి</option>
                    <option value="Cotton">Cotton / పత్తి</option>
                    <option value="Maize">Maize / మొక్కజొన్న</option>
                    <option value="Groundnut">Groundnut / వేరుశెనగ</option>
                    <option value="Chilli">Chilli / మిరప</option>
                  </select>
                </label>
                <label>{t.soil}
                  <select name="soil" value={form.soil} onChange={updateForm} required>
                    <option value="">{t.placeholders.soil}</option>
                    <option value="Black soil">Black soil / నల్ల నేల</option>
                    <option value="Red soil">Red soil / ఎర్ర నేల</option>
                    <option value="Sandy soil">Sandy soil / ఇసుక నేల</option>
                    <option value="Clay soil">Clay soil / బంకమట్టి</option>
                  </select>
                </label>
              </div>
              <label>{t.question}<textarea name="question" value={form.question} onChange={updateForm} placeholder={t.placeholders.question} rows="4" required /></label>
              {error && <div className="error-box" role="alert"><strong>{t.errorTitle}</strong><span>{error.includes('Please') || error.includes('complete') || error.includes('తప్పనిసరిగా') ? error : t.errorText}</span></div>}
              <button className="primary-button" type="submit" disabled={loading}><Sprout size={18} />{loading ? t.submitLoading : t.submit}</button>
            </form>
          </aside>

          <div className="right-column">
            <section className="advisory-card" id="advisory">
              <div className="section-heading">
                <div className="section-icon"><TrendingUp size={20} /></div>
                <div><h2>{t.advisoryTitle}</h2><p>{t.advisorySubtitle}</p></div>
              </div>
              {loading ? (
                <div className="loading-state"><span className="loader" /><p>{t.submitLoading}</p></div>
              ) : advisory ? (
                <div className="advisory-result">
                  <div className="advisory-meta"><span>{advisory.isMock ? t.sample : t.live}</span><strong>{form.crop}</strong></div>
                  <p>{advisory.advisory}</p>
                  <small>{language === 'Telugu' ? 'ముఖ్య నిర్ణయాలకు స్థానిక వ్యవసాయ అధికారిని సంప్రదించండి.' : 'Consult a local agricultural officer for important decisions.'}</small>
                </div>
              ) : (
                <div className="empty-advisory"><Sprout size={32} /><p>{t.advisoryEmpty}</p></div>
              )}
            </section>

            <section className="chat-card" id="chat">
              <div className="chat-header">
                <div className="assistant-avatar"><MessageCircle size={19} /></div>
                <div><h2>{t.chatTitle}</h2><span><i /> {t.chatOnline}</span></div>
              </div>
              <div className="chat-messages">
                {messages.map((message, index) => (
                  <div className={`chat-message ${message.role}`} key={`${message.role}-${index}`}>
                    {message.role === 'assistant' && <div className="message-avatar"><Sprout size={15} /></div>}
                    <p>{message.text}</p>
                    {message.role === 'user' && <div className="message-avatar user"><User size={15} /></div>}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <form className="chat-input" onSubmit={sendChat}>
                <input value={chatInput} onChange={(event) => setChatInput(event.target.value)} placeholder={t.chatPlaceholder} aria-label={t.chatPlaceholder} />
                <button type="submit" aria-label={t.chatSend}><Send size={18} /></button>
              </form>
            </section>
          </div>
        </section>

        <section className="mandi-card">
          <div className="section-heading">
            <div className="section-icon"><TrendingUp size={20} /></div>
            <div><h2>{t.mandiTitle}</h2><p>{t.mandiUnavailable}</p></div>
          </div>
          <div className="mandi-empty"><MapPin size={19} /><span>{t.mandiDetail}</span></div>
        </section>
      </main>
    </div>
  )
}
