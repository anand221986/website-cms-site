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
// import SignatureForm, { type SignatureData } from "@/components/SignatureForm";

import PlatformSelector from "@/components/signature/PlatformSelector";
import TemplateCarousel from "@/components/signature/TemplateCarousel";
import SignatureForm, { type SignatureData } from "@/components/signature/SignatureForm";
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
/*                               HELPER FUNCTIONS                              */
/* -------------------------------------------------------------------------- */
 

// export const generateCustomHTML = (

 export const generateCustomHTML = (
  data: any,
  template: string = "classic"
): string => {
  const name = `${data.firstName || "Your"} ${data.lastName || "Name"}`;
  const job = data.jobTitle || "Job Title";
  const company = data.company || "Company";
  const email = data.email || "email@company.com";
  const phone = data.phone || "(800) 555-0199";
  const mobile = data.mobile || "(800) 555-0299";
  const website = data.website || "www.company.com";
  const address = data.address || "Street, City, Zip Code, Country";

  const textColor = "hsl(220, 20%, 10%)";
  const mutedColor = "hsl(0, 0%, 45%)";
  const accentColor = "hsl(210, 100%, 45%)";
  const elegantAccent = "hsl(280,60%,50%)";

  const initials =
    (data.firstName?.[0] || "J") +
    (data.lastName?.[0] || "D");

  const avatar = data.logoBase64
    ? `<img src="${data.logoBase64}" width="56" height="56" style="display:block;border-radius:50%;" />`
    : `
      <table width="56" height="56" cellpadding="0" cellspacing="0" border="0"
        style="background:${accentColor};border-radius:50%;">
        <tr>
          <td align="center" valign="middle"
            style="color:#ffffff;font-weight:bold;font-size:22px;">
            ${initials}
          </td>
        </tr>
      </table>
    `;

  const wrap = (content: string) => `
  <!DOCTYPE html>
  <html>
  <body style="margin:0;padding:20px;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
    ${content}
  </body>
  </html>
  `;

  /* ================= MODERN ================= */
  if (template === "modern") {
    return wrap(`
      <table align="center" cellpadding="0" cellspacing="0" border="0" style="text-align:center;">
        <tr><td>${avatar}</td></tr>
        <tr>
          <td style="font-weight:bold;font-size:18px;color:${textColor};padding-top:8px;">
            ${name}
          </td>
        </tr>
        <tr>
          <td style="font-size:14px;color:${accentColor};padding:4px 0;">
            ${job} | ${company}
          </td>
        </tr>
        <tr>
          <td style="height:1px;width:60px;background:${accentColor};margin:6px auto;"></td>
        </tr>
        <tr>
          <td style="font-size:12px;color:${mutedColor};padding-top:6px;">
            ${email}<br/>
            ${phone} | ${mobile}<br/>
            ${website}
          </td>
        </tr>
      </table>
    `);
  }

  /* ================= COMPACT ================= */
  if (template === "compact") {
    return wrap(`
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td valign="middle" style="padding-right:10px;">
            ${avatar}
          </td>
          <td valign="middle">
            <div style="font-weight:bold;font-size:14px;color:${textColor};">
              ${name}
            </div>
            <div style="font-size:13px;color:${mutedColor};">
              · ${job} · ${company}
            </div>
            <div style="font-size:12px;color:${mutedColor};padding-top:4px;">
              ${phone} | ${email} | ${website}
            </div>
          </td>
        </tr>
      </table>
    `);
  }

  /* ================= ELEGANT ================= */
  if (template === "elegant") {
    return wrap(`
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td valign="top" style="padding-right:12px;">
            ${avatar}
          </td>
          <td>
            <div style="font-weight:bold;font-size:16px;color:${textColor};">
              ${name}
            </div>
            <div style="font-size:14px;font-style:italic;color:${elegantAccent};">
              ${job}
            </div>
            <div style="font-size:12px;color:${mutedColor};padding-top:4px;">
              ${company} · ${address}<br/>
              ✉ ${email} · ☎ ${phone}<br/>
              <span style="color:${elegantAccent};">${website}</span>
            </div>
          </td>
        </tr>
      </table>
    `);
  }

  /* ================= BOLD ================= */
  if (template === "bold") {
    return wrap(`
      <table cellpadding="0" cellspacing="0" border="0"
        style="background:hsl(210,80%,20%);padding:12px;border-radius:6px;">
        <tr>
          <td valign="top" style="padding-right:12px;">
            ${avatar}
          </td>
          <td>
            <div style="font-weight:bold;color:#ffffff;">
              ${name}
            </div>
            <div style="font-size:14px;color:hsl(0,80%,70%);">
              ${job}
            </div>
            <div style="font-size:12px;color:rgba(255,255,255,0.7);padding-top:4px;">
              ${email} · ${phone}
            </div>
            <div style="font-size:12px;color:hsl(0,80%,70%);">
              ${website}
            </div>
          </td>
        </tr>
      </table>
    `);
  }

  /* ================= CLASSIC (DEFAULT) ================= */
  return wrap(`
    <table cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td valign="top" style="padding-right:12px;">
          ${avatar}
        </td>
        <td valign="top" style="border-left:2px solid ${accentColor};padding-left:12px;">
          <div style="font-weight:bold;font-size:16px;color:${textColor};">
            ${name}
          </div>
          <div style="font-size:14px;color:${accentColor};padding:4px 0;">
            ${job} | ${company}
          </div>
          <div style="font-size:12px;color:${mutedColor};">
            <span style="color:${accentColor};">Phone:</span> ${phone}
            <span style="color:${accentColor};"> Mobile:</span> ${mobile}<br/>
            <span style="color:${accentColor};">Email:</span> ${email}<br/>
            ${company}<br/>
            ${address}<br/>
            <span style="color:${accentColor};">${website}</span>
          </div>
        </td>
      </tr>
    </table>
  `);
};
//   data: any,
//   template: string = "classic"
// ): string => {
//   const name = `${data.name || ""} ${data.lastName || ""}`.trim();
//   const job = data.designation || "";
//   const company = data.company || "";
//   const email = data.email || "";
//   const phone = data.phone || "";
//   const mobile = data.mobile || "";
//   const website = data.website || "";
//   const address = data.address || "";

