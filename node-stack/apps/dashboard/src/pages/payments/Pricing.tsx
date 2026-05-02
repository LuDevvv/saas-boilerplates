import React, { useState } from "react";
import { Check, ArrowRight, Minus, Plus, ChevronRight } from "lucide-react";
import { Button, Card, Badge, BillingToggle } from "@node-stack/ui";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { useAuth } from "@/hooks/stores/useAuth";
import { useNavigate } from "react-router-dom";
import { cn } from "@/utils/classNames";
import { BackButton } from "@/components/shared/BackButton";

const plans = [
  {
    id: "free",
    name: "Starter",
    price: 0,
    yearlyPrice: 0,
    description: "Ideal para proyectos personales y pequeñas pruebas.",
    features: [
      "Hasta 3 proyectos activos",
      "Analíticas básicas",
      "Soporte vía email",
      "100MB de almacenamiento"
    ],
    color: "blue"
  },
  {
    id: "pro",
    name: "Growth",
    price: 29,
    yearlyPrice: 290,
    description: "Para negocios que necesitan escalar con potencia.",
    features: [
      "Proyectos ilimitados",
      "Analíticas avanzadas",
      "Soporte prioritario 24/7",
      "10GB de almacenamiento",
      "Exportación de datos",
      "Acceso API"
    ],
    color: "cyan",
    popular: true
  },
  {
    id: "elite",
    name: "Unlimited",
    price: 99,
    yearlyPrice: 990,
    description: "Soluciones personalizadas para corporaciones.",
    features: [
      "Todo lo del plan Pro",
      "Infraestructura dedicada",
      "SLA del 99.99%",
      "Almacenamiento ilimitado",
      "Manager dedicado"
    ],
    color: "blue"
  }
];

