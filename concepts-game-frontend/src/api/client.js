const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

async function request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
}