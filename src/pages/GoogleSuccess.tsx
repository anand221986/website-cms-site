import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const GoogleSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithGoogle } = useAuth();

  useEffect(() => {
    const handleGoogleLogin = async () => {
      try {
        // ✅ token coming from backend redirect
        const token = searchParams.get("token");

        if (!token) {
          console.error("Google token missing");
          navigate("/login");
          return;
        }

        // ✅ Call backend to get user info
        const response = await axios.get(
          `${API_BASE_URL}/auth/google/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const { user, role }= response.data;
        // ✅ Store token + user in AuthContext
      loginWithGoogle(token, user, role);

        // ✅ Redirect to dashboard
        navigate("/", { replace: true });
      } catch (error) {
        console.error("Google login failed", error);
        navigate("/login");
      }
    };

    handleGoogleLogin();
  }, []);

  return (
    <div className="flex items-center justify-center h-screen text-lg">
      Logging you in with Google...
    </div>
  );
};

export default GoogleSuccess;
