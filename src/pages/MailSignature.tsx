import { useEffect, useState, useCallback } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Trash2,
  Copy,
  Plus,
  Pencil,
  Check,
  X,
  Download,
  Signature,
} from "lucide-react";
import { toast } from "sonner";

import PlatformSelector from "@/components/signature/PlatformSelector";
import TemplateCarousel from "@/components/signature/TemplateCarousel";
import SignatureForm from "@/components/signature/SignatureForm";
import SignaturePreview from "@/components/signature/SignaturePreview";

import { EmailSignature } from "@/types/signature";
import { saveSignature as apiSaveSignature } from "@/lib/saveSignature";
import { useAuth } from "@/context/AuthContext";

/* -------------------------------------------------------------------------- */
/*                                  CONSTANTS                                 */
/* -------------------------------------------------------------------------- */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const INITIAL_FORM: Omit<EmailSignature, "id"> = {
  name: "",
  lastName: "",
  designation: "",
  company: "",
  phone: "",
  mobile: "",
  email: "",
  website: "",
  address: "",
  logoUrl: "",
  logoBase64: "",
  customHTML: "",
  templateId: "classic",
  socialLinks: {
    facebook: "",
    twitter: "",
    linkedin: "",
    instagram: "",
    youtube: "",
  },
};

const DUMMY_SIGNATURES: EmailSignature[] = [
  {
    id: 1,
    name: "Rahul",
    lastName: "Tripathi",
    designation: "Senior Developer",
    company: "Acme Corp",
    phone: "+91 9876543210",
    mobile: "+91 9876543210",
    email: "rahul@acme.com",
    website: "https://acme.com",
    address: "123 Main Street",
    logoUrl: "",
    logoBase64: "",
    customHTML: "",
    templateId: "classic",
    socialLinks: {
      facebook: "",
      twitter: "",
      linkedin: "",
      instagram: "",
      youtube: "",
    },
  },
];

/* -------------------------------------------------------------------------- */
/*                                   HELPERS                                  */
/* -------------------------------------------------------------------------- */

const getImageSrc = (base64?: string) =>
  base64?.startsWith("data:image")
    ? base64
    : base64
    ? `data:image/jpeg;base64,${base64}`
    : "";

const templateHTML = (s: EmailSignature, removeBrand = true) => `
<table cellpadding="0" cellspacing="0" style="font-family:Arial;font-size:14px;color:#333">
  <tr>
    ${
      s.logoBase64
        ? `<td style="padding-right:12px">
            <img src="${getImageSrc(
              s.logoBase64
            )}" width="70" style="border-radius:6px"/>
           </td>`
        : ""
    }
    <td style="border-left:3px solid #2563eb;padding-left:12px">
      <strong style="font-size:16px">${s.name} ${s.lastName}</strong><br/>
      ${s.designation}<br/>
      <span style="color:#2563eb">${s.company}</span><br/><br/>
      📞 ${s.phone}<br/>
      ✉️ <a href="mailto:${s.email}">${s.email}</a><br/>
      ${s.website ? `🌐 <a href="${s.website}">${s.website}</a>` : ""}
    </td>
  </tr>
  ${
    !removeBrand
      ? `<tr><td colspan="2" style="font-size:11px;color:#888">Created with YourBrand</td></tr>`
      : ""
  }
</table>
`;

const generateHTML = (s: EmailSignature) =>
  s.customHTML || templateHTML(s);

/* -------------------------------------------------------------------------- */
/*                              MAIN COMPONENT                                */
/* -------------------------------------------------------------------------- */

