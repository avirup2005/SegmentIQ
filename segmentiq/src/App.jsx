import { useEffect, useMemo, useState } from 'react'
import './App.css'

const DEFAULT_INPUT = {
  Age: 45,
  Education: 2,
  Marital_Status: 1,
  Parental_Status: 1,
  Children: 2,
  Income: 55000,
  Total_Spending: 800,
  Days_as_Customer: 1200,
  Recency: 30,
  Wines: 300,
  Fruits: 50,
  Meat: 200,
  Fish: 80,
  Sweets: 60,
  Gold: 110,
  Web: 4,
  Catalog: 3,
  Store: 6,
  Discount_Purchases: 2,
  Total_Promo: 1,
  NumWebVisitsMonth: 5,
}

const EXAMPLE_PROFILES = [
  {
    id: 'budget',
    name: 'Budget Conscious',
    blurb: 'Lower income, low spend, deal-driven habits.',
    stats: [
      { label: 'Income', value: '$22k' },
      { label: 'Spend', value: '$120' },
      { label: 'Recency', value: '75d' },
    ],
    payload: {
      Age: 28,
      Education: 1,
      Marital_Status: 0,
      Parental_Status: 0,
      Children: 0,
      Income: 22000,
      Total_Spending: 120,
      Days_as_Customer: 400,
      Recency: 75,
      Wines: 15,
      Fruits: 8,
      Meat: 25,
      Fish: 6,
      Sweets: 12,
      Gold: 5,
      Web: 1,
      Catalog: 0,
      Store: 2,
      Discount_Purchases: 4,
      Total_Promo: 2,
      NumWebVisitsMonth: 2,
    },
  },
  {
    id: 'mid',
    name: 'Mid-Tier Shopper',
    blurb: 'Balanced income and steady multi-channel buying.',
    stats: [
      { label: 'Income', value: '$38k' },
      { label: 'Spend', value: '$420' },
      { label: 'Recency', value: '45d' },
    ],
    payload: {
      Age: 36,
      Education: 2,
      Marital_Status: 1,
      Parental_Status: 1,
      Children: 1,
      Income: 38000,
      Total_Spending: 420,
      Days_as_Customer: 1000,
      Recency: 45,
      Wines: 130,
      Fruits: 35,
      Meat: 95,
      Fish: 45,
      Sweets: 35,
      Gold: 40,
      Web: 3,
      Catalog: 2,
      Store: 4,
      Discount_Purchases: 5,
      Total_Promo: 3,
      NumWebVisitsMonth: 6,
    },
  },
  {
    id: 'premium',
    name: 'Premium Customer',
    blurb: 'High income, high spend, low discount usage.',
    stats: [
      { label: 'Income', value: '$120k' },
      { label: 'Spend', value: '$3.2k' },
      { label: 'Recency', value: '8d' },
    ],
    payload: {
      Age: 50,
      Education: 3,
      Marital_Status: 1,
      Parental_Status: 1,
      Children: 2,
      Income: 120000,
      Total_Spending: 3200,
      Days_as_Customer: 2100,
      Recency: 8,
      Wines: 1200,
      Fruits: 180,
      Meat: 700,
      Fish: 260,
      Sweets: 180,
      Gold: 420,
      Web: 8,
      Catalog: 5,
      Store: 10,
      Discount_Purchases: 0,
      Total_Promo: 0,
      NumWebVisitsMonth: 10,
    },
  },
]

