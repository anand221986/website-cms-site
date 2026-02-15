import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
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
  subscription?:string;
};

type GoogleUser = {
  name: string;
  email: string;
  picture?: string;
};

type UserDetails = {
  recruiter_Id: number;
  name: string;
  email: string;
  roles: string;
  userId: number;
  subscription:string;
};

interface AuthContextType {
  user: GoogleUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  googleAccessToken?: string;
  loginWithGoogle: (token: string, user: GoogleUser) => void;
  logout: () => void;
  getUserRoles: () => string[];
  getUserDetails: () => UserDetails | null;
}

/* ===================== CONTEXT ===================== */

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  loginWithGoogle: () => {},
  logout: () => {},
  getUserRoles: () => [],
  getUserDetails: () => null,
});

/* ===================== PROVIDER ===================== */

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [loading, setLoading] = useState(true);
const [googleAccessToken, setGoogleAccessToken] = useState<string | undefined>(undefined);
  /* ===================== INIT ===================== */

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        if (!decoded.exp || decoded.exp * 1000 > Date.now()) {
          setUser(JSON.parse(savedUser));
           if ((JSON.parse(savedUser) as GoogleUser)?.email) {
            setGoogleAccessToken(token);
          }
        } else {
          logout();
        }
      } catch {
        logout();
      }
    }

    setLoading(false);
  }, []);

  /* ===================== LOGIN ===================== */

  const login = async (email: string, password: string) => {
    try {
      const { data } = await axios.post(`${API_BASE_URL}/auth/signin`, {
        email,
        password,
      });

      const { accessToken, refreshToken, agency_id, id } = data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("agency_id", agency_id);
      localStorage.setItem("recruiter_id", id);
      localStorage.setItem("user", JSON.stringify(data));

      setUser(data);
    } catch (error) {
      console.error("Login failed", error);
      throw new Error("Invalid credentials");
    }
  };

  /* ===================== GOOGLE LOGIN ===================== */

  const loginWithGoogle = (token: string, user: GoogleUser) => {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
    setGoogleAccessToken(token); // Save Google access token in sta
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
    } catch {
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
      console.log(decoded,'decoded value')

      return {
        recruiter_Id: recruiterId,
        name: decoded.name,
        email: decoded.email,
        roles: Array.isArray(decoded.role)
          ? decoded.role.join(", ")
          : decoded.role || "",
        userId: decoded.sub,
        subscription:decoded.subscription,
      };
    } catch {
      return null;
    }
  };

  /* ===================== LOGOUT ===================== */

  const logout = () => {
    setUser(null);
    localStorage.clear();
  };

  /* ===================== PROVIDER ===================== */

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithGoogle,
        logout,
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