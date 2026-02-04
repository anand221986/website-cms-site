import { useState } from "react";
import { PlanCard, Plan } from "./PlanCard";
import { UpgradeModal } from "./UpgradeModal";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";

const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "month",
    description: "Perfect for getting started",
    features: [
      "Up to 100 emails/month",
      "Basic templates",
      "Email support",
      "1 team member",
      "Basic analytics",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    period: "month",
    description: "Best for growing teams",
    features: [
      "Unlimited emails",
      "Premium templates",
      "Priority support",
      "Up to 10 team members",
      "Advanced analytics",
      "Custom branding",
      "API access",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 99,
    period: "month",
    description: "For large organizations",
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
      "SSO authentication",
      "Audit logs",
      "Custom contracts",
    ],
  },
];

export function SubscriptionPage() {
  const [currentPlanId, setCurrentPlanId] = useState("free");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const currentPlan = plans.find((p) => p.id === currentPlanId) || plans[0];

  const handleSelectPlan = (plan: Plan) => {
    if (plan.id === currentPlanId) return;
    setSelectedPlan(plan);
    setModalOpen(true);
  };

  const handleConfirmUpgrade = () => {
    if (selectedPlan) {
      setCurrentPlanId(selectedPlan.id);
      setModalOpen(false);
      toast.success(`Successfully upgraded to ${selectedPlan.name}!`, {
        description: "Your new features are now active.",
      });
    }
  };

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center gap-3 mb-2">
        <CreditCard className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-semibold text-foreground">
          Subscription Plans
        </h1>
      </div>
      <p className="text-muted-foreground mb-8">
        Choose the perfect plan for your needs. Upgrade or downgrade at any time.
      </p>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isCurrentPlan={plan.id === currentPlanId}
            onSelect={handleSelectPlan}
          />
        ))}
      </div>

      <div className="bg-card rounded-xl p-6 border border-border shadow-card">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Current Subscription Details
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Plan</p>
            <p className="font-medium text-foreground">{currentPlan.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Billing</p>
            <p className="font-medium text-foreground">
              ${currentPlan.price}/{currentPlan.period}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Next billing date</p>
            <p className="font-medium text-foreground">Feb 15, 2026</p>
          </div>
        </div>
      </div>

      <UpgradeModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        selectedPlan={selectedPlan}
        currentPlan={currentPlan}
        onConfirm={handleConfirmUpgrade}
      />
    </div>
  );
}