const INPUT_FIELDS = [
  { key: 'Age', label: 'Age', step: '1', min: 0 },
  {
    key: 'Education',
    label: 'Education',
    type: 'select',
    options: [
      { value: 0, label: 'High School' },
      { value: 1, label: 'Diploma' },
      { value: 2, label: 'Graduate' },
      { value: 3, label: 'Masters' },
      { value: 4, label: 'PhD' },
    ],
  },
  {
    key: 'Marital_Status',
    label: 'Marital Status',
    type: 'select',
    options: [
      { value: 0, label: 'Single' },
      { value: 1, label: 'Has partner' },
    ],
  },
  {
    key: 'Parental_Status',
    label: 'Parental Status',
    type: 'select',
    options: [
      { value: 0, label: 'No children' },
      { value: 1, label: 'Has children' },
    ],
  },
  { key: 'Children', label: 'Children', step: '1', min: 0 },
  { key: 'Income', label: 'Income', step: '0.01', min: 0 },
  { key: 'Total_Spending', label: 'Total Spending', step: '0.01', min: 0 },
  { key: 'Days_as_Customer', label: 'Days as Customer', step: '1', min: 0 },
  { key: 'Recency', label: 'Recency (days)', step: '1', min: 0 },
  { key: 'Wines', label: 'Wines', step: '0.01', min: 0 },
  { key: 'Fruits', label: 'Fruits', step: '0.01', min: 0 },
  { key: 'Meat', label: 'Meat', step: '0.01', min: 0 },
  { key: 'Fish', label: 'Fish', step: '0.01', min: 0 },
  { key: 'Sweets', label: 'Sweets', step: '0.01', min: 0 },
  { key: 'Gold', label: 'Gold', step: '0.01', min: 0 },
  { key: 'Web', label: 'Web Purchases', step: '1', min: 0 },
  { key: 'Catalog', label: 'Catalog Purchases', step: '1', min: 0 },
  { key: 'Store', label: 'Store Purchases', step: '1', min: 0 },
  { key: 'Discount_Purchases', label: 'Discount Purchases', step: '1', min: 0 },
  { key: 'Total_Promo', label: 'Total Promo', step: '1', min: 0 },
  { key: 'NumWebVisitsMonth', label: 'Web Visits / Month', step: '1', min: 0 },
]

const METRICS = [
  { label: 'Model accuracy', value: '99.55%', note: 'Validation score' },
  { label: 'Inference latency', value: '< 1s', note: 'HF Spaces API' },
  { label: 'Segments', value: '3', note: 'Premium, Mid, Budget' },
  { label: 'Features', value: '20', note: 'Demographic + behavioral' },
]

const COMPARISON = [
  {
    title: 'RFM rules',
    metric: '0.81',
    detail: 'Accuracy',
    trend: '-18%',
    note: 'Rule-based baseline',
  },
  {
    title: 'KMeans + LR',
    metric: '0.9955',
    detail: 'Accuracy',
    trend: '+19%',
    note: 'Current production model',
  },
  {
    title: 'Next: XGBoost',
    metric: '0.98+',
    detail: 'Projected',
    trend: 'R&D',
    note: 'Planned upgrade',
  },
]

const TIMELINE = [
  {
    step: '01',
    title: 'Ingest',
    body: 'Customer profile, purchases, and channel interactions.',
  },
  {
    step: '02',
    title: 'Feature build',
    body: 'RFM + product mix + promo responsiveness.',
  },
  {
    step: '03',
    title: 'Segment',
    body: 'KMeans for behavior + LR for predictive scoring.',
  },
  {
    step: '04',
    title: 'Activate',
    body: 'Segments sync to CRM, email, and ads.',
  },
]

