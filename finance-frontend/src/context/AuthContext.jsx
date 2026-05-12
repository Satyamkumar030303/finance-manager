import { createContext, useState, useCallback, useEffect, useContext } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // true while checking session

  // Called by axios interceptor to get the current token
  const getToken = useCallback(() => accessToken, [accessToken]);

  // Called by axios interceptor to silently refresh the token
  const refreshToken = useCallback(async () => {
    try {
      const res = await api.post("/auth/refresh", {}, { withCredentials: true, _skipAuth: true });
      setUser(res.data.user);
      setAccessToken(res.data.accessToken);
      return res.data.accessToken;
    } catch {
      setUser(null);
      setAccessToken(null);
      return null;
    }
  }, []);

  const login = useCallback((data) => {
    setAccessToken(data.accessToken);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout", {}, { withCredentials: true, _skipAuth: true });
    } catch {
      // ignore
    }
    setUser(null);
    setAccessToken(null);
  }, []);

  // On app load — attempt silent refresh to restore session from cookie
  useEffect(() => {
    refreshToken().finally(() => setIsLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, login, logout, getToken, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;
