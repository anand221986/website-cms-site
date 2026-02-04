// components/sections/HeroMetaForm.tsx
import { Input } from "@/components/ui/input";

export default function HeroMetaForm({ meta, setMeta }: any) {
  const update = (key: string, value: any) =>
    setMeta({ ...meta, [key]: value });

  return (
    <div className="grid gap-3">
      <Input
        placeholder="Badge Text"
        value={meta?.badge || ""}
        onChange={(e) => update("badge", e.target.value)}
      />

      <Input
        placeholder="Hero Image URL"
        value={meta?.image || ""}
        onChange={(e) => update("image", e.target.value)}
      />

      <Input
        placeholder="Headline Line 1"
        value={meta?.headline?.line1 || ""}
        onChange={(e) =>
          setMeta({
            ...meta,
            headline: { ...meta.headline, line1: e.target.value },
          })
        }
      />

      <Input
        placeholder="Headline Line 2"
        value={meta?.headline?.line2 || ""}
        onChange={(e) =>
          setMeta({
            ...meta,
            headline: { ...meta.headline, line2: e.target.value },
          })
        }
      />
    </div>
  );
}