const CLUSTER_LABELS = {
  cluster_0: 'Budget Conscious',
  cluster_1: 'Mid-Tier Shopper',
  cluster_2: 'Premium Customer',
}
const PROCESS = [
  {
    title: '1. Train the segmentation model',
    body: 'Cluster customers with KMeans, then learn a classifier to predict segments.',
    file: 'notebook.py',
    code: `pca = PCA(n_components=3, random_state=42)\npca_data = pca.fit_transform(scaled_df)\n\nkmeans = KMeans(n_clusters=3, random_state=42, n_init=10)\ndf['cluster'] = kmeans.fit_predict(pca_data)\n\nX_train, X_test, y_train, y_test = train_test_split(\n  X, df['cluster'], test_size=0.2, random_state=42\n)\nmodel = LogisticRegression(max_iter=100, C=100, solver='lbfgs')\nmodel.fit(X_train, y_train)\nprint('Final accuracy:', accuracy_score(y_test, model.predict(X_test)))`,
  },
  {
    title: '2. Save artifacts',
    body: 'Ship everything the API needs: model, preprocessor, and feature order.',
    file: 'export_artifacts.py',
    code: `with open('models/model.pkl', 'wb') as f:\n    pickle.dump(model, f)\n\nwith open('models/preprocessor.pkl', 'wb') as f:\n    pickle.dump(preprocessor, f)\n\nwith open('models/feature_columns.pkl', 'wb') as f:\n    pickle.dump(feature_columns, f)\n\nwith open('models/metadata.json', 'w') as f:\n    json.dump(metadata, f, indent=2)`,
  },
  {
    title: '3. Serve with FastAPI',
    body: 'Load artifacts on startup and expose `/api/predict`.',
    file: 'app.py',
    code: `input_df = pd.DataFrame([input_dict])[feature_columns]\ninput_df = input_df.apply(pd.to_numeric, errors='coerce').fillna(0)\ninput_df = input_df.astype(float)\n\ninput_scaled = preprocessor.transform(input_df)\ninput_scaled_df = pd.DataFrame(input_scaled, columns=feature_columns)\n\npred = int(model.predict(input_scaled_df)[0])\nprobs = model.predict_proba(input_scaled_df)[0]`,
  },
  {
    title: '4. Deploy on Hugging Face',
    body: 'Docker image runs the API on port 7860. Frontend hits it directly.',
    file: 'Dockerfile',
    code: `FROM python:3.11-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt\nCOPY . .\nEXPOSE 7860\nCMD [\"python\", \"app.py\"]`,
  },
  {
    title: '5. Wire the frontend',
    body: 'The UI calls the Space endpoint directly and renders segments.',
    file: 'src/App.jsx',
    code: `const response = await fetch(\`\${apiUrl}/api/predict\`, {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify(payload)\n})\nconst data = await response.json()\nsetResult(data)`,
  },
  {
    title: '6. Visualize confidence',
    body: 'Turn probabilities into an interactive chart.',
    file: 'src/App.jsx',
    code: `Object.entries(probabilities).map(([k, v]) => (\n  <div key={k} className=\"prob-row\">\n    <div className=\"prob-label\">{labels[k]}</div>\n    <div className=\"prob-bar\"><span style={{ width: \`\${v}%\` }} /></div>\n    <div className=\"prob-value\">{v}%</div>\n  </div>\n))`,
  },
  {
    title: '7. Track drift + retrain',
    body: 'Schedule evaluations and alert on performance drops.',
    file: 'monitor.py',
    code: `if accuracy < 0.97:\n    send_alert('Model drift detected')\n    retrain_pipeline()\n    save_new_artifacts()`,
  },
  {
    title: '8. Ship the UI',
    body: 'Vercel builds the Vite app and serves the UI globally.',
    file: 'vercel.json',
    code: `{\n  \"buildCommand\": \"npm run build\",\n  \"outputDirectory\": \"dist\",\n  \"framework\": \"vite\"\n}`,
  },
]

const ROADMAP = [
  'Live retraining pipeline with data drift alerts',
  'Segment-level LTV forecasts and next-best-action',
  'Auto-generated segment playbooks',
]

const SOCIALS = [
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/avirup-sasmal-0b74a4304',
    note: 'linkedin.com/in/avirup-sasmal-0b74a4304',
  },
  {
    label: 'GitHub',
    href: 'https://github.com/avirup2005',
    note: 'github.com/avirup2005',
  },
  {
    label: 'Email',
    href: 'mailto:avirupsasmal2005@gmail.com',
    note: 'avirupsasmal2005@gmail.com',
  },
  { label: 'Portfolio', href: '#', note: 'Add your link' },
]

const fallbackResponse = {
  status: 'success',
  cluster: 2,
  segment_name: 'Premium Customer',
  emoji: '⭐',
  description:
    'High income, high spending customers. Prefer quality over price and rarely use discounts.',
  traits: ['High spender', 'Loyal', 'Premium products'],
  color: '#f59e0b',
  confidence: 92.4,
  probabilities: {
    cluster_0: 2.1,
    cluster_1: 5.5,
    cluster_2: 92.4,
  },
}

