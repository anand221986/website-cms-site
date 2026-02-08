import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SIGNATURE_TEMPLATES, SignatureTemplate } from "@/types/signature";
import { motion } from "framer-motion";
import { useState } from "react";

interface TemplateCarouselProps {
  selectedTemplate: string;
  onSelect: (templateId: string) => void;
}

const TemplateCarousel = ({ selectedTemplate, onSelect }: TemplateCarouselProps) => {
  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = 4;

  const canScrollLeft = startIndex > 0;
  const canScrollRight = startIndex + visibleCount < SIGNATURE_TEMPLATES.length;

  const scrollLeft = () => {
    if (canScrollLeft) setStartIndex(startIndex - 1);
  };

  const scrollRight = () => {
    if (canScrollRight) setStartIndex(startIndex + 1);
  };

  const visibleTemplates = SIGNATURE_TEMPLATES.slice(startIndex, startIndex + visibleCount);

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border">
      <h2 className="text-lg font-semibold text-center mb-4 ">
        2. Choose signature template
      </h2>
      
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={scrollLeft}
          disabled={!canScrollLeft}
          className="shrink-0"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        <div className="flex gap-4 flex-1 justify-center">
          {visibleTemplates.map((template) => (
            <motion.div
              key={template.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(template.id)}
              className={`template-card p-4 w-36 h-28 flex flex-col items-center justify-center gap-2 ${
                selectedTemplate === template.id ? 'selected' : ''
              }`}
            >
              <span className="text-3xl">{template.preview}</span>
              <span className="text-sm font-medium text-muted-foreground">
                {template.name}
              </span>
            </motion.div>
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={scrollRight}
          disabled={!canScrollRight}
          className="shrink-0"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      <p className="text-center mt-4 text-sm text-secondary cursor-pointer hover:underline">
        More templates
      </p>
    </div>
  );
};

export default TemplateCarousel;
