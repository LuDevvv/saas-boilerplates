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
    <div className="min-h-screen bg-canvas flex flex-col justify-center items-center p-6 animate-in fade-in duration-700">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-heading text-fg mb-3">
            ¡Bienvenido, {user?.firstName || 'Usuario'}!
          </h1>
          <p className="text-sm font-label text-fg-secondary leading-relaxed">
            Configuremos tu espacio de trabajo. Solo tomará un minuto y nos ayudará a personalizar tu experiencia.
          </p>
        </div>

        <Card className="p-8 rounded-[20px] border border-border bg-surface shadow-[var(--shadow-card)]">
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
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary-600 text-primary-foreground font-medium text-[13px] active:scale-[0.97] transition-colors shadow-[0_4px_14px_-2px_rgba(0,64,128,0.20)] dark:shadow-[0_4px_14px_-2px_rgba(91,168,229,0.20)] mt-4"
            >
              Continuar
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </form>
        </Card>

        {/* Progress indicator */}
        <div className="mt-10 flex items-center justify-center gap-2">
          <div className="w-8 h-2 rounded-full bg-primary" />
          <div className="w-2 h-2 rounded-full bg-border-strong" />
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
