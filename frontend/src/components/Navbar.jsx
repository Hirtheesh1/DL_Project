import { useState } from 'react'
import { FaBrain } from 'react-icons/fa'
import { MdMonitorHeart } from 'react-icons/md'
import styles from './Navbar.module.css'

export default function Navbar({ backendOnline }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinks = [
    { label: 'Predict',  href: '#predict' },
    { label: 'Metrics',  href: '#metrics' },
    { label: 'Model',    href: '#model' },
    { label: 'Dataset',  href: '#dataset' },
  ]

  return (
    <nav className={styles.nav}>
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <a href="#" className={styles.logo}>
          <span className={styles.logoIcon}><MdMonitorHeart size={24} /></span>
          <span>Neuro<strong>Scan</strong> AI</span>
        </a>

        {/* Links */}
        <ul className={`${styles.links} ${menuOpen ? styles.open : ''}`}>
          {navLinks.map(l => (
            <li key={l.label}>
              <a href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</a>
            </li>
          ))}
        </ul>

        {/* Status + burger */}
        <div className={styles.right}>
          <div className={styles.status} title={backendOnline ? 'Backend online' : backendOnline === false ? 'Backend offline' : 'Checking…'}>
            <span className={`pulse-dot ${backendOnline ? 'green' : 'red'}`} />
            <span className={styles.statusLabel}>
              {backendOnline ? 'API Online' : backendOnline === false ? 'API Offline' : 'Connecting…'}
            </span>
          </div>
          <button className={styles.burger} onClick={() => setMenuOpen(p => !p)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </div>
    </nav>
  )
}
