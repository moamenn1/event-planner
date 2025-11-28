// API base URL
const API_URL = 'http://127.0.0.1:8000/api';

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
      body: JSON.stringify({ username, email, password, role }),
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
  // Get all events
  getAll: async () => {
    const response = await fetch(`${API_URL}/events/`);
    if (!response.ok) throw new Error('Failed to fetch events');
    return response.json();
  },

  // Get events organized by current user
  getMyOrganized: async () => {
    const response = await fetch(`${API_URL}/events/my/organized`, {
      headers: getHeaders(true),
    });
    if (!response.ok) throw new Error('Failed to fetch organized events');
    return response.json();
  },

  // Get events where user is invited
  getMyInvited: async () => {
    const response = await fetch(`${API_URL}/events/my/invited`, {
      headers: getHeaders(true),
    });
    if (!response.ok) throw new Error('Failed to fetch invited events');
    return response.json();
  },

  // Get single event by ID
  getById: async (eventId) => {
    const response = await fetch(`${API_URL}/events/${eventId}`);
    if (!response.ok) throw new Error('Failed to fetch event');
    return response.json();
  },

  // Get attendee list with statuses for an event (organizer only)
  getAttendees: async (eventId) => {
    const response = await fetch(`${API_URL}/events/${eventId}/attendees`, {
      headers: getHeaders(true),
    });
    if (!response.ok) throw new Error('Failed to fetch attendees');
    return response.json();
  },

  // Create new event (organizer only)
  create: async (eventData) => {
    const response = await fetch(`${API_URL}/events/`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(eventData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to create event');
    }
    return response.json();
  },

  // Delete event (organizer only)
  delete: async (eventId) => {
    const response = await fetch(`${API_URL}/events/${eventId}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    if (!response.ok) throw new Error('Failed to delete event');
    return response.json();
  },

  // RSVP to event
  rsvp: async (eventId, responseStatus) => {
    const res = await fetch(`${API_URL}/events/${eventId}/rsvp`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ response: responseStatus }),
    });
    if (!res.ok) throw new Error('Failed to RSVP');
    return res.json();
  },

  // Invite users to event (organizer only)
  invite: async (eventId, usernames) => {
    const response = await fetch(`${API_URL}/events/${eventId}/invite`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ usernames }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to send invite');
    }
    return response.json();
  },

  // Search events with filters
  search: async (keyword = '', date = '', role = '') => {
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    if (date) params.append('date', date);
    if (role) params.append('role', role);
    
    const response = await fetch(`${API_URL}/events/search?${params.toString()}`, {
      headers: getHeaders(true),
    });
    if (!response.ok) throw new Error('Failed to search events');
    return response.json();
  },
};
