import styles from './ModelSection.module.css'

const layers = [
  { type: 'Input',   label: 'Input Layer',        detail: '(None, 178, 1)',   color: '#6b7fa3', icon: '⬇' },
  { type: 'LSTM',    label: 'LSTM Layer 1',        detail: '64 units · return_sequences=True', color: '#00e5ff', icon: '🔄' },
  { type: 'Dropout', label: 'Dropout 1',           detail: 'rate = 0.2',       color: '#7c3aed', icon: '🎲' },
  { type: 'LSTM',    label: 'LSTM Layer 2',        detail: '64 units · return_sequences=False', color: '#00e5ff', icon: '🔄' },
  { type: 'Dropout', label: 'Dropout 2',           detail: 'rate = 0.2',       color: '#7c3aed', icon: '🎲' },
  { type: 'Dense',   label: 'Dense Layer 1',       detail: '64 units · ReLU',  color: '#22c55e', icon: '⚡' },
  { type: 'Dropout', label: 'Dropout 3',           detail: 'rate = 0.2',       color: '#7c3aed', icon: '🎲' },
  { type: 'Dense',   label: 'Dense Layer 2',       detail: '32 units · ReLU',  color: '#22c55e', icon: '⚡' },
  { type: 'Output',  label: 'Output Layer',        detail: '1 unit · Sigmoid → [0,1]', color: '#f59e0b', icon: '🎯' },
]

const techCards = [
  { label: 'Framework',     value: 'TensorFlow / Keras' },
  { label: 'Optimizer',     value: 'Adam' },
  { label: 'Loss Function', value: 'Binary Cross-Entropy' },
  { label: 'Batch Size',    value: '128' },
  { label: 'Max Epochs',    value: '150 (ES@12)' },
  { label: 'Train Split',   value: '80% / 20%' },
  { label: 'Scaler',        value: 'StandardScaler' },
  { label: 'Parameters',    value: '~186,000' },
]

export default function ModelSection() {
  return (
    <section id="model" className={`section ${styles.section}`}>
      <div className="container">
        <h2 className="section-title gradient-text" style={{ textAlign: 'center' }}>
          Model Architecture
        </h2>
        <p className="section-subtitle" style={{ textAlign: 'center' }}>
          Stacked LSTM network designed to capture temporal dependencies in EEG time-series data,
          followed by fully-connected layers for binary classification.
        </p>

        <div className={styles.grid}>
          {/* Architecture flow */}
          <div className="card">
            <h3 className={styles.cardTitle}>Network Layers</h3>
            <div className={styles.pipeline}>
              {layers.map((l, i) => (
                <div key={i} className={styles.layerRow}>
                  <div className={styles.layerIcon} style={{ background: `${l.color}22`, border: `1px solid ${l.color}55`, color: l.color }}>
                    {l.icon}
                  </div>
                  <div className={styles.layerInfo}>
                    <div className={styles.layerName}>{l.label}</div>
                    <div className={styles.layerDetail}>{l.detail}</div>
                  </div>
                  <span className={styles.layerBadge} style={{ background: `${l.color}20`, color: l.color }}>
                    {l.type}
                  </span>
                  {i < layers.length - 1 && <div className={styles.arrow}>↓</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Right: info cards */}
          <div className={styles.rightCol}>
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 className={styles.cardTitle}>Training Configuration</h3>
              <div className={styles.techGrid}>
                {techCards.map(t => (
                  <div key={t.label} className={styles.techItem}>
                    <div className={styles.techLabel}>{t.label}</div>
                    <div className={styles.techValue}>{t.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className={styles.cardTitle}>Why LSTM?</h3>
              <ul className={styles.whyList}>
                {[
                  'EEG signals are sequential — LSTM captures long-range dependencies across time steps.',
                  'Gating mechanisms (forget, input, output) help filter irrelevant noise in neural signals.',
                  'Dropout regularisation prevents overfitting on the 11,500-sample dataset.',
                  'Sigmoid output gives probability scores enabling risk-level thresholding.',
                ].map((item, i) => (
                  <li key={i} className={styles.whyItem}>
                    <span className={styles.whyDot} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
