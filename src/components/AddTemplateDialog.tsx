import { useEffect, useState, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  FileText, 
  Mail, 
  AlignLeft, 
  Braces, 
  Info, 
  Sparkles 
} from "lucide-react";
import RichTextEditor from '@/components/RichTextEditor';

interface AddTemplateDialogProps {
  open: boolean;
  mode: "create" | "edit";
  initialData?: {
    name: string;
    subject: string;
    body: string;
  };
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    name: string;
    subject: string;
    body: string;
  }) => Promise<void> | void;
}

const AddTemplateDialog = ({
  open,
  mode,
  initialData,
  onOpenChange,
  onSubmit,
}: AddTemplateDialogProps) => {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  
  // Track if we have already initialized the data to prevent loops
  const isInitialized = useRef(false);

  const QUICK_TAGS = ["name", "position", "company", "interview_date", "location"];

  /* 🛠️ STABILIZED INITIALIZATION */
  useEffect(() => {
    if (open && !isInitialized.current) {
      if (mode === "edit" && initialData) {
        setName(initialData.name || "");
        setSubject(initialData.subject || "");
        setBody(initialData.body || "");
      } else {
        setName("");
        setSubject("");
        setBody("");
      }
      isInitialized.current = true;
    }

    // Reset initialization tracker when dialog closes
    if (!open) {
      isInitialized.current = false;
    }
  }, [open, mode, initialData]);

  /* 🛠️ MEMOIZED TAG INSERTION */
  const handleInsertTag = useCallback((tag: string) => {
    const formattedTag = ` {{${tag}}} `;
    setBody((prev) => {
      // If using HTML-based editor, insert before the closing paragraph
      if (prev.includes("</p>")) {
        return prev.replace(/<\/p>$/, `${formattedTag}</p>`);
      }
      return prev + formattedTag;
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !subject.trim()) return;

    await onSubmit({
      name: name.trim(),
      subject: subject.trim(),
      body: body.trim(),
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden rounded-xl border-none shadow-2xl">
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 px-8 py-6 flex-shrink-0">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
              <Mail className="h-6 w-6" />
              {mode === "create" ? "New Mail Template" : "Update Template"}
            </DialogTitle>
            <DialogDescription className="text-blue-100 mt-1">
              Design your personalized outreach. Use <b>{"{{tag}}"}</b> for dynamic content.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable Form Area */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden bg-white">
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            
            {/* Template & Subject Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" /> Template Name
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sales Follow-up"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-600" /> Subject Line
                </Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Hello {{name}}, checking in!"
                  required
                />
              </div>
            </div>

            {/* Quick Insert Toolbar */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <Braces className="h-3 w-3" /> Insert Dynamic Tag
                </span>
                <span className="text-[10px] text-slate-400 italic flex items-center gap-1">
                  <Info className="h-3 w-3" /> Adds tag to end of body
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_TAGS.map((tag) => (
                  <Button
                    key={tag}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleInsertTag(tag)}
                    className="h-8 bg-white text-xs font-mono border-slate-200 hover:border-blue-500 hover:text-blue-600"
                  >
                    {"{{"}{tag}{"}}"}
                  </Button>
                ))}
              </div>
            </div>

            {/* Editor Container */}
            <div className="space-y-2 flex flex-col flex-1 min-h-[300px]">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <AlignLeft className="h-4 w-4 text-blue-600" /> Email Body
              </Label>
              <div className="flex-1 border rounded-lg overflow-hidden shadow-inner bg-slate-50">
                <RichTextEditor 
                  value={body} 
                  onChange={setBody} 
                  placeholder="Write your email here..." 
                />
              </div>
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="bg-slate-50 px-8 py-4 flex justify-end gap-3 border-t flex-shrink-0">
            <Button variant="ghost" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 px-8 shadow-md">
              {mode === "create" ? "Create Template" : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTemplateDialog;