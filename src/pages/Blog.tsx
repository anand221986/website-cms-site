import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import BlogsNewPagesModal from "@/components/modals/BlogsNewPagesModal";
import BlogsViewList from "@/components/BlogsViewTable";
import axios from "axios";
 const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
interface Blog {
  id: number;
  title: string;
  content: string;
  author: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}
interface BlogApiResponse {
  result: Blog[];
}

const BlogPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState<Blog[]>([]); // strongly typed
const fetchPages = async () => {
  setLoading(true);
  try {
    const { data } = await axios.get<BlogApiResponse>(`${API_BASE_URL}/blogs`);
    console.log("Fetched blogs:", data.result);
    setPages(data.result); // correct
  } catch (err) {
    console.error("Error fetching pages: ", err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchPages();
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Blogs Management</h1>
            <p className="text-slate-600 mt-1">Manage your website Blogs.</p>
          </div>
        </div>

        <BlogsViewList
          loading={loading}
          fetchPages={fetchPages}
          blog={pages} // now typed correctly
        />

        <BlogsNewPagesModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchPages(); // Refresh after success
          }}
        />
      </div>
    </Layout>
  );
};

export default BlogPage;
