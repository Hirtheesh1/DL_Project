import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, YAxis } from 'recharts'
import styles from './DatasetSection.module.css'

const distData = [
  { name: 'Non-Seizure (0)', value: 9200, color: '#7c3aed' },
  { name: 'Seizure (1)',     value: 2300, color: '#00e5ff' },
]

// Mock characteristic signals for visualization
const characteristicData = {
  seizure: Array.from({length: 40}, (_, i) => ({ x: i, y: Math.sin(i * 0.8) * 5 + (Math.random() - 0.5) * 8 })),
  normal:  Array.from({length: 40}, (_, i) => ({ x: i, y: Math.sin(i * 0.2) * 2 + (Math.random() - 0.5) * 1 })),
}

const dataFacts = [
  { label: 'Source',        value: 'UCI ML Repository',      icon: '🗄️' },
  { label: 'Total Samples', value: '11,500',                   icon: '📊' },
  { label: 'Features',      value: '178 (EEG amplitudes)',     icon: '🧬' },
  { label: 'Classes',       value: '2 (Seizure / Non-Seizure)',icon: '🎯' },
  { label: 'Train / Test',  value: '9,200 / 2,300 (80/20)',   icon: '✂️' },
  { label: 'Sampling Rate', value: '1-second EEG segments',   icon: '⏱️' },
  { label: 'Class Imbalance', value: '4:1 (majority: Non-Seizure)', icon: '⚖️' },
  { label: 'Preprocessing', value: 'StandardScaler (z-score)', icon: '🔧' },
]

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{ background: '#111c30', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 14px' }}>
      <p style={{ color: d.color, fontWeight: 700 }}>{d.name}</p>
      <p style={{ color: '#f1f5f9', fontSize: '0.88rem' }}>{d.value.toLocaleString()} samples</p>
      <p style={{ color: '#6b7fa3', fontSize: '0.78rem' }}>{((d.value / 11500) * 100).toFixed(1)}%</p>
    </div>
  )
}

export default function DatasetSection() {
  return (
    <section id="dataset" className={`section ${styles.section}`}>
      <div className="container">
        <h2 className="section-title gradient-text" style={{ textAlign: 'center' }}>
          Dataset Overview
        </h2>
        <p className="section-subtitle" style={{ textAlign: 'center' }}>
          Epileptic Seizure Recognition dataset from the UCI Machine Learning Repository.
          Each sample represents a 1-second EEG recording with 178 amplitude measurements.
        </p>

        <div className={styles.grid}>
          {/* Pie chart */}
          <div className="card">
            <h3 className={styles.cardTitle}>Class Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={distData}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {distData.map((d, i) => (
                    <Cell key={i} fill={d.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className={styles.legend}>
              {distData.map(d => (
                <div key={d.name} className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: d.color }} />
                  <span className={styles.legendLabel}>{d.name}</span>
                  <span className={styles.legendVal}>{((d.value / 11500) * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Signal samples visualization */}
          <div className="card">
            <h3 className={styles.cardTitle}>Characteristic Signals</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <span className={`badge badge-red`} style={{ marginBottom: 8, fontSize: '0.7rem' }}>Seizure (Class 1)</span>
                <ResponsiveContainer width="100%" height={60}>
                  <LineChart data={characteristicData.seizure}>
                    <YAxis hide domain={['auto', 'auto']} />
                    <Line type="monotone" dataKey="y" stroke="#ef4444" dot={false} strokeWidth={2} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16 }}>
                <span className={`badge badge-green`} style={{ marginBottom: 8, fontSize: '0.7rem' }}>Non-Seizure (Class 0)</span>
                <ResponsiveContainer width="100%" height={60}>
                  <LineChart data={characteristicData.normal}>
                    <YAxis hide domain={['auto', 'auto']} />
                    <Line type="monotone" dataKey="y" stroke="#22c55e" dot={false} strokeWidth={2} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Facts grid */}
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3 className={styles.cardTitle}>Dataset Quick Facts</h3>
            <div className={styles.factsGrid}>
              {dataFacts.map(f => (
                <div key={f.label} className={styles.factItem}>
                  <span className={styles.factIcon}>{f.icon}</span>
                  <div>
                    <div className={styles.factLabel}>{f.label}</div>
                    <div className={styles.factValue}>{f.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* EEG description */}
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3 className={styles.cardTitle}>About the EEG Features</h3>
            <div className={styles.descGrid}>
              <div className={styles.descItem}>
                <h4>178 Amplitude Values</h4>
                <p>Each of the 178 features represents a single amplitude measurement of an EEG brain signal
                   captured at a specific moment during a 1-second time window. These values encode the
                   electrical activity pattern of the brain.</p>
              </div>
              <div className={styles.descItem}>
                <h4>Binary Labels</h4>
                <p>The original dataset had 5 classes. For this project, Class 1 (seizure activity) is kept
                   as the positive class, while Classes 2–5 (non-seizure activity) are merged into a single
                   negative class, forming a clean binary classification problem.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

