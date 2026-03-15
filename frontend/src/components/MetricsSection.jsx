import { useState, useEffect } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import styles from './MetricsSection.module.css'

/* ── Static data ───────────────────────────────────────────────── */
const classMetrics = [
  { name: 'Non-Seizure (0)', precision: 98.55, recall: 98.55, f1: 98.55, support: 1857 },
  { name: 'Seizure (1)',     precision: 93.91, recall: 93.91, f1: 93.91, support: 443  },
]

const confMatrix = [[1830, 27], [27, 416]]

/* Fake training history from notebook output */
const trainingHistory = [
  { epoch: 1,  trainAcc: 97.79, valAcc: 96.90, trainLoss: 0.067, valLoss: 0.084 },
  { epoch: 2,  trainAcc: 97.74, valAcc: 97.12, trainLoss: 0.063, valLoss: 0.071 },
  { epoch: 3,  trainAcc: 97.94, valAcc: 97.12, trainLoss: 0.059, valLoss: 0.090 },
  { epoch: 4,  trainAcc: 97.99, valAcc: 97.07, trainLoss: 0.061, valLoss: 0.078 },
  { epoch: 5,  trainAcc: 98.11, valAcc: 96.63, trainLoss: 0.057, valLoss: 0.078 },
  { epoch: 6,  trainAcc: 98.23, valAcc: 97.23, trainLoss: 0.054, valLoss: 0.072 },
  { epoch: 7,  trainAcc: 98.28, valAcc: 97.17, trainLoss: 0.051, valLoss: 0.080 },
  { epoch: 8,  trainAcc: 98.32, valAcc: 97.55, trainLoss: 0.047, valLoss: 0.072 },
  { epoch: 9,  trainAcc: 97.57, valAcc: 91.20, trainLoss: 0.062, valLoss: 0.278 },
  { epoch: 10, trainAcc: 95.40, valAcc: 96.68, trainLoss: 0.141, valLoss: 0.094 },
  { epoch: 11, trainAcc: 97.60, valAcc: 96.03, trainLoss: 0.080, valLoss: 0.094 },
  { epoch: 12, trainAcc: 97.15, valAcc: 96.96, trainLoss: 0.071, valLoss: 0.093 },
]

/* Custom Tooltip */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#111c30', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px' }}>
      <p style={{ color: '#6b7fa3', fontSize: '0.8rem', marginBottom: 4 }}>Epoch {label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color, fontSize: '0.88rem', margin: '2px 0' }}>
          {p.name}: {p.value.toFixed(2)}{p.name.includes('Acc') ? '%' : ''}
        </p>
      ))}
    </div>
  )
}

