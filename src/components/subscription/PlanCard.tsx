import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
}

interface PlanCardProps {
  plan: Plan;
  isCurrentPlan: boolean;
  onSelect: (plan: Plan) => void;
}

export function PlanCard({ plan, isCurrentPlan, onSelect }: PlanCardProps) {
  const isPro = plan.id === "pro";
  
  return (
    <div
      className={cn(
        "relative rounded-2xl p-6 bg-card border transition-all duration-300",
        isPro 
          ? "border-primary shadow-card-hover scale-[1.02]" 
          : "border-border shadow-card hover:shadow-card-hover",
        isCurrentPlan && "ring-2 ring-success"
      )}
    >
      {plan.popular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-primary border-0">
          Most Popular
        </Badge>
      )}
      
      {isCurrentPlan && (
        <Badge variant="outline" className="absolute -top-3 right-4 bg-success text-success-foreground border-0">
          Current Plan
        </Badge>
      )}

      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-foreground mb-2">{plan.name}</h3>
        <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-bold text-foreground">${plan.price}</span>
          <span className="text-muted-foreground">/{plan.period}</span>
        </div>
      </div>

      <ul className="space-y-3 mb-6">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-3 h-3 text-success" />
            </div>
            <span className="text-sm text-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        onClick={() => onSelect(plan)}
        disabled={isCurrentPlan}
        className={cn(
          "w-full",
          isPro && !isCurrentPlan && "gradient-primary hover:opacity-90",
          isCurrentPlan && "bg-muted text-muted-foreground"
        )}
        variant={isPro ? "default" : isCurrentPlan ? "secondary" : "outline"}
      >
        {isCurrentPlan ? "Current Plan" : `Upgrade to ${plan.name}`}
      </Button>
    </div>
  );
}
