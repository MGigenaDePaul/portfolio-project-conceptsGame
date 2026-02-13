import { data } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
        'Content-Type': 'application/json',
        ...options.headers
    },
    ...options
  }

  const response = await fetch(url, config)

  // Parse body (might be error or success)
  const body = await response.json().catch(() => null)

  if (!response.ok) {
    const message = body?.error || body?.message || `HTTP ${response.status}`
    const err = new Error(message)
    err.status = response.status
    err.body = body 
    throw err
  }

  return body
}

export const api = {
    get: (endpoint) => request(endpoint),
    post: (endpoint, data) => (
        request(endpoint, { method: 'POST', body: JSON.stringify(data) })
    ),
    put: (endpoint, data) => (
        request(endpoint, { method: 'PUT', body: JSON.stringify(data) })
    ),
    delete: (endpoint) => (
        request(endpoint, { method: 'DELETE' })
    )
}