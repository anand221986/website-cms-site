import Layout from "@/components/Layout";
import MetricCard from "@/components/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BarChart3, Briefcase, Building2, TrendingUp, Mail, MousePointer } from "lucide-react";
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart, 
  Area,
} from "recharts";
import { useEffect, useState } from "react";
// import axios from "axios"; // Uncomment when you connect the live API
import { useAuth } from "@/context/AuthContext";

// Moved outside component to avoid re-creation and hoisting issues
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const chartData = [
  { name: "Jan 1", sent: 400, opened: 340, clicked: 120 },
  { name: "Jan 8", sent: 650, opened: 520, clicked: 180 },
  { name: "Jan 15", sent: 800, opened: 620, clicked: 230 },
  { name: "Jan 22", sent: 1200, opened: 980, clicked: 340 },
  { name: "Jan 29", sent: 900, opened: 750, clicked: 280 },
];

const stats = [
  { label: "Total Sent", value: "12,847", change: "+12%", trend: "up", icon: Mail, color: "text-blue-600" },
  { label: "Open Rate", value: "78.4%", change: "+5.2%", trend: "up", icon: Users, color: "text-emerald-600" },
  { label: "Click Rate", value: "24.6%", change: "+3.1%", trend: "up", icon: MousePointer, color: "text-amber-500" },
  { label: "Avg. Response Time", value: "2.4h", change: "-18%", trend: "down", icon: TrendingUp, color: "text-red-500" },
];

const defaultMetrics: Metric[] = [
  { title: "Active Pages", value: 12, change: "+2 this month", icon: Building2, trend: "up" },
  { title: "Total Leads", value: 24, change: "+12%", icon: Briefcase, trend: "up" },
  { title: "Hot Leads", value: 1847, change: "+5%", icon: Users, trend: "up" },
  { title: "Cold Leads", value: "23%", change: "+3%", icon: TrendingUp, trend: "up" },
];

const defaultLeadsData: LeadData[] = [
  { page: "Home", views: 120 },
  { page: "About Us", views: 80 },
  { page: "Jobs", views: 150 },
  { page: "Contact", views: 60 },
  { page: "Apply", views: 90 },
];

const dummyApiData = {
  result: [
    { metric_name: "Active Pages", metric_value: 120, metric_change: "+5%", trend_direction: "up" },
    { metric_name: "Total Leads", metric_value: 45, metric_change: "-2%", trend_direction: "down" },
    { metric_name: "Hot Leads", metric_value: 300, metric_change: "+10%", trend_direction: "up" },
    { metric_name: "Cold Leads", metric_value: 1500, metric_change: "+8%", trend_direction: "up" },
  ],
};

type Metric = {
  title: string;
  value: string | number;
  change: string;
  icon: any;
  trend: "up" | "down";
};

type LeadData = {
  page: string;
  views: number;
};

