// src/components/SettingsTabs.jsx
 
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  User,
  Building,
  Bell,
  Mail,
  FileText,
  Settings as SettingsIcon,
  ListChecks,
  Users,
  Shield,
  Save,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { StatusSettingsTab } from "@/components/StatusSettingsTab";
import { useEffect, useState, useMemo } from "react";
import PageViewTable from "@/components/PagesViewTable";
import axios from "axios";
interface CandidateForm {
  id: number;
  job_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  headline: string | null;
  status: string;
  address: string;
  experience: string;
  photo_url: string | null;
  education: string;
  summary: string | null;
  resume_url: string;
  cover_letter: string | null;
  rating: string | null;
  hmapproval: string;
  recruiter_status: string;
  current_company: string | null;
  current_ctc: string | null;
  expected_ctc: string | null;
  skill: string[];
  college: string | null;
  degree: string | null;
  created_at: string;
  updated_at: string;
  linkedinprofile: string;
  institutiontier: string;
  companytier: string;
  role: string;
  created_dt: string;
  agency_id:number;
}
 const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PageSettingsTabs = () => {
      const [loading, setLoading] = useState(true);
      const [pages, setPages] = useState<any[]>([])
   const fetchPages = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/pages/getAllPages`
      );
 
    setPages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
          useEffect(() => {
    fetchPages();
  }, []);
  return (
      <Tabs defaultValue="pages" className="space-y-6">
       <TabsContent value="pages">
          <PageViewTable
    loading={loading}
    fetchPages={fetchPages}
    pages={pages}   // ✅ renamed
  />
          </TabsContent>
        </Tabs>
  );
};

export default PageSettingsTabs;
