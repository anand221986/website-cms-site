import Layout from "@/components/Layout";
import MetricCard from "@/components/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users,BarChart3, Briefcase, Building2, TrendingUp, Mail, MousePointer, } from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart, Area,
} from "recharts";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
 const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
 const chartData = [
  { name: "Jan 1", sent: 400, opened: 340, clicked: 120 },
  { name: "Jan 8", sent: 650, opened: 520, clicked: 180 },
  { name: "Jan 15", sent: 800, opened: 620, clicked: 230 },
  { name: "Jan 22", sent: 1200, opened: 980, clicked: 340 },
  { name: "Jan 29", sent: 900, opened: 750, clicked: 280 },
];

const stats = [
  { 
    label: "Total Sent", 
    value: "12,847", 
    change: "+12%", 
    trend: "up",
    icon: Mail,
    color: "text-primary"
  },
  { 
    label: "Open Rate", 
    value: "78.4%", 
    change: "+5.2%", 
    trend: "up",
    icon: Users,
    color: "text-success"
  },
  { 
    label: "Click Rate", 
    value: "24.6%", 
    change: "+3.1%", 
    trend: "up",
    icon: MousePointer,
    color: "text-warning"
  },
  { 
    label: "Avg. Response Time", 
    value: "2.4h", 
    change: "-18%", 
    trend: "down",
    icon: TrendingUp,
    color: "text-destructive"
  },
];

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

type UserContext = {
  tenantId: number;
  role: "superadmin" | "admin" | "editor";
};

      const data = {
  result: [
    {
      metric_name: "Active Pages",
      metric_value: 120,
      metric_change: "+5%",
      trend_direction: "up",
    },
    {
      metric_name: "Total Leads",
      metric_value: 45,
      metric_change: "-2%",
      trend_direction: "down",
    },
    {
      metric_name: "Hot Leads",
      metric_value: 300,
      metric_change: "+10%",
      trend_direction: "up",
    },
    {
      metric_name: "Cold Leads",
      metric_value: 1500,
      metric_change: "+8%",
      trend_direction: "up",
    },
  ],
};
const Index = () => {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [leadsData, setLeadsData] = useState<LeadData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { getUserDetails } = useAuth();
  const userRole = getUserDetails()?.roles?.toLowerCase() || "";
  // Simulate logged-in user context (replace with real auth logic)


  // const userContext: UserContext = {
  //   tenantId: 1, // dynamically get tenant ID from login/session
  //   role: "admin", // dynamically get user role
  // };

  useEffect(() => {
    fetchDashboardStats();
    fetchLeadsData();
  }, []);

  // Fetch Metrics from CMS API, tenant-aware
  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      // const { data } = await axios.get(`${API_BASE_URL}/common/getDashboardStats`, {
      //   params: { tenantId: userContext.tenantId, role: userContext.role },
      // });
      const mappedMetrics: Metric[] = (data.result || []).map((item: any) => ({
        title: item.metric_name || item.title || "Unknown",
        value: item.metric_value || item.value || 0,
        change: item.metric_change || item.change || "",
        icon:
          item.metric_name === "Active Pages"
            ? Building2
            : item.metric_name === "Active Jobs"
            ? Briefcase
            : item.metric_name === "Total Candidates"
            ? Users
            : TrendingUp,
        trend: item.trend_direction === "down" ? "down" : "up",
      }));

      setMetrics(mappedMetrics.length ? mappedMetrics : defaultMetrics);
    } catch (err) {
      console.error(err);
      setMetrics(defaultMetrics);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Leads / Page Views from CMS, tenant-aware
  const fetchLeadsData = async () => {
    try {
      // const { data } = await axios.get(`${API_BASE_URL}/leads/getPageViews`, {
      //   params: { tenantId: userContext.tenantId, role: userContext.role },
      // });

      const mappedLeads: LeadData[] = (data.result || []).map((item: any) => ({
        page: item.page_name || item.page || "Unknown",
        views: item.views_count || item.views || 0,
      }));

      setLeadsData(mappedLeads.length ? mappedLeads : defaultLeadsData);
    } catch (err) {
      console.error(err);
      setLeadsData(defaultLeadsData);
    }
  };

  // Default fallback metrics
  const defaultMetrics: Metric[] = [
    { title: "Active Pages", value: 12, change: "+2 this month", icon: Building2, trend: "up" },
    { title: "Total Leads", value: 24, change: "+12%", icon: Briefcase, trend: "up" },
    { title: "Hot Leads", value: 1847, change: "+5%", icon: Users, trend: "up" },
    { title: "Cold Leads", value: "23%", change: "+3%", icon: TrendingUp, trend: "up" },
  ];

  // Default fallback leads data
  const defaultLeadsData: LeadData[] = [
    { page: "Home", views: 120 },
    { page: "About Us", views: 80 },
    { page: "Jobs", views: 150 },
    { page: "Contact", views: 60 },
    { page: "Apply", views: 90 },
  ];

 return (
  <Layout>
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">
          Dashboard
        </h1>
        <span className="text-sm text-slate-500 capitalize">
          Role: {userRole || "N/A"}
        </span>
      </div>

      {/* Metrics Section */}
    {userRole === 'testing'&& (
      <div className="p-6 animate-fade-in">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-medium text-foreground">Analytics</h2>
        <p className="text-muted-foreground mt-1">
          Track your email campaign performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-card border border-border rounded-lg p-4 hover:shadow-google-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg bg-secondary flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <span className={`text-sm font-medium ${
                  stat.trend === "up" ? "text-success" : "text-destructive"
                }`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-display font-medium text-foreground">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h3 className="font-display font-medium text-foreground">Performance Over Time</h3>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOpened" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorClicked" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(215, 14%, 46%)"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(215, 14%, 46%)"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(0, 0%, 100%)",
                  border: "1px solid hsl(220, 13%, 91%)",
                  borderRadius: "8px",
                  boxShadow: "var(--shadow-md)",
                }}
              />
              <Area
                type="monotone"
                dataKey="sent"
                stroke="hsl(217, 91%, 60%)"
                fillOpacity={1}
                fill="url(#colorSent)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="opened"
                stroke="hsl(142, 71%, 45%)"
                fillOpacity={1}
                fill="url(#colorOpened)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="clicked"
                stroke="hsl(38, 92%, 50%)"
                fillOpacity={1}
                fill="url(#colorClicked)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">Sent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-sm text-muted-foreground">Opened</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span className="text-sm text-muted-foreground">Clicked</span>
          </div>
        </div>
      </div>
    </div> 
)}




      {/* Leads / Page Views Section (Hidden for Testing) */}
      {userRole!=='testing' && (

        <Card className="border-0 rounded-2xl shadow-md bg-white/70 backdrop-blur-md">
                <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-700 mb-4">
          Key Metrics
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, idx) => (
            <MetricCard key={idx} {...metric} />
          ))}
        </div>
      </div>
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
              <LineChart
                data={leadsData}
                margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="page" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "10px",
                    border: "1px solid #e5e7eb",
                    boxShadow:
                      "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ r: 5, strokeWidth: 2 }}
                  activeDot={{ r: 7 }}
                  name="Page Views"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Message for Testing Users */}
      {userRole!='testing' && (
        <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500">
          Leads analytics are disabled for <b>Testing</b> role.
        </div>
      )}

    </div>
  </Layout>
);

};

export default Index;
