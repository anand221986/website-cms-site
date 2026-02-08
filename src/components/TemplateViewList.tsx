import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Edit, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AddTemplateDialog from "@/components/AddTemplateDialog";

interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  body: string;
  created_at: string;
}
interface TemplateViewListProps {
  loading: boolean;
  pages: any[];
  fetchPages: () => Promise<void>;
}
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ITEMS_PER_PAGE = 10;
export default function EmailTemplatesTable({
  pages,
  fetchPages,
}: TemplateViewListProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogErrors, setDialogErrors] = useState<Record<string, string>>({});
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<EmailTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    body: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  /* -------------------- VALIDATION -------------------- */
  // const validateForm = () => {
  const validateForm = (data: {
  name: string;
  subject: string;
  body: string;
}) => {
  const newErrors: Record<string, string> = {};
  if (!data.name.trim()) {
    newErrors.name = "Template name is required";
  } else if (data.name.length < 3) {
    newErrors.name = "Name must be at least 3 characters";
  }
  if (!data.subject.trim()) {
    newErrors.subject = "Subject is required";
  }
  if (!data.body.trim()) {
    newErrors.body = "Body is required";
  } else if (data.body.length < 10) {
    newErrors.body = "Body must be at least 10 characters";
  }
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
  /* -------------------- FETCH -------------------- */
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await axios.get<EmailTemplate[]>(
        `${API_BASE_URL}/email/templates`
      );
      setTemplates(res.data);
    } catch {
      toast.error("Failed to load email templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  /* -------------------- FORM HANDLERS -------------------- */
  const openCreateModal = () => {
    setIsCreateMode(true);
    setEditingTemplate(null);
    setFormData({ name: "", subject: "", body: "" });
    setErrors({});
  };

  const openEditModal = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setIsCreateMode(false);
    setFormData({
      name: template.name,
      subject: template.subject,
      body: template.body,
    });
    setErrors({});
  };

  const closeModal = () => {
    setIsCreateMode(false);
    setEditingTemplate(null);
    setFormData({ name: "", subject: "", body: "" });
    setErrors({});
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSave = async (data: {
  name: string;
  subject: string;
  body: string;
}) => {
    if (!validateForm(data)) {
      toast.error("Please fix validation errors");
      return;
    }
    

    try {
      if (isCreateMode) {
        await axios.post(`${API_BASE_URL}/email/templates`, data);
        toast.success("Template created successfully");
      } else if (editingTemplate) {
        await axios.put(
          `${API_BASE_URL}/email/templates/${editingTemplate.id}`,
          formData
        );
        toast.success("Template updated successfully");
      }

      fetchTemplates();
      closeModal();
    } catch {
      toast.error("Operation failed");
    }
  };

  /* -------------------- PAGINATION -------------------- */
  const paginatedTemplates = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return templates.slice(start, start + ITEMS_PER_PAGE);
  }, [templates, currentPage]);

  const totalPages = Math.ceil(templates.length / ITEMS_PER_PAGE);

  /* -------------------- SELECTION -------------------- */
  const allSelected =
    paginatedTemplates.length > 0 &&
    paginatedTemplates.every((t) => selected.has(t.id));

  const toggleAll = () => {
    if (allSelected) {
      const next = new Set(selected);
      paginatedTemplates.forEach((t) => next.delete(t.id));
      setSelected(next);
    } else {
      setSelected(
        new Set([...selected, ...paginatedTemplates.map((t) => t.id)])
      );
    }
  };

  const toggleOne = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  /* -------------------- DELETE -------------------- */
  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${API_BASE_URL}/email/templates/${id}`);
      toast.success("Template deleted");
      fetchTemplates();
    } catch {
      toast.error("Failed to delete template");
    }
  };

  return (
    <div className="space-y-4 max-w-[95vw]">
      {/* Header */}
      <Card className="border-0 bg-white/60 shadow-sm">
        <CardContent className="flex justify-between p-4">
          <h2 className="text-lg font-semibold">Email Templates</h2>
          <Button onClick={openCreateModal}>+ Add Template</Button>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 bg-white/60 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                </TableHead>
                <TableHead className="py-3 px-4 text-left text-sm font-medium text-primary">Name</TableHead>
                <TableHead className="py-3 px-4 text-left text-sm font-medium text-primary">Subject</TableHead>
                <TableHead className="py-3 px-4 text-left text-sm font-medium text-primary">Created</TableHead>
                <TableHead className="py-3 px-4 text-left text-sm font-medium text-primary">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : paginatedTemplates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No templates found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTemplates.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell >
                      <Checkbox
                        checked={selected.has(t.id)}
                        onCheckedChange={() => toggleOne(t.id)}
                      />
                    </TableCell>
                    <TableCell className="py-4 px-4 text-sm">{t.name}</TableCell>
                    <TableCell className="py-4 px-4 text-sm">{t.subject}</TableCell>
                    <TableCell className="py-4 px-4 text-sm">
                      {new Date(t.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                       variant="ghost"
                          size="sm"
                         className="text-muted-foreground hover:text-destructive"
                        onClick={() => openEditModal(t)}
                      >
                        <Edit className="mr-1 h-3 w-3" /> Edit
                      </Button>
                      <Button
                       variant="ghost"
                          size="sm"
                         className="text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(t.id)}
                      >
                        <Trash2 className="mr-1 h-3 w-3" /> Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 py-4">
          <Button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Previous
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant={currentPage === p ? "default" : "outline"}
              onClick={() => setCurrentPage(p)}
            >
              {p}
            </Button>
          ))}

          <Button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Modal */}
      {/* {(isCreateMode || editingTemplate) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <Card className="w-[500px]">
            <CardContent className="space-y-4 p-6">
              <h3 className="text-lg font-semibold">
                {isCreateMode ? "Add Template" : "Edit Template"}
              </h3>

              <input
                placeholder="Name"
                className="w-full rounded border p-2"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}

              <input
                placeholder="Subject"
                className="w-full rounded border p-2"
                value={formData.subject}
                onChange={(e) => handleChange("subject", e.target.value)}
              />
              {errors.subject && (
                <p className="text-sm text-red-500">{errors.subject}</p>
              )}

              <textarea
                placeholder="Body"
                className="h-32 w-full rounded border p-2"
                value={formData.body}
                onChange={(e) => handleChange("body", e.target.value)}
              />
              {errors.body && (
                <p className="text-sm text-red-500">{errors.body}</p>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  {isCreateMode ? "Create" : "Save"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )} */}

      <AddTemplateDialog
  open={isCreateMode || !!editingTemplate}
  mode={isCreateMode ? "create" : "edit"}
  initialData={
    editingTemplate
      ? {
          name: editingTemplate.name,
          subject: editingTemplate.subject,
          body: editingTemplate.body,
        }
      : undefined
  }
  onOpenChange={(open) => {
    if (!open) closeModal();
  }}
  onSubmit={handleSave}
/>
    </div>
  );
}
