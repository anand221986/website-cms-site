import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Lock, CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

const UsageLimits = () => {
  const { getUserDetails } = useAuth();
  const user = getUserDetails();
  const [loading, setLoading] = useState(true);
  const [dynamicUsage, setDynamicUsage] = useState({
    emailsSent: 0,
    signaturesCreated: 0
  });

  const currentPlan = user?.subscription?.toLowerCase() || "free";

  useEffect(() => {
    const fetchUsage = async () => {
      // Prevent calling API if user ID isn't available yet
      if (!user?.userId) return;

      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/email/usage-limit/${user.userId}`
        );
 
        // Accessing the nested data from your utilService.successResponse
        // NestJS response structure: { data: { emails_sent_today: X, ... }, message: "..." }
        const apiData = response.data.result;

        setDynamicUsage({
          emailsSent: apiData?.emails_sent_today || 0,
          signaturesCreated: apiData?.email_signatures_created_today || 0
        });
      } catch (error) {
        console.error("Failed to fetch limits:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();
  }, [user?.userId]); // Dependency array ensures it runs when user loads

  const handleUpgrade = () => {
    window.open("https://www.amyntasmedia.com/product/prosign-email/", "_blank");
  };

  const usageLimits = [
    { 
      name: "Mail Merge (Daily)", 
      used: dynamicUsage.emailsSent, 
      total: currentPlan === "free" ? 20 : 1000 
    },
    { 
      name: "Email Signatures", 
      used: dynamicUsage.signaturesCreated, 
      total: currentPlan === "free" ? 5 : 999 
    },
  ];

  const plans = [
    {
      name: "Free",
      description: "Up to 20 recipients / day. Real-time tracking included.",
      price: "₹0",
      isSelected: currentPlan === "free",
      features: ["Basic usage limits"]
    },
    {
      name: "Pro",
      description: "Up to 1000 recipients / day. Advanced tracking.",
      price: "₹287",
      isSelected: currentPlan === "pro",
      features: ["Higher limits", "Priority Support"]
    }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-800">Usage & Billing</h1>
          <span className="px-3 py-1 bg-slate-100 rounded-full text-sm font-medium text-slate-600 uppercase">
            {currentPlan} Plan
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <div 
              key={plan.name} 
              className={`border rounded-xl p-6 flex flex-col justify-between transition-all ${
                plan.isSelected ? "border-blue-500 bg-blue-50/30 shadow-sm" : "bg-white border-slate-200"
              }`}
            >
              <div>
                <h2 className={`text-xl font-bold ${plan.isSelected ? "text-blue-600" : ""}`}>{plan.name}</h2>
                <p className="text-3xl font-bold my-4">{plan.price}<span className="text-sm font-normal text-slate-500"> / month</span></p>
                <p className="text-sm text-slate-600 mb-4">{plan.description}</p>
              </div>
              {plan.isSelected ? (
                <div className="text-blue-600 font-medium flex items-center gap-2 py-2">
                  <CheckCircle size={18} /> Currently Active
                </div>
              ) : (
                <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleUpgrade}>
                  Upgrade Now
                </Button>
              )}
            </div>
          ))}
        </div>

        <Card className="rounded-2xl shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Daily Consumption
              {loading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {usageLimits.map((limit, idx) => {
              const percent = Math.min(Math.round((limit.used / limit.total) * 100), 100);
              const isNearLimit = percent >= 85;

              return (
                <div key={idx} className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-slate-700">{limit.name}</span>
                    <span className={`font-mono ${isNearLimit ? "text-red-500 font-bold" : "text-slate-500"}`}>
                      {limit.used} / {limit.total}
                    </span>
                  </div>
                  <Progress 
                    value={percent} 
                    className="h-2"
                  />
                  {isNearLimit && (
                    <p className="text-[11px] text-red-500 font-medium animate-pulse">
                      You are almost at your limit. Upgrade to increase capacity.
                    </p>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default UsageLimits;