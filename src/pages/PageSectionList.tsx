import { useLocation, useParams,useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Edit, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import SectionFormModal from "@/components/modals/SectionFormModal";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
 

 const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface LocationState {
  pageName?: string;
}

interface Section {
  id: number;
  page_id: number;
  section_key: string;
  title: string;
  sub_title: string;
  meta: any;
  sort_order: number;
  is_active: boolean;
}

export default function PageSectionList() {
  const { pageId } = useParams<{ pageId: string }>();
  const location = useLocation();
  const state = location.state as LocationState | undefined;
  const pageName = state?.pageName;

  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const navigate = useNavigate();

  // Fetch sections for the page
  const fetchSections = async () => {
    if (!pageId) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/pages/${pageId}/sections`);
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setSections(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load sections");
      setSections([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, [pageId]);

  // Delete section
  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${API_BASE_URL}/pages/page-sections/${id}`);
      toast.success("Section deleted");
      fetchSections();
    } catch {
      toast.error("Delete failed");
    }
  };

  // Toggle section active status
  const toggleStatus = async (section: Section) => {
    try {
      await axios.patch(`${API_BASE_URL}/pages/page-sections/${section.id}`, {
        is_active: !section.is_active,
      });
      fetchSections();
    } catch {
      toast.error("Status update failed");
    }
  };

  return (
    <Layout>
      <Breadcrumb>
  <BreadcrumbList>
    {/* Pages List */}
    <BreadcrumbItem>
      <BreadcrumbLink
        asChild
        className="cursor-pointer"
      >
        <span onClick={() => navigate("/c-m-s")}>Pages</span>
      </BreadcrumbLink>
    </BreadcrumbItem>

    <BreadcrumbSeparator />

    {/* Sections */}
    <BreadcrumbItem>
      <BreadcrumbPage>Sections</BreadcrumbPage>
    </BreadcrumbItem>

    {pageName && (
      <>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{pageName}</BreadcrumbPage>
        </BreadcrumbItem>
      </>
    )}
  </BreadcrumbList>
</Breadcrumb>

      <div className="space-y-4">
        {/* Header */}
<div className="flex justify-between items-center">
  <div className="text-2xl font-bold text-gray-800">
    {/* Sections for {pageName ? `"${pageName}"` : `Page #${pageId}`} */}
  </div>

  <Button
    onClick={() => {
      setEditingSection(null);
      setOpen(true);
    }}
  >
    <Plus className="w-4 h-4 mr-1" />
    Add Section
  </Button>
</div>


        {/* Sections Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Key</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Sub Title</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[140px]">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : sections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No sections found
                </TableCell>
              </TableRow>
            ) : (
              sections.map((section) => (
                <TableRow key={section.id}>
                  <TableCell>{section.section_key}</TableCell>
                  <TableCell>{section.title}</TableCell>
                  <TableCell>{section.sub_title}</TableCell>
                  <TableCell>{section.sort_order}</TableCell>
                  <TableCell>
                    <Switch
                      checked={section.is_active}
                      onCheckedChange={() => toggleStatus(section)}
                    />
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingSection(section);
                        setOpen(true);
                      }}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="hover:text-red-600"
                      onClick={() => handleDelete(section.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Section Modal */}
        <SectionFormModal
          open={open}
          setOpen={setOpen}
          pageId={Number(pageId)}
          editingSection={editingSection}
          refresh={fetchSections}
        />
      </div>
    </Layout>
  );
}
