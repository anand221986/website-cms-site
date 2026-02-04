import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
import { Edit, Trash2, Layers } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import PageFormModal from "./modals/PageFormModal";

interface Page {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface PagesViewListProps {
  loading: boolean;
  fetchPages: () => void;
  pages: Page[];
}

 const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function PageViewTable({
  loading,
  fetchPages,
  pages,
}: PagesViewListProps) {
  const navigate = useNavigate();

  const [localPages, setLocalPages] = useState<Page[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [open, setOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);

  const itemsPerPage = 10;

  useEffect(() => {
    setLocalPages(pages);
  }, [pages]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return localPages.slice(start, start + itemsPerPage);
  }, [localPages, currentPage]);

  const totalPages = Math.ceil(localPages.length / itemsPerPage);

  const allSelected = useMemo(
    () =>
      paginated.length > 0 &&
      paginated.every((p) => selected.has(p.id)),
    [paginated, selected]
  );

  const toggleAll = () => {
    if (allSelected) {
      const next = new Set(selected);
      paginated.forEach((p) => next.delete(p.id));
      setSelected(next);
    } else {
      setSelected(
        (prev) => new Set([...prev, ...paginated.map((p) => p.id)])
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

  /* -------------------- ACTIONS -------------------- */

  const handleAdd = () => {
    setEditingPage(null);
    setOpen(true);
  };

  const handleEdit = (page: Page) => {
    setEditingPage(page);
    setOpen(true);
  };

  // ✅ PAGE → SECTION MANAGEMENT
  const handleSection = (pageId: number, pageTitle: string) => {
  navigate(`/pages/${pageId}/sections`, {
    state: { pageName: pageTitle },
  });
};

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${API_BASE_URL}/pages/${id}`);
      toast.success("Page deleted successfully");
      fetchPages();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete page");
    }
  };

  return (
    <div className="space-y-4 max-w-[95vw]">
      {/* Header */}
      <Card className="border-0 bg-white/60 shadow-sm backdrop-blur-sm">
        <CardContent className="flex justify-between p-4">
          <h2 className="font-semibold text-lg">Pages</h2>
          <Button onClick={handleAdd}>+ Add Page</Button>
        </CardContent>
      </Card>

      {/* Pages Table */}
      <Card className="border-0 bg-white/60 shadow-sm backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-white/90">
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                  </TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Meta Title</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-[200px]">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      No pages found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((page) => (
                    <TableRow key={page.id}>
                      <TableCell>
                        <Checkbox
                          checked={selected.has(page.id)}
                          onCheckedChange={() => toggleOne(page.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {page.title}
                      </TableCell>
                      <TableCell>{page.slug}</TableCell>
                      <TableCell>{page.status}</TableCell>
                      <TableCell>{page.meta_title || "N/A"}</TableCell>
                      <TableCell>
                        {new Date(page.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(page.updated_at).toLocaleDateString()}
                      </TableCell>

                      {/* ACTIONS */}
                      <TableCell className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(page)}
                        >
                          <Edit className="w-3 h-3 mr-1" /> Edit
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSection(page.id,page.title)}
                        >
                          <Layers className="w-3 h-3 mr-1" /> Sections
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className="hover:bg-red-50 hover:text-red-600"
                          onClick={() => handleDelete(page.id)}
                        >
                          <Trash2 className="w-3 h-3 mr-1" /> Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <CardContent className="flex justify-center gap-2 py-4">
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
        </CardContent>
      )}

      {/* Page Modal */}
      <PageFormModal
        open={open}
        setOpen={setOpen}
        fetchPages={fetchPages}
        editingPage={editingPage}
        setEditingPage={setEditingPage}
      />
    </div>
  );
}
