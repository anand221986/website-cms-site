import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
const REDIRECT_URL = "http://api.amyntasmedia.com/ams-tools-cms/mail-merge";
const ConnectSuccess = () => {
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const token = searchParams.get("token");
    // Optionally pass token to CMS
    if (token) {
      window.location.replace(`${REDIRECT_URL}?token=${token}`);
    } else {
      window.location.replace(REDIRECT_URL);
    }
  }, [searchParams]);
  return (
    <div className="flex items-center justify-center h-screen text-lg">
      Redirecting...
    </div>
  );
};
export default ConnectSuccess;