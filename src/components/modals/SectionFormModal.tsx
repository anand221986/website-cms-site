import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { SECTION_FORM_CONFIG } from "@/lib/sectionFormConfig";
import { renderDynamicFields } from "@/lib/renderDynamicFields";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function SectionFormModal({
  open,
  setOpen,
  pageId,
  editingSection,
  refresh,
}: any) {
  const [form, setForm] = useState<{
    section_key: string;
    title: string;
    sub_title: string;
    sort_order: number;
    is_active: boolean;
    meta: Record<string, any>;
  }>({
    section_key: "",
    title: "",
    sub_title: "",
    sort_order: 0,
    is_active: true,
    meta: {},
  });

  const [metaText, setMetaText] = useState("");

  useEffect(() => {
    if (!open) return;

    if (editingSection) {
      setForm({
        section_key: editingSection.section_key,
        title: editingSection.title ?? "",
        sub_title: editingSection.sub_title ?? "",
        sort_order: editingSection.sort_order ?? 0,
        is_active: editingSection.is_active ?? true,
        // 
        meta: {
        ...editingSection.meta,
        // ✅ move image into meta
        image: editingSection.image
          ? `${API_BASE_URL}/uploads/sections/${editingSection.image}`
          : null,
           images: Array.isArray(editingSection.images)
          ? editingSection.images.map(
              (img: string) =>
                `${API_BASE_URL}/uploads/sections/${img}`
            )
          : [],
      
      },
      
      });

      setMetaText(
        editingSection.meta
          ? JSON.stringify(editingSection.meta, null, 2)
          : ""
      );
    } else {
      setForm({
        section_key: "",
        title: "",
        sub_title: "",
        sort_order: 0,
        is_active: true,
        meta: {},
      });
      setMetaText("");
    }
  }, [open, editingSection]);

  // const handleSubmit = async () => {
  //   try {
  //     let parsedMetaFromJSON = {};

  //     if (metaText.trim()) {
  //       try {
  //         parsedMetaFromJSON = JSON.parse(metaText);
  //       } catch {
  //         toast.error("Invalid JSON in Meta field");
  //         return;
  //       }
  //     }

  //     // ✅ structured fields override JSON (correct behavior)
  //     const finalMeta = {
  //       ...parsedMetaFromJSON,
  //       ...form.meta,
  //     };

  //     const payload = {
  //       ...form,
  //       meta: finalMeta,
  //     };

  //     if (editingSection) {
  //       await axios.put(
  //         `${API_BASE_URL}/pages/${pageId}/sections/${editingSection.id}`,
  //         payload
  //       );
  //       toast.success("Section updated");
  //     } else {
  //       await axios.post(
  //         `${API_BASE_URL}/pages/${pageId}/sections`,
  //         payload
  //       );
  //       toast.success("Section created");
  //     }

  //     setOpen(false);
  //     refresh();
  //   } catch (error) {
  //     toast.error("Save failed");
  //   }
  // };

  const validateForm = (): string | null => {
  if (!form.section_key) return "Section Key is required";
  if (!form.title.trim()) return "Title is required";
  if (form.sort_order < 0) return "Sort Order must be 0 or greater";
  if (typeof form.is_active !== "boolean") return "Active must be true or false";

  // Optional: validate meta keys if needed
 for (const [key, value] of Object.entries(form.meta)) {
    // ✅ allow existing image URL
    if (key === "image" && typeof value === "string" && value.length > 0) {
      continue;
    }

    // ✅ allow images array with existing URLs
    if (
      key === "images" &&
      Array.isArray(value) &&
      value.length > 0
    ) {
      continue;
    }
  }

  return null; // all good
};
//   const handleSubmit = async () => {
//   try {
//      const validationError = validateForm();
//     if (validationError) {
//       toast.error(validationError);
//       return;
//     }
//     let parsedMetaFromJSON: Record<string, any> = {};

//     // ─────────────────────────────
//     // 1️⃣ Parse JSON Meta (manual editor)
//     // ─────────────────────────────
//     if (metaText.trim()) {
//       try {
//         parsedMetaFromJSON = JSON.parse(metaText);
//       } catch {
//         toast.error("Invalid JSON in Meta field");
//         return;
//       }
//     }

//     // ─────────────────────────────
//     // 2️⃣ Structured meta overrides JSON
//     // ─────────────────────────────
//     const finalMeta = {
//       ...parsedMetaFromJSON,
//       ...form.meta, // includes content + image
//     };

//     // ─────────────────────────────
//     // 3️⃣ Build FormData
//     // ─────────────────────────────
//     const formData = new FormData();

//     // normal fields
//     Object.entries(form).forEach(([key, value]) => {
//       if (key !== "meta" && value !== undefined && value !== null) {
//         formData.append(key, String(value));
//       }
//     });

//     // meta handling
//     const metaWithoutFiles: Record<string, any> = {};

//     Object.entries(finalMeta).forEach(([key, value]) => {
//       if (value instanceof File) {
//         // 🖼️ image inside meta
//         formData.append(key, value);
//       } else {
//         // 📝 content / text / html
//         metaWithoutFiles[key] = value;
//       }
//     });

//     // attach meta JSON (without files)
//     formData.append("meta", JSON.stringify(metaWithoutFiles));

//     // ─────────────────────────────
//     // 4️⃣ API Call
//     // ─────────────────────────────
//     if (editingSection) {
//       await axios.put(
//         `${API_BASE_URL}/pages/${pageId}/sections/${editingSection.id}`,
//         formData,
//         { headers: { "Content-Type": "multipart/form-data" } }
//       );
//       toast.success("Section updated");
//     } else {
//       await axios.post(
//         `${API_BASE_URL}/pages/${pageId}/sections`,
//         formData,
//         { headers: { "Content-Type": "multipart/form-data" } }
//       );
//       toast.success("Section created");
//     }

//     setOpen(false);
//     refresh();
//   } catch (error) {
//     console.error(error);
//     toast.error("Save failed");
//   }
// };


// const handleSubmit = async () => {
//   try {
//     const validationError = validateForm();
//     if (validationError) {
//       toast.error(validationError);
//       return;
//     }

//     let parsedMetaFromJSON = {};

//     if (metaText.trim()) {
//       try {
//         parsedMetaFromJSON = JSON.parse(metaText);
//       } catch {
//         toast.error("Invalid JSON in Meta field");
//         return;
//       }
//     }

//     // structured fields override JSON
//     const finalMeta = {
//       ...parsedMetaFromJSON,
//       ...form.meta,
//     };

//     const formData = new FormData();

//     formData.append("section_key", form.section_key);
//     formData.append("title", form.title);
//     formData.append("sub_title", form.sub_title);
//     formData.append("sort_order", String(form.sort_order));
//     formData.append("is_active", String(form.is_active));

//     // ✅ meta ALWAYS JSON (images already uploaded)
//     formData.append("meta", JSON.stringify(finalMeta));

//     if (editingSection) {
//       await axios.put(
//         `${API_BASE_URL}/pages/${pageId}/sections/${editingSection.id}`,
//         formData
//       );
//       toast.success("Section updated");
//     } else {
//       await axios.post(
//         `${API_BASE_URL}/pages/${pageId}/sections`,
//         formData
//       );
//       toast.success("Section created");
//     }

//     setOpen(false);
//     refresh();
//   } catch (err) {
//     console.error(err);
//     toast.error("Save failed");
//   }
// };

// const handleSubmit = async () => {
//   try {
//     const validationError = validateForm();
//     if (validationError) {
//       toast.error(validationError);
//       return;
//     }

//     const formData = new FormData();

//     // normal fields
//     formData.append("section_key", form.section_key);
//     formData.append("title", form.title);
//     formData.append("sub_title", form.sub_title);
//     formData.append("sort_order", String(form.sort_order));
//     formData.append("is_active", String(form.is_active));

//     const metaWithoutFiles: Record<string, any> = {};
//     const filesMap: Record<string, File[]> = {};

//     Object.entries(form.meta).forEach(([key, value]) => {
//       // if (Array.isArray(value) && value[0] instanceof File) {
//       //   filesMap[key] = value;
//       // } else {
//       //   metaWithoutFiles[key] = value;
//       // }
//       if (value instanceof File) {
//   filesMap[key] = [value]; // normalize to array
// } 
// else if (Array.isArray(value) && value[0] instanceof File) {
//   filesMap[key] = value;
// } 
// else {
//   metaWithoutFiles[key] = value;
// }
//     });

//     // attach files separately
//     Object.entries(filesMap).forEach(([key, files]) => {
//       files.forEach(file => {
//         formData.append(`${key}[]`, file);
//       });
//     });

//     // attach meta JSON (NO FILES)
//     formData.append("meta", JSON.stringify(metaWithoutFiles));

//     if (editingSection) {
//       await axios.put(
//         `${API_BASE_URL}/pages/${pageId}/sections/${editingSection.id}`,
//         formData,
//         { headers: { "Content-Type": "multipart/form-data" } }
//       );
//       toast.success("Section updated");
//     } else {
//       await axios.post(
//         `${API_BASE_URL}/pages/${pageId}/sections`,
//         formData,
//         { headers: { "Content-Type": "multipart/form-data" } }
//       );
//       toast.success("Section created");
//     }

//     setOpen(false);
//     refresh();
//   } catch (err) {
//     console.error(err);
//     toast.error("Save failed");
//   }
// };

const handleSubmit = async () => {
  try {
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const formData = new FormData();

    // Normal fields
    formData.append("section_key", form.section_key);
    formData.append("title", form.title);
    formData.append("sub_title", form.sub_title);
    formData.append("sort_order", String(form.sort_order));
    formData.append("is_active", String(form.is_active));

    const metaWithoutFiles: Record<string, any> = {};
    const filesMap: Record<string, File[]> = {};

    // Separate files from non-file meta
    Object.entries(form.meta).forEach(([key, value]) => {
      if (value instanceof File) {
        filesMap[key] = [value]; // normalize single file to array
      } else if (Array.isArray(value) && value[0] instanceof File) {
        filesMap[key] = value;
      } else {
        metaWithoutFiles[key] = value;
      }
    });

    // Attach files correctly
    Object.entries(filesMap).forEach(([key, files]) => {
      if (files.length === 1) {
        // Single file → key
        formData.append(key, files[0]);
      } else {
        // Multiple files → key[]
        files.forEach(file => { formData.append(key, file);});
      }
    });

    // Attach remaining meta as JSON
    formData.append("meta", JSON.stringify(metaWithoutFiles));

    // API call
    if (editingSection) {
      await axios.put(
        `${API_BASE_URL}/pages/${pageId}/sections/${editingSection.id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      toast.success("Section updated");
    } else {
      await axios.post(
        `${API_BASE_URL}/pages/${pageId}/sections`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      toast.success("Section created");
    }

    setOpen(false);
    refresh();
  } catch (err) {
    console.error(err);
    toast.error("Save failed");
  }
};




  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-5xl w-full rounded-xl p-6 overflow-y-auto max-h-[90vh] overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>
            {editingSection ? "Edit Section" : "Add Section"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Section Key */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Section Key</label>
            <Select
              value={form.section_key}
              onValueChange={value =>
                setForm(prev => ({
                  ...prev,
                  section_key: value,
                  
     meta: value === "slider"
        ? {
            ...prev.meta,
            cta: Array.isArray(prev.meta?.cta) ? prev.meta.cta : [], // ✅
          }
        : prev.meta,
    }))
              }
              disabled={!!editingSection}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select section key" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SECTION_FORM_CONFIG).map(([key, val]) => (
                  <SelectItem key={key} value={key}>
                    {val.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Input
            placeholder="Title"
            value={form.title}
            onChange={e =>
              setForm(prev => ({ ...prev, title: e.target.value }))
            }
          />
               <Input
            placeholder="Sub Title"
            value={form.sub_title}
            onChange={e =>
              setForm(prev => ({ ...prev, sub_title: e.target.value }))
            }
          />
                 {/* Dynamic Meta */}
          {form.section_key && (
            <div className="space-y-2">
              <label className="font-medium">Section Meta</label>
              {renderDynamicFields(
                form.meta,
                (key, value) =>
                  
                  setForm(prev => ({
                    ...prev,
                    meta: { ...prev.meta, [key]: value },
                  })),
                form.section_key,
                SECTION_FORM_CONFIG
              )}
            </div>
          )}
          <Input
            type="number"
            placeholder="Sort Order"
            value={form.sort_order}
            onChange={e =>
              setForm(prev => ({
                ...prev,
                sort_order: Number(e.target.value),
              }))
            }
          />
          

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium">Active</p>
              <p className="text-sm text-muted-foreground">
                Show or hide this section on the page
              </p>
            </div>
            <Switch
              checked={form.is_active}
              onCheckedChange={value =>
                setForm(prev => ({ ...prev, is_active: value }))
              }
            />
          </div>

   

          {/* Advanced JSON */}
          {/* <div>
            <label className="font-medium">Advanced Meta (JSON)</label>
            <Textarea
              rows={6}
              value={metaText}
              onChange={e => setMetaText(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Advanced users can edit raw JSON here. Structured fields override
              JSON on save.
            </p>
          </div> */}

          <Button onClick={handleSubmit} className="w-full">
            Save Section
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
