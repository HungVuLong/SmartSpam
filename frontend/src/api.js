const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof body === 'object' && body?.detail ? body.detail : `Request failed (${response.status})`;
    throw new Error(message);
  }

  return body;
}

function normalizeModelName(name) {
  if (!name) return 'Unknown model';
  return String(name)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export async function predict(message, model = 'logistic_regression') {
  const payload = await request('/predict', {
    method: 'POST',
    body: JSON.stringify({ message, model }),
  });

  return {
    ...payload,
    message,
    label: String(payload.label || payload.prediction || '').toLowerCase(),
  };
}

export async function getModels() {
  const payload = await request('/models');

  if (Array.isArray(payload)) {
    return payload.map((model, index) => ({
      id: model.id || model.name || `model-${index}`,
      name: normalizeModelName(model.name || model.id || `Model ${index + 1}`),
      accuracy: Number(model.accuracy) || 0,
      precision: Number(model.precision) || 0,
      recall: Number(model.recall) || 0,
      f1: Number(model.f1) || 0,
    }));
  }

  if (payload && typeof payload === 'object') {
    return Object.entries(payload).map(([key, metrics]) => ({
      id: key,
      name: normalizeModelName(key),
      accuracy: Number(metrics?.accuracy) || 0,
      precision: Number(metrics?.precision) || 0,
      recall: Number(metrics?.recall) || 0,
      f1: Number(metrics?.f1) || 0,
    }));
  }

  return [];
}

export async function getConfusionMatrix() {
  try {
    return await request('/confusion-matrix');
  } catch (firstError) {
    try {
      return await request('/matrix');
    } catch (secondError) {
      throw firstError.message ? firstError : secondError;
    }
  }
}

