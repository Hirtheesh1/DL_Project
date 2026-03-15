import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import Navbar      from './components/Navbar'
import Hero        from './components/Hero'
import StatsBar    from './components/StatsBar'
import PredictSection   from './components/PredictSection'
import ModelSection     from './components/ModelSection'
import MetricsSection   from './components/MetricsSection'
import DatasetSection   from './components/DatasetSection'
import HistorySection   from './components/HistorySection'
import Footer      from './components/Footer'
import { fetchHealth } from './services/api'
import './App.css'

export default function App() {
  const [backendOnline, setBackendOnline] = useState(null)
  const [history, setHistory] = useState([])

  useEffect(() => {
    fetchHealth()
      .then(() => setBackendOnline(true))
      .catch(() => setBackendOnline(false))
  }, [])

  const addToHistory = (entry) => {
    setHistory(prev => [{ ...entry, id: Date.now(), timestamp: new Date().toLocaleTimeString() }, ...prev].slice(0, 20))
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'custom-toast',
          style: { background: '#111c30', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.07)' },
        }}
      />
      <Navbar backendOnline={backendOnline} />
      <main>
        <Hero />
        <StatsBar />
        <PredictSection addToHistory={addToHistory} />
        <MetricsSection />
        <ModelSection />
        <DatasetSection />
        {history.length > 0 && <HistorySection history={history} />}
      </main>
      <Footer />
    </>
  )
}
