import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Layout from "@/components/Layout";
import ReactQuill from "react-quill";
import { CardTitle } from "@/components/ui/card";
import { Trash2, Copy, Plus, Pencil, Check, X, Mail, Phone, Globe, Building2, User, Briefcase, Image as ImageIcon,Download } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import "react-quill/dist/quill.snow.css";
import { Card, CardContent } from "@/components/ui/card";
import SignatureHeader from "@/components/signature/SignatureHeader";
import PlatformSelector from "@/components/signature/PlatformSelector";
import TemplateCarousel from "@/components/signature/TemplateCarousel";
import SignatureForm from "@/components/signature/SignatureForm";
import SignaturePreview from "@/components/signature/SignaturePreview";
import { INITIAL_SIGNATURE ,EmailSignature} from "@/types/signature";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
/* ---------------- TYPES ---------------- */
 
const getImageSrc = (base64?: string) => {
  if (!base64) return "";

  // Already has mime type
  if (base64.startsWith("data:image")) return base64;

  // Default fallback
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
  templateId: "classic", // or "" depending on your app
    socialLinks: {
    facebook: "",
    twitter: "",
    linkedin: "",
    instagram: "",
    youtube: "",
  }, // array of { type: string; url: string } or empty array
};


/* ---------------- COMPONENT ---------------- */
const  MailSignaturePage = () => {
  const [signatures, setSignatures] = useState<EmailSignature[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedSignature, setSelectedSignature] = useState<EmailSignature | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [defaultForNew, setDefaultForNew] = useState<string>("none");
  const [defaultForReply, setDefaultForReply] = useState<string>("none");
  const [editorHTML, setEditorHTML] = useState("");
   const [isEditing, setIsEditing] = useState(false);
   const { getUserDetails } = useAuth();
   const [showPreview, setShowPreview] = useState(false);
   const [editingSignatureId, setEditingSignatureId] = useState<number | null>(null);
    const userId = getUserDetails()?.userId || "";
    const [previewSignature, setPreviewSignature] = useState<EmailSignature | null>(null);
    const [selectedPlatform, setSelectedPlatform] = useState("gmail");
    const handleFormChange = (updated: Partial<EmailSignature>) => {
  setForm((prev) => ({
    ...prev,
    ...updated,
  }));

  if (Object.keys(errors).length > 0) {
    setErrors({});
  }
};
const [selectedTemplate, setSelectedTemplate] = useState("classic");
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
  setEditorHTML("");
  setErrors({});
  setIsEditing(false);
  setEditingSignatureId(null);
  setOpen(false);
};
    console.log(userId,'userId')

  //const [form, setForm] = useState<Omit<EmailSignature, "id">>(INITIAL_FORM);
  const [form, setForm] = useState<Omit<EmailSignature, "id">>(INITIAL_FORM);
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

  // /* ---------------- DUMMY API ---------------- */
  // const fetchSignatures = async () => {
  //   setLoading(true);
  //   setTimeout(() => {
  //      const res = await fetch(`${API_BASE_URL}/email-signature/`, {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify(payload),
  //   });

  //   if (!res.ok) {
  //     throw new Error("Failed to create signature");
  //   }
  //     const initialSignatures = [
  //       {
  //         id: 1,
  //         name: "Rahul Tripathi",
  //         designation: "Senior Developer",
  //         company: "Acme Corp",
  //         phone: "+91 9876543210",
  //         email: "rahul@acme.com",
  //         website: "https://acme.com",
  //         logoUrl: "https://dummyimage.com/80x80/4285f4/fff&text=AC",
  //       },
  //       {
  //         id: 2,
  //         name: "John Doe",
  //         designation: "Product Manager",
  //         company: "Tech Solutions",
  //         phone: "+1 555-123-4567",
  //         email: "john@techsolutions.com",
  //         website: "https://techsolutions.com",
  //         logoUrl: "",
  //       },
  //     ];
  //     setSignatures(initialSignatures);
  //     setSelectedSignature(initialSignatures[0]);
  //     setDefaultForNew("1");
  //     setLoading(false);
  //   }, 600);
  // };

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

const fetchSignatures = async () => {
  setLoading(true);
  try {
    const res = await fetch(`${API_BASE_URL}/email-signature/73`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      throw new Error(`API failed with status ${res.status}`);
    }
    const data = await res.json();

    console.log(data,'fetch data')
    // ✅ Use API data if available
    if (Array.isArray(data) && data.length > 0) {
      setSignatures(data);
      setSelectedSignature(data[0]);
      setDefaultForNew(data[0].id.toString());
      return;
    }

    // ⚠️ API returned empty array → fallback
    throw new Error("Empty API response");
  } catch (error) {
    console.warn("Using dummy signature data due to API failure", error);

    // ✅ Fallback to dummy data
    setSignatures(DUMMY_SIGNATURES);
    setSelectedSignature(DUMMY_SIGNATURES[0]);
    setDefaultForNew(DUMMY_SIGNATURES[0].id.toString());
  } finally {
    setLoading(false);
  }
};

