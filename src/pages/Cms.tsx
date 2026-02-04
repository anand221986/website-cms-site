import Layout from "@/components/Layout";
import PageSettingsTabs from "@/pages/PageSettingsTabs";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Edit, Trash2, Plus } from "lucide-react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* ================= TYPES ================= */

interface Menu {
  id: number;
  title: string;
  page_id: number | null;
  parent_id: number | null;
  position: number;
  url: string;
  slug?: string;
  location: "HEADER" | "FOOTER";
}

interface MenuForm {
  id?: number;
  title: string;
  parent_id: string;
  url: string;
  slug: string;
  position: number;
  order: number;
  location: "HEADER" | "FOOTER";
}

/* ================= HELPERS ================= */

const buildMenuTree = (menus: Menu[]) => {
  const map = new Map<number, any>();
  const roots: any[] = [];

  menus.forEach(m => map.set(m.id, { ...m, children: [] }));
  menus.forEach(m => {
    if (m.parent_id) {
      map.get(m.parent_id)?.children.push(map.get(m.id));
    } else {
      roots.push(map.get(m.id));
    }
  });

  return roots;
};

/* ================= MENU MODAL ================= */

const MenuModal = ({
  open,
  onClose,
  onSubmit,
  menus,
  initialData,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: MenuForm) => void;
  menus: Menu[];
  initialData: MenuForm | null;
}) => {
  const [form, setForm] = useState<MenuForm>({
    title: "",
    parent_id: "",
    url: "",
    slug: "",
    position: 0,
    order: 0,
    location: "HEADER",
  });

  useEffect(() => {
    if (initialData) setForm(initialData);
    else {
      setForm({
        title: "",
        parent_id: "",
        url: "",
        slug: "",
        position: 0,
        order: 0,
        location: "HEADER",
      });
    }
  }, [initialData]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{form.id ? "Edit Menu" : "Add Menu"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            placeholder="Menu Title"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
          />

          <Input
            placeholder="URL"
            value={form.url}
            onChange={e => setForm({ ...form, url: e.target.value })}
          />

          <Input
            placeholder="Slug"
            value={form.slug}
            onChange={e => setForm({ ...form, slug: e.target.value })}
          />

          <Input
            type="number"
            placeholder="Position"
            value={form.position}
            onChange={e =>
              setForm({ ...form, position: Number(e.target.value) })
            }
          />

          <Input
            type="number"
            placeholder="Order"
            value={form.order}
            onChange={e =>
              setForm({ ...form, order: Number(e.target.value) })
            }
          />

          {/* Parent Menu */}
          <Select
            value={form.parent_id || undefined}
            onValueChange={v => setForm({ ...form, parent_id: v || "" })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Parent Menu" />
            </SelectTrigger>
            <SelectContent>
              {menus
                .filter(m => m.id !== form.id)
                .map(m => (
                  <SelectItem key={m.id} value={String(m.id)}>
                    {m.title}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          {/* Location */}
          <Select
            value={form.location}
            onValueChange={v =>
              setForm({ ...form, location: v as "HEADER" | "FOOTER" })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="HEADER">Header</SelectItem>
              <SelectItem value="FOOTER">Footer</SelectItem>
            </SelectContent>
          </Select>

          <Button className="w-full" onClick={() => onSubmit(form)}>
            Save Menu
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/* ================= TREE VIEW ================= */

const TreeNode = ({ menu, level = 0 }: any) => (
  <div style={{ marginLeft: level * 20 }}>
    <div className="py-1">└ {menu.title}</div>
    {menu.children?.map((c: any) => (
      <TreeNode key={c.id} menu={c} level={level + 1} />
    ))}
  </div>
);

/* ================= MAIN COMPONENT ================= */

export default function CMS() {
  const [activeTab, setActiveTab] =
    useState<"pages" | "menu" | "seo">("pages");
  const [menus, setMenus] = useState<Menu[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<MenuForm | null>(null);

  const fetchMenus = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/menus`);
      setMenus(data.result);
    } catch {
      toast.error("Failed to load menus");
    }
  };

  useEffect(() => {
    if (activeTab === "menu") fetchMenus();
  }, [activeTab]);

  const handleSave = async (form: MenuForm) => {
    try {
      // const payload = {
      //   ...form,
      //   parent_id: form.parent_id || null,
      // };
// Build payload without id
    const { id, ...rest } = form;
    const payload = {
      ...rest,
      parent_id: rest.parent_id || null,
    };
      if (form.id) {
        await axios.put(`${API_BASE_URL}/menus/${form.id}`, payload);
        toast.success("Menu updated");
      } else {
        await axios.post(`${API_BASE_URL}/menus`, payload);
        toast.success("Menu added");
      }

      setModalOpen(false);
      setEditData(null);
      fetchMenus();
    } catch {
      toast.error("Failed to save menu");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this menu?")) return;
    await axios.delete(`${API_BASE_URL}/menus/${id}`);
    toast.success("Menu deleted");
    fetchMenus();
  };

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    const reordered = Array.from(menus);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    setMenus(reordered);

    await axios.post(`${API_BASE_URL}/menus/reorder`, {
      orders: reordered.map((m, i) => ({ id: m.id, position: i })),
    });
  };

  return (
    <Layout>
      <Tabs value={activeTab} onValueChange={v => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="menu">Menus</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="pages">
          <PageSettingsTabs />
        </TabsContent>

        <TabsContent value="menu">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold">Menu Management</h2>
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add Menu
            </Button>
          </div>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="menus">
              {p => (
                <Table ref={p.innerRef} {...p.droppableProps}>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {menus.map((m, i) => (
                      <Draggable key={m.id} draggableId={`${m.id}`} index={i}>
                        {p => (
                          <TableRow
                            ref={p.innerRef}
                            {...p.draggableProps}
                            {...p.dragHandleProps}
                          >
                            <TableCell>{m.title}</TableCell>
                            <TableCell>{m.location}</TableCell>
                            <TableCell className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditData({
                                    id: m.id,
                                    title: m.title,
                                    parent_id: String(m.parent_id ?? ""),
                                    url: m.url,
                                    slug: m.slug || "",
                                    position: m.position,
                                    order: m.position,
                                    location: m.location,
                                  });
                                  setModalOpen(true);
                                }}
                              >
                                <Edit className="w-3 h-3 mr-1" /> Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(m.id)}
                              >
                                <Trash2 className="w-3 h-3 mr-1" /> Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        )}
                      </Draggable>
                    ))}
                    {p.placeholder}
                  </TableBody>
                </Table>
              )}
            </Droppable>
          </DragDropContext>

          <div className="mt-6">
            <h3 className="font-semibold mb-2">Menu Tree Preview</h3>
            {buildMenuTree(menus).map(m => (
              <TreeNode key={m.id} menu={m} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <MenuModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditData(null);
        }}
        onSubmit={handleSave}
        menus={menus}
        initialData={editData}
      />
    </Layout>
  );
}
