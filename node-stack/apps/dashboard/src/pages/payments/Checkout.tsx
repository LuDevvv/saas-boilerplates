import React, { useState } from "react";
import {
  CreditCard,
  Calendar,
  Lock,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Button, Input, Badge, Select } from "@node-stack/ui";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/utils/classNames";
import { BackButton } from "@/components/shared/BackButton";

const checkoutSchema = z.object({
  email: z.string().email("Email inválido"),
  cardName: z.string().min(3, "Nombre muy corto"),
  cardNumber: z.string().min(19, "Número incompleto"),
  expiry: z.string().regex(/^(0[1-9]|1[0-2]) \/ \d{2}$/, "Formato MM / AA"),
  cvc: z.string().min(3, "Mínimo 3 dígitos").max(4),
  address: z.string().min(5, "Dirección requerida"),
  country: z.string().min(1, "País requerido")
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

const plansData = {
  free: { name: "Starter", price: 0, yearlyPrice: 0 },
  pro: { name: "Growth", price: 29, yearlyPrice: 290 },
  elite: { name: "Unlimited", price: 99, yearlyPrice: 990 }
};

const countryOptions = [
  { value: "US", label: "Estados Unidos" },
  { value: "ES", label: "España" },
  { value: "MX", label: "México" },
  { value: "CO", label: "Colombia" },
  { value: "AR", label: "Argentina" },
  { value: "CL", label: "Chile" }
];

const Checkout: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSummaryMobile, setShowSummaryMobile] = useState(false);

  const planId = searchParams.get("plan") || "pro";
  const billing = searchParams.get("billing") || "monthly";
  const extraUsers = parseInt(searchParams.get("users") || "0");
  const extraWorkspaces = parseInt(searchParams.get("workspaces") || "0");
  const isOnboarding = searchParams.get("onboarding") === "true";

  const isYearly = billing === "yearly";
  const planInfo = (plansData as any)[planId] || plansData.pro;

  const basePrice = isYearly ? planInfo.yearlyPrice : planInfo.price;
  const addonsTotal = (extraUsers * 5) + (extraWorkspaces * 10);
  const totalToday = basePrice + addonsTotal;

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: "usuario@ejemplo.com",
      country: "ES"
    }
  });

  const selectedCountry = watch("country");

  const onSubmit = async (_data: CheckoutForm) => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    
    if (isOnboarding) {
      navigate("/");
    } else {
      navigate("/payments?success=true");
    }
  };

  const OrderSummary = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={cn(
      "space-y-6",
      isMobile ? "bg-slate-50 dark:bg-white/5 p-6 rounded-[24px] border border-slate-100 dark:border-white/5" : ""
    )}>
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className={cn("font-label", isMobile ? "text-slate-900 dark:text-white" : "text-white text-lg")}>
            Plan {planInfo.name}
          </span>
          <span className={cn("text-[10px] font-label uppercase mt-1", isMobile ? "text-slate-400" : "text-white/30")}>
            {isYearly ? "Facturación Anual" : "Facturación Mensual"}
          </span>
        </div>
        <span className={cn("font-label", isMobile ? "text-slate-900 dark:text-white text-lg" : "text-white text-lg")}>
          US$ {basePrice}.00
        </span>
      </div>

      <div className="space-y-4 pt-4 border-t border-dashed border-slate-200 dark:border-white/10">
        {extraUsers > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className={isMobile ? "text-slate-500" : "text-white/40"}>{extraUsers} Usuarios extra</span>
            <span className={isMobile ? "text-slate-900 dark:text-white" : "text-white/70 font-label"}>US$ {extraUsers * 5}.00</span>
          </div>
        )}
        {extraWorkspaces > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className={isMobile ? "text-slate-500" : "text-white/40"}>{extraWorkspaces} Workspaces extra</span>
            <span className={isMobile ? "text-slate-900 dark:text-white" : "text-white/70 font-label"}>US$ {extraWorkspaces * 10}.00</span>
          </div>
        )}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-white/10">
          <span className={cn("font-label uppercase", isMobile ? "text-slate-900 dark:text-white" : "text-white text-base")}>Total</span>
          <span className={cn("font-kpi", isMobile ? "text-slate-900 dark:text-white text-2xl" : "text-white text-3xl")}>
            US$ {totalToday}.00
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0A0A] flex flex-col lg:flex-row animate-in fade-in duration-500">
      {/* Desktop Sidebar Summary (Solid Blue) */}
      <div className="hidden lg:flex w-[38%] bg-[#004080] dark:bg-[#001a33] p-16 flex-col justify-between shadow-2xl overflow-y-auto custom-scrollbar sticky top-0 h-screen">
        <div className="relative z-10">
          <BackButton label="Cancelar Pago" className="mb-12 text-white/40 hover:text-white" />

          <div className="space-y-4 mb-10">
            <Badge className="bg-[#00E6E6]/10 text-[#00E6E6] border border-[#00E6E6]/20 text-[10px] font-label uppercase px-3 py-1 rounded-full">
              Suscripción Segura
            </Badge>
            <h1 className="text-5xl font-kpi text-white leading-tight">
              US$ {totalToday}.00 <span className="text-xl text-white/30 font-kpi">/{isYearly ? "año" : "mes"}</span>
            </h1>
          </div>

          <div className="bg-white/5 p-8 rounded-[32px] border border-white/10">
            <OrderSummary />
          </div>

          <div className="mt-12 space-y-6">
            <div className="flex items-start gap-4">
              <div className="mt-1 w-5 h-5 rounded-full bg-[#00E6E6]/10 flex items-center justify-center flex-shrink-0 border border-[#00E6E6]/20">
                <CheckCircle2 className="w-3 h-3 text-[#00E6E6]" />
              </div>
              <span className="text-white/60 text-sm font-label leading-relaxed">Acceso inmediato y sin interrupciones</span>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1 w-5 h-5 rounded-full bg-[#00E6E6]/10 flex items-center justify-center flex-shrink-0 border border-[#00E6E6]/20">
                <CheckCircle2 className="w-3 h-3 text-[#00E6E6]" />
              </div>
              <span className="text-white/60 text-sm font-label leading-relaxed">Cancelación flexible en un clic</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-12 flex items-center justify-between border-t border-white/5 text-[9px] font-label text-white/20 uppercase">
          <span>Seguridad de nivel Bancario</span>
          <div className="flex gap-6">
            <span className="hover:text-white/40 cursor-pointer transition-colors">Términos</span>
            <span className="hover:text-white/40 cursor-pointer transition-colors">Privacidad</span>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 md:p-12 lg:p-20 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <div className="lg:hidden mb-8">
            <BackButton label="Atrás" />
          </div>

          <div className="mb-10">
            <h2 className="text-2xl lg:text-3xl font-heading text-slate-900 dark:text-white mb-2">Detalles del Pago</h2>
            <p className="text-sm font-label text-slate-400">Ingresa la información para activar tu cuenta.</p>
          </div>

          {/* Mobile Integrated Summary */}
          <div className="lg:hidden mb-10">
            <button
              onClick={() => setShowSummaryMobile(!showSummaryMobile)}
              className="w-full flex items-center justify-between p-5 bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5"
            >
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-label text-slate-400 uppercase">Resumen de Orden</span>
                <span className="text-lg font-kpi text-slate-900 dark:text-white">US$ {totalToday}.00</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <span className="text-xs font-label">{showSummaryMobile ? "Ocultar" : "Ver detalles"}</span>
                {showSummaryMobile ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>
            {showSummaryMobile && (
              <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
                <OrderSummary isMobile />
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Correo Electrónico"
                placeholder="usuario@ejemplo.com"
                {...register("email")}
                error={errors.email?.message}
              />
              <Input
                label="Nombre en la Tarjeta"
                placeholder="Ej: Juan Pérez"
                {...register("cardName")}
                error={errors.cardName?.message}
              />
            </div>

            <Input
              label="Información de la Tarjeta"
              placeholder="1234 1234 1234 1234"
              icon={<CreditCard />}
              {...register("cardNumber")}
              error={errors.cardNumber?.message}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 16);
                const formatted = val.match(/.{1,4}/g)?.join(" ") || val;
                setValue("cardNumber", formatted, { shouldValidate: true });
              }}
            />

            <div className="grid grid-cols-2 gap-6">
              <Input
                label="Vencimiento"
                placeholder="MM / AA"
                icon={<Calendar />}
                {...register("expiry")}
                error={errors.expiry?.message}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                  if (val.length >= 2) {
                    setValue("expiry", `${val.slice(0, 2)} / ${val.slice(2)}`, { shouldValidate: true });
                  } else {
                    setValue("expiry", val, { shouldValidate: true });
                  }
                }}
              />
              <Input
                label="CVC"
                placeholder="123"
                icon={<Lock />}
                {...register("cvc")}
                error={errors.cvc?.message}
                maxLength={4}
              />
            </div>

            <div className="space-y-6 pt-6 border-t border-slate-200 dark:border-white/5">
              <div className="flex items-center gap-2">
                <h3 className="text-[11px] font-label uppercase text-slate-400">Dirección de Facturación</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="País / Región"
                  options={countryOptions}
                  value={selectedCountry}
                  onChange={(val) => setValue("country", val, { shouldValidate: true })}
                  error={errors.country?.message}
                />
                <Input
                  label="Dirección"
                  placeholder="Calle y número"
                  {...register("address")}
                  error={errors.address?.message}
                />
              </div>
            </div>

            <div className="pt-8">
              <Button
                type="submit"
                loading={isSubmitting}
                className="w-full h-16 rounded-2xl bg-primary text-white font-heading text-sm uppercase hover:bg-primary-600 active:scale-95 transition-all shadow-2xl shadow-blue-900/20"
              >
                Pagar US$ {totalToday}.00 ahora
              </Button>
            </div>

            <div className="flex items-start gap-4 p-6 bg-slate-50 dark:bg-white/5 rounded-[24px] border border-slate-100 dark:border-white/10">
              <Info className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] font-label text-slate-500 leading-relaxed">
                Al confirmar el pago, aceptas nuestros términos de servicio. El cargo se realizará de forma automática según el ciclo de facturación {isYearly ? "anual" : "mensual"} de Elora.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
