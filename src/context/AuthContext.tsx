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

/* ================= TYPES ================= */

type DecodedToken = {
  sub: number;
  name: string;
  email: string;
  role?: string | string[];
  subscription:string;
  exp?: number;
};

type GoogleUser = {
  id?: number;
  name: string;
  email: string;
  picture?: string;
  role?: string;
};

type License = {
  product: string;
  status: string;
  expiry_date?: string | null;
};

type UserDetails = {
  userId: number;
  name: string;
  email: string;
  roles: string;
  subscription:string
};

interface AuthContextType {
  user: GoogleUser | null;
  loading: boolean;
  googleAccessToken?: string;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (token: string, user: GoogleUser, licenses: License[]) => void;
  logout: () => void;
  getUserRoles: () => string[];
  getUserDetails: () => UserDetails | null;
  getUserLicenses: () => string[];
}

/* ================= CONTEXT ================= */

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  googleAccessToken: undefined,
  login: async () => {},
  loginWithGoogle: () => {},
  logout: () => {},
  getUserRoles: () => [],
  getUserDetails: () => null,
  getUserLicenses: () => [],
});

/* ================= PROVIDER ================= */

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [googleAccessToken, setGoogleAccessToken] = useState<string>();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);

        if (!decoded.exp || decoded.exp * 1000 > Date.now()) {
          setUser(JSON.parse(savedUser));
          setGoogleAccessToken(token);
        } else {
          logout();
        }
      } catch {
        logout();
      }
    }

    setLoading(false);
  }, []);

  /* ================= LOGIN ================= */

  const login = async (email: string, password: string) => {
    const { data } = await axios.post(`${API_BASE_URL}/auth/signin`, {
      email,
      password,
    });

    const { accessToken, user } = data;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("licenses", JSON.stringify(user.licenses || []));

    setUser(user);
  };

  /* ================= GOOGLE LOGIN ================= */

  const loginWithGoogle = (
    token: string,
    user: GoogleUser,
    licenses: License[]
  ) => {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("licenses", JSON.stringify(licenses));

    setUser(user);
    setGoogleAccessToken(token);
  };

  /* ================= USER DETAILS ================= */

  const getUserDetails = (): UserDetails | null => {
    const token = localStorage.getItem("accessToken");

    if (!token) return null;

    try {
      const decoded = jwtDecode<DecodedToken>(token);

      return {
        userId: decoded.sub,
        name: decoded.name,
        email: decoded.email,
        subscription:decoded.subscription,
        roles: Array.isArray(decoded.role)
          ? decoded.role.join(", ")
          : decoded.role || "",
      };
      
    } catch {
      return null;
    }
  };

  /* ================= LICENSES ================= */

  const getUserLicenses = (): string[] => {
    const licenses = localStorage.getItem("licenses");

    if (!licenses) return [];

    try {
      const parsed: License[] = JSON.parse(licenses);

      return parsed
        .filter((l) => l.status === "active")
        .map((l) => l.product.trim().toLowerCase());
    } catch {
      return [];
    }
  };

  /* ================= ROLES ================= */

  const getUserRoles = (): string[] => {
    const token = localStorage.getItem("accessToken");

    if (!token) return [];

    try {
      const decoded = jwtDecode<DecodedToken>(token);

      if (Array.isArray(decoded.role)) return decoded.role;
      if (decoded.role) return [decoded.role];

      return [];
    } catch {
      return [];
    }
  };

  /* ================= LOGOUT ================= */

  const logout = () => {
    setUser(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        googleAccessToken,
        login,
        loginWithGoogle,
        logout,
        getUserRoles,
        getUserDetails,
        getUserLicenses,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);