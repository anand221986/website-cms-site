import { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Edit, Trash2, Plus, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AddTemplateDialog from "@/components/AddTemplateDialog";
import { useAuth } from "@/context/AuthContext";

interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  body: string;
  created_at: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ITEMS_PER_PAGE = 10; // Updated to 10 records per page

export default function EmailTemplatesTable() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);

  const { getUserDetails } = useAuth();
  const user = getUserDetails();

  /* -------------------- API ACTIONS -------------------- */
  const fetchTemplates = useCallback(async () => {
    if (!user?.userId) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/email/templates/${user.userId}`);
      setTemplates(res.data);
    } catch {
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleSave = async (data: { name: string; subject: string; body: string }) => {
    try {
      if (!editingTemplate) {
        await axios.post(`${API_BASE_URL}/email/templates`, { 
          ...data, 
          user_id: user?.userId 
        });
        toast.success("New template added");
      } else {
        await axios.put(`${API_BASE_URL}/email/templates/${editingTemplate.id}`, data);
        toast.success("Template updated");
      }
      fetchTemplates();
      setIsModalOpen(false);
      setEditingTemplate(null);
    } catch (err) {
      toast.error("Failed to save changes");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/email/templates/${id}`);
      toast.success("Template removed");
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      // Adjust page if the last item on a page is deleted
      if (paginatedTemplates.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch {
      toast.error("Delete operation failed");
    }
  };

  /* -------------------- CLIENT SIDE PAGINATION LOGIC -------------------- */
  const paginatedTemplates = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return templates.slice(start, start + ITEMS_PER_PAGE);
  }, [templates, currentPage]);

  const totalPages = Math.ceil(templates.length / ITEMS_PER_PAGE);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-slate-800">Email Templates</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            size="sm" 
            onClick={() => { setEditingTemplate(null); setIsModalOpen(true); }} 
            className="shadow-sm h-8 px-4"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Template
          </Button>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="shadow-md border-slate-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="w-[80px] pl-6 font-semibold text-slate-700 text-center">S.No</TableHead>
              <TableHead className="font-semibold text-slate-700">Template Name</TableHead>
              <TableHead className="font-semibold text-slate-700">Subject Line</TableHead>
              <TableHead className="font-semibold text-slate-700">Date Created</TableHead>
              <TableHead className="text-right pr-6 font-semibold text-slate-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5} className="p-4"><Skeleton className="h-8 w-full" /></TableCell>
                </TableRow>
              ))
            ) : paginatedTemplates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Mail className="h-12 w-12 mb-4 opacity-20" />
                    <p className="text-lg font-medium">No templates found</p>
                    <p className="text-sm text-slate-400">Click "Add Template" to get started.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedTemplates.map((template, index) => (
                <TableRow key={template.id} className="group hover:bg-slate-50/50 transition-colors">
                  {/* Serial Number Calculation */}
                  <TableCell className="pl-6 text-center text-slate-500 font-medium">
                    {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                  </TableCell>
                  
                  <TableCell className="font-medium text-slate-900">{template.name}</TableCell>
                  <TableCell className="text-slate-600 truncate max-w-[300px]">{template.subject}</TableCell>
                  <TableCell className="text-slate-500 text-xs">
                    {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(template.created_at))}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                        onClick={() => { setEditingTemplate(template); setIsModalOpen(true); }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Professional Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t bg-slate-50/30">
            <p className="text-xs text-slate-500">
              Showing <span className="font-medium text-slate-700">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-medium text-slate-700">{Math.min(currentPage * ITEMS_PER_PAGE, templates.length)}</span> of <span className="font-medium text-slate-700">{templates.length}</span> templates
            </p>
            <div className="flex items-center gap-1">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 px-3 text-xs"
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(p => p - 1)}
              >
                Previous
              </Button>
              
              {/* Page Numbers */}
              <div className="flex items-center gap-1 mx-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                   <Button
                    key={page}
                    variant={currentPage === page ? "default" : "ghost"}
                    size="sm"
                    className={`h-8 w-8 p-0 text-xs ${currentPage === page ? "shadow-sm" : "text-slate-500"}`}
                    onClick={() => setCurrentPage(page)}
                   >
                    {page}
                   </Button>
                ))}
              </div>

              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 px-3 text-xs"
                disabled={currentPage === totalPages} 
                onClick={() => setCurrentPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      <AddTemplateDialog
        open={isModalOpen}
        mode={editingTemplate ? "edit" : "create"}
        initialData={editingTemplate ? {
          name: editingTemplate.name,
          subject: editingTemplate.subject,
          body: editingTemplate.body,
        } : undefined}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setEditingTemplate(null);
        }}
        onSubmit={handleSave}
      />
    </div>
  );
}