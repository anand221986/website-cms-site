import { useState, useEffect, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface Lead {
  id: number;
  first_name?: string | null;
  last_name?: string | null;
  email: string;
  phone: string;
  source: string;
  status: string;
  assigned_to?: number;
  notes?: string;
  company_name?: string;
  role_to_hire?: string;
  requirements?: string;
  created_at?: string;
  updated_at?: string;
}

interface LeadsViewListProps {
  loading: boolean;
  fetchLeads: () => Promise<void>;
  leads: Lead[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function LeadsViewList({ loading, fetchLeads, leads }: LeadsViewListProps) {
  const [localLeads, setLocalLeads] = useState<Lead[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const [open, setOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  useEffect(() => {
    setLocalLeads(leads);
  }, [leads]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return localLeads.slice(start, start + itemsPerPage);
  }, [localLeads, currentPage]);

  const totalPages = Math.ceil(localLeads.length / itemsPerPage);

  const toggleOne = (id: number) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    if (paginated.every(p => selected.has(p.id))) {
      const next = new Set(selected);
      paginated.forEach(p => next.delete(p.id));
      setSelected(next);
    } else {
      setSelected(prev => new Set([...prev, ...paginated.map(p => p.id)]));
    }
  };

  const handleEditClick = (lead: Lead) => {
    setEditingLead(lead);
    setOpen(true);
  };

  const getLeadName = (lead: Lead) => {
    const first = lead.first_name || "";
    const last = lead.last_name || "";
    return `${first} ${last}`.trim() || "-";
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${API_BASE_URL}/leads/${id}`);
      toast.success("Lead deleted successfully");
      fetchLeads();
    } catch (err) {
      toast.error("Failed to delete lead");
      console.error(err);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingLead) return;

    const payload = {
      first_name: editingLead.first_name,
      last_name: editingLead.last_name,
      email: editingLead.email,
      phone: editingLead.phone,
      status: editingLead.status,
      source: editingLead.source,
      remark: editingLead.notes, // map notes to remark if needed by backend
      role_to_hire: editingLead.role_to_hire,
      requirements: editingLead.requirements,
      company_name: editingLead.company_name,
      assigned_to: editingLead.assigned_to,
    };

    try {
      await axios.put(`${API_BASE_URL}/leads/${editingLead.id}`, payload);
      toast.success("Lead updated successfully");
      setOpen(false);
      fetchLeads();
    } catch (err) {
      toast.error("Failed to update lead");
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Checkbox
                checked={paginated.every(p => selected.has(p.id))}
                onCheckedChange={toggleAll}
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead>Company Name</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={11} className="text-center">Loading...</TableCell>
            </TableRow>
          ) : paginated.length === 0 ? (
            <TableRow>
              <TableCell colSpan={11} className="text-center">No Leads found</TableCell>
            </TableRow>
          ) : paginated.map(lead => (
            <TableRow key={lead.id}>
              <TableCell>
                <Checkbox
                  checked={selected.has(lead.id)}
                  onCheckedChange={() => toggleOne(lead.id)}
                />
              </TableCell>
              <TableCell>{getLeadName(lead)}</TableCell>
              <TableCell>{lead.email}</TableCell>
              <TableCell>{lead.phone}</TableCell>
              <TableCell>{lead.source}</TableCell>
              <TableCell>{lead.status}</TableCell>
              <TableCell>{lead.notes}</TableCell>
              <TableCell>{lead.company_name}</TableCell>
              <TableCell>{lead.role_to_hire}</TableCell>
              <TableCell>{lead.created_at ? new Date(lead.created_at).toLocaleString() : "-"}</TableCell>
              <TableCell className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEditClick(lead)}>
                  <Edit className="w-3 h-3 mr-1" /> Edit
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(lead.id)}>
                  <Trash2 className="w-3 h-3 mr-1" /> Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-2">
          <Button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
            <Button key={n} variant={currentPage === n ? "default" : "outline"} onClick={() => setCurrentPage(n)}>{n}</Button>
          ))}
          <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
          </DialogHeader>

          {editingLead && (
            <div className="space-y-2">
              <input
                type="text"
                className="border p-2 w-full rounded"
                value={editingLead.first_name || ""}
                onChange={e => setEditingLead({ ...editingLead, first_name: e.target.value })}
                placeholder="First Name"
              />
              <input
                type="text"
                className="border p-2 w-full rounded"
                value={editingLead.last_name || ""}
                onChange={e => setEditingLead({ ...editingLead, last_name: e.target.value })}
                placeholder="Last Name"
              />
              <input
                type="email"
                className="border p-2 w-full rounded"
                value={editingLead.email}
                onChange={e => setEditingLead({ ...editingLead, email: e.target.value })}
                placeholder="Email"
              />
              <input
                type="text"
                className="border p-2 w-full rounded"
                value={editingLead.phone}
                onChange={e => setEditingLead({ ...editingLead, phone: e.target.value })}
                placeholder="Phone"
              />
              <input
                type="text"
                className="border p-2 w-full rounded"
                value={editingLead.source}
                onChange={e => setEditingLead({ ...editingLead, source: e.target.value })}
                placeholder="Source"
              />
              <input
                type="text"
                className="border p-2 w-full rounded"
                value={editingLead.status}
                onChange={e => setEditingLead({ ...editingLead, status: e.target.value })}
                placeholder="Status"
              />
              <textarea
                className="border p-2 w-full rounded"
                value={editingLead.notes}
                onChange={e => setEditingLead({ ...editingLead, notes: e.target.value })}
                placeholder="Notes"
              />
            </div>
          )}

          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
