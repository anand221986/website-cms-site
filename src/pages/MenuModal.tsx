import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ================= TYPES ================= */

export interface Menu {
  id: number;
  title: string;
  slug: string | null;
  url: string | null;
  parent_id: number | null;
  location: "HEADER" | "FOOTER";
  position: number;
}

export interface MenuForm {
  id?: number;
  title: string;
  slug: string;
  url: string;
  parent_id: string;
  location: "HEADER" | "FOOTER";
}

interface MenuModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: MenuForm) => void;
  menus: Menu[];
  initialData: MenuForm | null;
}

/* ================= COMPONENT ================= */

export default function MenuModal({
  open,
  onClose,
  onSubmit,
  menus = [],
  initialData,
}: MenuModalProps) {
  const [form, setForm] = useState<MenuForm>({
    title: "",
    slug: "",
    url: "",
    parent_id: "",
    location: "HEADER",
  });

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm({
        title: "",
        slug: "",
        url: "",
        parent_id: "",
        location: "HEADER",
      });
    }
  }, [initialData]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {form.id ? "Edit Menu" : "Add Menu"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            placeholder="Title"
            value={form.title}
            onChange={e =>
              setForm({ ...form, title: e.target.value })
            }
          />

          <Input
            placeholder="Slug"
            value={form.slug}
            onChange={e =>
              setForm({ ...form, slug: e.target.value })
            }
          />

          <Input
            placeholder="URL"
            value={form.url}
            onChange={e =>
              setForm({ ...form, url: e.target.value })
            }
          />

          {/* ✅ Parent Menu */}
          <Select
            value={form.parent_id || undefined}
            onValueChange={value =>
              setForm({ ...form, parent_id: value || "" })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Parent Menu" />
            </SelectTrigger>
            <SelectContent>
              {menus.length === 0 && (
                <SelectItem value="none" disabled>
                  No menus available
                </SelectItem>
              )}

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
            onValueChange={value =>
              setForm({
                ...form,
                location: value as "HEADER" | "FOOTER",
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Location" />
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
}
