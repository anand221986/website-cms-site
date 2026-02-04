// components/sections/StatsMetaForm.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash } from "lucide-react";

export default function StatsMetaForm({ meta, setMeta }: any) {
  const items = meta?.items || [];

  const updateItem = (index: number, key: string, value: string) => {
    const updated = [...items];
    updated[index][key] = value;
    setMeta({ items: updated });
  };

  const addItem = () => {
    setMeta({
      items: [...items, { icon: "", value: "", label: "" }],
    });
  };

  const removeItem = (index: number) => {
    setMeta({
      items: items.filter((_: any, i: number) => i !== index),
    });
  };

  return (
    <div className="space-y-4">
      {items.map((item: any, index: number) => (
        <div
          key={index}
          className="grid grid-cols-4 gap-3 border p-4 rounded-md"
        >
          <Input
            placeholder="Icon ( hooking-hand )"
            value={item.icon}
            onChange={(e) =>
              updateItem(index, "icon", e.target.value)
            }
          />

          <Input
            placeholder="Value ( 15,000+ )"
            value={item.value}
            onChange={(e) =>
              updateItem(index, "value", e.target.value)
            }
          />

          <Input
            placeholder="Label ( Placements )"
            value={item.label}
            onChange={(e) =>
              updateItem(index, "label", e.target.value)
            }
          />

          <Button
            variant="destructive"
            onClick={() => removeItem(index)}
          >
            <Trash size={16} />
          </Button>
        </div>
      ))}

      <Button onClick={addItem}>+ Add Stat</Button>
    </div>
  );
}
