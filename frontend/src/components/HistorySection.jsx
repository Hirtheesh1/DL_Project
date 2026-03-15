import styles from './HistorySection.module.css'

export default function HistorySection({ history }) {
  return (
    <section id="history" className={`section ${styles.section}`}>
      <div className="container">
        <h2 className="section-title gradient-text" style={{ textAlign: 'center' }}>
          Prediction History
        </h2>
        <p className="section-subtitle" style={{ textAlign: 'center' }}>
          Last {history.length} prediction{history.length > 1 ? 's' : ''} made in this session.
        </p>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Time</th>
                <th>Prediction</th>
                <th>Probability</th>
                <th>Confidence</th>
                <th>Risk</th>
                <th>True Label</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => {
                const isSeizure = h.prediction === 1
                const riskColor = h.risk_level === 'High' ? '#ef4444' : h.risk_level === 'Medium' ? '#f59e0b' : '#22c55e'
                const correct = h.trueLabel ? h.trueLabel === h.label : null
                return (
                  <tr key={h.id} className={styles.row}>
                    <td className={styles.idx}>{history.length - i}</td>
                    <td className={styles.time}>{h.timestamp}</td>
                    <td>
                      <span className={`badge ${isSeizure ? 'badge-red' : 'badge-green'}`}>
                        {isSeizure ? '⚠️ Seizure' : '✅ Non-Seizure'}
                      </span>
                    </td>
                    <td className={styles.mono}>{(h.probability * 100).toFixed(2)}%</td>
                    <td>
                      <div className={styles.confBar}>
                        <div className={styles.confFill}
                          style={{ width: `${h.confidence}%`, background: riskColor }} />
                        <span className={styles.confVal}>{h.confidence.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={styles.risk} style={{ color: riskColor }}>{h.risk_level}</span>
                    </td>
                    <td>
                      {h.trueLabel ? (
                        <span style={{ color: correct ? '#22c55e' : '#ef4444', fontWeight: 600, fontSize: '0.85rem' }}>
                          {correct ? '✓ ' : '✗ '}{h.trueLabel}
                        </span>
                      ) : <span className={styles.na}>N/A</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
