import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText, Mail, AlignLeft } from "lucide-react";
import RichTextEditor from '@/components/RichTextEditor'

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

  /* ---------- Sync data for edit / reset for create ---------- */
  useEffect(() => {
    if (open && mode === "edit" && initialData) {
      setName(initialData.name);
      setSubject(initialData.subject);
      setBody(initialData.body);
    }

    if (open && mode === "create") {
      setName("");
      setSubject("");
      setBody("");
    }
  }, [open, mode, initialData]);

  /* ---------- Submit ---------- */
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
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-5">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-primary-foreground flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {mode === "create" ? "Add New Template" : "Edit Template"}
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/80 text-sm">
              {mode === "create"
                ? "Create a reusable email template for your campaigns"
                : "Update your email template details"}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Template Name
            </Label>
            <Input
              placeholder="e.g. Welcome Email"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Email Subject
            </Label>
            <Input
              placeholder="Enter subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          {/* Body */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <AlignLeft className="h-4 w-4 text-muted-foreground" />
              Email Body
            </Label>
            {/* <Textarea
              placeholder="Write your email content..."
              className="min-h-[140px]"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            /> */}
            <RichTextEditor value={body} onChange={setBody} placeholder="Write your email body here..." />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {mode === "create" ? "Create Template" : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTemplateDialog;
