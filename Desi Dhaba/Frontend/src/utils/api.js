import axios from "axios";

// ─── Axios Instance ────────────────────────────────────────────────────────────
// baseURL points to /api/v1 (versioned). Vite proxy handles /api → localhost:5000.
// withCredentials: true so the httpOnly refreshToken cookie is sent on every request.

const API = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
});

// ─── Access Token (in-memory only — never localStorage) ───────────────────────
// Stored in module scope so it survives re-renders but NOT page refreshes.
// Page refresh restores the token via AuthContext → /auth/refresh on mount.

let _accessToken = null;

export const setAccessToken = (token) => { _accessToken = token; };
export const clearAccessToken = () => { _accessToken = null; };
export const getAccessToken = () => _accessToken;

// ─── Request Interceptor ───────────────────────────────────────────────────────
// Attach Bearer token from memory (not localStorage) on every request.

API.interceptors.request.use((config) => {
  if (_accessToken) {
    config.headers.Authorization = `Bearer ${_accessToken}`;
  }
  return config;
});

// ─── Response Interceptor ─────────────────────────────────────────────────────
// On 401, silently try to get a new access token via the httpOnly refresh cookie.
// If refresh succeeds: store new token and retry the original request once.
// If refresh fails: clear token (forces re-login).

let _isRefreshing = false;
let _pendingQueue = []; // queue requests that arrive while refresh is in-flight

const processQueue = (error, token = null) => {
  _pendingQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  );
  _pendingQueue = [];
};

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh if: 401, not the refresh endpoint itself, not already retried
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/auth/login")
    ) {
      if (_isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          _pendingQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return API(originalRequest);
        });
      }

      originalRequest._retry = true;
      _isRefreshing = true;

      try {
        const { data } = await axios.post(
          "/api/v1/auth/refresh",
          {},
          { withCredentials: true }
        );
        const newToken = data.accessToken;
        setAccessToken(newToken);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return API(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAccessToken();
        // Let AuthContext handle the logout UI via the 401 event
        window.dispatchEvent(new Event("auth:logout"));
        return Promise.reject(refreshError);
      } finally {
        _isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default API;
