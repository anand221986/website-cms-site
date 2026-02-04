import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Trash2, Download, CheckCircle, X } from "lucide-react";
import { useState } from "react";

const Unsubscriptions = () => {
  const [emailInput, setEmailInput] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [unsubscribedEmails, setUnsubscribedEmails] = useState<
  { email: string; date: string }[]
>([]);
const handleUnsubscribe = () => {
  if (!emailInput.trim()) return;

  const emails = emailInput
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  const newEntries = emails.map((email) => ({
    email,
    date: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  }));

  setUnsubscribedEmails((prev) => [...newEntries, ...prev]);
  setShowSuccess(true);
  setEmailInput("");
};
const handleDelete = (email: string) => {
  setUnsubscribedEmails((prev) =>
    prev.filter((item) => item.email !== email)
  );
};


  return (
    <Layout>
      <div className="max-w-5xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold text-slate-800">
            Unsubscriptions
          </h1>
          <p className="text-slate-500 mt-1">
            The list of recipients who have unsubscribed from your emails.
          </p>
        </div>

        {/* Input Row */}
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Enter email addresses separated by commas"
            className="max-w-md"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
          />

          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleUnsubscribe}>
            Unsubscribe
          </Button>

          <div className="ml-auto">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export to CSV
            </Button>
          </div>
        </div>

        {/* Success Alert */}
{showSuccess && (
  <>
    {/* Success Alert */}
    <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3">
      <div className="flex items-center gap-2 text-green-700 text-sm">
        <CheckCircle className="w-4 h-4" />
        {unsubscribedEmails.length} email address
        {unsubscribedEmails.length > 1 ? "es" : ""} successfully unsubscribed.
      </div>
      <button onClick={() => setShowSuccess(false)}>
        <X className="w-4 h-4 text-green-700" />
      </button>
    </div>

    {/* List Header */}
    {unsubscribedEmails.length > 0 &&
    <div className="grid grid-cols-12 text-sm text-slate-500 px-4">
      <div className="col-span-6 font-medium">EMAIL ADDRESS</div>
      <div className="col-span-4 font-medium">DATE</div>
      <div className="col-span-2 text-right font-medium">DELETE</div>
    </div>
}

    {/* List Items */}
    {unsubscribedEmails.map((item, idx) => (
      <Card key={idx} className="p-4">
        <div className="grid grid-cols-12 items-center">
          <div className="col-span-6 text-slate-800">
            {item.email}
          </div>
          <div className="col-span-4 text-slate-600">
            {item.date}
          </div>
          <div className="col-span-2 flex justify-end">
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-500 hover:text-red-600"
              onClick={() => handleDelete(item.email)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    ))}
  </>
)}

      </div>
    </Layout>
  );
};

export default Unsubscriptions;