//   const initials =
//     (data.name?.[0] || "J") + (data.lastName?.[0] || "D");

//   const avatar = data.logoBase64
//     ? `<img src="${data.logoBase64}" width="56" height="56"
//         style="border-radius:50%;object-fit:cover;display:block;" />`
//     : `<div style="
//         width:56px;
//         height:56px;
//         border-radius:50%;
//         background:#0070f3;
//         color:#fff;
//         font-weight:bold;
//         font-size:20px;
//         display:flex;
//         align-items:center;
//         justify-content:center;">
//         ${initials}
//       </div>`;

//   const wrap = (content: string, bg: string = "#ffffff") => `
//   <!DOCTYPE html>
//   <html>
//   <head>
//     <meta charset="UTF-8" />
//   </head>
//   <body style="margin:0;padding:20px;background:${bg};font-family:Arial,sans-serif;">
//     ${content}
//   </body>
//   </html>
//   `;

//   /* ================= CLASSIC ================= */
//   if (template === "classic") {
//     return wrap(`
//       <div style="display:flex;align-items:flex-start;gap:16px;">
//         ${avatar}
//         <div style="border-left:3px solid #0070f3;padding-left:12px;">
//           <div style="font-weight:bold;font-size:16px;color:#000;">
//             ${name}
//           </div>
//           <div style="color:#0070f3;font-size:14px;margin-bottom:6px;">
//             ${job}${company ? " | " + company : ""}
//           </div>
//           ${phone ? `<div style="font-size:12px;">Phone: ${phone}</div>` : ""}
//           ${mobile ? `<div style="font-size:12px;">Mobile: ${mobile}</div>` : ""}
//           ${email ? `<div style="font-size:12px;">Email: <a href="mailto:${email}" style="color:#0070f3;text-decoration:none;">${email}</a></div>` : ""}
//           ${website ? `<div style="font-size:12px;"><a href="${website}" style="color:#0070f3;text-decoration:none;">${website}</a></div>` : ""}
//           ${address ? `<div style="font-size:12px;">${address}</div>` : ""}
//         </div>
//       </div>
//     `);
//   }

