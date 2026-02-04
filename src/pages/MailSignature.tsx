import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Layout from "@/components/Layout";
import { Trash2, Copy, Plus, Pencil, Check, X, Mail, Phone, Globe, Building2, User, Briefcase, Image as ImageIcon, Download } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import SignatureHeader from "@/components/signature/SignatureHeader";
import PlatformSelector from "@/components/signature/PlatformSelector";
import TemplateCarousel from "@/components/signature/TemplateCarousel";
import SignatureForm from "@/components/signature/SignatureForm";
import SignaturePreview from "@/components/signature/SignaturePreview";
import { INITIAL_SIGNATURE, EmailSignature } from "@/types/signature";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const getImageSrc = (base64?: string) => {
  if (!base64) return "";
  if (base64.startsWith("data:image")) return base64;
  return `data:image/jpeg;base64,${base64}`;
};

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
    logoUrl: "https://dummyimage.com/80x80/4285f4/fff&text=AC",
    logoBase64: "",
    customHTML: "",
    templateId: "classic",
    socialLinks: { facebook: "", twitter: "", linkedin: "", instagram: "", youtube: "" },
  },
  {
    id: 2,
    name: "John",
    lastName: "Doe",
    designation: "Product Manager",
    company: "Tech Solutions",
    phone: "+1 555-123-4567",
    mobile: "+1 555-123-4567",
    email: "john@techsolutions.com",
    website: "https://techsolutions.com",
    address: "456 Another St",
    logoUrl: "",
    logoBase64: "",
    customHTML: "",
    templateId: "classic",
    socialLinks: { facebook: "", twitter: "", linkedin: "", instagram: "", youtube: "" },
  },
];

