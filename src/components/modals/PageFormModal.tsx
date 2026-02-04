import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import RichEditor from "@/components/RichEditor";
import axios from "axios";
import { toast } from "sonner";

interface PageFormValues {
  title: string;
  slug: string;
  content: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  status:string;
}

interface PageFormModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  fetchPages: () => void;
  editingPage: any | null;
  setEditingPage: (page: any | null) => void;
}

 const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const initialFormValues: PageFormValues = {
  title: "",
  slug: "",
  content: null,
  metaTitle: null,
  metaDescription: null,
  metaKeywords: null,
  ogTitle: null,
  ogDescription: null,
  ogImage: null,
  status:"draft"
};

export default function PageFormModal({
  open,
  setOpen,
  fetchPages,
  editingPage,
  setEditingPage,
}: PageFormModalProps) {
  const [formValues, setFormValues] = useState<PageFormValues>(initialFormValues);
  const [errors, setErrors] = useState<Partial<PageFormValues>>({});

  useEffect(() => {
    if (editingPage) {
      setFormValues({
        title: editingPage.title,
        slug: editingPage.slug,
        content: editingPage.content,
        metaTitle: editingPage.meta_title,
        metaDescription: editingPage.meta_description,
        metaKeywords: editingPage.meta_keywords,
        ogTitle: editingPage.og_title,
        ogDescription: editingPage.og_description,
        ogImage: editingPage.og_image,
        status:editingPage.status
      });
    } else {
      setFormValues(initialFormValues);
    }
  }, [editingPage]);

  const validate = (): boolean => {
    const newErrors: Partial<PageFormValues> = {};

    if (!formValues.title?.trim()) newErrors.title = "Title is required";
    if (!formValues.slug?.trim()) newErrors.slug = "Slug is required";

    if (formValues.metaTitle && formValues.metaTitle.length > 60)
      newErrors.metaTitle = "Meta Title should be under 60 characters";
    if (formValues.metaDescription && formValues.metaDescription.length > 160)
      newErrors.metaDescription = "Meta Description should be under 160 characters";

    if (formValues.ogTitle && formValues.ogTitle.length > 60)
      newErrors.ogTitle = "OG Title should be under 60 characters";
    if (formValues.ogDescription && formValues.ogDescription.length > 160)
      newErrors.ogDescription = "OG Description should be under 160 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (editingPage) {
        await axios.put(`${API_BASE_URL}/pages/${editingPage.id}`, formValues);
        toast.success("Page updated successfully");
      } else {
        await axios.post(`${API_BASE_URL}/pages`, formValues);
        toast.success("Page created successfully");
      }
      fetchPages();
      setOpen(false);
      setEditingPage(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save page");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-5xl w-full rounded-xl p-6 overflow-y-auto max-h-[90vh] overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>{editingPage ? "Edit Page" : "Add Page"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2 w-full">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formValues.title}
              onChange={e => setFormValues({ ...formValues, title: e.target.value })}
            />
            {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
          </div>

          {/* Slug */}
          <div className="space-y-2 w-full">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={formValues.slug}
              onChange={e => setFormValues({ ...formValues, slug: e.target.value })}
            />
            {errors.slug && <p className="text-red-500 text-sm">{errors.slug}</p>}
          </div>

          {/* Content */}
          <div className="space-y-2 w-full">
            <Label htmlFor="content">Content</Label>
            <RichEditor
              initial={formValues.content || ""}
              onSave={value => setFormValues({ ...formValues, content: value })}
              style={{
                width: "100%",
                height: "400px", // increased height
                marginBottom: "5px", // ensures spacing below editor
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Meta Title */}
          <div className="space-y-2 w-full">
            <Label htmlFor="metaTitle">Meta Title</Label>
            <Input
              id="metaTitle"
              value={formValues.metaTitle || ""}
              onChange={e => setFormValues({ ...formValues, metaTitle: e.target.value })}
            />
            {errors.metaTitle && <p className="text-red-500 text-sm">{errors.metaTitle}</p>}
          </div>

          {/* Meta Description */}
          <div className="space-y-2 w-full">
            <Label htmlFor="metaDescription">Meta Description</Label>
            <Textarea
              id="metaDescription"
              value={formValues.metaDescription || ""}
              onChange={e => setFormValues({ ...formValues, metaDescription: e.target.value })}
              rows={2}
            />
            {errors.metaDescription && <p className="text-red-500 text-sm">{errors.metaDescription}</p>}
          </div>

          {/* OG Title */}
          <div className="space-y-2 w-full">
            <Label htmlFor="ogTitle">OG Title</Label>
            <Input
              id="ogTitle"
              value={formValues.ogTitle || ""}
              onChange={e => setFormValues({ ...formValues, ogTitle: e.target.value })}
            />
            {errors.ogTitle && <p className="text-red-500 text-sm">{errors.ogTitle}</p>}
          </div>

          {/* OG Description */}
          <div className="space-y-2 w-full">
            <Label htmlFor="ogDescription">OG Description</Label>
            <Textarea
              id="ogDescription"
              value={formValues.ogDescription || ""}
              onChange={e => setFormValues({ ...formValues, ogDescription: e.target.value })}
              rows={2}
            />
            {errors.ogDescription && <p className="text-red-500 text-sm">{errors.ogDescription}</p>}
          </div>

          {/* OG Image */}
          <div className="space-y-2 w-full">
            <Label htmlFor="ogImage">OG Image URL</Label>
            <Input
              id="ogImage"
              value={formValues.ogImage || ""}
              onChange={e => setFormValues({ ...formValues, ogImage: e.target.value })}
            />
          </div>
          <div className="space-y-2 w-full">
  <Label htmlFor="status">Status</Label>
  <select
    id="status"
    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
    value={formValues.status}
    onChange={(e) =>
      setFormValues({ ...formValues, status: e.target.value })
    }
  >
    <option value="draft">Draft</option>
    <option value="published">Published</option>
  </select>
</div>

          <DialogFooter className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingPage ? "Update Page" : "Create Page"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