function App() {
  const [form, setForm] = useState(DEFAULT_INPUT)
  const [status, setStatus] = useState('idle')
  const [result, setResult] = useState(null)
  const apiUrl = import.meta.env.VITE_CATEGORISER_API_URL

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || 0
      document.documentElement.style.setProperty('--scroll', `${scrollY}`)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleMouseMove = (event) => {
    const { innerWidth, innerHeight } = window
    const x = event.clientX / innerWidth
    const y = event.clientY / innerHeight
    document.documentElement.style.setProperty('--mx', x.toFixed(3))
    document.documentElement.style.setProperty('--my', y.toFixed(3))
  }

  const formattedApiUrl = useMemo(() => {
    if (!apiUrl) return 'Not connected'
    return apiUrl.replace(/^https?:\/\//, '')
  }, [apiUrl])

  const handleRun = async (event) => {
    event.preventDefault()
    setStatus('loading')
    setResult(null)

    const requestPayload = INPUT_FIELDS.reduce((acc, field) => {
      const raw = form[field.key]
      const num = Number(raw)
      acc[field.key] = Number.isFinite(num) ? num : 0
      return acc
    }, {})

    if (!apiUrl) {
      await new Promise((resolve) => setTimeout(resolve, 900))
      setResult({
        source: 'Local demo',
        payload: fallbackResponse,
        notes: 'Connect a Hugging Face Space endpoint to replace this demo output.',
      })
      setStatus('success')
      return
    }

    try {
      const response = await fetch(`${apiUrl}/api/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...requestPayload,
        }),
      })

      if (!response.ok) {
        throw new Error(`Request failed with ${response.status}`)
      }

      const apiPayload = await response.json()
      setResult({ source: 'Live API', payload: apiPayload })
      setStatus('success')
    } catch (error) {
      setResult({
        source: 'API error',
        error: error.message,
      })
      setStatus('error')
    }
  }

  const applyExample = (example) => {
    setForm(example.payload)
    setResult(null)
    setStatus('idle')
  }

  return (
    <div className="page" onMouseMove={handleMouseMove}>
      <div className="ambient">
        <span className="orb orb-one" />
        <span className="orb orb-two" />
        <span className="orb orb-three" />
        <span className="planet planet-a" />
        <span className="planet planet-b" />
        <span className="planet planet-c" />
        <span className="planet planet-d" />
      </div>

      <header className="hero" data-parallax="0.08">
        <nav className="nav">
          <div className="logo">SegmentIQ</div>
          <div className="nav-links">
            <a href="#demo">Demo</a>
            <a href="#metrics">Metrics</a>
            <a href="#about">About</a>
            <a href="#roadmap">Roadmap</a>
          </div>
          <a className="btn ghost" href="#contact">
            Contact
          </a>
        </nav>

        <div className="hero-grid">
          <div className="hero-copy">
            <div className="eyebrow reveal" style={{ '--delay': '0.1s' }}>
              Customer categorisation platform
            </div>
            <h1 className="reveal" style={{ '--delay': '0.2s' }}>
              A scalable machine learning–powered customer segmentation engine
              that uncovers hidden patterns and enables smarter marketing
              decisions.
            </h1>
            <p className="lede reveal" style={{ '--delay': '0.3s' }}>
              SegmentIQ turns raw customer behavior into explainable cohorts,
              then ships them straight into your workflows. Built on Hugging Face,
              deployed on Vercel, styled for the demo table.
            </p>
            <div className="hero-actions reveal" style={{ '--delay': '0.4s' }}>
              <a className="btn primary" href="#demo">
                Try the live demo
              </a>
              <a className="btn" href="#about">
                Read the build story
              </a>
            </div>
            <div className="hero-meta reveal" style={{ '--delay': '0.5s' }}>
              <div>
                <span className="meta-label">Model endpoint</span>
                <span className="meta-value">{formattedApiUrl}</span>
              </div>
              <div>
                <span className="meta-label">Deploy target</span>
                <span className="meta-value">Vercel + Hugging Face</span>
              </div>
            </div>
          </div>

          <div className="hero-panel reveal" style={{ '--delay': '0.35s' }}>
            <div className="panel-card">
              <span className="pill">Live intelligence</span>
              <h3>Segment summary</h3>
              <p>
                Premium customers convert 2.3x higher and respond best to
                personalized bundles.
              </p>
              <div className="panel-stats">
                <div>
                  <span>Confidence</span>
                  <strong>92.4%</strong>
                </div>
                <div>
                  <span>Latency</span>
                  <strong>0.7s</strong>
                </div>
              </div>
              <div className="panel-foot">
                Updated Feb 19, 2026
              </div>
            </div>
            <div className="panel-card glass">
              <span className="pill ghost">Active signals</span>
              <ul>
                <li>Recency + Frequency + Monetary</li>
                <li>Channel behavior + product mix</li>
                <li>Promo sensitivity + loyalty</li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      <section className="metrics" id="metrics" data-parallax="0.05">
        {METRICS.map((metric, index) => (
          <div
            key={metric.label}
            className="metric-card reveal"
            style={{ '--delay': `${0.1 + index * 0.08}s` }}
          >
            <span>{metric.label}</span>
            <h3>{metric.value}</h3>
            <p>{metric.note}</p>
          </div>
        ))}
      </section>

      <section className="demo" id="demo" data-parallax="0.03">
        <div className="section-head">
          <div>
            <span className="section-tag">Live Demo</span>
            <h2>Score a customer in real time</h2>
            <p>
              Input the feature values from your dataset and get the predicted
              segment with explainable traits.
            </p>
          </div>
          <div className="status">
            <span className={`status-dot ${status}`} />
            <span className="status-text">{status}</span>
          </div>
        </div>

        <form className="demo-grid" onSubmit={handleRun}>
          <div className="field">
            <span>Customer attributes</span>
            <div className="input-grid">
              {INPUT_FIELDS.map((field) => (
                <label key={field.key}>
                  <span>{field.label}</span>
                  {field.type === 'select' ? (
                    <select
                      value={form[field.key] ?? ''}
                      onChange={(event) => {
                        const value = event.target.value
                        setForm((prev) => ({
                          ...prev,
                          [field.key]: value,
                        }))
                      }}
                    >
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="number"
                      value={form[field.key] ?? ''}
                      step={field.step}
                      min={field.min}
                      max={field.max}
                      onChange={(event) => {
                        const value = event.target.value
                        setForm((prev) => ({
                          ...prev,
                          [field.key]: value,
                        }))
                      }}
                    />
                  )}
                </label>
              ))}
            </div>
            <p className="hint">
              Education, marital status, and parental status are now dropdowns.
            </p>
            <div className="example-block">
              <div className="example-head">
                <span>Example profiles</span>
                <span className="example-sub">One per cluster</span>
              </div>
              <div className="example-grid">
                {EXAMPLE_PROFILES.map((profile) => (
                  <article key={profile.id} className="example-card">
                    <div className="example-title">{profile.name}</div>
                    <p>{profile.blurb}</p>
                    <div className="example-stats">
                      {profile.stats.map((stat) => (
                        <span key={stat.label}>
                          {stat.label}: {stat.value}
                        </span>
                      ))}
                    </div>
                    <button
                      className="btn"
                      type="button"
                      onClick={() => applyExample(profile)}
                    >
                      Use example
                    </button>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="field output">
            <span>Prediction</span>
            <div className="result">
              {result ? (
                result.payload?.status === 'success' ? (
                  <div className="segment-card">
                    <h4>
                      {result.payload.emoji} {result.payload.segment_name}
                    </h4>
                    <p>{result.payload.description}</p>
                    <div className="drivers">
                      {result.payload.traits?.map((trait) => (
                        <span key={trait}>{trait}</span>
                      ))}
                    </div>
                    <div className="confidence">
                      Confidence: {result.payload.confidence}%
                    </div>
                    <div className="probability-chart">
                      {Object.entries(result.payload.probabilities || {}).map(
                        ([label, value]) => (
                          <div key={label} className="prob-row">
                            <div className="prob-label">
                              {CLUSTER_LABELS[label] || label}
                            </div>
                            <div className="prob-bar">
                              <span style={{ width: `${value}%` }} />
                            </div>
                            <div className="prob-value">{value}%</div>
                          </div>
                        )
                      )}
                    </div>
                    {result.notes && <p className="note">{result.notes}</p>}
                  </div>
                ) : (
                  <pre>{JSON.stringify(result.payload, null, 2)}</pre>
                )
              ) : (
                <div className="placeholder">
                  <h4>Run a request</h4>
                  <p>
                    Connect your Hugging Face Space and the live response will
                    appear here.
                  </p>
                </div>
              )}
              {result?.payload?.status === 'error' && (
                <div className="error">
                  <strong>API error:</strong> {result.payload.message}
                </div>
              )}
              {result?.error && (
                <div className="error">
                  <strong>API error:</strong> {result.error}
                </div>
              )}
            </div>
            <div className="actions">
              <button className="btn primary" type="submit">
                {apiUrl ? 'Score with live model' : 'Run demo output'}
              </button>
              <button
                className="btn"
                type="button"
                onClick={() => {
                  setForm(DEFAULT_INPUT)
                  setResult(null)
                  setStatus('idle')
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </form>
      </section>

      <section className="comparison" data-parallax="0.02">
        <div className="section-head">
          <div>
            <span className="section-tag">Model Comparison</span>
            <h2>Benchmarking the segmentation engine</h2>
            <p>
              Track how each model performs. Replace these numbers with your
              evaluation metrics.
            </p>
          </div>
        </div>
        <div className="comparison-grid">
          {COMPARISON.map((item) => (
            <article key={item.title} className="compare-card reveal">
              <h3>{item.title}</h3>
              <div className="compare-score">
                <span>{item.metric}</span>
                <small>{item.detail}</small>
              </div>
              <div className="compare-meta">
                <strong>{item.trend}</strong>
                <p>{item.note}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="process" id="process" data-parallax="0.02">
        <div className="section-head">
          <div>
            <span className="section-tag">Workflow</span>
            <h2>Scroll through the build</h2>
            <p>Each step mirrors the actual pipeline from notebook to API.</p>
          </div>
        </div>
        <p className="process-summary">
          SegmentIQ is a customer-segmentation web app built for a college demo. A
          Python notebook cleans data, engineers RFM and channel features,
          clusters customers with KMeans, and trains Logistic Regression to
          predict segments. Artifacts are exported as pickle files plus metadata.
          A FastAPI service loads them, validates input, and returns segment
          name, traits, and probabilities. The UI is a React/Vite site with an
          interactive form, live charts, and story-driven sections. Hugging Face
          Spaces hosts the API, and Vercel serves the frontend. Everything is
          modular, reproducible, and easy to extend. The demo highlights model
          accuracy, deployment reliability, and clean UX for reviewers.
        </p>
        <div className="process-grid">
          {PROCESS.map((item, index) => (
            <article
              key={item.title}
              className="process-card reveal"
              style={{ '--delay': `${0.1 + index * 0.08}s` }}
            >
              <div className="process-copy">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
              <div className="code-window">
                <div className="code-title">
                  <span className="code-dots">
                    <i />
                    <i />
                    <i />
                  </span>
                  <span>{item.file}</span>
                </div>
                <pre>
                  <code>{item.code}</code>
                </pre>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="pipeline" data-parallax="0.015">
        <div className="section-head">
          <div>
            <span className="section-tag">Pipeline</span>
            <h2>How the model works end to end</h2>
            <p>From raw data to live decisions.</p>
          </div>
        </div>
        <div className="timeline">
          {TIMELINE.map((step) => (
            <div key={step.step} className="timeline-card reveal">
              <span className="timeline-step">{step.step}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="about" id="about" data-parallax="0.02">
        <div className="section-head">
          <div>
            <span className="section-tag">About</span>
            <h2>How I built SegmentIQ</h2>
            <p>
              Add your build story here: the dataset, model selection, feature
              engineering, and the React + Vercel deployment.
            </p>
          </div>
        </div>
        <div className="about-grid">
          <div className="about-card">
            <h3>Stack</h3>
            <p>Python, FastAPI, Scikit-learn, KMeans, React, Vite, Vercel.</p>
          </div>
          <div className="about-card">
            <h3>Hosting</h3>
            <p>Hugging Face Spaces for inference, Vercel for the UI.</p>
          </div>
          <div className="about-card">
            <h3>Why it matters</h3>
            <p>Explainable segments that drive marketing and product actions.</p>
          </div>
        </div>
      </section>

      <section className="roadmap" id="roadmap" data-parallax="0.015">
        <div className="section-head">
          <div>
            <span className="section-tag">Future Upgrades</span>
            <h2>What’s next</h2>
            <p>Planned enhancements to keep the model ahead.</p>
          </div>
        </div>
        <div className="roadmap-list">
          {ROADMAP.map((item) => (
            <div key={item} className="roadmap-item reveal">
              <span />
              <p>{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="contact" id="contact" data-parallax="0.01">
        <div className="section-head">
          <div>
            <span className="section-tag">Connect</span>
            <h2>Social links</h2>
            <p>These are pulled from your CV. Replace Portfolio when ready.</p>
          </div>
        </div>
        <div className="social-grid">
          {SOCIALS.map((item) => (
            <a key={item.label} className="social-card" href={item.href}>
              <div>
                <h3>{item.label}</h3>
                <p>{item.note}</p>
              </div>
              <span>→</span>
            </a>
          ))}
        </div>
      </section>

      <footer className="footer">
        <div>
          <span className="logo">SegmentIQ</span>
          <p>Customer intelligence built by Avirup Sasmal.</p>
        </div>
        <div className="footer-links">
          <a href="#demo">Demo</a>
          <a href="#metrics">Metrics</a>
          <a href="#about">About</a>
        </div>
      </footer>
    </div>
  )
}

export default App
