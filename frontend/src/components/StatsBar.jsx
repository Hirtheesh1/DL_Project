import styles from './StatsBar.module.css'
import { FaBrain, FaChartLine, FaDatabase, FaLayerGroup } from 'react-icons/fa'

const stats = [
  { icon: <FaChartLine />, value: '97.65%', label: 'Test Accuracy',   color: '#00e5ff' },
  { icon: <FaDatabase />,  value: '11,500', label: 'Total Samples',   color: '#7c3aed' },
  { icon: <FaBrain />,     value: '178',    label: 'EEG Features',    color: '#22c55e' },
  { icon: <FaLayerGroup />,value: '3',      label: 'LSTM Layers',     color: '#f59e0b' },
  { icon: <FaChartLine />, value: '96.23%', label: 'F1-Score (macro)',color: '#00e5ff' },
  { icon: <FaDatabase />,  value: '2,300',  label: 'Test Samples',    color: '#7c3aed' },
]

export default function StatsBar() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.grid}>
          {stats.map((s, i) => (
            <div key={i} className={styles.card} style={{ '--c': s.color }}>
              <span className={styles.icon}>{s.icon}</span>
              <div>
                <div className={styles.value}>{s.value}</div>
                <div className={styles.label}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
