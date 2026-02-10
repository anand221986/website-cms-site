import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
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
import { Trash2, Copy, Plus, Pencil, Download } from "lucide-react";
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

/* -------------------------------------------------------------------------- */
/*                              MAIN COMPONENT                                */
/* -------------------------------------------------------------------------- */

const MailSignaturePage = () => {
  const [signatures, setSignatures] = useState<EmailSignature[]>([]);
  const [selected, setSelected] = useState<EmailSignature | null>(null);

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [platform, setPlatform] = useState("gmail");

  const isEditing = editingId !== null;

  const { getUserDetails } = useAuth();
  const userId = getUserDetails()?.userId;

  /* ------------------------------ LOAD DATA ------------------------------ */

  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/email-signature/${userId}`);
        if (!res.ok) throw new Error();

        const data: EmailSignature[] = await res.json();
        setSignatures(data);
        setSelected(data[0] || null);
      } catch {
        setSignatures([]);
      }
    };

    load();
  }, [userId]);

  /* ------------------------------ HELPERS -------------------------------- */

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

  /* ------------------------------ SAVE ----------------------------------- */

  const saveSignature = async () => {
    if (!validate()) return;
    if (!userId) return toast.error("User not authenticated");

    try {
      const {
      id,
      created_at,
      updated_at,
      status,
      message,
      result,
      ...cleanForm
    } = form as any;
      const payload = {
      ...cleanForm,
      platform,
      user_id: userId,
      id: editingId ?? undefined, // only for update
    };

      // ✅ backend must return saved record
    const response = await apiSaveSignature(payload);
const saved: EmailSignature = response.result;
setSignatures((prev) =>
  isEditing
    ? prev.map((s) => (s.id === saved.id ? saved : s))
    : [saved, ...prev]
);

setSelected(saved)
      toast.success(isEditing ? "Signature updated" : "Signature created");
      resetForm();
    } catch (err: any) {
       const status =
      err?.response?.status || err?.status;

    const message =
      err?.response?.data?.message || "Failed to save signature";

    if (status === 403) {
      toast.error(message); // ✅ backend message
      return;
    }

    toast.error(message);
    }
  };

  /* ------------------------------ ACTIONS -------------------------------- */

  const copyHTML = (s: EmailSignature) => {
    navigator.clipboard.writeText(s.customHTML || "");
    toast.success("HTML copied");
  };

  const exportHTML = (s: EmailSignature) => {
    const blob = new Blob([s.customHTML || ""], { type: "text/html" });
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
              <Plus className="w-4 h-4 mr-2" /> Add Signature
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
                      <Button
                        size="icon"
                        onClick={() => {
                          setForm(s);
                          setEditingId(s.id);
                          setDialogOpen(true);
                        }}
                      >
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

        {/* DIALOG */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-6xl">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit Signature" : "Create Signature"}
              </DialogTitle>
            </DialogHeader>

            <ScrollArea className="h-[70vh] pr-4">
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
                    selectedTemplate={form.templateId}
                    onSelect={(id) =>
                      setForm((prev) => ({ ...prev, templateId: id }))
                    }
                  />
                  <SignaturePreview
                    signature={{
                      ...(form as EmailSignature),
                      id: editingId ?? 0,
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