import { useEffect, useMemo, useState } from 'react';
import { getConfusionMatrix } from '../api';

function toPercent(value) {
  if (!Number.isFinite(value)) return 0;
  return value * 100;
}

function safeDivide(numerator, denominator) {
  if (!denominator) return 0;
  return numerator / denominator;
}

export default function ConfusionMatrix() {
  const [matrix, setMatrix] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        const data = await getConfusionMatrix();
        if (!alive) return;
        setMatrix(data);
        setError(null);
      } catch (err) {
        if (!alive) return;
        setError(err.message);
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();

    return () => {
      alive = false;
    };
  }, []);

  const stats = useMemo(() => {
    if (!matrix) return null;

    const tn = Number(matrix.tn) || 0;
    const fp = Number(matrix.fp) || 0;
    const fn = Number(matrix.fn) || 0;
    const tp = Number(matrix.tp) || 0;

    const total = tn + fp + fn + tp;
    const accuracy = safeDivide(tp + tn, total);
    const precision = safeDivide(tp, tp + fp);
    const recall = safeDivide(tp, tp + fn);
    const specificity = safeDivide(tn, tn + fp);
    const f1 = safeDivide(2 * precision * recall, precision + recall);

    return { tn, fp, fn, tp, accuracy, precision, recall, specificity, f1 };
  }, [matrix]);

  if (loading) {
    return <div style={styles.state}>Loading confusion matrix...</div>;
  }

  if (error) {
    return <div style={styles.error}>Failed to load confusion matrix: {error}</div>;
  }

  if (!stats) {
    return <div style={styles.state}>No confusion matrix data available.</div>;
  }

  return (
    <section style={styles.card}>
      <h2 style={styles.title}>Confusion Matrix</h2>

      <div style={styles.grid}>
        <div style={styles.corner} />
        <div style={styles.axis}>Pred: Ham</div>
        <div style={styles.axis}>Pred: Spam</div>

        <div style={styles.axis}>Actual: Ham</div>
        <div style={{ ...styles.cell, ...styles.goodCell }}>
          <span>TN</span>
          <strong>{stats.tn}</strong>
        </div>
        <div style={{ ...styles.cell, ...styles.badCell }}>
          <span>FP</span>
          <strong>{stats.fp}</strong>
        </div>

        <div style={styles.axis}>Actual: Spam</div>
        <div style={{ ...styles.cell, ...styles.badCell }}>
          <span>FN</span>
          <strong>{stats.fn}</strong>
        </div>
        <div style={{ ...styles.cell, ...styles.goodCell }}>
          <span>TP</span>
          <strong>{stats.tp}</strong>
        </div>
      </div>

      <div style={styles.statsWrap}>
        <Stat label="Accuracy" value={stats.accuracy} />
        <Stat label="Precision" value={stats.precision} />
        <Stat label="Recall" value={stats.recall} />
        <Stat label="Specificity" value={stats.specificity} />
        <Stat label="F1" value={stats.f1} />
      </div>
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statLabel}>{label}</div>
      <div style={styles.statValue}>{toPercent(value).toFixed(1)}%</div>
    </div>
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
  title: {
    margin: 0,
    color: '#f0f0f5',
    fontSize: 18,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '120px 1fr 1fr',
    gap: 8,
  },
  corner: {
    minHeight: 1,
  },
  axis: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 10,
    color: '#9c9cb4',
    fontSize: 12,
    padding: '0.5rem',
    textAlign: 'center',
  },
  cell: {
    borderRadius: 12,
    padding: '0.9rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    fontFamily: 'var(--mono, JetBrains Mono, monospace)',
  },
  goodCell: {
    background: 'rgba(73, 220, 130, 0.12)',
    border: '1px solid rgba(73, 220, 130, 0.25)',
    color: '#9ef3bd',
  },
  badCell: {
    background: 'rgba(255, 71, 87, 0.12)',
    border: '1px solid rgba(255, 71, 87, 0.25)',
    color: '#ff98a2',
  },
  statsWrap: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: 8,
  },
  statCard: {
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 10,
    padding: '0.65rem',
    background: '#0f0f16',
  },
  statLabel: {
    color: '#8f8fa8',
    fontSize: 11,
    marginBottom: 4,
    fontFamily: 'var(--mono, JetBrains Mono, monospace)',
  },
  statValue: {
    color: '#e2e2f2',
    fontSize: 16,
    fontWeight: 700,
  },
  state: {
    color: '#8c8ca2',
    fontFamily: 'var(--mono, JetBrains Mono, monospace)',
    padding: '1rem 0',
  },
  error: {
    color: '#ff7a87',
    background: 'rgba(255, 71, 87, 0.08)',
    border: '1px solid rgba(255, 71, 87, 0.2)',
    borderRadius: 12,
    padding: '1rem',
  },
};