export default function MetricsSection() {
  const [activeChart, setActiveChart] = useState('accuracy')
  const [show, setShow] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 300)
    return () => clearTimeout(t)
  }, [])

  const maxCell = Math.max(...confMatrix.flat())

  return (
    <section id="metrics" className={`section ${styles.section}`}>
      <div className="container">
        <h2 className="section-title gradient-text" style={{ textAlign: 'center' }}>
          Performance Metrics
        </h2>
        <p className="section-subtitle" style={{ textAlign: 'center' }}>
          Evaluation results on 2,300 held-out test samples. The model achieves strong
          performance on both classes.
        </p>

        {/* ── Top row: per-class metrics ───────────────────────────── */}
        <div className={styles.classGrid}>
          {classMetrics.map(m => (
            <div key={m.name} className="card">
              <div className={styles.className}>{m.name}</div>
              <div className={styles.metricRow}>
                <MetricBar label="Precision" value={m.precision} color="#00e5ff" />
                <MetricBar label="Recall"    value={m.recall}    color="#7c3aed" />
                <MetricBar label="F1-Score"  value={m.f1}        color="#22c55e" />
              </div>
              <div className={styles.support}>Support: {m.support.toLocaleString()} samples</div>
            </div>
          ))}

          {/* Overall */}
          <div className="card" style={{ borderTop: '3px solid var(--accent-amber)' }}>
            <div className={styles.className}>Overall (Weighted Avg)</div>
            <div className={styles.overallStats}>
              {[
                { l: 'Accuracy',  v: '97.65%' },
                { l: 'Precision', v: '97.65%' },
                { l: 'Recall',    v: '97.65%' },
                { l: 'F1-Score',  v: '97.65%' },
              ].map(s => (
                <div key={s.l} className={styles.overallItem}>
                  <span className={styles.overallVal}>{s.v}</span>
                  <span className={styles.overallLabel}>{s.l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom row: Confusion Matrix + Training Charts ──────── */}
        <div className={styles.bottomGrid}>
          {/* Confusion Matrix */}
          <div className="card">
            <h3 className={styles.cardTitle}>Confusion Matrix</h3>
            <div className={styles.cm}>
              {/* Column labels */}
              <div />
              <div className={styles.cmColLabel}>Pred: Non-Seizure</div>
              <div className={styles.cmColLabel}>Pred: Seizure</div>
              {/* Row 0 */}
              <div className={styles.cmRowLabel}>True: Non-Seizure</div>
              <CMCell value={confMatrix[0][0]} max={maxCell} type="tp" label="True Neg" />
              <CMCell value={confMatrix[0][1]} max={maxCell} type="fp" label="False Pos" />
              {/* Row 1 */}
              <div className={styles.cmRowLabel}>True: Seizure</div>
              <CMCell value={confMatrix[1][0]} max={maxCell} type="fn" label="False Neg" />
              <CMCell value={confMatrix[1][1]} max={maxCell} type="tn" label="True Pos" />
            </div>
          </div>

          {/* Training Charts */}
          <div className="card">
            <div className={styles.chartHeader}>
              <h3 className={styles.cardTitle}>Training History</h3>
              <div className={styles.chartTabs}>
                <button
                  className={`${styles.ctab} ${activeChart === 'accuracy' ? styles.ctabActive : ''}`}
                  onClick={() => setActiveChart('accuracy')}
                >Accuracy</button>
                <button
                  className={`${styles.ctab} ${activeChart === 'loss' ? styles.ctabActive : ''}`}
                  onClick={() => setActiveChart('loss')}
                >Loss</button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trainingHistory} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="epoch" tick={{ fill: '#6b7fa3', fontSize: 11 }} />
                <YAxis tick={{ fill: '#6b7fa3', fontSize: 11 }}
                  domain={activeChart === 'accuracy' ? [90, 100] : [0, 0.35]}
                  tickFormatter={v => activeChart === 'accuracy' ? `${v}%` : v.toFixed(2)}
                />
                <Tooltip content={<CustomTooltip />} />
                {activeChart === 'accuracy' ? (<>
                  <Line type="monotone" dataKey="trainAcc" name="Train Acc" stroke="#00e5ff" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="valAcc"   name="Val Acc"   stroke="#7c3aed" strokeWidth={2} dot={false} strokeDasharray="4 2" />
                </>) : (<>
                  <Line type="monotone" dataKey="trainLoss" name="Train Loss" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="valLoss"   name="Val Loss"   stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="4 2" />
                </>)}
              </LineChart>
            </ResponsiveContainer>
            <div className={styles.legend}>
              {activeChart === 'accuracy' ? (<>
                <LegendItem color="#00e5ff" label="Train Accuracy" />
                <LegendItem color="#7c3aed" label="Validation Accuracy" dashed />
              </>) : (<>
                <LegendItem color="#f59e0b" label="Train Loss" />
                <LegendItem color="#ef4444" label="Validation Loss" dashed />
              </>)}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function MetricBar({ label, value, color }) {
  return (
    <div className={styles.metricBar}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{label}</span>
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color }}>{value.toFixed(2)}%</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  )
}

function CMCell({ value, max, type, label }) {
  const intensity = value / max
  const colors = { tp: '#22c55e', tn: '#22c55e', fp: '#ef4444', fn: '#ef4444' }
  const color = colors[type]
  return (
    <div className={styles.cmCell} style={{ background: `${color}${Math.round(intensity * 40 + 15).toString(16).padStart(2, '0')}`, borderColor: `${color}40` }}>
      <span className={styles.cmValue}>{value.toLocaleString()}</span>
      <span className={styles.cmLabel}>{label}</span>
    </div>
  )
}

function LegendItem({ color, label, dashed }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <svg width="24" height="10">
        <line x1="0" y1="5" x2="24" y2="5" stroke={color} strokeWidth="2"
          strokeDasharray={dashed ? '4 2' : undefined} />
      </svg>
      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{label}</span>
    </div>
  )
}
