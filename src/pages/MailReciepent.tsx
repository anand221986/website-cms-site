import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Recipient {
  id: number;
  email: string;
  status: string;
  message_id: string | null;
  error_message: string | null;
  created_at: string;
}

const MailRecipient = () => {
  const { jobId } = useParams();

  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(false);

  /** ✅ Pagination */
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  /** ---------------- FETCH ---------------- */
  const fetchRecipients = async () => {
    if (!jobId) return;

    setLoading(true);
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/email/merge-recipients/${jobId}?page=${page}&limit=${limit}`
      );

      setRecipients(data.result || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load recipients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipients();
  }, [jobId, page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <Layout>
      <div className="p-6">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold">
            Mail Recipients (Job ID: {jobId})
          </h1>
        </div>

        {/* TABLE */}
        <div className="border rounded-lg bg-card">

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Message ID</TableHead>
                <TableHead>Error</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : recipients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No recipients found
                  </TableCell>
                </TableRow>
              ) : (
                recipients.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.id}</TableCell>
                    <TableCell>{r.email}</TableCell>
                    <TableCell>
                      <span
    className={`px-2 py-1 rounded text-xs font-medium text-white ${
      r.status?.toUpperCase() === "SUCCESS"
        ? "bg-green-500"
        : r.status?.toUpperCase() === "PENDING"
        ? "bg-yellow-500"
        : "bg-gray-400"
    }`}
  >
    {r.status?.toUpperCase() || "UNKNOWN"}
  </span>
                    </TableCell>
                    <TableCell>{r.message_id || "-"}</TableCell>
                    <TableCell className="text-red-500">
                      {r.error_message || "-"}
                    </TableCell>
                    <TableCell>
                      {new Date(r.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* PAGINATION */}
          <div className="flex justify-end items-center gap-3 p-4">
            <Button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </Button>

            <span className="text-sm">
              Page {page} of {totalPages || 1}
            </span>

            <Button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MailRecipient;