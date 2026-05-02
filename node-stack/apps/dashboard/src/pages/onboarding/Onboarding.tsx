import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Select, Card } from "@node-stack/ui";
import { Building2, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/stores/useAuth";

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "",
    role: "founder"
  });

  const roleOptions = [
    { value: "founder", label: "Fundador / CEO" },
    { value: "developer", label: "Desarrollador" },
    { value: "designer", label: "Diseñador" },
    { value: "manager", label: "Product Manager" },
    { value: "other", label: "Otro" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call to save onboarding data
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    navigate("/onboarding/pricing");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0A0A] flex flex-col justify-center items-center p-6 animate-in fade-in duration-700">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-heading text-slate-900 dark:text-white mb-3">
            ¡Bienvenido, {user?.firstName || 'Usuario'}!
          </h1>
          <p className="text-sm font-label text-slate-500 dark:text-slate-400 leading-relaxed">
            Configuremos tu espacio de trabajo. Solo tomará un minuto y nos ayudará a personalizar tu experiencia.
          </p>
        </div>

        <Card className="p-8 rounded-[32px] border-slate-100 dark:border-white/5 bg-white dark:bg-white/5 shadow-2xl shadow-blue-900/5">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Nombre de tu Empresa / Proyecto"
              placeholder="Ej: NodeStack Inc."
              icon={<Building2 className="w-5 h-5" />}
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              required
            />

            <Select
              label="Tu rol principal"
              options={roleOptions}
              value={formData.role}
              onChange={(val) => setFormData({ ...formData, role: val })}
            />

            <Button
              type="submit"
              loading={isSubmitting}
              className="w-full h-14 rounded-2xl bg-primary text-white font-heading text-sm uppercase hover:bg-primary-600 active:scale-95 transition-all shadow-xl shadow-primary/20 mt-8"
            >
              Continuar
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </form>
        </Card>

        {/* Progress indicator */}
        <div className="mt-10 flex items-center justify-center gap-2">
          <div className="w-8 h-2 rounded-full bg-primary" />
          <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-white/10" />
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
