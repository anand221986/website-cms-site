import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Lock, CheckCircle, Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type FeatureLimit = {
  name: string;
  used: number;
  total: number;
};

type FeatureAccess = {
  name: string;
  allowed: boolean;
};

const UsageLimits = () => {
  const { getUserDetails } = useAuth();
  const user = getUserDetails();
  const userRole = user?.roles?.toLowerCase() || "free";
  const subscribed = !!user?.subscription;
  const currentPlan = user?.subscription || "free";
  
const handleUpgrade = async (planName: string) => {
  try {
    // const response = await fetch("/api/upgrade", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ plan: planName }),
    // });
      // Simulate an API call with dummy data
    const response = await new Promise<{ success: boolean }>((resolve) => {
      setTimeout(() => {
        resolve({ success: true }); // Dummy success response
      }, 1000); // simulate 1 second network delay
    });
    // const data = await response.json();
    if (response.success) {
      alert("Plan upgraded successfully!");
      // Optionally refresh user info or subscription status
    }
  } catch (error) {
    console.error("Upgrade failed:", error);
  }
};
  const usageLimits: FeatureLimit[] = [
    { name: "Email Signatures", used: 3, total: currentPlan === "free" ? 5 : 999 },
    { name: "Signature Edits", used: 8, total: currentPlan === "free" ? 10 : 999 },
    { name: "Exports / Downloads", used: 2, total: currentPlan === "free" ? 3 : 999 },
  ];

  const featureAccess: FeatureAccess[] = [
    { name: "Remove Branding", allowed: currentPlan !== "free" },
    { name: "Custom HTML Editor", allowed: currentPlan !== "free" },
    { name: "Team Signatures", allowed: currentPlan === "Enterprise" },
    { name: "API Access", allowed: currentPlan === "Enterprise" },
  ];

  /* ---------------- PLAN SELECTION ---------------- */
  const plans = [
    {
      name: "Free",
      description: "Up to 50 recipients / day. Real-time tracking included.",
      price: "$0 / month",
      features: ["Basic usage limits", "Track opens & clicks"],
      isSelected: !subscribed || currentPlan === "free",
    },
    {
      name: "Pro",
      description: "Up to 400 recipients / day. Schedule sends & advanced tracking.",
      price: "$3 / month",
      features: ["Higher usage limits", "Schedule sends", "Advanced tracking"],
      isSelected: subscribed && currentPlan === "pro",
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-800">
            Usage Limits & Feature Gating
          </h1>
          <span className="text-sm text-slate-500">
            Current Plan: <b>{currentPlan}</b>
          </span>
        </div>

        {/* Plan Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`border rounded-lg p-6 flex flex-col justify-between ${
                plan.isSelected
                  ? "border-blue-600 bg-blue-50"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div>
                <h2
                  className={`text-xl font-semibold ${
                    plan.isSelected ? "text-blue-600" : "text-slate-800"
                  }`}
                >
                  {plan.name}
                </h2>
                <p className="mt-2 text-sm text-slate-600">{plan.description}</p>
                <p className="mt-4 text-3xl font-bold text-slate-800">{plan.price}</p>
                <ul className="mt-2 space-y-1 text-sm text-slate-600">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx}>• {feat}</li>
                  ))}
                </ul>
              </div>
              {plan.isSelected ? (
  <span className="mt-4 inline-block rounded-full bg-blue-600 px-4 py-1 text-sm text-white">
    Current Plan
  </span>
) : (
  // Only show Upgrade button if plan is not Pro
  currentPlan !== "pro" && (
    <Button className="mt-4 bg-blue-600 hover:bg-blue-700" onClick={() => handleUpgrade(plan.name)}>
      Upgrade
    </Button>
  )
)}
            </div>
          ))}
        </div>

        {/* Usage Limits */}
        <Card className="rounded-2xl shadow-md bg-white/70">
          <CardHeader>
            <CardTitle className="text-lg">Usage Limits</CardTitle>
            <p className="text-sm text-muted-foreground">
              Monitor your current plan usage
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {usageLimits.map((limit, idx) => {
              const percent = Math.min(
                Math.round((limit.used / limit.total) * 100),
                100
              );
              return (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{limit.name}</span>
                    <span className="text-slate-500">
                      {limit.used} / {limit.total}
                    </span>
                  </div>
                  <Progress value={percent} />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Feature Gating */}
        <Card className="rounded-2xl shadow-md bg-white/70">
          <CardHeader>
            <CardTitle className="text-lg">Feature Access</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featureAccess.map((feature, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-4 rounded-xl border ${
                  feature.allowed
                    ? "border-green-200 bg-green-50"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <span className="font-medium">{feature.name}</span>
                {feature.allowed ? (
                  <CheckCircle className="text-green-600" />
                ) : (
                  <Lock className="text-slate-400" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default UsageLimits;