const Index = () => {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [leadsData, setLeadsData] = useState<LeadData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const { getUserDetails } = useAuth();
  const user = getUserDetails();
  const userRole = user?.roles?.toLowerCase() || "";
  const currentPlan = user?.subscription || "Free";

  useEffect(() => {
    fetchDashboardStats();
    // fetchLeadsData();
  }, []);

  // Fetch Metrics from CMS API
  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      // Simulate API response using the dummy data you provided
      // const mappedMetrics: Metric[] = (dummyApiData.result || []).map((item: any) => ({
      //   title: item.metric_name || "Unknown",
      //   value: item.metric_value || 0,
      //   change: item.metric_change || "",
      //   icon: item.metric_name === "Active Pages" ? Building2 : 
      //         item.metric_name === "Active Jobs" ? Briefcase : 
      //         item.metric_name === "Total Candidates" ? Users : TrendingUp,
      //   trend: item.trend_direction === "down" ? "down" : "up",
      // }));

      // setMetrics(mappedMetrics.length ? mappedMetrics : defaultMetrics);
    } catch (err) {
      console.error(err);
      setMetrics(defaultMetrics);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Leads / Page Views from CMS
  const fetchLeadsData = async () => {
    try {
      const mappedLeads: LeadData[] = (dummyApiData.result || []).map((item: any) => ({
        page: item.page_name || item.page || "Unknown",
        views: item.views_count || item.views || 0,
      }));

      setLeadsData(mappedLeads.length ? mappedLeads : defaultLeadsData);
    } catch (err) {
      console.error(err);
      setLeadsData(defaultLeadsData);
    }
  };

  return (
    <Layout>
      <div className="space-y-8 p-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Welcome back to Ams Tools analytics.</p>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            {/* The Plan Badge */}
            <span className="px-3 py-1 font-medium capitalize rounded-full bg-slate-100 text-slate-700 border border-slate-200 shadow-sm">
              Plan: {currentPlan}
            </span>

            {/* The Upgrade Button */}
            {currentPlan === "Free" && (
              <Link 
                to="/plans" 
                className="flex items-center gap-1.5 px-4 py-1.5 font-medium text-white transition-colors bg-blue-600 rounded-full hover:bg-blue-700 shadow-sm cursor-pointer"
              >
                <span>⚡</span> Upgrade to Pro
              </Link>
            )}
          </div>
        </div>

        {/* ROLE: TESTING -> Email Analytics Section */}
        {userRole === 'testing' && (
          <div className="animate-fade-in space-y-6">
            {/* <div>
              <h2 className="text-2xl font-semibold text-slate-800">Analytics</h2>
              <p className="text-slate-500 mt-1">
                Track your email campaign performance
              </p>
            </div> */}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                        <Icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                      <span className={`text-sm font-semibold ${
                        stat.trend === "up" ? "text-emerald-600" : "text-red-500"
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">
                      {stat.value}
                    </p>
                    <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Area Chart */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-slate-800">Performance Over Time</h3>
              </div>

              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorOpened" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorClicked" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d97706" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Area type="monotone" dataKey="sent" stroke="#2563eb" fillOpacity={1} fill="url(#colorSent)" strokeWidth={2} />
                    <Area type="monotone" dataKey="opened" stroke="#059669" fillOpacity={1} fill="url(#colorOpened)" strokeWidth={2} />
                    <Area type="monotone" dataKey="clicked" stroke="#d97706" fillOpacity={1} fill="url(#colorClicked)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-600" />
                  <span className="text-sm text-slate-500 font-medium">Sent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-600" />
                  <span className="text-sm text-slate-500 font-medium">Opened</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-sm text-slate-500 font-medium">Clicked</span>
                </div>
              </div>
            </div>
          </div> 
        )}

        {/* ROLE: NOT TESTING -> Leads / Page Views Section */}
        {userRole !== 'testing' && (
          <div className="space-y-6">
            
            {/* Metrics Grid */}
            <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6 shadow-sm border border-blue-100">
              <h2 className="text-lg font-semibold text-slate-700 mb-4">Key Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric, idx) => (
                  <MetricCard key={idx} {...metric} />
                ))}
              </div>
            </div>

            {/* Line Chart */}
            <Card className="border border-slate-200 rounded-xl shadow-sm bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-slate-800 text-lg">
                  Page Views & Leads Analytics
                </CardTitle>
                <p className="text-sm text-slate-500">
                  Track engagement across key pages
                </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={leadsData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="page" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="views"
                      stroke="#4f46e5"
                      strokeWidth={3}
                      dot={{ r: 5, strokeWidth: 2 }}
                      activeDot={{ r: 7 }}
                      name="Page Views"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Message for Testing Users (Fixed Conditional Logic) */}
        {/* {userRole === 'testing' && (
          <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500 bg-slate-50">
            Leads analytics are disabled for users with the <b>Testing</b> role.
          </div>
        )} */}

      </div>
    </Layout>
  );
};

export default Index;