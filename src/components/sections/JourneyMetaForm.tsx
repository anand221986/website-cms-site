// components/sections/JourneyMetaForm.tsx
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function JourneyMetaForm({ meta, setMeta }: any) {
  const items = meta?.items || [];

  const updateItem = (i: number, key: string, value: string) => {
    const updated = [...items];
    updated[i][key] = value;
    setMeta({ items: updated });
  };

  return (
    <div className="space-y-3">
      {items.map((item: any, i: number) => (
        <div key={i} className="grid grid-cols-3 gap-2">
          <Input
            placeholder="Year"
            value={item.year}
            onChange={(e) =>
              updateItem(i, "year", e.target.value)
            }
          />
          <Input
            placeholder="Title"
            value={item.title}
            onChange={(e) =>
              updateItem(i, "title", e.target.value)
            }
          />
          <Input
            placeholder="Description"
            value={item.description}
            onChange={(e) =>
              updateItem(i, "description", e.target.value)
            }
          />
        </div>
      ))}

      <Button
        onClick={() =>
          setMeta({
            items: [...items, { year: "", title: "", description: "" }],
          })
        }
      >
        + Add Journey
      </Button>
    </div>
  );
}
