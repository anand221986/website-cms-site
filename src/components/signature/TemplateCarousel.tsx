// import { ChevronLeft, ChevronRight } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { SIGNATURE_TEMPLATES, SignatureTemplate } from "@/types/signature";
// import { motion } from "framer-motion";
// import { useState } from "react";

// interface TemplateCarouselProps {
//   selectedTemplate: string;
//   onSelect: (templateId: string) => void;
// }

// const TemplateCarousel = ({ selectedTemplate, onSelect }: TemplateCarouselProps) => {
//   const [startIndex, setStartIndex] = useState(0);
//   const visibleCount = 4;

//   const canScrollLeft = startIndex > 0;
//   const canScrollRight = startIndex + visibleCount < SIGNATURE_TEMPLATES.length;

//   const scrollLeft = () => {
//     if (canScrollLeft) setStartIndex(startIndex - 1);
//   };

//   const scrollRight = () => {
//     if (canScrollRight) setStartIndex(startIndex + 1);
//   };

//   const visibleTemplates = SIGNATURE_TEMPLATES.slice(startIndex, startIndex + visibleCount);

//   return (
//     <div className="bg-card rounded-xl p-6 shadow-sm border">
//       <h2 className="text-lg font-semibold text-center mb-4 ">
//         2. Choose signature template
//       </h2>
      
//       <div className="flex items-center gap-4">
//         <Button
//           variant="ghost"
//           size="icon"
//           onClick={scrollLeft}
//           disabled={!canScrollLeft}
//           className="shrink-0"
//         >
//           <ChevronLeft className="w-5 h-5" />
//         </Button>

//         <div className="flex gap-4 flex-1 justify-center">
//           {visibleTemplates.map((template) => (
//             <motion.div
//               key={template.id}
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.98 }}
//               onClick={() => onSelect(template.id)}
//               className={`template-card p-4 w-36 h-28 flex flex-col items-center justify-center gap-2 ${
//                 selectedTemplate === template.id ? 'selected' : ''
//               }`}
//             >
//               <span className="text-3xl">{template.preview}</span>
//               <span className="text-sm font-medium text-muted-foreground">
//                 {template.name}
//               </span>
//             </motion.div>
//           ))}
//         </div>

//         <Button
//           variant="ghost"
//           size="icon"
//           onClick={scrollRight}
//           disabled={!canScrollRight}
//           className="shrink-0"
//         >
//           <ChevronRight className="w-5 h-5" />
//         </Button>
//       </div>

//       <p className="text-center mt-4 text-sm text-secondary cursor-pointer hover:underline">
//         More templates
//       </p>
//     </div>
//   );
// };

// export default TemplateCarousel;

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const templates = [
  {
    id: "classic",
    name: "Classic",
    layout: "horizontal",
    style: { bg: "hsl(0,0%,100%)", accent: "hsl(210,100%,45%)" },
  },
  {
    id: "modern",
    name: "Modern",
    layout: "vertical",
    style: { bg: "hsl(220,20%,12%)", accent: "hsl(45,100%,60%)" },
  },
  {
    id: "compact",
    name: "Compact",
    layout: "inline",
    style: { bg: "hsl(0,0%,100%)", accent: "hsl(152,60%,42%)" },
  },
  {
    id: "elegant",
    name: "Elegant",
    layout: "horizontal",
    style: { bg: "hsl(0,0%,98%)", accent: "hsl(280,60%,50%)" },
  },
  {
    id: "bold",
    name: "Bold",
    layout: "vertical",
    style: { bg: "hsl(210,80%,20%)", accent: "hsl(0,80%,55%)" },
  },
];

interface TemplateCarouselProps {
  selected: string;
  onSelect: (id: string) => void;
  logoBase64?: string;
  
}

