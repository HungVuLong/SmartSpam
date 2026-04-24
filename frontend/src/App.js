/* App.js - SmartSpam Root */
import { useState } from 'react';
import './index.css';
import { predict } from './api';
import InputBox from './components/InputBox';
import ResultBox from './components/ResultBox';
import ModelComparison from './components/ModelComparison';
import ConfusionMatrix from './components/ConfusionMatrix';

const TABS = [
  { id: 'detect', label: 'Detect', icon: '🔍' },
  { id: 'models', label: 'Models', icon: '📊' },
  { id: 'matrix', label: 'Confusion Matrix', icon: '🧩' },
];

export default function App() {
  const [tab, setTab] = useState('detect');
  const [result, setResult] = useState(null);
  const [lastMessage, setLastMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedModel, setSelectedModel] = useState('logistic_regression');

  const handleSubmit = async (message) => {
    setLoading(true);
    setError(null);
    setLastMessage(message);
    try {
      const data = await predict(message, selectedModel);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div style={styles.app}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerInner}>
            <div style={styles.logoWrap}>
              <div style={styles.logoIcon}>⚡</div>
              <div>
                <div style={styles.logoName}>SmartSpam</div>
                <div style={styles.logoSub}>AI-powered spam detection</div>
              </div>
            </div>
            <div style={styles.headerBadges}>
              <span style={styles.badge}>TF-IDF</span>
              <span style={styles.badge}>Logistic Reg.</span>
              <span style={styles.badge}>Naive Bayes</span>
            </div>
          </div>
        </header>

        {/* Nav Tabs */}
        <nav style={styles.nav}>
          <div style={styles.navInner}>
            {TABS.map(t => (
                <button
                    key={t.id}
                    style={{ ...styles.navBtn, ...(tab === t.id ? styles.navBtnActive : {}) }}
                    onClick={() => setTab(t.id)}
                >
                  <span style={{ fontSize: 16 }}>{t.icon}</span>
                  {t.label}
                </button>
            ))}
          </div>
        </nav>

        {/* Main content */}
        <main style={styles.main}>
          {tab === 'detect' && (
              <div style={styles.detectLayout}>
                <div style={styles.detectLeft}>
                  <InputBox
                      onSubmit={handleSubmit}
                      loading={loading}
                      selectedModel={selectedModel}
                      onModelChange={setSelectedModel}
                  />

                  {error && (
                      <div style={styles.errorBox}>
                        ⚠ {error}
                        <br />
                        <span style={{ fontSize: 12, opacity: 0.7 }}>
                    Make sure the FastAPI backend is running: <code>uvicorn main:app --reload</code>
                  </span>
                      </div>
                  )}

                  {!result && !loading && !error && (
                      <div style={styles.placeholder}>
                        <div style={styles.placeholderIcon}>🔍</div>
                        <div style={styles.placeholderText}>
                          Enter a message above to analyze it for spam
                        </div>
                        <div style={styles.placeholderSub}>
                          Powered by TF-IDF vectorization and machine learning
                        </div>
                      </div>
                  )}

                  {loading && (
                      <div style={styles.analyzing}>
                        <div style={styles.analyzeSpinner} />
                        <span>Analyzing with {selectedModel === 'logistic_regression' ? 'Logistic Regression' : 'Naive Bayes'}...</span>
                      </div>
                  )}
                </div>

                <div style={styles.detectRight}>
                  {result && !loading && (
                      <ResultBox result={result} message={lastMessage} />
                  )}
                </div>
              </div>
          )}

          {tab === 'models' && <ModelComparison />}
          {tab === 'matrix' && <ConfusionMatrix />}
        </main>

        {/* Footer */}
        <footer style={styles.footer}>
          <span>SmartSpam — Built with FastAPI + scikit-learn + React</span>
          <span style={{ color: '#333' }}>SMS Spam Collection Dataset · UCI ML Repository</span>
        </footer>
      </div>
  );
}

const styles = {
  app: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#0a0a0f',
  },
  header: {
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(17,17,24,0.9)',
    backdropFilter: 'blur(12px)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  headerInner: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '1rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  logoIcon: {
    width: 40,
    height: 40,
    background: 'linear-gradient(135deg, #5c73f2, #8c7df7)',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
  },
  logoName: {
    fontFamily: 'Syne, sans-serif',
    fontSize: 20,
    fontWeight: 800,
    color: '#f0f0f5',
    letterSpacing: '-0.02em',
  },
  logoSub: {
    fontSize: 12,
    color: '#55556a',
    marginTop: 1,
  },
  headerBadges: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  badge: {
    padding: '4px 12px',
    borderRadius: 6,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    fontSize: 11,
    color: '#8888a0',
    fontFamily: 'JetBrains Mono, monospace',
  },
  nav: {
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    background: '#0a0a0f',
  },
  navInner: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 1.5rem',
    display: 'flex',
    gap: 4,
  },
  navBtn: {
    padding: '0.875rem 1.25rem',
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: '#55556a',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    transition: '0.2s',
    fontFamily: 'Instrument Sans, sans-serif',
    marginBottom: -1,
  },
  navBtnActive: {
    color: '#f0f0f5',
    borderBottomColor: '#5c73f2',
  },
  main: {
    flex: 1,
    maxWidth: 1200,
    width: '100%',
    margin: '0 auto',
    padding: '2rem 1.5rem',
  },
  detectLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 24,
    alignItems: 'start',
  },
  detectLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  detectRight: {
    position: 'sticky',
    top: 100,
  },
  errorBox: {
    padding: '1rem',
    background: 'rgba(255, 71, 87, 0.08)',
    border: '1px solid rgba(255, 71, 87, 0.2)',
    borderRadius: 12,
    color: '#ff6b7a',
    fontSize: 13,
    lineHeight: 1.6,
  },
  placeholder: {
    padding: '3rem 2rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    background: '#111118',
    border: '1px dashed rgba(255,255,255,0.08)',
    borderRadius: 18,
  },
  placeholderIcon: {
    fontSize: 40,
    opacity: 0.4,
  },
  placeholderText: {
    fontSize: 15,
    color: '#8888a0',
  },
  placeholderSub: {
    fontSize: 12,
    color: '#55556a',
  },
  analyzing: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '1.5rem',
    background: '#111118',
    border: '1px solid rgba(92,115,242,0.2)',
    borderRadius: 18,
    color: '#8888a0',
    fontSize: 14,
    animation: 'fadeIn 0.3s ease',
  },
  analyzeSpinner: {
    width: 20,
    height: 20,
    border: '2px solid rgba(92,115,242,0.2)',
    borderTopColor: '#5c73f2',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
  footer: {
    padding: '1.5rem',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 12,
    color: '#55556a',
    flexWrap: 'wrap',
    gap: 8,
  },
};