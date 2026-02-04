import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "sonner";
import RichEditor from "@/components/RichEditor";

interface BlogsFormValues {
  content: string;
  title: string;
  author: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

interface BlogsFormModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  fetchPages: () => void;
  editingPage: BlogsFormValues & { id?: number } | null;
  setEditingPage: (page: any | null) => void;
}

 const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const initialFormValues: BlogsFormValues = {
  content: "",
  title: "",
  author: "",
  image_url: "",
  created_at: "",
  updated_at: "",
};

export default function BlogsFormModal({
  open,
  setOpen,
  fetchPages,
  editingPage,
  setEditingPage,
}: BlogsFormModalProps) {
  const [formValues, setFormValues] = useState<BlogsFormValues>(initialFormValues);
  const [errors, setErrors] = useState<Partial<BlogsFormValues>>({});

  useEffect(() => {
    if (editingPage) {
      setFormValues({
        content: editingPage.content,
        title: editingPage.title,
        author: editingPage.author,
        image_url: editingPage.image_url,
        created_at: editingPage.created_at || "",
        updated_at: editingPage.updated_at || "",
      });
    } else {
      setFormValues(initialFormValues);
    }
  }, [editingPage]);

  const validate = (): boolean => {
    const newErrors: Partial<BlogsFormValues> = {};
    if (!formValues.content.trim()) newErrors.content = "Content is required";
    if (!formValues.title.trim()) newErrors.title = "Title is required";
    if (!formValues.author.trim()) newErrors.author = "Author is required";
    if (!formValues.image_url.trim()) newErrors.image_url = "Image URL is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (editingPage && editingPage.id) {
        await axios.put(`${API_BASE_URL}/blogs/${editingPage.id}`, formValues);
        toast.success("Blog updated successfully");
      } else {
        await axios.post(`${API_BASE_URL}/blogs`, formValues);
        toast.success("Blog created successfully");
      }

      fetchPages();
      setOpen(false);
      setEditingPage(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save blog");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-5xl w-full rounded-xl p-6 overflow-y-auto max-h-[90vh] overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>{editingPage ? "Edit Blog" : "Add Blog"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formValues.title}
              onChange={(e) => setFormValues({ ...formValues, title: e.target.value })}
            />
            {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <RichEditor
              initial={formValues.content || ""}
              onSave={(value) => setFormValues({ ...formValues, content: value })}
              style={{ height: "300px", marginBottom: "16px" }}
            />
            {errors.content && <p className="text-red-500 text-sm">{errors.content}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              value={formValues.author}
              onChange={(e) => setFormValues({ ...formValues, author: e.target.value })}
            />
            {errors.author && <p className="text-red-500 text-sm">{errors.author}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Image URL</Label>
            <Input
              id="image_url"
              value={formValues.image_url}
              onChange={(e) => setFormValues({ ...formValues, image_url: e.target.value })}
            />
            {errors.image_url && <p className="text-red-500 text-sm">{errors.image_url}</p>}
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingPage ? "Update Blog" : "Create Blog"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
