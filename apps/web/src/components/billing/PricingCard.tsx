import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui";
import { Check, Sparkles, Zap, ShieldCheck } from "lucide-react";
import { CheckoutButton } from "./CheckoutButton";

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: string;
  duration: string;
  features: string[];
  productId: string | null;
  isPopular: boolean;
}

interface PricingCardProps {
  plan: Plan;
  isLoading: boolean;
  isProcessing: boolean;
  onSubscribe: (plan: Plan) => Promise<void>;
}

/**
 * Modern pricing card component with EdgeStack aesthetics.
 */
export function PricingCard({
  plan,
  isLoading,
  isProcessing,
  onSubscribe,
}: PricingCardProps) {
  return (
    <Card
      className={`dashboard-card relative flex flex-col h-full border-none transition-all duration-700 hover:translate-y-[-12px] bg-white ${
        plan.isPopular
          ? "shadow-2xl shadow-[hsl(var(--brand-primary))/20] ring-1 ring-[hsl(var(--brand-primary))/10] scale-[1.05] z-10"
          : "shadow-xl shadow-black/[0.02]"
      }`}
    >
      {plan.isPopular && (
        <div className="absolute -top-6 left-0 right-0 flex justify-center">
          <span className="bg-[#1A1D1F] text-white text-[10px] font-black italic px-5 py-2.5 rounded-2xl uppercase tracking-[0.3em] shadow-2xl shadow-black/20 flex items-center gap-2 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-[#16C8C7]" />
            Nominated Protocol
          </span>
        </div>
      )}

      <CardHeader className="pb-10 pt-12 px-10">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-3xl font-black text-[#1A1D1F] tracking-tighter italic leading-none">
            {plan.name}
          </CardTitle>
          {plan.isPopular && (
            <Zap className="w-6 h-6 text-[hsl(var(--brand-primary))] fill-current" />
          )}
        </div>
        <CardDescription className="min-h-[56px] text-base font-semibold text-[#8E95A2] leading-relaxed italic pr-4">
          {plan.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-12 px-10">
        <div className="flex items-baseline gap-2 mb-12">
          <span className="text-7xl font-black tracking-tighter text-[#1A1D1F] italic leading-none">
            {plan.price}
          </span>
          <span className="text-[#C1C7D0] text-[10px] font-black uppercase tracking-[0.2em] italic">
            {plan.duration}
          </span>
        </div>

        <div className="text-[10px] font-black text-[#C1C7D0] uppercase tracking-[0.4em] italic mb-8 flex items-center gap-3">
          Protocol Capabilities
          <div className="h-[1px] flex-1 bg-gradient-to-r from-[#F1F3F6] to-transparent" />
        </div>

        <ul className="space-y-6">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-center gap-5 group/item">
              <div
                className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500 group-hover/item:rotate-6 ${
                  plan.isPopular
                    ? "bg-[hsl(var(--brand-primary))/10] text-[hsl(var(--brand-primary))]"
                    : "bg-[#F8F9FB] text-[#C1C7D0]"
                }`}
              >
                <Check className="h-5 w-5" strokeWidth={4} />
              </div>
              <span className="text-sm text-[#1A1D1F] font-black italic group-hover/item:translate-x-1 transition-transform truncate">
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="pt-6 pb-12 px-10">
        <CheckoutButton
          onClick={() => onSubscribe(plan)}
          isLoading={isLoading}
          isProcessing={isProcessing}
          className={`w-full h-20 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-2xl italic border-none ${
            plan.isPopular
              ? "bg-[#1A1D1F] text-white hover:bg-black shadow-black/20 hover:scale-[1.02]"
              : "bg-[#F8F9FB] hover:bg-white text-[#1A1D1F] border border-[#F1F3F6] shadow-black/[0.02] hover:-translate-y-1"
          }`}
        >
          {plan.productId ? "Provision Protocol" : "Initialize Node"}
        </CheckoutButton>
      </CardFooter>

      <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
        <ShieldCheck className="w-32 h-32" strokeWidth={1} />
      </div>
    </Card>
  );
}
