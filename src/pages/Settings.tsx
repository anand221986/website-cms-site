import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Save, User } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface UserData {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  profile_pic: string | null;
  role: string;
  status: number;
  agency_id: number | null;
  address: string | null;
}

const Settings = () => {
  const { getUserDetails } = useAuth();
  const userDetails = getUserDetails();
  console.log(userDetails);
  const userId = userDetails?.userId;

  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async (id: number) => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/user/${id}`);
        setUser(data.result);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch user data.");
      } finally {
        setLoading(false);
      }
    };

    // ✅ IMPORTANT: stop loading if no userId
    if (!userId) {
      setLoading(false);
      return;
    }

    fetchUser(userId);
  }, [userId]);

  const handleSave = async () => {
    if (!user) return;

    const payload = {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
    };

    try {
      await axios.put(`${API_BASE_URL}/user/${user.id}`, payload);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>User not found.</p>;

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
          <User className="w-5 h-5" /> Settings
        </h1>

        <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-slate-800">
              Profile Information
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="w-20 h-20">
                {user.profile_pic ? (
                  <AvatarImage src={user.profile_pic} alt="Profile" />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xl">
                    {`${user.first_name[0]}${user.last_name[0]}`}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>First Name</Label>
                <Input
                  value={user.first_name}
                  onChange={(e) =>
                    setUser({ ...user, first_name: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Last Name</Label>
                <Input
                  value={user.last_name}
                  onChange={(e) =>
                    setUser({ ...user, last_name: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={user.email}
                  onChange={(e) =>
                    setUser({ ...user, email: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Phone</Label>
                <Input
                  value={user.phone}
                  onChange={(e) =>
                    setUser({ ...user, phone: e.target.value })
                  }
                />
              </div>

              <div className="md:col-span-2">
                <Label>Address</Label>
                <Textarea
                  value={user.address || ""}
                  onChange={(e) =>
                    setUser({ ...user, address: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Settings;