//   /* ================= MODERN ================= */
//   if (template === "modern") {
//     return wrap(`
//       <div style="text-align:center;">
//         <div style="margin-bottom:8px;display:flex;justify-content:center;">
//           ${avatar}
//         </div>
//         <div style="font-weight:bold;font-size:16px;">${name}</div>
//         <div style="color:#0070f3;margin:4px 0;">
//           ${job}${company ? " | " + company : ""}
//         </div>
//         ${email ? `<div><a href="mailto:${email}" style="color:#0070f3;text-decoration:none;">${email}</a></div>` : ""}
//         ${phone ? `<div>${phone}${mobile ? " | " + mobile : ""}</div>` : ""}
//         ${website ? `<div><a href="${website}" style="color:#0070f3;text-decoration:none;">${website}</a></div>` : ""}
//       </div>
//     `, "#f9fafb");
//   }

//   /* ================= COMPACT ================= */
//   if (template === "compact") {
//     return wrap(`
//       <div style="display:flex;align-items:center;gap:12px;font-size:13px;">
//         ${avatar}
//         <div>
//           <span style="font-weight:bold;">${name}</span>
//           <span style="color:#666;"> · ${job} · ${company}</span><br/>
//           ${phone ? `${phone} | ` : ""}
//           ${email ? `<a href="mailto:${email}" style="color:#0070f3;text-decoration:none;">${email}</a> | ` : ""}
//           ${website ? `<a href="${website}" style="color:#0070f3;text-decoration:none;">${website}</a>` : ""}
//         </div>
//       </div>
//     `);
//   }

//   /* ================= ELEGANT ================= */
//   if (template === "elegant") {
//     return wrap(`
//       <div style="display:flex;align-items:flex-start;gap:16px;font-family:Georgia,serif;">
//         ${avatar}
//         <div style="display:flex;flex-direction:column;gap:4px;">
//           <div style="font-weight:bold;font-size:16px;">
//             ${name}
//           </div>
//           <div style="font-size:14px;font-style:italic;color:#8e44ad;">
//             ${job}
//           </div>
//           <div style="font-size:12px;color:#555;">
//             ${company}${address ? " · " + address : ""}
//           </div>
//           <div style="font-size:12px;color:#555;">
//             ${email ? `✉ <a href="mailto:${email}" style="color:#8e44ad;text-decoration:none;">${email}</a>` : ""}
//             ${phone ? ` · ☎ ${phone}` : ""}
//           </div>
//           ${website ? `<div style="font-size:12px;"><a href="${website}" style="color:#8e44ad;text-decoration:none;">${website}</a></div>` : ""}
//         </div>
//       </div>
//     `);
//   }

//   /* ================= BOLD ================= */
//   if (template === "bold") {
//     return wrap(`
//       <div style="display:flex;align-items:center;gap:16px;
//         background:#0d3b66;padding:12px;border-radius:6px;color:#fff;">
//         ${avatar}
//         <div>
//           <div style="font-weight:bold;font-size:16px;">
//             ${name}
//           </div>
//           <div style="color:#ff6b6b;margin:4px 0;">
//             ${job}
//           </div>
//           <div style="font-size:12px;">
//             ${email ? `<div>${email}</div>` : ""}
//             ${phone ? `<div>${phone}</div>` : ""}
//             ${website ? `<div style="color:#ff6b6b;">${website}</div>` : ""}
//           </div>
//         </div>
//       </div>
//     `, "#ffffff");
//   }

