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
  gated?: boolean;
};

type FeatureAccess = {
  name: string;
  allowed: boolean;
};

const UsageLimits = () => {
  const { getUserDetails } = useAuth();
  const userRole = getUserDetails()?.roles?.toLowerCase() || "free";

  const currentPlan =
    userRole === "superadmin"
      ? "Enterprise"
      : userRole === "admin"
      ? "Pro"
      : "Free";

  /* ---------------- USAGE LIMITS ---------------- */
  const usageLimits: FeatureLimit[] = [
    { name: "Email Signatures", used: 3, total: currentPlan === "Free" ? 5 : 999 },
    { name: "Signature Edits", used: 8, total: currentPlan === "Free" ? 10 : 999 },
    { name: "Exports / Downloads", used: 2, total: currentPlan === "Free" ? 3 : 999 },
  ];

  /* ---------------- FEATURE GATING ---------------- */
  const featureAccess: FeatureAccess[] = [
    { name: "Remove Branding", allowed: currentPlan !== "Free" },
    { name: "Custom HTML Editor", allowed: currentPlan !== "Free" },
    { name: "Team Signatures", allowed: currentPlan === "Enterprise" },
    { name: "API Access", allowed: currentPlan === "Enterprise" },
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
{/* FREE PLAN CARD */}
  <div className="bg-white border rounded-lg p-6 flex items-start justify-between">
    <div>
      <h2 className="text-xl font-semibold text-slate-800">Free</h2>
      <p className="mt-2 text-sm text-slate-600">
        <b>Up to 20 recipients / day</b>
      </p>
      <p className="mt-1 text-sm text-slate-500">
        Real-time open, click, response, bounce and unsubscribe tracking
      </p>
    </div>

    <span className="border rounded-full px-4 py-1 text-sm text-slate-600">
      Current plan
    </span>
  </div>
  {/* PRO PLAN CARD */}
  <div className="bg-white border rounded-lg p-6 flex items-start justify-between">
    <div>
      <h2 className="text-xl font-semibold text-blue-600">Easy Flow Pro</h2>
      <p className="mt-2 text-3xl font-bold text-slate-800">
        $3.00 <span className="text-sm font-medium text-slate-500">/ month</span>
      </p>
      <p className="text-sm text-slate-500">$36 billed annually</p>

      <ul className="mt-4 space-y-1 text-sm text-slate-600">
        <li><b>Up to 400 recipients / day</b></li>
        <li>Schedule send</li>
        <li>Spread out large sends over a few days</li>
      </ul>
    </div>
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

    <button className="h-fit rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700">
      Upgrade
    </button>
  </div>
        {/* ---------------- USAGE LIMITS ---------------- */}
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

        {/* ---------------- FEATURE GATING ---------------- */}
        {/* <Card className="rounded-2xl shadow-md bg-white/70">
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
        </Card> */}

        {/* ---------------- UPGRADE CTA ---------------- */}
        {/* {currentPlan === "Free" && (
          <Card className="rounded-2xl border border-dashed border-indigo-300 bg-indigo-50">
            <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 p-6">
              <div>
                <h3 className="text-lg font-semibold text-indigo-700">
                  Unlock Pro Features 🚀
                </h3>
                <p className="text-sm text-indigo-600">
                  Remove limits, unlock branding removal & advanced editing.
                </p>
              </div>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Zap className="mr-2 h-4 w-4" />
                Upgrade to Pro
              </Button>
            </CardContent>
          </Card>
        )} */}
      </div>
    </Layout>
  );
};

export default UsageLimits;