// const TemplatePreviewMini = ({ template, isSelected,logoBase64 }: { template: typeof templates[0]; isSelected: boolean,logoBase64?: string; }) => {
//   const isDark = template.style.bg.includes("12%") || template.style.bg.includes("20%");
//   return (
//     <div
//       className={`relative flex flex-col items-center gap-2 rounded-lg border-2 p-2 transition-all cursor-pointer ${
//         isSelected
//           ? "border-[hsl(var(--template-selected))] shadow-md"
//           : "border-border hover:border-muted-foreground/30"
//       }`}
//     >
//       <div
//         className="w-full h-28 rounded-md flex items-center justify-center overflow-hidden"
//         style={{ backgroundColor: template.style.bg }}
//       >
//          {logoBase64 ? (
//           <img
//             src={logoBase64}
//             alt="Logo"
//             className="w-10 h-10 object-cover rounded-full"
//           />
//         ) : (
//         <div className="flex items-center gap-2 px-3">
//           <div
//             className="w-10 h-10 rounded-full"
//             style={{ backgroundColor: template.style.accent }}
//           />
//           <div className="space-y-1">
//             <div
//               className="h-2 w-16 rounded"
//               style={{ backgroundColor: isDark ? "hsl(0,0%,80%)" : "hsl(0,0%,20%)" }}
//             />
//             <div
//               className="h-1.5 w-12 rounded"
//               style={{ backgroundColor: template.style.accent }}
//             />
//             <div
//               className="h-1.5 w-20 rounded"
//               style={{ backgroundColor: isDark ? "hsl(0,0%,60%)" : "hsl(0,0%,60%)" }}
//             />
//           </div>
//         </div>
//          )}
//       </div>
//       <span className="text-xs font-medium text-foreground">{template.name}</span>
//     </div>
//   );
// };
const TemplatePreviewMini = ({
  template,
  isSelected,
  logoBase64,
}: {
  template: typeof templates[0];
  isSelected: boolean;
  logoBase64?: string;
}) => {
  const isDark = template.style.bg.includes("12%") || template.style.bg.includes("20%");
  return (
    <div
      className={`relative flex flex-col items-center gap-2 rounded-lg border-2 p-2 transition-all cursor-pointer ${
        isSelected
          ? "border-[hsl(var(--template-selected))] shadow-md"
          : "border-border hover:border-muted-foreground/30"
      }`}
    >
      <div
        className="w-full h-28 rounded-md flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: template.style.bg }}
      >
        {logoBase64 ? (
          <img
            src={logoBase64}
            alt="Logo"
            className="w-10 h-10 object-cover rounded-full"
          />
        ) : (
          <div className="flex items-center gap-2 px-3">
            <div
              className="w-10 h-10 rounded-full"
              style={{ backgroundColor: template.style.accent }}
            />
            <div className="space-y-1">
              <div
                className="h-2 w-16 rounded"
                style={{ backgroundColor: isDark ? "hsl(0,0%,80%)" : "hsl(0,0%,20%)" }}
              />
              <div
                className="h-1.5 w-12 rounded"
                style={{ backgroundColor: template.style.accent }}
              />
              <div
                className="h-1.5 w-20 rounded"
                style={{ backgroundColor: isDark ? "hsl(0,0%,60%)" : "hsl(0,0%,60%)" }}
              />
            </div>
          </div>
        )}
      </div>
      <span className="text-xs font-medium text-foreground">{template.name}</span>
    </div>
  );
};
const TemplateCarousel = ({ selected, onSelect,logoBase64 }: TemplateCarouselProps) => {
  const [offset, setOffset] = useState(0);
  const visible = 3;
  const maxOffset = Math.max(0, templates.length - visible);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">2. Choose signature template</h2>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOffset(Math.max(0, offset - 1))}
          disabled={offset === 0}
          className="shrink-0 rounded-full p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="grid grid-cols-3 gap-3 flex-1">
          {templates.slice(offset, offset + visible).map((t) => (
            <div key={t.id} onClick={() => onSelect(t.id)}>
              <TemplatePreviewMini template={t} isSelected={selected === t.id} logoBase64={logoBase64}  />
            </div>
          ))}
        </div>
        <button
          onClick={() => setOffset(Math.min(maxOffset, offset + 1))}
          disabled={offset >= maxOffset}
          className="shrink-0 rounded-full p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
        >
          <ChevronRight size={24} />
        </button>
      </div>
      <button className="text-sm text-primary hover:underline mx-auto block">More templates</button>
    </div>
  );
};

export default TemplateCarousel;
