// API base URL
const API_URL = 'http://localhost:8000/api';

// Helper to get auth token from localStorage
const getAuthToken = () => localStorage.getItem('token');

// Helper to set auth headers
const getHeaders = (includeAuth = false) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

// Auth APIs
export const authAPI = {
  signup: async (username, email, password, role) => {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ username, email, password }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Signup failed');
    }
    return response.json();
  },

  login: async (username, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) throw new Error('Login failed');
    const data = await response.json();
    // Save token to localStorage
    localStorage.setItem('token', data.access_token);
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },
};

// User APIs
export const userAPI = {
  getMe: async () => {
    const response = await fetch(`${API_URL}/users/me`, {
      headers: getHeaders(true),
    });
    if (!response.ok) throw new Error('Failed to get user');
    return response.json();
  },
};

// Event APIs
export const eventAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/events/`);
    if (!response.ok) throw new Error('Failed to fetch events');
    return response.json();
  },

  getById: async (eventId) => {
    const response = await fetch(`${API_URL}/events/${eventId}`);
    if (!response.ok) throw new Error('Failed to fetch event');
    return response.json();
  },

  create: async (eventData) => {
    const response = await fetch(`${API_URL}/events/`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(eventData),
    });
    if (!response.ok) throw new Error('Failed to create event');
    return response.json();
  },

  delete: async (eventId) => {
    const response = await fetch(`${API_URL}/events/${eventId}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    if (!response.ok) throw new Error('Failed to delete event');
    return response.json();
  },

  rsvp: async (eventId, response, username) => {
    const res = await fetch(`${API_URL}/events/${eventId}/rsvp`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ response, username }),
    });
    if (!res.ok) throw new Error('Failed to RSVP');
    return res.json();
  },

  invite: async (eventId, username, message = '') => {
    const response = await fetch(`${API_URL}/events/${eventId}/invite`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ username, message }),
    });
    if (!response.ok) throw new Error('Failed to send invite');
    return response.json();
  },
};
