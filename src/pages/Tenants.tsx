import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* =========================
   Interfaces
========================= */
interface Tenant {
  id: number;
  name: string;
  domain: string;
  is_active: boolean;
  created_at: string;
}

interface TenantApiResponse {
  status: boolean;
  message: string;
  result: Tenant[];
  total: number;
}

/* =========================
   Component
========================= */
const TenantsPage = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);

  // pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  // form
  const [open, setOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [form, setForm] = useState({
    name: "",
    domain: "",
    is_active: true,
  });

  /* =========================
     Fetch Tenants
  ========================= */
  const fetchTenants = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get<TenantApiResponse>(
        `${API_BASE_URL}/tenants?page=${page}&limit=${limit}`
      );
      setTenants(data.result);
      setTotal(data.total);
    } catch (err) {
      console.error("Fetch tenants error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, [page]);

  /* =========================
     Add / Update Tenant
  ========================= */
  const handleSubmit = async () => {
    try {
      if (editingTenant) {
        await axios.put(`${API_BASE_URL}/tenants/${editingTenant.id}`, form);
      } else {
        await axios.post(`${API_BASE_URL}/tenants`, form);
      }
      resetForm();
      fetchTenants();
    } catch (err) {
      console.error("Save tenant error:", err);
    }
  };

  /* =========================
     Delete Tenant
  ========================= */
  const deleteTenant = async (id: number) => {
    if (!confirm("Are you sure you want to delete this tenant?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/tenants/${id}`);
      fetchTenants();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  /* =========================
     Helpers
  ========================= */
  const openEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setForm({
      name: tenant.name,
      domain: tenant.domain,
      is_active: tenant.is_active,
    });
    setOpen(true);
  };

  const resetForm = () => {
    setForm({ name: "", domain: "", is_active: true });
    setEditingTenant(null);
    setOpen(false);
  };

  const totalPages = Math.ceil(total / limit);

  /* =========================
     UI
  ========================= */
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Tenant Management</h1>
          <button
            onClick={() => setOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            + Add Tenant
          </button>
        </div>

        {/* Table */}
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="min-w-full border">
            <thead className="bg-slate-100">
              <tr>
                <th className="border px-4 py-2">ID</th>
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Domain</th>
                <th className="border px-4 py-2">Active</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-6">
                    Loading...
                  </td>
                </tr>
              ) : tenants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6">
                    No tenants found
                  </td>
                </tr>
              ) : (
                tenants.map((t) => (
                  <tr key={t.id}>
                    <td className="border px-4 py-2">{t.id}</td>
                    <td className="border px-4 py-2">{t.name}</td>
                    <td className="border px-4 py-2">{t.domain}</td>
                    <td className="border px-4 py-2">
                      {t.is_active ? "Yes" : "No"}
                    </td>
                    <td className="border px-4 py-2 space-x-2">
                      <button
                        onClick={() => openEdit(t)}
                        className="text-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteTenant(t.id)}
                        className="text-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-end gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 border rounded"
          >
            Prev
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 border rounded"
          >
            Next
          </button>
        </div>

        {/* Modal */}
        {open && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white p-6 rounded w-96 space-y-4">
              <h2 className="text-xl font-semibold">
                {editingTenant ? "Edit Tenant" : "Add Tenant"}
              </h2>

              <input
                placeholder="Name"
                className="w-full border px-3 py-2"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />

              <input
                placeholder="Domain"
                className="w-full border px-3 py-2"
                value={form.domain}
                onChange={(e) =>
                  setForm({ ...form, domain: e.target.value })
                }
              />

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) =>
                    setForm({ ...form, is_active: e.target.checked })
                  }
                />
                Active
              </label>

              <div className="flex justify-end gap-2">
                <button onClick={resetForm} className="px-3 py-1 border">
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-3 py-1 bg-blue-600 text-white"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TenantsPage;
