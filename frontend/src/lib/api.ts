const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface RequestOptions extends RequestInit {
  token?: string;
}

async function request(path: string, options: RequestOptions = {}) {
  const url = `${API_BASE_URL}${path}`;
  
  // Try to extract token from localStorage if available
  let token = '';
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token') || '';
  }

  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP error! Status: ${response.status}`);
  }

  // Handle binary downloads for exports
  const contentType = response.headers.get('content-type');
  if (contentType && (
    contentType.includes('application/pdf') ||
    contentType.includes('wordprocessingml') ||
    contentType.includes('presentationml')
  )) {
    return response.blob();
  }

  return response.json();
}

export const api = {
  auth: {
    register: (data: any) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: any) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    me: () => request('/api/auth/me'),
    forgotPassword: (email: string) => request('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
    resetPassword: (data: any) => request('/api/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),
    googleOAuth: (data: any) => request('/api/auth/google-oauth', { method: 'POST', body: JSON.stringify(data) }),
    logout: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      return request('/api/auth/logout', { method: 'POST' });
    }
  },
  ideas: {
    create: (data: any) => request('/api/ideas', { method: 'POST', body: JSON.stringify(data) }),
    list: (search?: string) => request(`/api/ideas${search ? `?search=${encodeURIComponent(search)}` : ''}`),
    get: (id: string) => request(`/api/ideas/${id}`),
    edit: (id: string, data: any) => request(`/api/ideas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    duplicate: (id: string) => request(`/api/ideas/${id}/duplicate`, { method: 'POST' }),
    delete: (id: string) => request(`/api/ideas/${id}`, { method: 'DELETE' }),
  },
  reports: {
    downloadPdfUrl: (id: string) => `${API_BASE_URL}/api/reports/${id}/pdf`,
    downloadDocxUrl: (id: string) => `${API_BASE_URL}/api/reports/${id}/docx`,
    downloadPptxUrl: (id: string) => `${API_BASE_URL}/api/reports/${id}/pptx`,
  },
  mentor: {
    ask: (ideaId: string, data: { mentorRole: string; message: string }) => 
      request(`/api/mentor/${ideaId}/ask`, { method: 'POST', body: JSON.stringify(data) }),
    history: (ideaId: string, mentorRole?: string) => 
      request(`/api/mentor/${ideaId}/history${mentorRole ? `?mentorRole=${encodeURIComponent(mentorRole)}` : ''}`),
  },
  admin: {
    users: () => request('/api/admin/users'),
    deleteUser: (id: string) => request(`/api/admin/users/${id}`, { method: 'DELETE' }),
    analytics: () => request('/api/admin/analytics'),
    updateSubscription: (userId: string, plan: string) => 
      request(`/api/admin/subscriptions/${userId}`, { method: 'PUT', body: JSON.stringify({ plan }) }),
  }
};
