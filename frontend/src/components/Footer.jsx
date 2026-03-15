import styles from './Footer.module.css'
import { MdMonitorHeart } from 'react-icons/md'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <MdMonitorHeart size={22} color="var(--accent-cyan)" />
          <span>Neuro<strong>Scan</strong> AI</span>
        </div>
        <p className={styles.copy}>
          LSTM-based Epilepsy Seizure Detection · DL Project · {year}
        </p>
        <div className={styles.stack}>
          {['Python', 'TensorFlow', 'Flask', 'React', 'Recharts'].map(t => (
            <span key={t} className={styles.tag}>{t}</span>
          ))}
        </div>
      </div>
    </footer>
  )
}
