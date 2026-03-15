import { useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { predict, fetchSample, uploadCSV } from '../services/api'
import styles from './PredictSection.module.css'

/* Animated confidence ring */
function ConfidenceRing({ value, color }) {
  const r = 52; const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ
  return (
    <svg width="130" height="130" className={styles.ring}>
      <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
      <circle
        cx="65" cy="65" r={r}
        fill="none" stroke={color}
        strokeWidth="10"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 65 65)"
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
      <text x="65" y="60" textAnchor="middle" dominantBaseline="middle"
        fill="#f1f5f9" fontSize="22" fontWeight="800" fontFamily="Inter">
        {Math.round(value)}%
      </text>
      <text x="65" y="80" textAnchor="middle" fill="#6b7fa3" fontSize="10" fontFamily="Inter">
        Confidence
      </text>
    </svg>
  )
}

function WaveformChart({ data }) {
  const chartData = useMemo(() => {
    return data.map((val, i) => ({ time: i, amp: parseFloat(val) || 0 }))
  }, [data])

  return (
    <div style={{ width: '100%', height: 160, marginTop: 20 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="time" hide />
          <YAxis hide domain={['auto', 'auto']} />
          <Tooltip 
            contentStyle={{ background: '#111c30', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} 
            labelStyle={{ color: '#6b7fa3' }}
            itemStyle={{ color: '#00e5ff' }}
          />
          <Line 
            type="monotone" 
            dataKey="amp" 
            stroke="#00e5ff" 
            strokeWidth={2} 
            dot={false} 
            animationDuration={800}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function PredictSection({ addToHistory }) {
  const [loading, setLoading]         = useState(false)
  const [sampleLoading, setSampleLoading] = useState(false)
  const [features, setFeatures]       = useState(Array(178).fill(''))
  const [result, setResult]           = useState(null)
  const [trueLabel, setTrueLabel]     = useState(null)
  const [inputMode, setInputMode]     = useState('random') // 'random' | 'manual' | 'upload'
  const [viewMode, setViewMode]       = useState('waveform') // 'waveform' | 'heatmap'
  const [batchResult, setBatchResult] = useState(null)

  const parseFeatures = () => {
    const nums = features.map(f => parseFloat(f))
    if (nums.some(n => isNaN(n))) throw new Error('All 178 fields must be numeric')
    return nums
  }

  const handleLoadSample = async () => {
    setSampleLoading(true)
    setBatchResult(null)
    try {
      const { data } = await fetchSample()
      setFeatures(data.features.map(String))
      setTrueLabel(data.true_label_name)
      setResult(null)
      toast.success(`Real EEG sample loaded`, { icon: '🧠' })
    } catch {
      toast.error('Could not load sample. Is the backend running?')
    } finally {
      setSampleLoading(false)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setLoading(true)
    setResult(null)
    setBatchResult(null)
    try {
      const { data } = await uploadCSV(file)
      setBatchResult(data)
      toast.success(`Processed ${data.summary.total} signals from ${file.name}`, { icon: '📂' })
    } catch (err) {
      toast.error(err.response?.data?.error || 'CSV processing failed')
    } finally {
      setLoading(false)
    }
  }

  const handlePredict = async () => {
    setLoading(true)
    setResult(null)
    try {
      const nums = parseFeatures()
      const { data } = await predict(nums)
      setResult(data)
      addToHistory({ ...data, trueLabel })
      toast.success(`Prediction: ${data.label}`, { icon: data.prediction === 1 ? '⚠️' : '✅' })
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Prediction failed')
    } finally {
      setLoading(false)
    }
  }

  const riskColor = result
    ? result.risk_level === 'High' ? '#ef4444'
    : result.risk_level === 'Medium' ? '#f59e0b'
    : '#22c55e'
    : '#00e5ff'

  const isSeizure = result?.prediction === 1
  const allFilled = features.some(f => f !== '')

  return (
    <section id="predict" className={`section ${styles.section}`}>
      <div className="container">
        <div className="section-title" style={{ textAlign: 'center' }}>
          <h2 className="section-title gradient-text">Live Seizure Prediction</h2>
        </div>
        <p className="section-subtitle" style={{ textAlign: 'center' }}>
          Load a real-world EEG sample from the test set or enter your own 178 feature values,
          then run the LSTM model in real-time.
        </p>

        <div className={styles.grid}>
          {/* ── Left Panel: Input ─────────────────────────────────────── */}
          <div className={styles.inputPanel}>
            {/* Mode tabs */}
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${inputMode === 'random' ? styles.active : ''}`}
                onClick={() => setInputMode('random')}
              >Test Dataset</button>
              <button
                className={`${styles.tab} ${inputMode === 'manual' ? styles.active : ''}`}
                onClick={() => { setInputMode('manual'); setBatchResult(null); }}
              >Manual Input</button>
              <button
                className={`${styles.tab} ${inputMode === 'upload' ? styles.active : ''}`}
                onClick={() => setInputMode('upload')}
              >Upload CSV</button>
            </div>

            {inputMode === 'random' ? (
              <div className={styles.autoPanel}>
                <p className={styles.hint}>
                  Fetch a verified EEG recording from the UCI dataset to test model accuracy.
                </p>
                <button
                  className="btn btn-secondary"
                  onClick={handleLoadSample}
                  disabled={sampleLoading}
                  style={{ width: '100%', justifyContent: 'center', marginBottom: 16 }}
                >
                  {sampleLoading ? '⏳ Loading…' : '🎲 Load Real EEG Sample'}
                </button>
                
                {allFilled && (
                  <div className={styles.visualizerBox}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>SIGNAL VISUALIZATION</span>
                      <div className={styles.toggleGroup}>
                        <button className={`${styles.miniBtn} ${viewMode === 'waveform' ? styles.active : ''}`} onClick={() => setViewMode('waveform')}>Wave</button>
                        <button className={`${styles.miniBtn} ${viewMode === 'heatmap' ? styles.active : ''}`} onClick={() => setViewMode('heatmap')}>Heat</button>
                      </div>
                    </div>

                    {viewMode === 'waveform' ? (
                      <WaveformChart data={features} />
                    ) : (
                      <div className={styles.heatmapWrap}>
                        <div className={styles.heatmap}>
                          {features.slice(0, 178).map((v, i) => {
                            const n = parseFloat(v) || 0
                            const norm = Math.min(Math.max((n + 3) / 6, 0), 1)
                            return (
                              <div
                                key={i}
                                className={styles.heatCell}
                                title={`Feature ${i + 1}: ${parseFloat(n).toFixed(3)}`}
                                style={{
                                  background: `hsl(${200 + norm * 120}, 80%, ${30 + norm * 30}%)`,
                                  opacity: 0.7 + norm * 0.3,
                                }}
                              />
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {trueLabel && (
                  <div className={styles.trueLabel}>
                    Source status: <span className={trueLabel === 'Seizure' ? styles.seizureText : styles.normalText}>
                      {trueLabel} Recording
                    </span>
                  </div>
                )}
                </div>
              ) : inputMode === 'manual' ? (
                <div className={styles.manualPanel}>
                  <p className={styles.hint}>Enter all 178 EEG feature values (comma or newline separated).</p>
                  <textarea
                    className={`input ${styles.textarea}`}
                    placeholder="e.g. 0.123, -0.456, 1.789, …"
                    rows={8}
                    onChange={e => {
                      const vals = e.target.value.split(/[\s,]+/).filter(Boolean)
                      setFeatures(vals.length ? vals : Array(178).fill(''))
                    }}
                  />
                  <p className={styles.counter}>
                    {features.filter(f => f !== '').length} / 178 values entered
                  </p>
                </div>
              ) : (
                <div className={styles.uploadPanel}>
                  <p className={styles.hint}>
                    Upload a CSV file containing 178 numeric features per row. The model will process all rows instantly.
                  </p>
                  <div className={styles.dropzone}>
                    <input 
                      type="file" 
                      accept=".csv" 
                      onChange={handleFileUpload} 
                      disabled={loading}
                      id="csv-upload"
                      style={{ display: 'none' }} 
                    />
                    <label htmlFor="csv-upload" className={styles.dropLabel}>
                      <span style={{ fontSize: '2rem' }}>📁</span>
                      <strong>{loading ? 'Processing...' : 'Click to Upload CSV'}</strong>
                      <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Supports standard EEG dataset format</span>
                    </label>
                  </div>
                </div>
              )}

              {inputMode !== 'upload' && (
                <button
                  className="btn btn-primary"
                  onClick={handlePredict}
                  disabled={loading || !allFilled}
                  style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}
                >
                  {loading ? '⏳ Running LSTM Model…' : '🧠 Predict Seizure'}
                </button>
              )}
            </div>

            {/* ── Right Panel: Result ────────────────────────────────────── */}
            <div className={styles.resultPanel}>
              {batchResult ? (
                <div className={styles.resultCard} style={{ '--rc': batchResult.summary.seizures > 0 ? '#ef4444' : '#22c55e' }}>
                   <div className={styles.resultTop}>
                    <span className={`badge ${batchResult.summary.seizures > 0 ? 'badge-red' : 'badge-green'}`} style={{ fontSize: '1rem', padding: '8px 20px' }}>
                      Batch Results: {batchResult.filename}
                    </span>
                  </div>
                  <div className={styles.details}>
                    <Detail label="Total Samples" value={batchResult.summary.total} />
                    <Detail label="Seizures Detected" value={batchResult.summary.seizures} color="#ef4444" />
                    <Detail label="Non-Seizures" value={batchResult.summary.non_seizures} color="#22c55e" />
                    <Detail label="Seizure Rate" value={batchResult.summary.seizure_rate + '%'} />
                  </div>
                  <div style={{ marginTop: 24 }}>
                    <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12 }}>PREVIEW (FIRST 5)</h4>
                    {batchResult.results.slice(0, 5).map((r, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span>Sample #{r.index + 1}</span>
                        <span style={{ color: r.prediction === 1 ? '#ef4444' : '#22c55e', fontWeight: 600 }}>{r.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : result ? (
              <div className={styles.resultCard} style={{ '--rc': riskColor }}>
                <div className={styles.resultTop}>
                  <span className={`badge ${isSeizure ? 'badge-red' : 'badge-green'}`} style={{ fontSize: '1rem', padding: '8px 20px' }}>
                    {isSeizure ? '⚠️  Seizure Detected' : '✅  No Seizure'}
                  </span>
                </div>

                {/* Confidence Ring */}
                <div className={styles.ringWrap}>
                  <ConfidenceRing value={result.confidence} color={riskColor} />
                </div>

                {/* Detail rows */}
                <div className={styles.details}>
                  <Detail label="Raw Probability" value={(result.probability * 100).toFixed(3) + '%'} />
                  <Detail label="Risk Level"       value={result.risk_level} color={riskColor} />
                  <Detail label="Predicted Class"  value={result.prediction === 1 ? 'Seizure (1)' : 'Non-Seizure (0)'} />
                  {trueLabel && (
                    <Detail
                      label="True Label"
                      value={trueLabel}
                      color={trueLabel === result.label ? '#22c55e' : '#ef4444'}
                      note={trueLabel === result.label ? '✓ Correct' : '✗ Incorrect'}
                    />
                  )}
                </div>

                {/* Risk bar */}
                <div style={{ marginTop: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>Seizure Probability</span>
                    <span>{(result.probability * 100).toFixed(1)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill"
                      style={{ width: `${result.probability * 100}%`, background: `linear-gradient(90deg, #22c55e, ${riskColor})` }} />
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.emptyResult}>
                <div className={styles.emptyIcon}>🧠</div>
                <p>Load a sample or enter features,<br />then click <strong>Predict</strong> to see results.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function Detail({ label, value, color, note }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{label}</span>
      <span style={{ fontWeight: 700, color: color || 'var(--text-primary)', display: 'flex', gap: 8, alignItems: 'center' }}>
        {value}
        {note && <span style={{ fontSize: '0.75rem', fontWeight: 400, color }}>{note}</span>}
      </span>
    </div>
  )
}
