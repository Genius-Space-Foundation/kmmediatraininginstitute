import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { api } from "../utils/api";

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: "user" | "admin" | "trainer";
  phone?: string;
  address?: string;
  specialization?: string;
  bio?: string;
  profileImage?: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  hasRole: (role: string | string[]) => boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated
  const isAuthenticated = !!user && !!token;

  // Role-based access control
  const hasRole = (role: string | string[]): boolean => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");
      console.log("AuthContext - Stored token:", storedToken);

      if (storedToken) {
        try {
          // Set token in API headers
          api.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${storedToken}`;

          console.log("AuthContext - Calling /auth/profile");
          const response = await api.get("/auth/profile");
          console.log("AuthContext - Profile response:", response.data);

          // Check if response has the expected structure
          if (
            response.data.success &&
            response.data.data &&
            response.data.data.user
          ) {
            setUser(response.data.data.user);
            setToken(storedToken);
            console.log(
              "AuthContext - User set successfully:",
              response.data.data.user
            );
          } else {
            console.error(
              "AuthContext - Unexpected response structure:",
              response.data
            );
            throw new Error("Invalid response structure");
          }
        } catch (error: any) {
          // Token is invalid or expired
          console.error("AuthContext - Token validation failed:", error);
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
          delete api.defaults.headers.common["Authorization"];
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { user, token } = response.data.data;

      setUser(user);
      setToken(token);
      localStorage.setItem("token", token);

      // Set default authorization header
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      return user;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Login failed. Please check your credentials.";
      throw new Error(message);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await api.post("/auth/register", userData);
      const { user, token } = response.data.data;

      setUser(user);
      setToken(token);
      localStorage.setItem("token", token);

      // Set default authorization header
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      throw new Error(message);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];

    // Clear any cached data
    sessionStorage.clear();
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      const response = await api.put("/auth/profile", userData);
      const updatedUser = response.data.data.user;
      setUser(updatedUser);
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Profile update failed. Please try again.";
      throw new Error(message);
    }
  };

  const refreshToken = async () => {
    try {
      const response = await api.post("/auth/refresh");
      const { token: newToken } = response.data.data;

      setToken(newToken);
      localStorage.setItem("token", newToken);
      api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    } catch (error: any) {
      // If refresh fails, logout the user
      logout();
      throw new Error("Session expired. Please login again.");
    }
  };

  const refreshUser = async () => {
    try {
      const response = await api.get("/auth/profile");
      const { user } = response.data.data;
      setUser(user);
    } catch (error: any) {
      console.error("Failed to refresh user profile:", error);
      logout();
      throw new Error("Failed to refresh user profile.");
    }
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    isAuthenticated,
    hasRole,
    login,
    logout,
    register,
    refreshUser,
    updateProfile,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
