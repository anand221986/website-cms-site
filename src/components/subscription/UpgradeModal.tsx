import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plan } from "./PlanCard";
import { Check, ArrowRight, Sparkles } from "lucide-react";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPlan: Plan | null;
  currentPlan: Plan | null;
  onConfirm: () => void;
}

export function UpgradeModal({
  open,
  onOpenChange,
  selectedPlan,
  currentPlan,
  onConfirm,
}: UpgradeModalProps) {
  if (!selectedPlan || !currentPlan) return null;

  const isUpgrade = selectedPlan.price > currentPlan.price;
  const priceDiff = Math.abs(selectedPlan.price - currentPlan.price);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full gradient-primary flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <DialogTitle className="text-center text-xl">
            {isUpgrade ? "Upgrade" : "Change"} to {selectedPlan.name}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isUpgrade
              ? `Unlock premium features for $${priceDiff}/month more`
              : `Switch to a different plan`}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="text-center p-4 bg-muted rounded-xl">
              <p className="text-sm text-muted-foreground mb-1">Current</p>
              <p className="font-semibold text-foreground">{currentPlan.name}</p>
              <p className="text-sm text-muted-foreground">${currentPlan.price}/mo</p>
            </div>
            <ArrowRight className="w-5 h-5 text-primary" />
            <div className="text-center p-4 bg-primary/10 rounded-xl border border-primary/20">
              <p className="text-sm text-primary mb-1">New Plan</p>
              <p className="font-semibold text-foreground">{selectedPlan.name}</p>
              <p className="text-sm text-primary">${selectedPlan.price}/mo</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground mb-3">
              {isUpgrade ? "New features you'll get:" : "Features included:"}
            </p>
            {selectedPlan.features.slice(0, 4).map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success" />
                <span className="text-sm text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={onConfirm} className="w-full gradient-primary">
            Confirm {isUpgrade ? "Upgrade" : "Change"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
