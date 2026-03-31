import { createContext, useContext, useState, useEffect, useCallback } from "react";
import API, { setAccessToken, clearAccessToken } from "../utils/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const silentRefresh = useCallback(async () => {
    try {
      const { data } = await API.post("/auth/refresh");
      setAccessToken(data.accessToken);
      setUser(data.user);
    } catch {
      clearAccessToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    silentRefresh();
  }, [silentRefresh]);

  useEffect(() => {
    const handleForcedLogout = () => {
      clearAccessToken();
      setUser(null);
    };
    window.addEventListener("auth:logout", handleForcedLogout);
    return () => window.removeEventListener("auth:logout", handleForcedLogout);
  }, []);

  const login = async (email, password) => {
    const { data } = await API.post("/auth/login", { email, password });
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

  const logout = async () => {
    try {
      await API.post("/auth/logout");
    } catch {
    } finally {
      clearAccessToken();
      setUser(null);
    }
  };

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
