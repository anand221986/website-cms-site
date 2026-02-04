import { Mail } from "lucide-react";

const SignatureHeader = () => {
  return (
    <div className="header-gradient py-8 px-6 text-center">
      <div className="flex items-center justify-center gap-3 mb-2">
        <Mail className="w-8 h-8 text-primary-foreground" />
        <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground">
          Free Email Signature Generator
        </h1>
      </div>
      <p className="text-primary-foreground/80 text-sm md:text-base">
        Create professional email signatures in minutes
      </p>
    </div>
  );
};

export default SignatureHeader;
