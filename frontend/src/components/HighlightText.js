const DEFAULT_SPAM_KEYWORDS = [
  'free',
  'win',
  'winner',
  'prize',
  'claim',
  'urgent',
  'limited',
  'offer',
  'click',
  'verify',
  'bank',
  'bonus',
  'cash',
];

const DEFAULT_HAM_KEYWORDS = [
  'meeting',
  'tomorrow',
  'thanks',
  'dinner',
  'call',
  'family',
  'project',
  'schedule',
  'home',
];

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default function HighlightText({ text, spamKeywords, hamKeywords }) {
  const source = text || '';
  const spamList = (spamKeywords && spamKeywords.length ? spamKeywords : DEFAULT_SPAM_KEYWORDS).map((k) => k.toLowerCase());
  const hamList = (hamKeywords && hamKeywords.length ? hamKeywords : DEFAULT_HAM_KEYWORDS).map((k) => k.toLowerCase());

  const allKeywords = [...new Set([...spamList, ...hamList])].sort((a, b) => b.length - a.length);
  if (!allKeywords.length || !source) {
    return <span style={styles.plain}>{source}</span>;
  }

  const matcher = new RegExp(`\\b(${allKeywords.map(escapeRegex).join('|')})\\b`, 'gi');
  const parts = [];
  let last = 0;
  let match;

  while ((match = matcher.exec(source)) !== null) {
    const index = match.index;
    const value = match[0];
    const lowerValue = value.toLowerCase();

    if (index > last) {
      parts.push(source.slice(last, index));
    }

    const isSpam = spamList.includes(lowerValue);
    const badgeStyle = isSpam ? styles.spam : styles.ham;
    const marker = isSpam ? '🔴' : '🟢';

    parts.push(
      <mark key={`${index}-${value}`} style={{ ...styles.badge, ...badgeStyle }}>
        {marker} {value}
      </mark>
    );

    last = index + value.length;
  }

  if (last < source.length) {
    parts.push(source.slice(last));
  }

  return <span style={styles.plain}>{parts}</span>;
}

const styles = {
  plain: {
    color: '#d8d8e8',
    lineHeight: 1.7,
    fontFamily: 'var(--mono, JetBrains Mono, monospace)',
    fontSize: 13,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  badge: {
    borderRadius: 6,
    padding: '0.1rem 0.3rem',
    margin: '0 0.08rem',
  },
  spam: {
    background: 'rgba(255, 71, 87, 0.2)',
    color: '#ff8b97',
  },
  ham: {
    background: 'rgba(73, 220, 130, 0.2)',
    color: '#88f0ad',
  },
};

