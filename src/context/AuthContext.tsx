import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* ===================== TYPES ===================== */

type DecodedToken = {
  sub: number;
  name: string;
  email: string;
  role?: string | string[];
  "cognito:groups"?: string[];
  exp?: number;
};

type UserDetails = {
  recruiter_Id: number;
  name: string;
  email: string;
  roles: string;
  userId: number;
};

interface AuthContextType {
  user: any;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (token: string, user: any) => void;
  logout: () => void;
  loading: boolean;
  getUserRoles: () => string[];
  getUserDetails: () => UserDetails | null;
}

/* ===================== CONTEXT ===================== */

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  loginWithGoogle: () => {},
  logout: () => {},
  loading: true,
  getUserRoles: () => [],
  getUserDetails: () => null,
});

/* ===================== PROVIDER ===================== */

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  /* ===================== LOGIN ===================== */

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signin`, {
        email,
        password,
      });

      const { accessToken, refreshToken, agency_id, id } = response.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("agency_id", agency_id);
      localStorage.setItem("recruiter_id", id);

      const decoded = jwtDecode<DecodedToken>(accessToken);
      console.log("Decoded Token:", decoded);

      setUser(response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
    } catch (error) {
      console.error("Login failed", error);
      alert("Invalid credentials");
    }
  };

  /* ===================== GOOGLE LOGIN ===================== */

  const loginWithGoogle = (token: string, user: any) => {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  };

  /* ===================== ROLES ===================== */

  const getUserRoles = (): string[] => {
    const token = localStorage.getItem("accessToken");
    if (!token) return [];

    try {
      const decoded = jwtDecode<DecodedToken>(token);

      if (Array.isArray(decoded.role)) return decoded.role;
      if (decoded.role) return [decoded.role];

      if (decoded["cognito:groups"]) return decoded["cognito:groups"];

      return [];
    } catch (err) {
      console.error("Token decode error", err);
      return [];
    }
  };

  /* ===================== USER DETAILS ===================== */

  const getUserDetails = (): UserDetails | null => {
    const token = localStorage.getItem("accessToken");
    const recruiterId = Number(localStorage.getItem("recruiter_id"));

    if (!token) return null;

    try {
      const decoded = jwtDecode<DecodedToken>(token);

      return {
        recruiter_Id: recruiterId,
        name: decoded.name,
        email: decoded.email,
        roles: Array.isArray(decoded.role)
          ? decoded.role.join(", ")
          : decoded.role || "",
        userId: decoded.sub,
      };
    } catch (err) {
      console.error("Token decode error", err);
      return null;
    }
  };

  /* ===================== LOGOUT ===================== */

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("agency_id");
    localStorage.removeItem("recruiter_id");
  };

  /* ===================== PROVIDER ===================== */

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginWithGoogle,
        logout,
        loading,
        getUserRoles,
        getUserDetails,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* ===================== HOOK ===================== */

export const useAuth = () => useContext(AuthContext);
