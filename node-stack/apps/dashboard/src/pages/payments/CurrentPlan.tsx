import { Check, Calendar, ArrowRight, Activity, Clock } from "lucide-react";
import { Button, Card, CardContent, Badge, Progress } from "@node-stack/ui";
import { useAuth } from "@/hooks/stores/useAuth";
import { SectionHeader } from "@/components/layout/SectionHeader";

export const CurrentPlan: React.FC = () => {
  const { currentPlan, isPremium } = useAuth();

  // Dummy calculations for UI
  const remainingDays = 15;
  const percentage = 50;

  return (
    <div className="w-full animate-fade-in-up pb-10 flex flex-col gap-10 max-w-[1600px] mx-auto px-4 md:px-6">
      <SectionHeader
        title="Mi Plan"
        subtitle="Información detallada sobre tu suscripción actual y beneficios."
      />

      <div className="flex flex-col gap-6 w-full max-w-4xl">
        <Card variant="premium" className="overflow-hidden border-none shadow-premium relative">
          {/* Premium Gradient Background Accents */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 dark:from-primary-500 dark:to-primary-700" />
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary-500/10 blur-[100px] rounded-full pointer-events-none" />

          <CardContent className="p-8 sm:p-10 relative z-10">
            {/* Header Layout */}
            <div className="flex flex-col gap-6 pb-8 border-b border-gray-100 dark:border-white/5 w-full items-start">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <p className="text-[11px] font-label text-primary-600 dark:text-primary-400 uppercase ">Plan Actual</p>
                    <Badge variant={isPremium ? "success" : "secondary"} className=" px-3 py-1">
                      {isPremium ? "Activo" : "Gratuito"}
                    </Badge>
                  </div>
                  <h3 className="text-4xl md:text-5xl font-heading text-gray-950 dark:text-white ">
                    {currentPlan?.planId?.toUpperCase() || (isPremium ? "PRO" : "FREE")}
                  </h3>
                </div>

                {!isPremium && (
                  <Button size="lg" className="rounded-2xl py-6 px-8 text-[14px] font-label shadow-premium hover:translate-y-[-1px]">
                    Mejorar a Pro <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="w-full mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Benefits */}
              <div className="flex flex-col gap-6">
                <h4 className="text-[14px] font-label text-gray-900 dark:text-white uppercase  flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary-500" /> Beneficios Incluidos
                </h4>
                <ul className="space-y-4">
                  {["Acceso ilimitado al dashboard", "Soporte prioritario 24/7", "Analíticas avanzadas y reportes", "API de alto rendimiento"].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-[14px] font-label text-gray-600 dark:text-gray-400 group">
                      <div className="rounded-full bg-primary-50 p-1.5 dark:bg-primary-500/10 group-hover:bg-primary-100 dark:group-hover:bg-primary-500/20 transition-colors">
                        <Check className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Billing Details & Progress */}
              <Card className="bg-gray-50/80 p-6 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                    <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-label text-gray-900 dark:text-white uppercase ">Próximo cobro</h4>
                    <p className="text-2xl font-heading text-gray-950 dark:text-white  mt-1">15 May, 2026</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-2 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-label text-gray-500 flex items-center gap-1.5 uppercase ">
                      <Clock className="h-3.5 w-3.5" /> Ciclo de Facturación
                    </span>
                    <span className="text-[12px] font-label text-primary-600 dark:text-primary-400">
                      {remainingDays} días restantes
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>

                {isPremium && (
                  <Button variant="outline" className="mt-2 w-full text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 border-gray-200 dark:border-white/10">
                    Cancelar Suscripción
                  </Button>
                )}
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CurrentPlan;
