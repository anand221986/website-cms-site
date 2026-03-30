import Layout from "@/components/Layout";
import CMSSettingsTabs from "@/pages/CmsDashboardTabs";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye,Trash2, Upload } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { StatusBadge } from "./StatusBadge";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play } from "lucide-react";
import { TemplateSelector } from "@/components/mail-merge/TemplateSelector";
import { ContactUploader } from "@/components/mail-merge/ContactUploader";
import { StartMergeDialog, MergeConfig } from "@/components/mail-merge/StartMergeDialog";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const mockTemplates = [
  {
    id: "1",
    name: "Interview Invitation",
    subject: "Interview Invitation for {{position}}",
    body: `Dear {{name}},

We are pleased to inform you that you have been shortlisted for the {{position}} role at our company.

We would like to invite you for an interview on {{date}} at {{time}}.

Please confirm your availability by replying to this email.

Best regards,
HR Team`,
  },
  {
    id: "2",
    name: "Password Reset",
    subject: "Password Reset Request",
    body: `Hi {{name}},

We received a request to reset your password. Click the link below to set a new password:

{{reset_link}}

If you didn't request this, please ignore this email.

Thanks,
Support Team`,
  },
  {
    id: "3",
    name: "Welcome Email",
    subject: "Welcome to {{company}}!",
    body: `Hello {{name}},

Welcome aboard! We're thrilled to have you join {{company}}.

Here are your next steps:
1. Complete your profile
2. Explore our resources
3. Join the team channel

If you have any questions, feel free to reach out.

Cheers,
{{company}} Team`,
  },
];
interface MailMergeJob {
  id: number;
  template_id: number;
  template_name: string;
  total: number;
  processed: number;
  scheduled_at:string;
  status: "completed" | "pending" | "processing" | "failed";

