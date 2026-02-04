import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Save, Palette, Type, Image as ImageIcon } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

 const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface WebsiteSettings {
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  font_family: string;
  base_font_size: string;
}

const WebsiteSetting = () => {
  const [loading, setLoading] = useState(true);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [settings, setSettings] = useState<WebsiteSettings>({
    logo_url: "",
    primary_color: "#2563eb",
    secondary_color: "#9333ea",
    font_family: "Inter",
    base_font_size: "16px",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  /* ---------------- FETCH SETTINGS ---------------- */
  const fetchSettings = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/website-settings`);

      if (data?.status && data?.result) {
        setSettings({
          logo_url: data.result.logo_url || "",
          primary_color: data.result.primary_color || "#2563eb",
          secondary_color: data.result.secondary_color || "#9333ea",
          font_family: data.result.font_family || "Inter",
          base_font_size: data.result.base_font_size || "16px",
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load website settings");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- SAVE SETTINGS + LOGO ---------------- */
  const handleSave = async () => {
    try {
      const formData = new FormData();

      if (logoFile) {
        formData.append("logo", logoFile);
      }

      formData.append("primary_color", settings.primary_color);
      formData.append("secondary_color", settings.secondary_color);
      formData.append("font_family", settings.font_family);
      formData.append("base_font_size", settings.base_font_size);

      const { data } = await axios.put(
        `${API_BASE_URL}/website-settings`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data?.status) {
        toast.success("Website settings updated successfully");

        // Update logo_url immediately if API returns it
        if (data.result?.logo_url) {
          setSettings((prev) => ({
            ...prev,
            logo_url: data.result.logo_url,
          }));
          setLogoFile(null);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save website settings");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
console.log(settings.logo_url)
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-800">
          Website Settings
        </h1>

        {/* ---------------- LOGO ---------------- */}
        <Card className="bg-white/60 backdrop-blur-sm shadow-sm border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Website Logo
            </CardTitle>
          </CardHeader>

          <CardContent className="flex items-center gap-6">
       <Avatar className="w-24 h-24">
  {logoFile ? (
    (() => {
      const fileUrl = URL.createObjectURL(logoFile);
      console.log("Preview URL:", fileUrl); // prints preview URL
      return <AvatarImage src={fileUrl} />;
    })()
  ) : settings.logo_url ? (
    (() => {
      console.log("API Logo URL:", settings.logo_url); // prints API logo URL
      return <AvatarImage src={settings.logo_url} />;
    })()
  ) : (
    <AvatarFallback>LOGO</AvatarFallback>
  )}
</Avatar>

            <div className="w-full space-y-2">
              <Label>Upload Logo</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setLogoFile(file);
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* ---------------- COLORS ---------------- */}
        <Card className="bg-white/60 backdrop-blur-sm shadow-sm border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Theme Colors
            </CardTitle>
          </CardHeader>

          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Primary Color</Label>
              <Input
                type="color"
                value={settings.primary_color}
                onChange={(e) =>
                  setSettings({ ...settings, primary_color: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Secondary Color</Label>
              <Input
                type="color"
                value={settings.secondary_color}
                onChange={(e) =>
                  setSettings({ ...settings, secondary_color: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* ---------------- TYPOGRAPHY ---------------- */}
        <Card className="bg-white/60 backdrop-blur-sm shadow-sm border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="w-5 h-5" />
              Typography
            </CardTitle>
          </CardHeader>

          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Font Family</Label>
              <select
                className="w-full border rounded-md p-2 bg-white"
                value={settings.font_family}
                onChange={(e) =>
                  setSettings({ ...settings, font_family: e.target.value })
                }
              >
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Poppins">Poppins</option>
                <option value="Montserrat">Montserrat</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Base Font Size</Label>
              <select
                className="w-full border rounded-md p-2 bg-white"
                value={settings.base_font_size}
                onChange={(e) =>
                  setSettings({ ...settings, base_font_size: e.target.value })
                }
              >
                <option value="14px">Small (14px)</option>
                <option value="16px">Default (16px)</option>
                <option value="18px">Large (18px)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* ---------------- SAVE BUTTON ---------------- */}
        <div className="flex justify-end">
          <Button
            className="bg-gradient-to-r from-blue-600 to-purple-600"
            onClick={handleSave}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Website Settings
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default WebsiteSetting;
