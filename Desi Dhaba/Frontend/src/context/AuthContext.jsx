import { createContext, useContext, useState, useEffect, useCallback } from "react";
import API, { setAccessToken, clearAccessToken } from "../utils/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // user holds profile data only — NO token. Token lives in api.js memory.
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while we attempt silent refresh

  // ─── Silent Refresh on Mount ─────────────────────────────────────────────────
  // On every page load (including refresh), try to get a new access token
  // using the httpOnly refresh cookie. If it works, restore the session.
  // If it fails (cookie expired / not present), user stays logged out.

  const silentRefresh = useCallback(async () => {
    try {
      const { data } = await API.post("/auth/refresh");
      setAccessToken(data.accessToken);
      setUser(data.user);
    } catch {
      // No valid refresh cookie — user needs to log in
      clearAccessToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    silentRefresh();
  }, [silentRefresh]);

  // ─── Listen for forced logout (token refresh failed in api.js interceptor) ──

  useEffect(() => {
    const handleForcedLogout = () => {
      clearAccessToken();
      setUser(null);
    };
    window.addEventListener("auth:logout", handleForcedLogout);
    return () => window.removeEventListener("auth:logout", handleForcedLogout);
  }, []);

  // ─── Login ────────────────────────────────────────────────────────────────────

  const login = async (email, password) => {
    const { data } = await API.post("/auth/login", { email, password });
    // data.accessToken goes to memory; user profile goes to state
    setAccessToken(data.accessToken);
    const profile = {
      _id: data._id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      avatar: data.avatar,
      role: data.role,
      savedAddresses: data.savedAddresses,
    };
    setUser(profile);
    return profile;
  };

  // ─── Register ─────────────────────────────────────────────────────────────────

  const register = async (name, email, password) => {
    const { data } = await API.post("/auth/register", { name, email, password });
    setAccessToken(data.accessToken);
    const profile = {
      _id: data._id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      avatar: data.avatar,
      role: data.role,
      savedAddresses: data.savedAddresses,
    };
    setUser(profile);
    return profile;
  };

  // ─── Logout ───────────────────────────────────────────────────────────────────

  const logout = async () => {
    try {
      await API.post("/auth/logout"); // clears httpOnly cookie on server
    } catch {
      // Even if the backend call fails, clear client state
    } finally {
      clearAccessToken();
      setUser(null);
    }
  };

  // ─── Update local user state (e.g. after profile edit) ───────────────────────

  const updateUserState = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, updateUserState, loading, isAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
};
