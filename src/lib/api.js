const API_BASE = '/api';

const cache = new Map();
const CACHE_TTL = 60000;

async function fetchAPI(endpoint) {
  const cached = cache.get(endpoint);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    cache.set(endpoint, { data, timestamp: Date.now() });
    return data;
  } catch (err) {
    console.warn(`API fetch failed for ${endpoint}:`, err.message);
    return null;
  }
}

export async function getProfile() {
  return fetchAPI('/profile');
}

export async function getSkills() {
  return fetchAPI('/skills');
}

export async function getTimeline() {
  return fetchAPI('/timeline');
}

export async function getProjects() {
  return fetchAPI('/projects');
}

export async function getProject(slug) {
  return fetchAPI(`/projects/${slug}`);
}

export async function submitContact(data) {
  try {
    const response = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.warn('Contact submission failed:', err.message);
    return null;
  }
}

export async function checkHealth() {
  return fetchAPI('/health');
}
