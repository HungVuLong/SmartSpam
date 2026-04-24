import HighlightText from './HighlightText';

function asPercent(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  return value <= 1 ? value * 100 : value;
}

function deriveProbabilities(result) {
  const spam = asPercent(result?.probabilities?.spam ?? result?.spam_probability ?? result?.spamProb ?? 0);
  const hamRaw = result?.probabilities?.ham ?? result?.ham_probability ?? result?.hamProb;
  const ham = typeof hamRaw === 'number' ? asPercent(hamRaw) : Math.max(0, 100 - spam);

  return {
    spam: Math.min(100, Math.max(0, spam)),
    ham: Math.min(100, Math.max(0, ham)),
  };
}

export default function ResultBox({ result, message }) {
  if (!result) return null;

  const label = String(result.label || result.prediction || '').toLowerCase();
  const isSpam = label === 'spam';
  const probabilities = deriveProbabilities(result);

  return (
    <section style={styles.card}>
      <div style={{ ...styles.banner, ...(isSpam ? styles.bannerSpam : styles.bannerHam) }}>
        <strong>{isSpam ? 'Spam detected' : 'Likely ham'}</strong>
        <span style={styles.bannerSub}>
          Confidence: {(isSpam ? probabilities.spam : probabilities.ham).toFixed(1)}%
        </span>
      </div>

      <div style={styles.barGroup}>
        <div style={styles.barRow}>
          <span style={styles.metricLabel}>Spam</span>
          <div style={styles.track}>
            <div style={{ ...styles.fill, ...styles.fillSpam, width: `${probabilities.spam}%` }} />
          </div>
          <span style={styles.metricValue}>{probabilities.spam.toFixed(1)}%</span>
        </div>
        <div style={styles.barRow}>
          <span style={styles.metricLabel}>Ham</span>
          <div style={styles.track}>
            <div style={{ ...styles.fill, ...styles.fillHam, width: `${probabilities.ham}%` }} />
          </div>
          <span style={styles.metricValue}>{probabilities.ham.toFixed(1)}%</span>
        </div>
      </div>

      <div style={styles.highlightWrap}>
        <div style={styles.sectionTitle}>Highlighted message</div>
        <HighlightText
          text={message || result.message || ''}
          spamKeywords={result.spam_keywords || result.keywords?.spam}
          hamKeywords={result.ham_keywords || result.keywords?.ham}
        />
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
    gap: 14,
  },
  banner: {
    padding: '0.8rem 0.9rem',
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  bannerSpam: {
    background: 'rgba(255, 71, 87, 0.14)',
    border: '1px solid rgba(255, 71, 87, 0.3)',
    color: '#ff96a0',
  },
  bannerHam: {
    background: 'rgba(73, 220, 130, 0.14)',
    border: '1px solid rgba(73, 220, 130, 0.3)',
    color: '#9ef3bd',
  },
  bannerSub: {
    fontSize: 12,
    opacity: 0.9,
    fontFamily: 'var(--mono, JetBrains Mono, monospace)',
  },
  barGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  barRow: {
    display: 'grid',
    gridTemplateColumns: '52px 1fr 56px',
    alignItems: 'center',
    gap: 8,
  },
  metricLabel: {
    color: '#b5b5c7',
    fontSize: 12,
    fontFamily: 'var(--mono, JetBrains Mono, monospace)',
  },
  track: {
    height: 10,
    borderRadius: 999,
    background: '#0a0a0f',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
  fillSpam: {
    background: 'linear-gradient(90deg, #ff6b7a, #ff4f8c)',
  },
  fillHam: {
    background: 'linear-gradient(90deg, #4fd991, #37c9a2)',
  },
  metricValue: {
    textAlign: 'right',
    color: '#8b8ba3',
    fontSize: 12,
    fontFamily: 'var(--mono, JetBrains Mono, monospace)',
  },
  highlightWrap: {
    borderTop: '1px solid var(--border, rgba(255,255,255,0.08))',
    paddingTop: 12,
  },
  sectionTitle: {
    marginBottom: 8,
    color: '#8f8fa6',
    fontSize: 12,
    fontFamily: 'var(--mono, JetBrains Mono, monospace)',
  },
};

