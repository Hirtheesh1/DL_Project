import { useEffect, useRef } from 'react'
import styles from './Hero.module.css'

/* Animated EEG SVG waveform */
function EEGWaveform() {
  return (
    <svg viewBox="0 0 800 120" className={styles.eeg} aria-hidden="true" preserveAspectRatio="none">
      <defs>
        <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#00e5ff" stopOpacity="0" />
          <stop offset="20%"  stopColor="#00e5ff" stopOpacity="0.8" />
          <stop offset="80%"  stopColor="#7c3aed" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* flat + spike + flat pattern repeated */}
      <path
        d="M0,60 L60,60 L70,60 L75,20 L80,100 L85,30 L90,80 L95,60 L160,60
           L170,60 L175,20 L180,100 L185,30 L190,80 L195,60 L260,60
           L270,60 L275,20 L280,100 L285,30 L290,80 L295,60 L360,60
           L370,60 L375,20 L380,100 L385,30 L390,80 L395,60 L460,60
           L470,60 L475,20 L480,100 L485,30 L490,80 L495,60 L560,60
           L570,60 L575,20 L580,100 L585,30 L590,80 L595,60 L660,60
           L670,60 L675,20 L680,100 L685,30 L690,80 L695,60 L800,60"
        fill="none"
        stroke="url(#waveGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="1200"
        className={styles.wavePath}
      />
    </svg>
  )
}

export default function Hero() {
  return (
    <section className={styles.hero}>
      {/* Background grid */}
      <div className={styles.grid} aria-hidden="true" />

      {/* Floating blobs */}
      <div className={`${styles.blob} ${styles.blob1}`} aria-hidden="true" />
      <div className={`${styles.blob} ${styles.blob2}`} aria-hidden="true" />

      <div className="container">
        <div className={styles.content}>
          <div className={`badge badge-cyan ${styles.topBadge}`} style={{ animationDelay: '0s' }}>
            <span className="pulse-dot green" style={{ width: 7, height: 7 }} />
            Deep Learning · LSTM · Binary Classification
          </div>

          <h1 className={styles.headline}>
            AI-Powered
            <br />
            <span className="gradient-text">Epilepsy Seizure</span>
            <br />
            Detection
          </h1>

          <p className={styles.sub}>
            Real-time EEG signal analysis using a stacked LSTM neural network trained on
            11,500 samples. Achieves <strong>97.65% accuracy</strong> — helping clinicians
            detect seizures earlier and with greater precision.
          </p>

          <div className={styles.ctas}>
            <a href="#predict" className="btn btn-primary">
              Run Prediction →
            </a>
            <a href="#metrics" className="btn btn-secondary">
              View Metrics
            </a>
          </div>

          {/* Mini stat row */}
          <div className={styles.miniStats}>
            {[
              { v: '97.65%', l: 'Accuracy' },
              { v: '11,500', l: 'Samples' },
              { v: '178',    l: 'EEG Features' },
              { v: 'LSTM',   l: 'Architecture' },
            ].map(s => (
              <div key={s.l} className={styles.miniStat}>
                <span className={styles.miniVal}>{s.v}</span>
                <span className={styles.miniLabel}>{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* EEG waveform at bottom */}
      <div className={styles.waveWrap}>
        <EEGWaveform />
      </div>
    </section>
  )
}
