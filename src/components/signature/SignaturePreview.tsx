import { Moon, Sun } from "lucide-react";
import { useState } from "react";
import type { SignatureData } from "./SignatureForm";

interface SignaturePreviewProps {
  data: SignatureData;
  template: string;
}

const SignaturePreview = ({ data, template }: SignaturePreviewProps) => {
  const [dark, setDark] = useState(false);

  const name = `${data.firstName || "Your"} ${data.lastName || "Name"}`;
  const job = data.jobTitle || "Job Title";
  const company = data.company || "Company";
  const email = data.email || "email@company.com";
  const phone = data.phone || "(800) 555-0199";
  const mobile = data.mobile || "(800) 555-0299";
  const website = data.website || "www.company.com";
  const address = data.address || "Street, City, Zip Code, Country";

  const bgColor = dark ? "hsl(220, 20%, 12%)" : "hsl(0, 0%, 100%)";
  const textColor = dark ? "hsl(0, 0%, 90%)" : "hsl(220, 20%, 10%)";
  const mutedColor = dark ? "hsl(0, 0%, 60%)" : "hsl(0, 0%, 45%)";
  const accentColor = "hsl(210, 100%, 45%)";

  // ✅ Avatar component
  const Avatar = ({ size = 64 }: { size?: number }) => {
    const initials = `${data.firstName?.[0] || "J"}${data.lastName?.[0] || "D"}`;
    return data.logoBase64 ? (
      <img
        src={data.logoBase64}
        alt="Logo"
        className="object-cover rounded-full"
        style={{ width: size, height: size }}
      />
    ) : (
      <div
        className="flex items-center justify-center rounded-full text-white font-bold"
        style={{
          width: size,
          height: size,
          backgroundColor: accentColor,
          fontSize: size / 2.5,
        }}
      >
        {initials}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Signature preview</h2>
        <button
          onClick={() => setDark(!dark)}
          className="flex items-center gap-2 rounded-lg border bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
          {dark ? "Light" : "Dark"} mode preview
        </button>
      </div>

      <div
        className="rounded-lg border p-6 transition-colors duration-300"
        style={{ backgroundColor: bgColor }}
      >
        {template === "modern" ? (
          <div className="text-center space-y-2">
            <div className="mx-auto">
              <Avatar size={64} />
            </div>
            <div className="font-bold text-lg" style={{ color: textColor }}>{name}</div>
            <div className="text-sm" style={{ color: accentColor }}>{job} | {company}</div>
            <div className="h-px w-16 mx-auto" style={{ backgroundColor: accentColor }} />
            <div className="text-xs space-y-0.5" style={{ color: mutedColor }}>
              <p>{email}</p>
              <p>{phone} | {mobile}</p>
              <p>{website}</p>
            </div>
          </div>
        ) : template === "compact" ? (
          <div className="flex items-center gap-3">
            <Avatar size={48} />
            <div>
              <span className="font-bold text-sm" style={{ color: textColor }}>{name}</span>
              <span className="text-sm" style={{ color: mutedColor }}> · {job} · {company}</span>
              <div className="text-xs mt-0.5" style={{ color: mutedColor }}>
                {phone} | {email} | {website}
              </div>
            </div>
          </div>
        ) : template === "elegant" ? (
          <div className="flex items-start gap-4">
            <Avatar size={56} />
            <div className="space-y-1">
              <div className="font-bold" style={{ color: textColor }}>{name}</div>
              <div className="text-sm italic" style={{ color: "hsl(280,60%,50%)" }}>{job}</div>
              <div className="text-xs space-y-0.5" style={{ color: mutedColor }}>
                <p>{company} · {address}</p>
                <p>✉ {email} · ☎ {phone}</p>
                <p style={{ color: "hsl(280,60%,50%)" }}>{website}</p>
              </div>
            </div>
          </div>
        ) : template === "bold" ? (
          <div className="p-3 rounded-md" style={{ backgroundColor: dark ? "hsl(210,80%,15%)" : "hsl(210,80%,20%)" }}>
            <div className="flex items-center gap-4">
              <Avatar size={56} />
              <div>
                <div className="font-bold text-white">{name}</div>
                <div className="text-sm" style={{ color: "hsl(0,80%,70%)" }}>{job}</div>
                <div className="text-xs text-white/70 mt-1">
                  {email} · {phone}
                </div>
                <div className="text-xs" style={{ color: "hsl(0,80%,70%)" }}>{website}</div>
              </div>
            </div>
          </div>
        ) : (
          /* Classic */
          <div className="flex items-start gap-4">
            <Avatar size={56} />
            <div className="border-l-2 pl-4 space-y-1" style={{ borderColor: accentColor }}>
              <div className="font-bold" style={{ color: textColor }}>{name}</div>
              <div className="text-sm" style={{ color: accentColor }}>{job} | {company}</div>
              <div className="text-xs space-y-0.5" style={{ color: mutedColor }}>
                <p><span style={{ color: accentColor }}>Phone:</span> {phone} <span style={{ color: accentColor }}>Mobile:</span> {mobile}</p>
                <p><span style={{ color: accentColor }}>Email:</span> {email}</p>
                <p>{company}</p>
                <p>{address}</p>
                <p style={{ color: accentColor }}>{website}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignaturePreview;