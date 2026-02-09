import { useState, useCallback } from "react";
import { Info, RefreshCw, Plus, ChevronLeft, Sparkles, Send, Calendar, TestTube, FileSpreadsheet, X, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { sendMailMerge } from "@/lib/mailMerge";
import { useAuth } from "@/context/AuthContext";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
interface Template {
  id: string;
  name: string;
}
interface StartMergeDialogProps {
  templates: Template[];
  // onStartMerge: (config: MergeConfig) => void;
  onStartMerge: (payload: StartMergePayload) => void;
  children: React.ReactNode;
}
export interface StartMergePayload {
  fileName: string;
  templateId: string;
  sender: {
    name: string;
    email: string;
    replyTo?: string;
  };
  trackEmails: boolean;
  scheduledAt?: Date;
  recipients: {
    email: string;
    variables: {
      firstname?: string;
      lastname?: string;
      unsubscribe_link?: string;
    };
  }[];
}

export interface MergeConfig {
  emailColumn: string;
  firstNameColumn: string;
  lastNameColumn: string;
  unsubscribeColumn: string;
  senderName: string;
  templateId: string;
  trackEmails: boolean;
  sendFrom: string;
  sheetFilterEnabled: boolean;
  replyToAddress: string;
  personalizedAttachments: boolean;
  unsubscribeLink: boolean;
  polls: boolean;
  recipientCount: number;
  fileName: string;
  scheduledAt?: Date;
}

interface ParsedCSV {
  headers: string[];
  rows: string[][];
  recordCount: number;
}
const senderEmails = ["rahulknit007@gmail.com", "support@company.com", "noreply@company.com"];

const NONE_VALUE = "__none__";

export const StartMergeDialog = ({
  templates,
  onStartMerge,
  children
}: StartMergeDialogProps) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedCSV | null>(null);
  const { getUserDetails } = useAuth();
  const users = getUserDetails();
  console.log(getUserDetails(), 'rahul tripathi')
  const [config, setConfig] = useState<MergeConfig>({
    emailColumn: "",
    firstNameColumn: "",
    lastNameColumn: "",
    unsubscribeColumn: "",
    senderName: "",
    templateId: "",
    trackEmails: true,
    sendFrom: senderEmails[0],
    sheetFilterEnabled: true,
    replyToAddress: "",
    personalizedAttachments: false,
    unsubscribeLink: false,
    polls: false,
    recipientCount: 0,
    fileName: "",
  });

  const handleUpgrade = () => {
    window.location.href = "/plans";
  };

  const handleSendTestEmail = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/google/send-mail`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accessToken: '', // <-- Gmail OAuth token
            from: config.sendFrom,
            to: config.sendFrom,
            // "test@example.com",
            templateId: config.templateId,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to send email");
      }
      alert("Test email sent successfully");
    } catch (error) {
      console.error("Failed to send test email:", error);
      alert(error.message);
    }
  };


  const handleSchedule = async () => {
    const date = prompt("Enter schedule date (YYYY-MM-DD HH:mm)");
    if (!date) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/google/send-mail`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accessToken: "", // Gmail OAuth token
            from: config.sendFrom,
            to: config.sendFrom,
            templateId: config.templateId,
            scheduledAt: new Date(date).toISOString(), // 👈 key difference
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to schedule email");
      }

      alert("Email scheduled successfully 🕒");
      setOpen(false);
      resetDialog();
    } catch (error) {
      console.error("Failed to schedule email:", error);
      alert(error.message);
    }
  };

  const parseCSV = useCallback((text: string): ParsedCSV => {
    const lines = text.trim().split('\n');

    // detect delimiter
    const delimiter = lines[0].includes('\t') ? '\t' : ',';

    const headers = lines[0]
      .split(delimiter)
      .map(h => h.trim().replace(/^"|"$/g, ''))
      .filter(Boolean); // ⬅️ remove empty headers

    const rows = lines.slice(1).map(line =>
      line
        .split(delimiter)
        .map(cell => cell.trim().replace(/^"|"$/g, ''))
    );

    return {
      headers,
      rows,
      recordCount: rows.length,
    };
  }, []);

  const autoDetectColumns = (headers: string[]) => {
    const normalize = (h: string) => h.toLowerCase().replace(/\s|_/g, "");

    const findHeader = (candidates: string[]) =>
      headers.find(h =>
        candidates.some(c => normalize(h).includes(c))
      ) || "";

    return {
      emailColumn: findHeader(["email", "emailaddress"]),
      firstNameColumn: findHeader(["firstname", "fname", "first"]),
      lastNameColumn: findHeader(["lastname", "lname", "last"]),
      unsubscribeColumn: findHeader(["unsubscribe", "optout", "subscription"]),
    };
  };

  const handleFileSelect = useCallback(async (file: File) => {
    setCsvFile(file);
    setIsProcessing(true);
    setProcessingProgress(0);

    const progressInterval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 100);

    try {
      const text = await file.text();
      const parsed = parseCSV(text);
      const detected = autoDetectColumns(parsed.headers);
      clearInterval(progressInterval);
      setProcessingProgress(100);

      setTimeout(() => {
        setParsedData(parsed);
        setConfig(prev => ({
          ...prev,
          ...detected,
          recipientCount: parsed.recordCount,
          fileName: file.name,
        }));
        setIsProcessing(false);
      }, 300);
    } catch (error) {
      clearInterval(progressInterval);
      setIsProcessing(false);
      console.error("Error parsing CSV:", error);
    }
  }, [parseCSV]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.type === "text/csv" || file.name.endsWith('.csv'))) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);
  const buildRecipients = useCallback(() => {
    if (!parsedData) return [];

    const emailIdx = parsedData.headers.indexOf(config.emailColumn);
    const fnIdx = parsedData.headers.indexOf(config.firstNameColumn);
    const lnIdx = parsedData.headers.indexOf(config.lastNameColumn);
    const unsubIdx = parsedData.headers.indexOf(config.unsubscribeColumn);

    return parsedData.rows
      .filter(row => row[emailIdx]) // safety
      .map(row => ({
        email: row[emailIdx],
        variables: {
          firstname: fnIdx !== -1 ? row[fnIdx] : undefined,
          lastname: lnIdx !== -1 ? row[lnIdx] : undefined,
          unsubscribe_link:
            unsubIdx !== -1 && row[unsubIdx] === "1"
              ? undefined
              : `https://app.com/unsubscribe?email=${encodeURIComponent(row[emailIdx])}`,
        },
      }));
  }, [parsedData, config]);
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleNext = () => {
    if (step === 1 && config.emailColumn && parsedData) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
  };

  // const handleStartMerge = () => {
  //   onStartMerge(config);
  //   setOpen(false);
  //   resetDialog();
  // };
  const handleStartMerge = async () => {
    if (!parsedData) return;
    const startpayload = {
      fileName: config.fileName,
      templateId: config.templateId,

      sender: {
        name: config.senderName,
        email: config.sendFrom,
        replyTo: config.replyToAddress || undefined,
      },

      trackEmails: config.trackEmails,
      scheduledAt: config.scheduledAt,

      recipients: buildRecipients(),
    };


    try {
      const data = await sendMailMerge(startpayload);

      console.log("Mail merge started:", data);

      alert(
        `Mail merge started for ${startpayload.recipients.length} recipients 🚀`
      );
      onStartMerge(startpayload);
      setOpen(false);
      resetDialog();
    } catch (err: any) {
      console.error("Mail merge failed:", err);

      alert(
        err?.response?.data?.message ||
        "Failed to start mail merge. Please try again."
      );
    }
    // onStartMerge(startpayload);
    // setOpen(false);
    // resetDialog();
  };

  const resetDialog = () => {
    setStep(1);
    setAdvancedOpen(false);
    setCsvFile(null);
    setParsedData(null);
    setIsProcessing(false);
    setProcessingProgress(0);
    setConfig({
      emailColumn: "",
      firstNameColumn: "",
      lastNameColumn: "",
      unsubscribeColumn: "",
      senderName: "",
      templateId: "",
      trackEmails: true,
      sendFrom: senderEmails[0],
      sheetFilterEnabled: true,
      replyToAddress: "",
      personalizedAttachments: false,
      unsubscribeLink: false,
      polls: false,
      recipientCount: 0,
      fileName: "",
    });
  };

  const updateConfig = <K extends keyof MergeConfig>(key: K, value: MergeConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const clearFile = () => {
    setCsvFile(null);
    setParsedData(null);
    setConfig(prev => ({
      ...prev,
      emailColumn: "",
      firstNameColumn: "",
      lastNameColumn: "",
      unsubscribeColumn: "",
      recipientCount: 0,
      fileName: "",
    }));
  };

  const getColumnLetter = (index: number) => String.fromCharCode(65 + index);

  const getMappedColumnsCount = () => {
    let count = 0;
    if (config.emailColumn) count++;
    if (config.firstNameColumn) count++;
    if (config.lastNameColumn) count++;
    if (config.unsubscribeColumn) count++;
    return count;
  };
  useEffect(() => {
    if (users?.name && users?.email) {
      updateConfig(
        "senderName",
        `${users.name} <${users.email}>`
      );
    }
  }, []);
  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetDialog();
    }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Start Mail Merge
          </DialogTitle>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`h-7 w-7 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${step >= s
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
                }`}>
                {step > s ? <Check className="h-4 w-4" /> : s}
              </div>
              {s < 3 && <div className={`h-0.5 w-8 ${step > s ? 'bg-primary' : 'bg-muted'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: File Upload & Column Mapping */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            {/* File Upload Section */}
            {!csvFile ? (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 hover:bg-muted/50 transition-all cursor-pointer"
              >
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileInput}
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm font-medium">Drop your spreadsheet here</p>
                  <p className="text-xs text-muted-foreground mt-1">or click to browse (CSV format)</p>
                </label>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileSpreadsheet className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <span className="text-sm font-medium truncate block max-w-[250px]">{csvFile.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {(csvFile.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={clearFile}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {isProcessing ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Processing spreadsheet...</span>
                      <span>{processingProgress}%</span>
                    </div>
                    <Progress value={processingProgress} className="h-2" />
                  </div>
                ) : parsedData && (
                  <div className="flex items-center gap-4 text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
                    <span className="flex items-center gap-1.5">
                      <span className="font-semibold text-foreground">{parsedData.headers.length}</span> columns
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="font-semibold text-foreground">{parsedData.recordCount}</span> records
                    </span>
                  </div>
                )}
              </div>
            )}

            {parsedData && (
              <>
                <Alert className="bg-primary/5 border-primary/20">
                  <Info className="h-4 w-4 text-primary" />
                  <AlertDescription className="text-sm">
                    Map your spreadsheet columns to merge fields below.
                  </AlertDescription>
                </Alert>

                {/* Column Mapping Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Email Column - Required */}
                  <div className="space-y-1.5">
                    <Label className="text-xs flex items-center gap-1">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={config.emailColumn}
                      onValueChange={(val) => updateConfig("emailColumn", val)}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        {parsedData.headers.map((header, index) => (
                          <SelectItem key={index} value={header}>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">
                                {getColumnLetter(index)}
                              </span>
                              <span className="truncate">{header}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* First Name Column */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">First Name</Label>
                    <Select
                      value={(config.firstNameColumn ?? -1).toString()}
                      onValueChange={(val) => updateConfig("firstNameColumn", val === NONE_VALUE ? "" : val)}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE_VALUE}>
                          <span className="text-muted-foreground">None</span>
                        </SelectItem>
                        {parsedData.headers.map((header, index) => (
                          <SelectItem key={index} value={header}>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">
                                {getColumnLetter(index)}
                              </span>
                              <span className="truncate">{header}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Last Name Column */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">Last Name</Label>
                    <Select
                      value={config.lastNameColumn || NONE_VALUE}
                      onValueChange={(val) => updateConfig("lastNameColumn", val === NONE_VALUE ? "" : val)}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE_VALUE}>
                          <span className="text-muted-foreground">None</span>
                        </SelectItem>
                        {parsedData.headers.map((header, index) => (
                          <SelectItem key={index} value={header}>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">
                                {getColumnLetter(index)}
                              </span>
                              <span className="truncate">{header}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Unsubscribe Column */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">Unsubscribe Status</Label>
                    <Select
                      value={config.unsubscribeColumn || NONE_VALUE}
                      onValueChange={(val) => updateConfig("unsubscribeColumn", val === NONE_VALUE ? "" : val)}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE_VALUE}>
                          <span className="text-muted-foreground">None</span>
                        </SelectItem>
                        {parsedData.headers.map((header, index) => (
                          <SelectItem key={index} value={header}>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">
                                {getColumnLetter(index)}
                              </span>
                              <span className="truncate">{header}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {config.emailColumn && (
                  <div className="bg-success/10 border border-success/20 rounded-lg p-3">
                    <p className="text-sm text-success flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      <span>
                        Ready to send to <span className="font-semibold">{parsedData.recordCount}</span> recipients
                        {getMappedColumnsCount() > 1 && (
                          <span className="text-muted-foreground ml-1">
                            ({getMappedColumnsCount()} columns mapped)
                          </span>
                        )}
                      </span>
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleNext}
                  disabled={!config.emailColumn}
                  className="w-full"
                >
                  Continue to Settings
                </Button>
              </>
            )}
          </div>
        )}

        {/* Step 2: Main Settings */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <Alert className="bg-muted border-border">
              <Info className="h-4 w-4 text-muted-foreground" />
              <AlertDescription className="text-sm flex items-center justify-between">
                Rows with a valid merge status will be skipped.
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </AlertDescription>
            </Alert>

            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              <p className="text-muted-foreground">
                Sending to <span className="font-semibold text-foreground">{config.recipientCount}</span> recipients
                using column <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{config.emailColumn}</span>
                {" "}
                <button onClick={() => setStep(1)} className="text-primary hover:underline text-xs ml-1">
                  change
                </button>
              </p>
              {(config.firstNameColumn || config.lastNameColumn) && (
                <p className="text-xs text-muted-foreground mt-1">
                  Personalization:
                  {config.firstNameColumn && <span className="ml-1">{config.firstNameColumn}</span>}
                  {config.firstNameColumn && config.lastNameColumn && <span>,</span>}
                  {config.lastNameColumn && <span className="ml-1">{config.lastNameColumn}</span>}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Sender Name</Label>
              <Input
                value={config.senderName}
                onChange={(e) => updateConfig("senderName", e.target.value)}
                placeholder="Enter sender name"
              />
            </div>

            <div className="space-y-2">
              <Label>Email Template</Label>
              <div className="flex gap-2">
                <Select
                  value={config.templateId}
                  onValueChange={(val) => updateConfig("templateId", val)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="track-emails"
                checked={config.trackEmails}
                onCheckedChange={(checked) => updateConfig("trackEmails", checked as boolean)}
              />
              <Label htmlFor="track-emails" className="text-sm font-normal cursor-pointer">
                Track emails opened, clicked, or bounced
              </Label>
            </div>

            <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="p-0 h-auto text-primary hover:text-primary/80 hover:bg-transparent text-sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Alias, filters, personalized attachments...
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setStep(3)}
                >
                  Configure Advanced Options
                </Button>
              </CollapsibleContent>
            </Collapsible>

            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={handleUpgrade}>
                <Sparkles className="h-4 w-4" />
                Upgrade
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={handleSendTestEmail}>
                <TestTube className="h-4 w-4" />
                Test
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={handleSchedule}>
                <Calendar className="h-4 w-4" />
                Schedule
              </Button>
              <Button
                onClick={handleStartMerge}
                disabled={!config.senderName || !config.templateId}
                size="sm"
                className="gap-1.5 ml-auto"
              >
                <Send className="h-4 w-4" />
                Send {config.recipientCount} emails
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Advanced Options */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-2">
              <Label>Send from</Label>
              <Select
                value={config.sendFrom}
                onValueChange={(val) => updateConfig("sendFrom", val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {senderEmails.map((email) => (
                    <SelectItem key={email} value={email}>
                      {email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between py-2">
              <Label>Sheet filter</Label>
              <div className="flex items-center gap-2">
                <div className={`h-5 w-5 rounded-full flex items-center justify-center ${config.sheetFilterEnabled ? 'bg-success text-success-foreground' : 'bg-muted'
                  }`}>
                  {config.sheetFilterEnabled && <Check className="h-3 w-3" />}
                </div>
                <span className="text-sm">{config.sheetFilterEnabled ? "Enabled" : "Disabled"}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Reply-to address</Label>
              <Input
                value={config.replyToAddress}
                onChange={(e) => updateConfig("replyToAddress", e.target.value)}
                placeholder="Optional reply-to email"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <Label>Personalized attachments</Label>
              <span className="text-sm text-muted-foreground">Checking permissions...</span>
            </div>

            <div className="flex items-center justify-between py-2">
              <Label>Unsubscribe link</Label>
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground text-xs">○</span>
                </div>
                <span className="text-sm">Disabled</span>
                <a href="#" className="text-primary hover:underline text-sm">Set up</a>
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <Label>YAMM Polls</Label>
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground text-xs">○</span>
                </div>
                <span className="text-sm">Disabled</span>
                <a href="#" className="text-primary hover:underline text-sm">Set up</a>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t">
              <Button variant="outline" onClick={handleBack} className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              <Button onClick={() => setStep(2)} className="flex-1">
                Save & Continue
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
