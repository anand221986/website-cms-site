import React from "react";
import { Loader } from "lucide-react";

const FullPageSpinner: React.FC = () => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/75"
      aria-label="Loading…"
    >
      <Loader className="h-12 w-12 animate-spin text-gray-600" />
    </div>
  );
};

export default FullPageSpinner;