  created_at: string;
}
interface MailTemplate {
  id: number;
  name: string;
}
interface ApiResponse<T> {
  status: boolean;
  message: string;
  result: T;
}
const CMS = () => {
   const navigate = useNavigate();
  const [activeTab, setActiveTab] =
    useState<"pages" | "template">("pages");
  const [jobs, setJobs] = useState<MailMergeJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [file, setFile] = useState<File | null>(null);
  const [templateId, setTemplateId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [gmailConnected, setGmailConnected] = useState<boolean | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const handleConnectGmail = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };
  const checkGmailStatus = async () => {
    try {
       const token = localStorage.getItem("accessToken");
      const { data } = await axios.get(
        `${API_BASE_URL}/auth/google/status`,
        {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
      );
      setGmailConnected(data.connected);
    } catch (error) {
      console.error("Failed to check Gmail status", error);
      setGmailConnected(false);
    }
  };
const handleViewRecipients = async (jobId: number) => {
   navigate(`/mail-receipent/${jobId}`);
  // try {
  //   const { data } = await axios.get(
  //     `${API_BASE_URL}/email/merge-recipients/${jobId}`
  //   );

  //   console.log("Recipients:", data.result);

  //   // 👉 For now just log
  //   // Later you can show in modal/table
  //   toast.success(`Loaded ${data.result.length} records`);
  // } catch (error) {
  //   console.error(error);
  //   toast.error("Failed to fetch recipients");
  // }
};
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get<ApiResponse<MailMergeJob[]>>(
        `${API_BASE_URL}/email/merge-jobs`
      );
      setJobs(data.result);
    } catch {
      toast.error("Failed to load mail merge jobs");
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    if (activeTab === "template") {
      fetchJobs();
      fetchTemplates();
      checkGmailStatus();
    }
  }, [activeTab]);

  const toggleOne = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (jobs.every(j => selected.has(j.id))) {
      setSelected(new Set());
    } else {
      setSelected(new Set(jobs.map(j => j.id)));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this mail merge job?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/email/merge-jobs/${id}`);
      toast.success("Job deleted");
      fetchJobs();
    } catch {
      toast.error("Failed to delete job");
    }
  };

  /** ✅ Upload CSV */
  const handleUpload = async () => {
    if (!file || !templateId) {
      toast.error("CSV file and Template ID are required");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("templateId", templateId);

    try {
      setUploading(true);
      await axios.post(
        `${API_BASE_URL}/email/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      toast.success("CSV uploaded successfully");
      setFile(null);
      setTemplateId("");
      fetchJobs();
      fetchTemplates();
    } catch {
      toast.error("CSV upload failed");
    } finally {
      setUploading(false);
    }

  };

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get<ApiResponse<MailTemplate[]>>(
        `${API_BASE_URL}/email/mail-templates`
      );
      setTemplates(data.result);
    } catch (error) {
      toast.error("Failed to load mail templates");
    } finally {
      setLoading(false);
    }
  };
  const handleStartMerge = () => {
    if (!selectedTemplate) {
      toast.error("Please select a template");
      return;
    }
    if (!selectedFile) {
      toast.error("Please upload a CSV file with contacts");
      return;
    }

    const template = mockTemplates.find((t) => t.id === selectedTemplate);
     setSelectedTemplate("");
    setSelectedFile(null);
    toast.success("Mail merge job created successfully!");
  };

  return (
    <Layout>
      <div className="p-6">
 <Tabs
          value={activeTab}
          onValueChange={v => setActiveTab(v as any)}
        >
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-muted">
              <TabsTrigger value="pages">Mail Templates</TabsTrigger>
              <TabsTrigger value="template">Mail Merge Jobs</TabsTrigger>
            </TabsList>

            {activeTab === "template" && (
              <div className="flex items-center gap-4">
                <div className="flex flex-wrap items-center gap-4">
                  {/* <button
                    onClick={handleConnectGmail}
                    className="px-4 py-2 bg-red-600 text-white rounded"
                  >
                    Connect Gmail
                  </button> */}
                  {gmailConnected === false && (
  <button
    onClick={handleConnectGmail}
    className="px-4 py-2 bg-red-600 text-white rounded"
  >
    Connect Gmail
  </button>
)}

{gmailConnected === true && (
  <div className="px-4 py-2 bg-green-100 text-green-700 rounded">
    Gmail Connected ✓
  </div>
)}
                <StartMergeDialog
  templates={templates}
  onStartMerge={() => {
    fetchJobs(); // only refresh
  }}
  onSuccessRedirect={() => {
    fetchJobs();
    setActiveTab("template");
  }}
>
                    <Button className="gap-2">
                      <Play className="w-4 h-4" />
                      Start Merge
                    </Button>
                  </StartMergeDialog>
                </div>

              </div>
            )}
          </div>

          <TabsContent value="pages">
            <CMSSettingsTabs />
          </TabsContent>

          <TabsContent value="template" className="mt-0">
            {/* <CardHeader className="flex flex-row justify-between items-center">
              <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Mail Merge Job History</h2>
            </div> */}
            {/* ✅ Upload CSV */}

            {/* </CardHeader> */}
            <div className="bg-card rounded-lg border">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Mail Merge Job History</h2>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Checkbox
                        checked={
                          jobs.length > 0 &&
                          jobs.every(j => selected.has(j.id))
                        }
                        onCheckedChange={toggleAll}
                      />
                    </TableHead>
                    <TableHead className="py-3 px-4 text-left text-sm font-medium text-primary">ID</TableHead>
                    <TableHead className="py-3 px-4 text-left text-sm font-medium text-primary">Template Name</TableHead>
                    <TableHead className="py-3 px-4 text-left text-sm font-medium text-primary">Total</TableHead>
                    <TableHead className="py-3 px-4 text-left text-sm font-medium text-primary">Processed</TableHead>
                    <TableHead className="py-3 px-4 text-left text-sm font-medium text-primary">Scheduled Time</TableHead>
                    <TableHead className="py-3 px-4 text-left text-sm font-medium text-primary">Status</TableHead>
                    <TableHead className="py-3 px-4 text-left text-sm font-medium text-primary">Created At</TableHead>
                    <TableHead className="py-3 px-4 text-left text-sm font-medium text-primary">Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : jobs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        No jobs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    jobs.map(job => (
                      <TableRow key={job.id}>
                        <TableCell>
                          <Checkbox
                            checked={selected.has(job.id)}
                            onCheckedChange={() => toggleOne(job.id)}
                          />
                        </TableCell>
                        <TableCell className="py-4 px-4 text-sm">{job.id}</TableCell>
                        <TableCell className="py-4 px-4 text-sm font-medium">{job.template_name}</TableCell>
                        <TableCell className="py-4 px-4 text-sm">{job.total.toLocaleString()}</TableCell>
                        <TableCell className="py-4 px-4 text-sm text-primary">{job.processed}</TableCell>
                        <TableCell className="py-4 px-4 text-sm text-primary">{job.scheduled_at}</TableCell>
                        <TableCell className="py-4 px-4">  <StatusBadge status={job.status.toLowerCase() as any} /></TableCell>
                        <TableCell>
                          {new Date(job.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell className="py-4 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(job.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                            <Button
    variant="ghost"
    size="sm"
    onClick={() => handleViewRecipients(job.id)}
    className="text-muted-foreground  "
  >
    <Eye className="w-4 h-4 mr-1" />
    View  
  </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>

      </div>
    </Layout>
  );
};

export default CMS;
