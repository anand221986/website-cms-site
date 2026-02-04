import { Eye } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
}

interface TemplateSelectorProps {
  templates: Template[];
  selectedTemplate?: string;
  onSelect: (templateId: string) => void;
}

export const TemplateSelector = ({ templates, selectedTemplate, onSelect }: TemplateSelectorProps) => {
  const currentTemplate = templates.find(t => t.id === selectedTemplate);

  return (
    <div className="flex items-center gap-3">
      <Select value={selectedTemplate} onValueChange={onSelect}>
        <SelectTrigger className="w-[220px] bg-card">
          <SelectValue placeholder="Select Template" />
        </SelectTrigger>
        <SelectContent>
          {templates.map((template) => (
            <SelectItem key={template.id} value={template.id}>
              {template.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {currentTemplate && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" className="bg-card">
              <Eye className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Template Preview: {currentTemplate.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Subject</label>
                <div className="mt-1 p-3 bg-muted rounded-lg text-sm">
                  {currentTemplate.subject}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Body</label>
                <div className="mt-1 p-4 bg-muted rounded-lg text-sm whitespace-pre-wrap min-h-[200px]">
                  {currentTemplate.body}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
