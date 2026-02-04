import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import BlogsNewPagesModal from "@/components/modals/BlogsNewPagesModal";
import LeadsViewList from "@/components/LeadsViewTable";
import axios from "axios";
 const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
interface Lead {
  id: number;
  name: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email: string;
  phone: string;
  source: string;
  status: string;
  assigned_to: number;
  notes: string;
  company_name: string;
  role_to_hire: string;
  requirements:string;
  created_at: string;
  updated_at: string;
}

interface LeadApiResponse {
  status: boolean;
  message: string;
  result: Lead[];
}

const BlogPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get<LeadApiResponse>(`${API_BASE_URL}/leads`);
      console.log("Fetched leads:", data.result);
      setLeads(data.result);
    } catch (err) {
      console.error("Error fetching leads: ", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Lead Management</h1>
          </div>
        </div>

        <LeadsViewList
          loading={loading}
          fetchLeads={fetchLeads}
          leads={leads}
        />

        <BlogsNewPagesModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchLeads();
          }}
        />
      </div>
    </Layout>
  );
};

export default BlogPage;
