import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* ---------------------------------------------
   IMAGE PREVIEW RESOLVER
---------------------------------------------- */
const getPreview = (value: File | string | null) => {
  if (!value) return null;

  if (value instanceof File) return URL.createObjectURL(value);

  if (typeof value === "string") {
    if (value.startsWith("http")) return value;
    return `${API_BASE_URL}/uploads/sections/${value}`;
  }

  return null;
};

/* ---------------------------------------------
   DYNAMIC FIELD RENDERER
---------------------------------------------- */
export function renderDynamicFields(
  section: any, // entire section object
  onChange: (key: string, value: any) => void,
  sectionKey: string,
  config: any
) {
  const sectionConfig = config[sectionKey];
  if (!sectionConfig) return null;

  return sectionConfig.fields.map((field: any) => {
    /* ---------------- NORMALIZE VALUE ---------------- */
    let value: any;

    if (field.type === "image" || field.type === "file") {
      if (field.multiple) {
        // Combine meta.image, section.image, and section.images[] for multiple
        const combined: (string | File)[] = [
          section.meta?.[field.name] ?? section.image,
          ...(section.images ?? []),
        ].filter(Boolean);
        value = combined;
      } else {
        // Single image → prefer meta.image, fallback section.image
        value = section.meta?.[field.name] ?? section.image ?? null;
      }
    } else {
      value = section.meta?.[field.name] ?? "";
    }

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
            value={typeof value === "string" ? value : JSON.stringify(value, null, 2)}
            onChange={e => {
              try {
                onChange(field.name, JSON.parse(e.target.value));
              } catch {
                onChange(field.name, e.target.value);
              }
            }}
          />
        );

      /* ---------------- BADGES ---------------- */
      case "badges": {
        const badges: string[] = value || [];
        return (
          <div key={field.name} className="space-y-2">
            <p className="font-medium">{field.label}</p>
            {badges.map((badge, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={badge}
                  onChange={e => {
                    const updated = [...badges];
                    updated[index] = e.target.value;
                    onChange(field.name, updated);
                  }}
                />
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() =>
                    onChange(field.name, badges.filter((_, i) => i !== index))
                  }
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() => onChange(field.name, [...badges, ""])}
            >
              + Add Badge
            </Button>
          </div>
        );
      }

      /* ---------------- IMAGE / FILE ---------------- */
      case "image":
      case "file":
        {
          const imagesArray = Array.isArray(value) ? value : [value];
          const isMultiple = field.multiple;

          return (
            <div key={field.name} className="space-y-2">
              <label className="text-sm font-medium">{field.label}</label>

              <Input
                type="file"
                accept="image/*"
                multiple={isMultiple}
                onChange={e => {
                  const files = Array.from(e.target.files || []);
                  if (!files.length) return;

                  if (isMultiple) {
                    onChange(field.name, [...imagesArray.filter(Boolean), ...files]);
                  } else {
                    onChange(field.name, files[0]);
                  }

                  e.target.value = "";
                }}
              />

              {/* -------- IMAGE PREVIEW GALLERY -------- */}
              {imagesArray.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {imagesArray.map((item: any, index: number) => {
                    if (!item) return null;
                    const preview = getPreview(item);
                    if (!preview) return null;

                    return (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          className="h-24 w-32 rounded border object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            onChange(
                              field.name,
                              imagesArray.filter((_: any, i: number) => i !== index)
                            )
                          }
                          className="absolute top-1 right-1 bg-black/60 text-white text-xs px-1 rounded"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }

      /* ---------------- QUILL ---------------- */
      case "quill":
        return (
          <div
            key={field.name}
            className="w-full [&_.ql-container]:min-h-[120px] [&_.ql-editor]:min-h-[120px]"
          >
            <label className="text-sm font-medium">{field.label}</label>

            <ReactQuill
              theme="snow"
              value={value}
              onChange={content => onChange(field.name, content)}
              className="bg-white"
            />
          </div>
        );

      default:
        return null;
    }
  });
}
