import { Plus, Trash2, ShieldCheck } from "lucide-react";
import { Button, Card, Badge } from "@node-stack/ui";
import { SectionHeader } from "@/components/layout/SectionHeader";

const PaymentMethods = () => {
  const methods = [
    { id: "1", type: "Visa", last4: "4242", expiry: "12/28", isDefault: true },
  ];

  return (
    <div className="w-full animate-fade-in-up pb-10 flex flex-col gap-10 max-w-[1600px] mx-auto px-4 md:px-6">
      <SectionHeader
        title="Métodos de Pago"
        subtitle="Administra tus tarjetas y métodos de pago guardados."
      />

      <div className="max-w-4xl space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-heading text-fg ">Tarjetas Guardadas</h3>
          <Button size="lg" icon={Plus} className="rounded-2xl font-heading shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all">
            Añadir Tarjeta
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {methods.map((method) => (
            <Card
              key={method.id}
              className="group relative flex items-center gap-5 rounded-[24px] border border-gray-100/80 bg-white/80 backdrop-blur-xl p-6 lg:p-7 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-gray-900/80 hover:border-primary-200 dark:hover:border-primary-500/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              {/* Ambient glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              <div className="flex h-14 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200/50 dark:from-gray-800 dark:to-gray-900 dark:border-gray-700 font-heading text-fg-secondary text-[18px]  relative z-10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)]">
                {method.type}
              </div>
              <div className="flex-1 relative z-10">
                <div className="flex items-center gap-3 mb-1">
                  <p className="text-[16px] font-kpi text-fg ">•••• {method.last4}</p>
                  {method.isDefault && (
                    <Badge variant="success" className=" flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> Principal
                    </Badge>
                  )}
                </div>
                <p className="text-[13px] font-label text-fg-secondary">Expira el {method.expiry}</p>              </div>
              <button className="relative z-10 opacity-0 group-hover:opacity-100 p-3 bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-all active:scale-90 shadow-sm translate-x-4 group-hover:translate-x-0 duration-300">
                <Trash2 className="h-4 w-4" />
              </button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaymentMethods;
