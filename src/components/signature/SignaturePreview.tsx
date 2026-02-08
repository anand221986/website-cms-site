import { useState } from "react";
import { Moon, Sun, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmailSignature } from "@/types/signature";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface SignaturePreviewProps {
  signature: Partial<EmailSignature>;
}

const SignaturePreview = ({ signature }: SignaturePreviewProps) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const generateHTML = () => {
    const s = signature;
    const fullName = [s.name, s.lastName].filter(Boolean).join(' ') || 'Your Name';
    
    return `
<table cellpadding="0" cellspacing="0" style="font-family: Arial, sans-serif; font-size: 14px; color: ${isDarkMode ? '#e5e5e5' : '#333333'};">
  <tr>
    ${s.logoBase64 ? `
    <td style="padding-right: 15px; vertical-align: top;">
      <img src="${s.logoBase64}" width="80" height="80" style="border-radius: 8px; display: block;" alt="Photo" />
    </td>` : `
    <td style="padding-right: 15px; vertical-align: top;">
      <div style="width: 80px; height: 80px; background: ${isDarkMode ? '#374151' : '#e5e7eb'}; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: ${isDarkMode ? '#9ca3af' : '#6b7280'};">
        Photo<br/>156x156
      </div>
    </td>`}
    <td style="vertical-align: top;">
      <div style="border-left: 3px solid #14b8a6; padding-left: 15px;">
        <strong style="font-size: 16px; color: ${isDarkMode ? '#ffffff' : '#1f2937'};">${fullName}</strong><br/>
        <span style="color: ${isDarkMode ? '#d1d5db' : '#4b5563'};">${s.designation || 'Job Title'} | ${s.company || 'Company'}</span><br/><br/>
        ${s.phone ? `<strong>P:</strong> ${s.phone}` : ''}
        ${s.mobile ? ` | <strong>M:</strong> ${s.mobile}` : ''}<br/>
        <strong>E:</strong> <a href="mailto:${s.email || 'email@company.com'}" style="color: #14b8a6;">${s.email || 'email@company.com'}</a>
        ${s.website ? ` | <a href="${s.website}" style="color: #14b8a6;">${s.website.replace(/^https?:\/\//, '')}</a>` : ''}<br/>
        ${s.address ? `<span style="color: ${isDarkMode ? '#9ca3af' : '#6b7280'};">${s.address}</span>` : ''}
        <br/><br/>
        <div style="display: flex; gap: 8px;">
          ${s.socialLinks?.facebook ? `<a href="${s.socialLinks.facebook}"><img src="https://cdn-icons-png.flaticon.com/24/733/733547.png" width="20" height="20" alt="Facebook"/></a>` : ''}
          ${s.socialLinks?.twitter ? `<a href="${s.socialLinks.twitter}"><img src="https://cdn-icons-png.flaticon.com/24/733/733579.png" width="20" height="20" alt="Twitter"/></a>` : ''}
          ${s.socialLinks?.linkedin ? `<a href="${s.socialLinks.linkedin}"><img src="https://cdn-icons-png.flaticon.com/24/733/733561.png" width="20" height="20" alt="LinkedIn"/></a>` : ''}
          ${s.socialLinks?.instagram ? `<a href="${s.socialLinks.instagram}"><img src="https://cdn-icons-png.flaticon.com/24/733/733558.png" width="20" height="20" alt="Instagram"/></a>` : ''}
          ${s.socialLinks?.youtube ? `<a href="${s.socialLinks.youtube}"><img src="https://cdn-icons-png.flaticon.com/24/733/733646.png" width="20" height="20" alt="YouTube"/></a>` : ''}
        </div>
      </div>
    </td>
  </tr>
</table>`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateHTML());
    toast.success("Signature HTML copied to clipboard!");
  };

  const downloadHTML = () => {
    const html = generateHTML();
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `email-signature.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Signature downloaded!");
  };

  return (
    <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Signature preview</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="gap-2"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {isDarkMode ? 'Light' : 'Dark'} mode preview
        </Button>
      </div>

      <motion.div
        layout
        className={`p-6 min-h-[200px] transition-colors duration-300 ${
          isDarkMode ? 'preview-container dark-mode' : 'preview-container'
        }`}
      >
        <div dangerouslySetInnerHTML={{ __html: generateHTML() }} />
      </motion.div>

      <div className="flex gap-3 p-4 border-t bg-muted/30">
        <Button onClick={copyToClipboard} className="flex-1 gap-2">
          <Copy className="w-4 h-4" />
          Copy HTML
        </Button>
        <Button onClick={downloadHTML} variant="outline" className="flex-1 gap-2">
          <Download className="w-4 h-4" />
          Download
        </Button>
      </div>
    </div>
  );
};

export default SignaturePreview;
