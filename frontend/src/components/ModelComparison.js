import { useEffect, useState } from 'react';
import { getModels } from '../api';

const METRICS = ['accuracy', 'precision', 'recall', 'f1'];

function asPercent(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  return value <= 1 ? value * 100 : value;
}

export default function ModelComparison() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        if (loading) setLoading(true);
        const data = await getModels();
        if (!alive) return;
        setModels(data);
        setError(null);
      } catch (err) {
        if (!alive) return;
        setError(err.message);
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    const timer = setInterval(load, 15000);

    return () => {
      alive = false;
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <div style={styles.state}>Loading model metrics...</div>;
  }

  if (error) {
    return <div style={styles.error}>Failed to load model metrics: {error}</div>;
  }

  return (
    <section style={styles.card}>
      <h2 style={styles.title}>Model Comparison</h2>
      {models.map((model) => (
        <article key={model.id || model.name} style={styles.modelCard}>
          <div style={styles.modelName}>{model.name}</div>
          {METRICS.map((metric) => {
            const value = asPercent(model[metric]);
            return (
              <div key={metric} style={styles.metricRow}>
                <span style={styles.metricLabel}>{metric.toUpperCase()}</span>
                <div style={styles.track}>
                  <div style={{ ...styles.fill, width: `${Math.max(0, Math.min(100, value))}%` }} />
                </div>
                <span style={styles.metricValue}>{value.toFixed(1)}%</span>
              </div>
            );
          })}
        </article>
      ))}
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
  title: {
    margin: 0,
    color: '#f0f0f5',
    fontSize: 18,
  },
  modelCard: {
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: '0.8rem',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  modelName: {
    color: '#c7c7da',
    fontSize: 13,
    fontFamily: 'var(--mono, JetBrains Mono, monospace)',
    textTransform: 'capitalize',
  },
  metricRow: {
    display: 'grid',
    gridTemplateColumns: '62px 1fr 58px',
    alignItems: 'center',
    gap: 8,
  },
  metricLabel: {
    color: '#8b8ba2',
    fontSize: 11,
    fontFamily: 'var(--mono, JetBrains Mono, monospace)',
  },
  track: {
    background: '#0a0a0f',
    border: '1px solid rgba(255,255,255,0.05)',
    height: 9,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    background: 'linear-gradient(90deg, #5c73f2, #8c7df7)',
  },
  metricValue: {
    textAlign: 'right',
    color: '#9b9bb3',
    fontSize: 11,
    fontFamily: 'var(--mono, JetBrains Mono, monospace)',
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

