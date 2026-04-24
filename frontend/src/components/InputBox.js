import { useMemo, useState } from 'react';

const EXAMPLES = [
  'Congratulations! You have won a free cruise. Reply CLAIM now.',
  'Hey, can we move our meeting to 3:30 PM tomorrow?',
  'URGENT: Verify your bank account immediately at secure-link.example',
  'Are we still on for dinner tonight?',
];

export default function InputBox({ onSubmit, loading, selectedModel, onModelChange }) {
  const [message, setMessage] = useState('');

  const canSubmit = useMemo(() => message.trim().length > 0 && !loading, [message, loading]);

  const submit = () => {
    if (!canSubmit) return;
    onSubmit(message.trim());
  };

  const handleKeyDown = (event) => {
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault();
      submit();
    }
  };

  return (
    <section style={styles.card}>
      <div style={styles.topRow}>
        <h2 style={styles.title}>Message Input</h2>
        <div style={styles.toggleWrap}>
          <button
            type="button"
            style={{ ...styles.toggleBtn, ...(selectedModel === 'logistic_regression' ? styles.toggleBtnActive : {}) }}
            onClick={() => onModelChange('logistic_regression')}
          >
            LR
          </button>
          <button
            type="button"
            style={{ ...styles.toggleBtn, ...(selectedModel === 'naive_bayes' ? styles.toggleBtnActive : {}) }}
            onClick={() => onModelChange('naive_bayes')}
          >
            NB
          </button>
        </div>
      </div>

      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Paste or type an SMS/email message to classify..."
        style={styles.textarea}
        rows={8}
      />

      <div style={styles.actions}>
        <button type="button" style={{ ...styles.submitBtn, ...(canSubmit ? {} : styles.submitBtnDisabled) }} onClick={submit}>
          {loading ? 'Analyzing...' : 'Analyze message'}
        </button>
        <span style={styles.shortcutHint}>Ctrl+Enter to submit</span>
      </div>

      <div style={styles.examples}>
        <div style={styles.examplesLabel}>Try examples:</div>
        <div style={styles.examplesGrid}>
          {EXAMPLES.map((sample) => (
            <button key={sample} type="button" style={styles.exampleBtn} onClick={() => setMessage(sample)}>
              {sample}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

const styles = {
  card: {
    background: 'var(--bg-card, #111118)',
    border: '1px solid var(--border, rgba(255,255,255,0.08))',
    borderRadius: 16,
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    margin: 0,
    color: '#f0f0f5',
    fontSize: 16,
  },
  toggleWrap: {
    display: 'inline-flex',
    border: '1px solid var(--border, rgba(255,255,255,0.08))',
    borderRadius: 10,
    overflow: 'hidden',
  },
  toggleBtn: {
    padding: '0.4rem 0.75rem',
    border: 'none',
    background: 'transparent',
    color: '#8888a0',
    cursor: 'pointer',
    fontFamily: 'var(--mono, JetBrains Mono, monospace)',
    fontSize: 12,
  },
  toggleBtnActive: {
    background: 'rgba(92,115,242,0.2)',
    color: '#e5e7ff',
  },
  textarea: {
    width: '100%',
    resize: 'vertical',
    minHeight: 140,
    background: '#0a0a0f',
    border: '1px solid var(--border, rgba(255,255,255,0.08))',
    borderRadius: 12,
    padding: '0.8rem',
    color: '#f0f0f5',
    fontFamily: 'var(--mono, JetBrains Mono, monospace)',
    fontSize: 13,
    lineHeight: 1.5,
    boxSizing: 'border-box',
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  submitBtn: {
    border: 'none',
    borderRadius: 10,
    background: 'linear-gradient(135deg, #5c73f2, #8c7df7)',
    color: 'white',
    padding: '0.55rem 0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  submitBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  shortcutHint: {
    color: '#66667c',
    fontFamily: 'var(--mono, JetBrains Mono, monospace)',
    fontSize: 12,
  },
  examples: {
    borderTop: '1px solid var(--border, rgba(255,255,255,0.08))',
    paddingTop: 10,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  examplesLabel: {
    color: '#8f8fa6',
    fontSize: 12,
    fontFamily: 'var(--mono, JetBrains Mono, monospace)',
  },
  examplesGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 6,
  },
  exampleBtn: {
    textAlign: 'left',
    border: '1px solid rgba(255,255,255,0.06)',
    background: '#0f0f16',
    color: '#a6a6bc',
    borderRadius: 10,
    padding: '0.5rem 0.65rem',
    cursor: 'pointer',
    fontSize: 12,
    lineHeight: 1.4,
  },
};