//   return "";
// };
/* -------------------------------------------------------------------------- */
/*                              MAIN COMPONENT                                */
/* -------------------------------------------------------------------------- */
const defaultData: SignatureData = {
  firstName: "John",
  lastName: "Doe",
  jobTitle: "Sales & Marketing Director",
  email: "john.doe@my-company.com",
  phone: "(800) 555-0199",
  mobile: "(800) 555-0299",
  company: "My Company",
  website: "www.my-company.com",
  address: "Street, City, Zip Code, Country",
  logoBase64:""
};
const MailSignaturePage = () => {
  const [signatures, setSignatures] = useState<EmailSignature[]>([]);
  const [selected, setSelected] = useState<EmailSignature | null>(null);

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [platform, setPlatform] = useState("gmail");
  // const [template, setTemplate] = useState("classic");
  const [data, setData] = useState<SignatureData>(defaultData);
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
      custom_html: generateCustomHTML(cleanForm),
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
    // navigator.clipboard.writeText(s.customHTML || "");
    navigator.clipboard.writeText((s as any).custom_html || "");
    toast.success("HTML copied");
  };

  const exportHTML = (s: EmailSignature) => {
    // const blob = new Blob([s.customHTML || ""], { type: "text/html" });
    const blob = new Blob([(s as any).custom_html || ""], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${s.name}_signature.html`;
    a.click();
    URL.revokeObjectURL(url);
  };
const removeSignature = async (id: number) => {
  try {
    const response = await fetch(`http://localhost:3002/email-signature/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete signature");
    }

    // Remove from local state
    setSignatures((prev) => prev.filter((s) => s.id !== id));
    toast.success("Signature deleted successfully");
  } catch (error) {
    console.error(error);
    toast.error("Error deleting signature");
  }
};

  /* ---------------------------------------------------------------------- */

  return (
    <Layout>
      <div className="space-y-6">
        {/* HEADER */}
        <Card>
          <CardContent className="flex justify-between p-4">
            <h2 className="font-semibold text-lg">Email Signature Generator</h2>
      <Button
  size="sm"                 // small button
  className="px-3 py-1.5"   // optional: adjust padding
  onClick={() => {
    resetForm();
    setDialogOpen(true);
  }}
>
  <Plus className="w-3 h-3 mr-2" /> Add Signature
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
                        size="icon-sm"
                        className="p-1"
                        onClick={() => {
                           setForm({
    ...s,
    logoBase64: s.logoBase64 || "", // make sure base64 exists
    socialLinks: s.socialLinks || { facebook: "", twitter: "", linkedin: "", instagram: "", youtube: "" }
  });
                          setEditingId(s.id);
                          setDialogOpen(true);
                        }}
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button size="icon-sm" className="p-1" onClick={() => copyHTML(s)}>
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button className="p-1" size="icon-sm" onClick={() => exportHTML(s)}>
                        <Download className="w-3 h-3" />
                      </Button>
                      <Button
                        size="icon-sm"
                         className="p-0.5"
                        variant="destructive"
                        onClick={() => removeSignature(s.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                      <Button
                       size="icon-sm"
                         className="p-0.5"
  // onClick={() => pushToGmail(signatureId)}
  // className="bg-green-600 hover:bg-green-700 text-white"
>
  Push to Gmail
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
                    selected={form.templateId}
                    onSelect={(id) =>
                      setForm((prev) => ({ ...prev, templateId: id }))
                    }
                    logoBase64={form.logoBase64}  // pass logoBase64
                  />
                  {/* <SignaturePreview
                    signature={{
                      ...(form as EmailSignature),
                      id: editingId ?? 0,
                    }}
                  /> */}
                  {/* <SignaturePreview data={data} template={template} /> */}
                  <SignaturePreview
  data={{
    firstName: form.name || "",
    lastName: form.lastName || "",
    jobTitle: form.designation || "",
    email: form.email || "",
    phone: form.phone || "",
    mobile: form.mobile || "",
    company: form.company || "",
    website: form.website || "",
    address: form.address || "",
    logoBase64:form.logoBase64 || "",
  }}
  template={form.templateId || "classic"}
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