import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, UserCheck, Download, Edit, Trash } from "lucide-react";
import axios from "axios";
import { saveAs } from "file-saver";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* ===================== TYPES ===================== */

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string | null;
  pin_code: number | null;
  state: string | null;
  profile_pic: string | null;
  status: number;
  created_dt: string;
  role: string;
  agency_id: string | null;
}

interface Tenant {
  id: number;
  name: string;
  domain: string;
  is_active: boolean;
}

/* ===================== COMPONENT ===================== */

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchTenants();
  }, []);

  /* ===================== API ===================== */

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/user/getAllUsers`);
      setUsers(data.result || []);
    } catch {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const fetchTenants = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/tenants`);
      setTenants(data.result || []);
    } catch {
      toast.error("Failed to fetch tenants");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this user?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/user/deleteUser/${id}`);
      setUsers(users.filter((u) => u.id !== id));
      toast.success("User deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleSubmit = async (formData: FormData) => {
    const payload: Partial<User> = {
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      pin_code: Number(formData.get("pin_code")),
      state: formData.get("state") as string,
      role: formData.get("role") as string,
      status: Number(formData.get("status")),
      agency_id: formData.get("agency_id") as string,
    };

    try {
      if (editingUser?.id) {
        await axios.put(`${API_BASE_URL}/user/${editingUser.id}`, payload);
        toast.success("User updated");
      } else {
        await axios.post(`${API_BASE_URL}/user/createUser`, payload);
        toast.success("User added");
      }
      setEditingUser(null);
      fetchUsers();
    } catch {
      toast.error("Save failed");
    }
  };

  /* ===================== EXPORT ===================== */

  const handleExport = () => {
    if (!users.length) return toast.error("No users");

    const csv = [
      ["Name", "Email", "Phone", "Role", "Status", "State", "Pincode"],
      ...users.map((u) => [
        `${u.first_name} ${u.last_name}`,
        u.email,
        u.phone,
        u.role,
        u.status === 1 ? "Active" : "Inactive",
        u.state ?? "",
        u.pin_code ?? "",
      ]),
    ]
      .map((r) => r.map((v) => `"${v}"`).join(","))
      .join("\n");

    saveAs(new Blob([csv]), `users_${Date.now()}.csv`);
  };

  /* ===================== UI ===================== */

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">CMS Users</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-1" /> Export
            </Button>
            <Button onClick={() => setEditingUser({})}>
              <Plus className="w-4 h-4 mr-1" /> Add User
            </Button>
          </div>
        </div>

        {/* Metrics */}
        <Card>
          <CardContent className="flex justify-between">
            <div>
              <p>Total Users</p>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
            <UserCheck />
          </CardContent>
        </Card>

        {/* List */}
        {users.map((u) => (
          <Card key={u.id}>
            <CardContent className="flex justify-between">
              <div>
                <p className="font-semibold">
                  {u.first_name} {u.last_name}
                </p>
                <p className="text-sm">{u.email}</p>
                <p className="text-sm">
                  {u.role} • {u.status === 1 ? "Active" : "Inactive"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditingUser(u)}>
                  <Edit className="w-4 h-4 mr-1" /> Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(u.id)}>
                  <Trash className="w-4 h-4 mr-1" /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

      {/* Modal */}
{editingUser && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
      <h2 className="text-xl font-bold mb-6">
        {editingUser.id ? "Edit User" : "Add User"}
      </h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(new FormData(e.currentTarget));
        }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* First Name */}
        <input
          name="first_name"
          defaultValue={editingUser.first_name}
          placeholder="First Name"
          className="input"
          required
        />

        {/* Last Name */}
        <input
          name="last_name"
          defaultValue={editingUser.last_name}
          placeholder="Last Name"
          className="input"
          required
        />

        {/* Email */}
        <input
          name="email"
          type="email"
          defaultValue={editingUser.email}
          placeholder="Email"
          className="input"
          required
        />

        {/* Phone */}
        <input
          name="phone"
          defaultValue={editingUser.phone}
          placeholder="Phone"
          className="input"
        />

        {/* Address – Full Width */}
        <input
          name="address"
          defaultValue={editingUser.address ?? ""}
          placeholder="Address"
          className="input md:col-span-2"
        />

        {/* State */}
        <input
          name="state"
          defaultValue={editingUser.state ?? ""}
          placeholder="State"
          className="input"
        />

        {/* Pincode */}
        <input
          name="pin_code"
          defaultValue={editingUser.pin_code ?? ""}
          placeholder="Pincode"
          className="input"
        />

        {/* Role */}
        <select
          name="role"
          defaultValue={editingUser.role ?? "Admin"}
          className="input"
        >
          <option value="Admin">Admin</option>
          <option value="Testing">Testing</option>
        </select>

        {/* Status */}
        <select
          name="status"
          defaultValue={editingUser.status ?? 1}
          className="input"
        >
          <option value={1}>Active</option>
          <option value={0}>Inactive</option>
        </select>

        {/* Agency */}
        <select
          name="agency_id"
          defaultValue={editingUser.agency_id ?? ""}
          className="input md:col-span-2"
          required
        >
          <option value="">Select Agency</option>
          {tenants
            .filter((t) => t.is_active)
            .map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
        </select>

        {/* Actions */}
        <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => setEditingUser(null)}
          >
            Cancel
          </Button>
          <Button type="submit">
            {editingUser.id ? "Update User" : "Add User"}
          </Button>
        </div>
      </form>
    </div>
  </div>
)}

      </div>
    </Layout>
  );
}