const Pricing: React.FC<{ isOnboarding?: boolean }> = ({ isOnboarding = false }) => {
  const { currentPlan } = useAuth();
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(false);
  const [extraUsers, setExtraUsers] = useState(0);
  const [extraWorkspaces, setExtraWorkspaces] = useState(0);

  const handleSelectPlan = (planId: string) => {
    const cycle = isAnnual ? "yearly" : "monthly";
    const addonsParams = `&users=${extraUsers}&workspaces=${extraWorkspaces}`;
    const onboardingParam = isOnboarding ? "&onboarding=true" : "";
    navigate(`/payments/checkout?plan=${planId}&billing=${cycle}${addonsParams}${onboardingParam}`);
  };

  return (
    <div className="pb-20 animate-in fade-in duration-700">
      {!isOnboarding && <BackButton to="/payments" label="Volver a Pagos" className="mb-8" />}

      <div className="flex flex-col items-center text-center mb-16">
        <SectionHeader
          title="El plan perfecto para tu equipo"
          subtitle="Optimiza tu flujo de trabajo con la potencia del motor Elora. Cancela en cualquier momento."
          className="items-center text-center max-w-2xl"
        />

        {/* Billing Toggle */}
        <BillingToggle
          isAnnualBilling={isAnnual}
          onChange={setIsAnnual}
          className="mt-8"
          discountLabel="-15%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-[1200px] mx-auto mb-20">
        {plans.map((plan) => {
          const isCurrent = currentPlan?.planId === plan.id || (plan.id === "pro" && currentPlan?.planId === "premium");
          const basePrice = isAnnual ? plan.yearlyPrice : plan.price;

          return (
            <Card
              key={plan.id}
              className={cn(
                "relative flex flex-col p-8 rounded-[32px] border transition-all duration-500 group overflow-hidden",
                plan.popular
                  ? "border-primary bg-white dark:bg-[#121212] shadow-2xl shadow-blue-900/10 z-10"
                  : "border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 backdrop-blur-sm"
              )}
            >
              {plan.popular && (
                <div className="absolute top-6 right-6">
                  <Badge className="bg-[#004080] text-white border-none font-label text-[10px] uppercase px-3 py-1 rounded-full">
                    Más Popular
                  </Badge>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-heading text-gray-900 dark:text-white mb-1">{plan.name}</h3>
                <p className="text-sm font-label text-gray-500 dark:text-gray-400 mb-8 min-h-[40px]">
                  {plan.description}
                </p>

                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-kpi text-gray-900 dark:text-white leading-none">
                    ${basePrice}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 font-kpi text-sm">/mes</span>
                </div>
                <p className="text-[11px] font-label text-gray-400 uppercase mt-3">
                  {isAnnual ? "Facturado anualmente" : "Facturado mensualmente"}
                </p>
              </div>

              <div className="flex-1 space-y-4 mb-10">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-colors",
                      plan.popular
                        ? "bg-primary/10 text-primary border-primary/20"
                        : "bg-gray-100 dark:bg-white/5 text-gray-500 border-gray-200 dark:border-white/10"
                    )}>
                      <Check className="w-3 h-3 stroke-[3px]" />
                    </div>
                    <span className="text-[13px] font-label text-gray-600 dark:text-gray-300">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                disabled={isCurrent}
                onClick={() => handleSelectPlan(plan.id)}
                className={cn(
                  "w-full h-14 rounded-2xl font-label text-sm uppercase transition-all duration-300 active:scale-95",
                  isCurrent
                    ? "bg-gray-100 dark:bg-white/5 text-gray-400 cursor-default border-none"
                    : plan.popular
                      ? "bg-primary text-white hover:bg-primary-600 shadow-xl shadow-blue-900/20"
                      : "btn-secondary w-full h-14"
                )}
              >
                {isCurrent ? "Plan Actual" : "Mejorar Ahora"}
                {!isCurrent && <ArrowRight className="ml-2 w-4 h-4" />}
              </Button>
            </Card>
          );
        })}
      </div>

      {/* Add-ons Section */}
      <div className="max-w-4xl mx-auto mb-20">
        <div className="flex flex-col items-center text-center mb-10">
          <h3 className="text-2xl font-heading text-gray-900 dark:text-white">Personaliza con Add-ons</h3>
          <p className="text-sm font-label text-gray-500 mt-2">Escala tu plan según las necesidades de tu equipo.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 rounded-[24px] border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 backdrop-blur-sm flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="font-heading text-gray-900 dark:text-white">Usuarios Adicionales</h4>
              <p className="text-xs text-gray-500">+$5 / usuario al mes</p>
            </div>
            <div className="flex items-center gap-4 bg-gray-100 dark:bg-white/10 p-1 rounded-xl border border-gray-200 dark:border-white/10">
              <button
                onClick={() => setExtraUsers(Math.max(0, extraUsers - 1))}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white dark:hover:bg-white/10 transition-colors text-gray-500"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-kpi text-gray-900 dark:text-white">{extraUsers}</span>
              <button
                onClick={() => setExtraUsers(extraUsers + 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white dark:hover:bg-white/10 transition-colors text-gray-500"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </Card>

          <Card className="p-6 rounded-[24px] border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 backdrop-blur-sm flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="font-heading text-gray-900 dark:text-white">Workspaces Extra</h4>
              <p className="text-xs text-gray-500">+$10 / espacio al mes</p>
            </div>
            <div className="flex items-center gap-4 bg-gray-100 dark:bg-white/10 p-1 rounded-xl border border-gray-200 dark:border-white/10">
              <button
                onClick={() => setExtraWorkspaces(Math.max(0, extraWorkspaces - 1))}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white dark:hover:bg-white/10 transition-colors text-gray-500"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-kpi text-gray-900 dark:text-white">{extraWorkspaces}</span>
              <button
                onClick={() => setExtraWorkspaces(extraWorkspaces + 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white dark:hover:bg-white/10 transition-colors text-gray-500"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Elora CTA Banner */}
      <Card className="w-full p-10 md:p-12 border-none bg-gray-900 dark:bg-[#121212] rounded-[32px] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[80px] rounded-full -mr-20 -mt-20" />
        <div className="max-w-md text-center md:text-left relative z-10">
          <h3 className="text-2xl font-heading text-white mb-3">¿Deseas una solución personalizada?</h3>
          <p className="text-sm font-label text-gray-400 leading-relaxed">
            Hablemos sobre cómo Elora puede escalar con tu infraestructura dedicada y soporte técnico a medida.
          </p>
        </div>
        <Button className="btn-secondary w-full md:w-auto h-12 px-10">
          Hablar con Ventas
          <ChevronRight className="ml-2 w-4 h-4" />
        </Button>
      </Card>
    </div>
  );
};

export default Pricing;