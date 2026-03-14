import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const apiClient = axios.create({
  baseURL: `${baseURL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

let onUnauthorized: (() => void) | null = null;

export function setOnUnauthorized(callback: () => void) {
  onUnauthorized = callback;
}

export function setAuthToken(token: string | null) {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
}

// When sending FormData, do not set Content-Type so the browser sends multipart/form-data with boundary
apiClient.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const url: string | undefined = err.config?.url;
      const isValidationEndpoint =
        typeof url === 'string' && url.includes('/users/validate-for-document');

      // For the secondary validation popup, a 401 should NOT log the user out;
      // just surface the error to the caller so it can show a toast.
      if (!isValidationEndpoint && onUnauthorized) {
        onUnauthorized();
      }
    }
    return Promise.reject(err);
  }
);