// const createSignature = async () => {
//   if (!validateForm()) return;

//   setTimeout(() => {
//     const newSignature = {
//       id: Date.now(),
//       ...form,
//       customHTML: editorHTML || "",
//     }; 

//      const payload = {
//     ...form,
//     customHTML: editorHTML,
//   };
//       const res = await fetch(API_BASE_URL, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(payload),
//   });
//   return res.json();
 

//     setSignatures((prev) => [...prev, newSignature]);
//     setSelectedSignature(newSignature);

//     toast.success("Signature created");

//     // ✅ FULL RESET
//     setForm(INITIAL_FORM);
//     setEditorHTML("");
//     setErrors({});
//     setOpen(false);
//   }, 300);
// };

const createSignature = async () => {
  if (!validateForm()) return;

  try {
    const payload = {
      ...form,
      user_id: Number(userId),
      customHTML: editorHTML || "",
    };
    const res = await fetch(`${API_BASE_URL}/email-signature`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
     // 🔐 Handle PRO restriction
    if (res.status === 403) {
      toast.error(data.message || "Upgrade to Pro to continue");
      // OPTIONAL: open upgrade modal
      // setShowUpgradeModal(true);
      return;
    }
    if (!res.ok) {
        // Use the message returned by the server if available
      throw new Error(data?.message || "Failed to create signature");
    }

    const savedSignature = await res.json();

    // ✅ Use API response as source of truth
    setSignatures((prev) => [...prev, savedSignature]);
    setSelectedSignature(savedSignature);

    toast.success("Signature created");

    // ✅ FULL RESET
    setForm(INITIAL_FORM);
    setEditorHTML("");
    setErrors({});
    setOpen(false);
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong");
  }
};

const updateSignature = async () => {
  if (!validateForm() || !editingSignatureId) return;

  try {
 const payload = {
  name: form.name,
  designation: form.designation,
  company: form.company,
  phone: form.phone,
  email: form.email,
  website: form.website,
  logo_url: form.logoUrl,
  logo_base64: form.logoBase64,
  custom_html: editorHTML,
};

    const res = await fetch(
      `${API_BASE_URL}/email-signature/${editingSignatureId}`,
      {
        method: "PUT", // or PATCH (based on backend)
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) throw new Error("Update failed");

    const updated = await res.json();

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
    setEditorHTML(s.customHTML || "");
    setOpen(true);
  };

  // const deleteSignature = async (id: number) => {
  //   setTimeout(() => {
  //     setSignatures(prev => {
  //       const updated = prev.filter(s => s.id !== id);
  //       if (selectedSignature?.id === id) {
  //         setSelectedSignature(updated[0] || null);
  //       }
  //       return updated;
  //     });
  //     if (defaultForNew === String(id)) setDefaultForNew("none");
  //     if (defaultForReply === String(id)) setDefaultForReply("none");
  //     toast.success("Signature deleted");
  //   }, 300);
  // };
  const deleteSignature = async (id: number) => {
  try {
    const res = await fetch(`${API_BASE_URL}/email-signature/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Failed to delete signature");
    }

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

  try {
    const res = await fetch(
      `${API_BASE_URL}/signatures/${editingId}/name`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: editingName }),
      }
    );

    if (!res.ok) {
      throw new Error("Failed to rename signature");
    }

    const updatedSignature = await res.json();

    setSignatures((prev) =>
      prev.map((s) =>
        s.id === updatedSignature.id ? updatedSignature : s
      )
    );

    if (selectedSignature?.id === updatedSignature.id) {
      setSelectedSignature(updatedSignature);
    }

    setEditingId(null);
    setEditingName("");
    toast.success("Signature renamed");
  } catch (error) {
    console.error(error);
    toast.error("Unable to rename signature");
  }
};

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName("");
  };
const isProUser = true; // 🔐 fetch from subscription API
    /* --------------------------- DEFAULT TEMPLATE -------------------------- */
//   const templateHTML = (s: EmailSignature, removeBrand = false) => `
// <table cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;font-size:14px;color:#333">
//   <tr>
//     ${
//       s.logoBase64
//         ? `<td style="padding-right:12px;vertical-align:top">
//              <img src="${s.logoBase64}" width="70" style="border-radius:6px"/>
//            </td>`
//         : ""
//     }
//     <td>
//       <strong style="font-size:16px">${s.name}</strong><br/>
//       ${s.designation || ""}<br/>
//       <span style="color:#2563eb">${s.company || ""}</span><br/><br/>
//       📞 ${s.phone}<br/>
//       ✉️ <a href="mailto:${s.email}" style="color:#2563eb">${s.email}</a><br/>
//       ${
//         s.website
//           ? `🌐 <a href="${s.website}" style="color:#2563eb">${s.website}</a>`
//           : ""
//       }
//     </td>
//   </tr>
//   ${
//     !removeBrand
//       ? `<tr>
//            <td colspan="2" style="padding-top:8px;font-size:11px;color:#888">
//              Created with <a href="https://yourbrand.com">YourBrand</a>
//            </td>
//          </tr>`
//       : ""
//   }
// </table>
// `;

const templateHTML = (s: EmailSignature, removeBrand = false) => `
<table cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;font-size:14px;color:#333">
  <tr>
    ${
      s.logoBase64
        ? `<td style="padding-right:12px;vertical-align:top">
           <img 
  src="${getImageSrc(s.logoBase64)}"
  width="70"
  style="border-radius:6px;display:block"
  alt="logo"
/>
           </td>`
        : ""
    }
    <td>
      <strong style="font-size:16px">${s.name}</strong><br/>
      ${s.designation || ""}<br/>
      <span style="color:#2563eb">${s.company || ""}</span><br/><br/>
      📞 ${s.phone}<br/>
      ✉️ <a href="mailto:${s.email}" style="color:#2563eb">${s.email}</a><br/>
      ${
        s.website
          ? `🌐 <a href="${s.website}" style="color:#2563eb">${s.website}</a>`
          : ""
      }
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


  // const generateHTML = (s: EmailSignature) =>
  //   s.customHTML
  //     ? s.customHTML
  //     : templateHTML(s, isProUser);


      const generateHTML = (s: EmailSignature) =>
  s.customHTML ? s.customHTML : templateHTML(s, isProUser);

  const copyHTML = (s: EmailSignature) => {
    navigator.clipboard.writeText(generateHTML(s));
    toast.success("Signature HTML copied to clipboard!");
  };

  useEffect(() => {
    fetchSignatures();
  }, []);

  /* ---------------- UI ---------------- */
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}

          <Card className="border-0 bg-white/60 shadow-sm">
                <CardContent className="flex justify-between p-4">
                  <h2 className="text-lg font-semibold">Email Signature Generator</h2>
                <Button onClick={() =>{ resetForm();  setOpen(true)}}>
      <Plus className="w-4 h-4 mr-2" />
      Add Signature
    </Button>
                </CardContent>
              </Card>
     

 {/* MAIN SIGNATURE EDITOR - Gmail Style */}
 <Card className="border-0 bg-white/60 shadow-sm">
         <CardContent className="p-0"></CardContent>
   <Table>
  {/* <colgroup>
    <col style={{ width: "25%" }} />
    <col style={{ width: "25%" }} />
    <col style={{ width: "25%" }} />
    <col style={{ width: "25%" }} />
  </colgroup> */}

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
          
          {/* NAME (EDITABLE) */}
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
     {/* PREVIEW COLUMN */}
          {/* ACTIONS */}
          <TableCell className="text-right space-x-1">
            {/* <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedSignature(s);
              }}
            >
              <Mail className="w-4 h-4" />
            </Button> */}
            <Button
              size="icon"
              variant="ghost"
              // onClick={(e) => {
              //   e.stopPropagation();
              //   startEditing(s);
              // }}
              onClick={() => openEditModal(s)}
            >
              <Pencil className="w-4 h-4" />
            </Button>

           

            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                copyHTML(s);
              }}
            >
              <Copy className="w-4 h-4" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                exportSignature(s);
              }}
            >
              <Download className="w-4 h-4" />
            </Button>
<Button
  variant="secondary"
  onClick={(e) => {
    e.stopPropagation();
    setPreviewSignature(s);
  }}
>
  Live Preview
</Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                deleteSignature(s.id);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
  </Card>

  

        {/* SIGNATURE DEFAULTS */}
        {/* <div className="border rounded-lg p-5 bg-card space-y-4">
          <h3 className="font-medium text-base">Signature defaults</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                FOR NEW EMAILS USE
              </Label>
              <Select value={defaultForNew} onValueChange={setDefaultForNew}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select signature" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No signature</SelectItem>
                  {signatures.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                ON REPLY/FORWARD USE
              </Label>
              <Select value={defaultForReply} onValueChange={setDefaultForReply}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select signature" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No signature</SelectItem>
                  {signatures.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div> */}

        {/* CREATE DIALOG */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">Create Email Signature</DialogTitle>
            </DialogHeader>
<ScrollArea className="flex-1 pr-4"></ScrollArea>
            <div className="grid gap-6 py-4">
              {/* Personal Info */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className={errors.name ? "border-destructive" : ""}
                    />
                    {errors.name && <p className="text-destructive text-xs">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="designation" className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                      Designation
                    </Label>
                    <Input
                      id="designation"
                      placeholder="Senior Developer"
                      value={form.designation}
                      onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company" className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      Company
                    </Label>
                    <Input
                      id="company"
                      placeholder="Acme Corporation"
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                    />
                  </div>
{/* 
                  <div className="space-y-2">
                    <Label htmlFor="logoUrl" className="flex items-center gap-2">
                      <Image className="w-4 h-4 text-muted-foreground" />
                      Logo URL
                    </Label>
                    <Input
                      id="logoUrl"
                      placeholder="https://example.com/logo.png"
                      value={form.logoUrl}
                      onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                    />
                  </div> */}
                  {/* LOGO UPLOAD */}
              <div className="space-y-2">
                <Label className="flex gap-2 items-center">
                  <ImageIcon className="w-4 h-4" /> Logo Upload
                </Label>
                <Input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/gif"
                  onChange={(e) => handleLogoUpload(e.target.files?.[0])}
                />
                {form.logoBase64 && (
                  <img
                    src={form.logoBase64}
                    className="h-16 rounded border mt-2"
                  />
                )}
              </div>
                </div>
               <div className="space-y-2">
  <Label>Visual Editor (Pro)</Label>

  <div
    className="
      w-[600px]
      [&_.ql-container]:min-h-[120px]
      [&_.ql-editor]:min-h-[120px]
      [&_.ql-editor]:overflow-y-hidden
    "
  >
    <ReactQuill
      theme="snow"
      value={editorHTML}
      onChange={setEditorHTML}
    />
  </div>
</div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@company.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && <p className="text-destructive text-xs">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      Phone *
                    </Label>
                    <Input
                      id="phone"
                      placeholder="+1 234 567 8900"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className={errors.phone ? "border-destructive" : ""}
                    />
                    {errors.phone && <p className="text-destructive text-xs">{errors.phone}</p>}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="website" className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      Website
                    </Label>
                    <Input
                      id="website"
                      placeholder="https://company.com"
                      value={form.website}
                      onChange={(e) => setForm({ ...form, website: e.target.value })}
                      className={errors.website ? "border-destructive" : ""}
                    />
                    {errors.website && <p className="text-destructive text-xs">{errors.website}</p>}
                  </div>
                </div>
              </div>

              {/* Live Preview */}
              {/* {form.name && (
                <div className="space-y-2">
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    Live Preview
                  </h3>
                  <div
                    className="signature-preview"
                    dangerouslySetInnerHTML={{ __html: generateHTML({ id: 0, ...form }) }}
                  />
                </div>
              )} */}
            </div>
            

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              {/* <Button onClick={createSignature}>Save Signature</Button> */}
              <Button onClick={isEditing ? updateSignature : createSignature}>
  {isEditing ? "Update Signature" : "Save Signature"}
</Button>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog
  open={!!previewSignature}
  onOpenChange={() => setPreviewSignature(null)}
>
  {/* <DialogContent className="max-w-3xl">
    <DialogHeader>
      <DialogTitle>Signature Preview</DialogTitle>
    </DialogHeader>

    {previewSignature && (
      <div className="border rounded-md p-4 bg-white overflow-auto max-h-[60vh]">
        <div
          className="signature-preview"
          dangerouslySetInnerHTML={{
            __html: generateHTML(previewSignature),
          }}
        />
      </div>
    )}
  </DialogContent> */}
  <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
  <DialogHeader>
    <DialogTitle className="text-xl">
      {isEditing ? "Edit Email Signature" : "Create Email Signature"}
    </DialogTitle>
  </DialogHeader>

  <div className="h-[80vh] overflow-y-auto">
    <SignatureHeader />

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
                templateId: selectedTemplate,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  </div>

  <div className="flex justify-end gap-3 pt-4 border-t">
    <Button variant="outline" onClick={() => setOpen(false)}>
      Cancel
    </Button>

    <Button onClick={isEditing ? updateSignature : createSignature}>
      {isEditing ? "Update Signature" : "Save Signature"}
    </Button>
  </div>
</DialogContent>

</Dialog>
      </div>
    </Layout>
  );
};

export default  MailSignaturePage;
