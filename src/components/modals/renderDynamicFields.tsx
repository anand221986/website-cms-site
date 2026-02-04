import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SECTION_FORM_CONFIG } from "@/lib/sectionFormConfig";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Button } from "@/components/ui/button";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type OnChangeFn = (key: string, value: any) => void;

export function renderDynamicFields(
  meta: Record<string, any>,
  onChange: OnChangeFn,
  sectionKey: string,
  config: typeof SECTION_FORM_CONFIG
) {
  const section = config[sectionKey];
  if (!section) return null;

  return section.fields.map(field => {
    const value = field.multiple
      ? meta[field.name] ?? []
      : meta[field.name] ?? "";

    switch (field.type) {
      /* ---------------- TEXT ---------------- */
      case "text":
        return (
          <Input
            key={field.name}
            placeholder={field.label}
            value={value}
            onChange={e => onChange(field.name, e.target.value)}
          />
        );

      /* ---------------- TEXTAREA ---------------- */
      case "textarea":
        return (
          <Textarea
            key={field.name}
            placeholder={field.label}
            value={value}
            onChange={e => onChange(field.name, e.target.value)}
          />
        );

      /* ---------------- JSON ---------------- */
      case "json":
        return (
          <Textarea
            key={field.name}
            rows={6}
            placeholder={field.label}
            value={
              typeof value === "string"
                ? value
                : JSON.stringify(value, null, 2)
            }
            onChange={e => {
              try {
                onChange(field.name, JSON.parse(e.target.value));
              } catch {
                onChange(field.name, e.target.value);
              }
            }}
          />
        );

      /* ---------------- FILE / IMAGE UPLOAD ---------------- */
      case "file":
      case "image":
        return (
          <div key={field.name} className="space-y-2">
            <label className="text-sm font-medium">{field.label}</label>

            <Input
              type="file"
              accept="image/*"
              multiple={Boolean(field.multiple)}
              onChange={async e => {
                const files = Array.from(e.target.files || []);
                if (!files.length) return;

                // MULTIPLE FILE UPLOAD
                if (field.multiple) {
                  const uploadedUrls: string[] = [];

                  for (const file of files) {
                    const formData = new FormData();
                    formData.append("file", file);

                    const res = await fetch(`${API_BASE_URL}/upload`, {
                      method: "POST",
                      body: formData,
                    });

                    const data = await res.json();
                    uploadedUrls.push(data.url);
                  }

                  onChange(field.name, [...value, ...uploadedUrls]);
                }
                // SINGLE FILE UPLOAD
                else {
                  const formData = new FormData();
                  formData.append("file", files[0]);

                  const res = await fetch(`${API_BASE_URL}/upload`, {
                    method: "POST",
                    body: formData,
                  });

                  const data = await res.json();
                  onChange(field.name, data.url);
                }

                // 🔥 Reset input so same file can be re-selected
                e.target.value = "";
              }}
            />

            {/* PREVIEW (MULTIPLE) */}
            {/* {field.multiple && Array.isArray(value) && value.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {value.map((url: string, index: number) => (
                  <img
                    key={index}
                    src={url}
                    className="h-24 w-32 rounded border object-cover"
                  />
                ))}
              </div>
            )} */}

            {field.multiple && Array.isArray(value) && value.length > 0 && (
  <div className="flex flex-wrap gap-2">
    {value.map((url: string, index: number) => (
      <div
        key={index}
        className="relative h-24 w-32 overflow-hidden rounded border bg-gray-100"
      >
        <img
          src={url}
          alt={`preview-${index}`}
          className="h-full w-full object-cover"
        />
      </div>
    ))}
  </div>
)}


            {/* PREVIEW (SINGLE) */}
            {!field.multiple && value && (
              <img
                src={value}
                className="h-28 rounded border object-cover"
              />
            )}
          </div>
        );

      /* ---------------- QUILL ---------------- */
      case "quill":
        return (
          <div key={field.name} className="space-y-2">
            <label className="text-sm font-medium">{field.label}</label>

            <ReactQuill
              theme="snow"
              value={value}
              onChange={html => onChange(field.name, html)}
              className="bg-white"
            />
          </div>
        );
        case "cta":
      const ctas = Array.isArray(value) ? value : [];
   return (
    <div key={field.name} className="space-y-3">
      <label className="text-sm font-medium">{field.label}</label>

      {ctas.map((cta: any, index: number) => (
        <div
          key={index}
          className="grid grid-cols-12 gap-2 rounded-lg border p-3"
        >
          <Input
            className="col-span-4"
            placeholder="Label"
            value={cta.label}
            onChange={e => {
              const updated = [...ctas];
              updated[index] = { ...cta, label: e.target.value };
              onChange(field.name, updated);
            }}
          />

          <Input
            className="col-span-4"
            placeholder="URL"
            value={cta.url}
            onChange={e => {
              const updated = [...ctas];
              updated[index] = { ...cta, url: e.target.value };
              onChange(field.name, updated);
            }}
          />

          <select
            className="col-span-3 rounded-md border px-2"
            value={cta.variant || "primary"}
            onChange={e => {
              const updated = [...ctas];
              updated[index] = { ...cta, variant: e.target.value };
              onChange(field.name, updated);
            }}
          >
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
            <option value="outline">Outline</option>
          </select>

          <Button
            variant="destructive"
            size="sm"
            className="col-span-1"
            onClick={() => {
              const updated = ctas.filter((_, i) => i !== index);
              onChange(field.name, updated);
            }}
          >
            ✕
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          onChange(field.name, [
            ...ctas,
            { label: "", url: "", variant: "primary" },
          ])
        }
      >
        + Add CTA
      </Button>
    </div>
  );


      default:
        return null;
    }
  });
}