const MailSignaturePage = () => {
  const [signatures, setSignatures] = useState<EmailSignature[]>([]);
  const [selected, setSelected] = useState<EmailSignature | null>(null);

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [inlineEditId, setInlineEditId] = useState<number | null>(null);
  const [inlineName, setInlineName] = useState("");

  const [platform, setPlatform] = useState("gmail");
  const [template, setTemplate] = useState("classic");

  const isEditing = editingId !== null;
    const { getUserDetails } = useAuth();
    const userDetails = getUserDetails();
    const userId = userDetails?.recruiter_Id;

  /* ------------------------------ DATA LOAD ------------------------------ */

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/email-signature/73`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setSignatures(data);
        setSelected(data[0]);
      } catch {
        setSignatures(DUMMY_SIGNATURES);
        setSelected(DUMMY_SIGNATURES[0]);
      }
    };
    load();
  }, []);

  /* ------------------------------ FORM LOGIC ----------------------------- */

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    setEditingId(null);
    setDialogOpen(false);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name) e.name = "Name required";
    if (!form.email) e.email = "Email required";
    if (!form.phone) e.phone = "Phone required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };
 const saveSignature = async () => {
  if (!validate()) return;

  const payload = {
    ...form,
    id: isEditing ? editingId! : Date.now(),
    platform,        // include the selected platform
    templateId: template, // include the selected template
    user_id: userId,
  };

  if (isEditing) {
    setSignatures((prev) =>
      prev.map((s) => (s.id === editingId ? payload : s))
    );
    toast.success("Signature updated");
  } else {
    setSignatures((prev) => [...prev, payload]);

    try {
      const data = await apiSaveSignature(payload);
      console.log("save Signature:", data);
      toast.success("Signature created");
    } catch (err) {
      // handle 403 (Pro limitation)
      if (err?.response?.status === 403 || err?.status === 403) {
        toast.error("Upgrade to Pro to save multiple signatures.");
      } else {
        toast.error("Failed to save the signature");
      }
        toast.error("Failed to save the signature");
    }

 
  }

  console.log("Saved Signature:", JSON.stringify(payload, null, 2));
  resetForm();
};
  /* ------------------------------ ACTIONS -------------------------------- */

  const copyHTML = (s: EmailSignature) => {
    navigator.clipboard.writeText(generateHTML(s));
    toast.success("HTML copied");
  };

  const exportHTML = (s: EmailSignature) => {
    const blob = new Blob([generateHTML(s)], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${s.name}_signature.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const removeSignature = (id: number) => {
    setSignatures((prev) => prev.filter((s) => s.id !== id));
    toast.success("Signature deleted");
  };

  /* ---------------------------------------------------------------------- */

  return (
    <Layout>
      <div className="space-y-6">
        {/* HEADER */}
        <Card>
          <CardContent className="flex justify-between p-4">
            <h2 className="font-semibold text-lg">Email Signature Generator</h2>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Signature
            </Button>
          </CardContent>
        </Card>

        {/* TABLE */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {signatures.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>{s.company}</TableCell>
                    <TableCell>{s.email}</TableCell>
                    <TableCell>{s.phone}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button size="icon" onClick={() => {
                        setForm(s);
                        setEditingId(s.id);
                        setDialogOpen(true);
                      }}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="icon" onClick={() => copyHTML(s)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button size="icon" onClick={() => exportHTML(s)}>
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => removeSignature(s.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* CREATE / EDIT */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen} > 
          <DialogContent className="max-w-6xl overflow-hidden filter-none backdrop-filter-none">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit Signature" : "Create Signature"}
              </DialogTitle>
            </DialogHeader>

            <ScrollArea className="h-[70vh] pr-4"  >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <PlatformSelector
                    selectedPlatform={platform}
                    onSelect={setPlatform}
                  />
                  <SignatureForm
                    form={form}
                    setForm={(v) => setForm({ ...form, ...v })}
                    errors={errors}
                  />
                </div>

                <div className="border rounded-md p-4">
                  <TemplateCarousel
                    selectedTemplate={template}
                    onSelect={setTemplate}
                  />
                  <SignaturePreview
                    signature={{
                      ...(form as EmailSignature),
                      id: editingId || 0,
                      templateId: template,
                    }}
                  />
                </div>
              </div>
            </ScrollArea>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button onClick={saveSignature}>
                {isEditing ? "Update" : "Save"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default MailSignaturePage;