const MailSignaturePage = () => {
  const [signatures, setSignatures] = useState<EmailSignature[]>([]);
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedSignature, setSelectedSignature] = useState<EmailSignature | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [defaultForNew, setDefaultForNew] = useState<string>("none");
  const [defaultForReply, setDefaultForReply] = useState<string>("none");
  const [isEditing, setIsEditing] = useState(false);
  const { getUserDetails } = useAuth();
  const [editingSignatureId, setEditingSignatureId] = useState<number | null>(null);
  const userId = getUserDetails()?.userId || "";
  const [previewSignature, setPreviewSignature] = useState<EmailSignature | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState("gmail");
  const [selectedTemplate, setSelectedTemplate] = useState("classic");
  const [form, setForm] = useState<Omit<EmailSignature, "id">>(INITIAL_FORM);

  const handleFormChange = (updated: Partial<EmailSignature>) => {
    setForm((prev) => ({
      ...prev,
      ...updated,
    }));
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
  };

  const exportSignature = (s: EmailSignature) => {
    const html = generateHTML(s);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${s.name.replace(/\s+/g, "_")}_signature.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Signature exported");
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    setIsEditing(false);
    setEditingSignatureId(null);
    setCreateDialogOpen(false);
  };

  const handleLogoUpload = (file?: File) => {
    if (!file) return;
    if (!file.type.match(/image\/(png|jpeg|jpg|gif)/)) {
      toast.error("Only PNG, JPG, JPEG, GIF allowed");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm({ ...form, logoBase64: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Invalid email address";
    }
    if (!form.phone.trim()) {
      newErrors.phone = "Phone is required";
    } else if (form.phone.length < 10) {
      newErrors.phone = "Phone number must be at least 10 digits";
    }
    if (form.website && !/^https?:\/\//.test(form.website)) {
      newErrors.website = "Website must start with http:// or https://";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchSignatures = async () => {
    setLoading(true);
    try {
      if (!API_BASE_URL) throw new Error("No API URL");
      const res = await fetch(`${API_BASE_URL}/email-signature/73`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error(`API failed with status ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setSignatures(data);
        setSelectedSignature(data[0]);
        setDefaultForNew(data[0].id.toString());
        return;
      }
      throw new Error("Empty API response");
    } catch (error) {
      console.warn("Using dummy signature data due to API failure", error);
      setSignatures(DUMMY_SIGNATURES);
      setSelectedSignature(DUMMY_SIGNATURES[0]);
      setDefaultForNew(DUMMY_SIGNATURES[0].id.toString());
    } finally {
      setLoading(false);
    }
  };

  const createSignature = async () => {
    if (!validateForm()) return;
    try {
      const newSignature: EmailSignature = {
        id: Date.now(),
        ...form,
      };
      setSignatures((prev) => [...prev, newSignature]);
      setSelectedSignature(newSignature);
      toast.success("Signature created");
      resetForm();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  const updateSignature = async () => {
    if (!validateForm() || !editingSignatureId) return;
    try {
      const updated: EmailSignature = {
        id: editingSignatureId,
        ...form,
      };
      setSignatures((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s))
      );
      setSelectedSignature(updated);
      toast.success("Signature updated");
      resetForm();
    } catch (err) {
      toast.error("Unable to update signature");
    }
  };

  const openEditModal = (s: EmailSignature) => {
    setIsEditing(true);
    setEditingSignatureId(s.id);
    setForm(s);
    setSelectedTemplate(s.templateId || "classic");
    setCreateDialogOpen(true);
  };

  const openPreviewModal = (s: EmailSignature) => {
    setPreviewSignature(s);
    setPreviewDialogOpen(true);
  };

  const deleteSignature = async (id: number) => {
    try {
      setSignatures((prev) => {
        const updated = prev.filter((s) => s.id !== id);
        if (selectedSignature?.id === id) {
          setSelectedSignature(updated[0] || null);
        }
        return updated;
      });
      if (defaultForNew === String(id)) setDefaultForNew("none");
      if (defaultForReply === String(id)) setDefaultForReply("none");
      toast.success("Signature deleted");
    } catch (error) {
      console.error(error);
      toast.error("Unable to delete signature");
    }
  };

  const startEditing = (signature: EmailSignature) => {
    setEditingId(signature.id);
    setEditingName(signature.name);
  };

  const saveEditing = async () => {
    if (!editingName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    setSignatures((prev) =>
      prev.map((s) =>
        s.id === editingId ? { ...s, name: editingName } : s
      )
    );
    if (selectedSignature?.id === editingId) {
      setSelectedSignature({ ...selectedSignature, name: editingName });
    }
    setEditingId(null);
    setEditingName("");
    toast.success("Signature renamed");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName("");
  };

  const isProUser = true;

  const templateHTML = (s: EmailSignature, removeBrand = false) => `
<table cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;font-size:14px;color:#333">
  <tr>
    ${
      s.logoBase64
        ? `<td style="padding-right:12px;vertical-align:top">
           <img src="${getImageSrc(s.logoBase64)}" width="70" style="border-radius:6px;display:block" alt="logo"/>
           </td>`
        : ""
    }
    <td style="border-left:3px solid #2563eb;padding-left:12px">
      <strong style="font-size:16px">${s.name}${s.lastName ? ` ${s.lastName}` : ""}</strong><br/>
      ${s.designation || ""}<br/>
      <span style="color:#2563eb">${s.company || ""}</span><br/><br/>
      📞 ${s.phone}<br/>
      ✉️ <a href="mailto:${s.email}" style="color:#2563eb">${s.email}</a><br/>
      ${s.website ? `🌐 <a href="${s.website}" style="color:#2563eb">${s.website}</a>` : ""}
    </td>
  </tr>
  ${
    !removeBrand
      ? `<tr>
           <td colspan="2" style="padding-top:8px;font-size:11px;color:#888">
             Created with <a href="https://yourbrand.com">YourBrand</a>
           </td>
         </tr>`
      : ""
  }
</table>
`;

  const generateHTML = (s: EmailSignature) =>
    s.customHTML ? s.customHTML : templateHTML(s, isProUser);

  const copyHTML = (s: EmailSignature) => {
    navigator.clipboard.writeText(generateHTML(s));
    toast.success("Signature HTML copied to clipboard!");
  };

  useEffect(() => {
    fetchSignatures();
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <Card className="border-0 bg-white/60 shadow-sm">
          <CardContent className="flex justify-between p-4">
            <h2 className="text-lg font-semibold">Email Signature Generator</h2>
            <Button onClick={() => { resetForm(); setCreateDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Signature
            </Button>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-0 bg-white/60 shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Mobile No</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {signatures.map((s) => (
                  <TableRow
                    key={s.id}
                    className={selectedSignature?.id === s.id ? "bg-muted/40" : ""}
                    onClick={() => setSelectedSignature(s)}
                  >
                    <TableCell>
                      {editingId === s.id ? (
                        <div className="flex gap-1">
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="h-7"
                            autoFocus
                          />
                          <Button size="icon" variant="ghost" onClick={saveEditing}>
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={cancelEditing}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="font-medium">{s.name}</span>
                      )}
                    </TableCell>
                    <TableCell>{s.company || "—"}</TableCell>
                    <TableCell>{s.email}</TableCell>
                    <TableCell>{s.phone}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button size="icon" variant="ghost" onClick={() => openEditModal(s)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); copyHTML(s); }}>
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); exportSignature(s); }}>
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="secondary" onClick={(e) => { e.stopPropagation(); openPreviewModal(s); }}>
                        Live Preview
                      </Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={(e) => { e.stopPropagation(); deleteSignature(s.id); }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* CREATE/EDIT DIALOG */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className=" text-foreground max-w-6xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {isEditing ? "Edit Email Signature" : "Create Email Signature"}
              </DialogTitle>
            </DialogHeader>

            <ScrollArea className="h-[70vh] pr-4">
              <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* LEFT SIDE */}
                  <div className="space-y-6">
                    <PlatformSelector
                      selectedPlatform={selectedPlatform}
                      onSelect={setSelectedPlatform}
                    />
                    <SignatureForm
                      form={form}
                      setForm={handleFormChange}
                      errors={errors}
                      onLogoUpload={handleLogoUpload}
                    />
                  </div>

                  {/* RIGHT SIDE */}
                  <div className="space-y-6">
                    <TemplateCarousel
                      selectedTemplate={selectedTemplate}
                      onSelect={setSelectedTemplate}
                    />
                    <div className="sticky top-4 rounded-md border bg-white p-4">
                      <SignaturePreview
                        signature={{
                          ...(form as EmailSignature),
                          id: editingSignatureId || 0,
                          templateId: selectedTemplate,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={isEditing ? updateSignature : createSignature}>
                {isEditing ? "Update Signature" : "Save Signature"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* PREVIEW DIALOG - Simple preview only */}
        <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Signature Preview</DialogTitle>
            </DialogHeader>
            {previewSignature && (
              <div className="border rounded-md p-6 bg-white overflow-auto max-h-[60vh]">
                <div
                  className="signature-preview"
                  dangerouslySetInnerHTML={{
                    __html: generateHTML(previewSignature),
                  }}
                />
              </div>
            )}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>
                Close
              </Button>
              <Button onClick={() => previewSignature && copyHTML(previewSignature)}>
                <Copy className="w-4 h-4 mr-2" />
                Copy HTML
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default MailSignaturePage;
