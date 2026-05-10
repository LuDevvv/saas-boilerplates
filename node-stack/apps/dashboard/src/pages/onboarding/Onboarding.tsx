import { Button, Input, Select, PhoneInput } from "@node-stack/ui";
import { ArrowRight, ChevronLeft, User, Briefcase } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

import { Logo } from "@/assets/logo/logo";
import { useUpdateProfile } from "@/features/auth/hooks/useUpdateProfile";
import { useCreateWorkspace, useWorkspaces } from "@/features/workspaces/hooks/useWorkspaces";
import { useAuth } from "@/hooks/stores/useAuth";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { AuthSidebar } from "@pages/auth/components/AuthSidebar";

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { mutateAsync: updateProfile } = useUpdateProfile();
  const { data: workspaces } = useWorkspaces();
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem("onboarding_data");
    const parsed = saved ? JSON.parse(saved) : {};
    return {
      name: parsed.name || user?.firstName || "",
      jobTitle: parsed.jobTitle || "",
      phone: parsed.phone || user?.phone || "",
      companyName: parsed.companyName || "",
      sector: parsed.sector || "",
      teamSize: parsed.teamSize || "",
      revenue: parsed.revenue || "",
    };
  });

  useEffect(() => {
    localStorage.setItem("onboarding_data", JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    const savedStep = localStorage.getItem("onboarding_step");
    if (savedStep) setStep(parseInt(savedStep, 10));
  }, []);

  useEffect(() => {
    localStorage.setItem("onboarding_step", step.toString());
  }, [step]);

  // Lead recovery: user captured phone (step 1 done) but has no workspace → resume at step 2
  useEffect(() => {
    const hasWorkspace = Array.isArray(workspaces) && workspaces.length > 0;
    if (user?.phone && !hasWorkspace) {
      setStep(2);
    }
  }, [user?.phone, workspaces]);

  const jobTitleOptions = [
    { value: "founder", label: "Propietario/a" },
    { value: "accountant", label: "Contador/a" },
    { value: "admin", label: "Administrador/a" },
    { value: "manager", label: "Gerente" },
    { value: "cto", label: "CTO / Director Tecnológico" },
    { value: "other", label: "Otro" },
  ];

  const sectorOptions = [
    { value: "retail", label: "Comercio Minorista (Retail)" },
    { value: "services", label: "Servicios Profesionales" },
    { value: "tech", label: "Tecnología / Software" },
    { value: "food", label: "Restaurantes / Alimentos" },
    { value: "health", label: "Salud / Médicos" },
    { value: "other", label: "Otro Sector" },
  ];

  const teamSizeOptions = [
    { value: "1", label: "Solo yo" },
    { value: "2-6", label: "2 - 6" },
    { value: "7-15", label: "7 - 15" },
    { value: "16-30", label: "16 - 30" },
    { value: "31+", label: "Más de 30" },
  ];

  const revenueOptions = [
    { value: "0-50k", label: "Menos de $50,000" },
    { value: "50k-200k", label: "$50,000 - $200,000" },
    { value: "200k-500k", label: "$200,000 - $500,000" },
    { value: "500k+", label: "Más de $500,000" },
    { value: "prefer-not", label: "Prefiero no decirlo" },
  ];

  const { mutateAsync: createWorkspace } = useCreateWorkspace();

  const handleNext = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.name.trim()) newErrors["name"] = "El nombre es obligatorio";
      if (!formData.jobTitle) newErrors["jobTitle"] = "El cargo es obligatorio";
      if (!formData.phone || formData.phone.length < 8) newErrors["phone"] = "Ingresa un número de WhatsApp válido";
    } else {
      if (!formData.companyName.trim()) newErrors["companyName"] = "El nombre de la empresa es obligatorio";
      if (!formData.sector) newErrors["sector"] = "Selecciona un sector";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    if (step === 1) {
      try {
        await updateProfile({
          firstName: formData.name,
          phone: formData.phone,
          jobTitle: formData.jobTitle,
        });
      } catch (err) {
        console.error("Error guardando lead:", err);
      }
      setStep(2);
    } else {
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const workspace = await createWorkspace({
        name: formData.companyName,
        industry: formData.sector || undefined,
        teamSize: formData.teamSize || undefined,
        revenueRange: formData.revenue || undefined,
      });

      // Set as active so X-Workspace-ID header is available in checkout
      if (workspace?.id) setActiveWorkspace(workspace.id);

      localStorage.removeItem("onboarding_data");
      localStorage.removeItem("onboarding_step");
      navigate("/onboarding/pricing");
    } catch {
      setErrors({ companyName: "Hubo un error al crear tu espacio. Inténtalo de nuevo." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-canvas font-sans">

      {/* ─── PANE IZQUIERDO (Formulario) ─── */}
      <div className="w-full lg:w-1/2 flex flex-col p-8 lg:p-12 xl:p-16 h-screen overflow-y-auto relative z-10 bg-canvas">

        <div className="mx-auto w-full max-w-md flex-1 flex flex-col justify-center">

          <Link to="/" className="mb-8 w-fit">
            <Logo variant="full" width={140} height={35} />
          </Link>

          <div className="flex items-center justify-between mb-6">
            <button
              type="button"
              onClick={() => step > 1 && setStep(1)}
              className={`flex items-center text-sm font-medium text-primary hover:text-primary-600 transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Volver
            </button>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-fg-secondary">Paso {step} de 2</span>
              <div className="w-24 h-1.5 bg-border-subtle rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
                  style={{ width: step === 1 ? '50%' : '100%' }}
                />
              </div>
            </div>
          </div>

          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {step === 1 ? (
              <>
                <h1 className="text-3xl font-heading text-fg mb-2">Vamos a conocerte mejor</h1>
                <p className="text-sm text-fg-secondary mb-6 leading-relaxed">
                  Estos datos nos ayudarán a personalizar tu experiencia y configurar tu cuenta correctamente.
                </p>

                <form onSubmit={handleNext} noValidate className="space-y-5">
                  <Input
                    label="¿Cuál es tu nombre?"
                    placeholder="Ej.: José Rodríguez"
                    icon={<User className="w-4 h-4" />}
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors["name"]) setErrors({ ...errors, name: "" });
                    }}
                    error={errors["name"]}
                    required
                  />

                  <Select
                    label="¿Cuál es tu cargo dentro de la empresa?"
                    options={jobTitleOptions}
                    value={formData.jobTitle}
                    onChange={(val) => {
                      setFormData({ ...formData, jobTitle: val });
                      if (errors["jobTitle"]) setErrors({ ...errors, jobTitle: "" });
                    }}
                    error={errors["jobTitle"]}
                    required
                  />

                  <PhoneInput
                    label="Número de WhatsApp"
                    value={formData.phone}
                    onChange={(val) => {
                      setFormData({ ...formData, phone: val });
                      if (errors["phone"]) setErrors({ ...errors, phone: "" });
                    }}
                    error={errors["phone"]}
                    required
                  />

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-12 rounded-xl bg-primary hover:bg-primary-600 text-primary-foreground font-medium mt-6 shadow-none hover:translate-y-0 hover:scale-100 active:scale-100 transition-colors"
                  >
                    Continuar
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </form>
              </>
            ) : (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <h1 className="text-3xl font-heading text-fg mb-2">Cuéntanos sobre tu empresa</h1>
                <p className="text-sm text-fg-secondary mb-6 leading-relaxed">
                  Estos detalles nos ayudarán a adaptar la plataforma al tamaño y necesidades de tu negocio.
                </p>

                <form onSubmit={handleNext} noValidate className="space-y-6">
                  <Input
                    label="¿Cuál es el nombre de tu empresa?"
                    placeholder="Ej.: Ferretería El Sol SRL"
                    icon={<Briefcase className="w-4 h-4" />}
                    value={formData.companyName}
                    onChange={(e) => {
                      setFormData({ ...formData, companyName: e.target.value });
                      if (errors["companyName"]) setErrors({ ...errors, companyName: "" });
                    }}
                    error={errors["companyName"]}
                    required
                  />

                  <Select
                    label="¿En qué sector se ubica?"
                    options={sectorOptions}
                    value={formData.sector}
                    onChange={(val) => {
                      setFormData({ ...formData, sector: val });
                      if (errors["sector"]) setErrors({ ...errors, sector: "" });
                    }}
                    error={errors["sector"]}
                    required
                  />

                  <div className="space-y-2">
                    <label className="text-[13px] font-medium text-fg">
                      ¿Cuántas personas trabajan en tu empresa?
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {teamSizeOptions.map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, teamSize: opt.value })}
                          className={`flex-1 min-w-[60px] py-2.5 px-2 text-xs font-medium rounded-lg border transition-all ${
                            formData.teamSize === opt.value
                              ? 'border-primary bg-primary/5 text-primary shadow-[0_2px_8px_-2px_rgba(0,64,128,0.10)]'
                              : 'border-border text-fg-secondary hover:border-border-strong hover:bg-surface'
                          }`}
                        >
                          {opt.label === "Solo yo" ? "1" : opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Select
                    label="Rango de ingresos mensuales (Opcional)"
                    options={revenueOptions}
                    value={formData.revenue}
                    onChange={(val) => setFormData({ ...formData, revenue: val })}
                  />

                  <Button
                    type="submit"
                    size="lg"
                    loading={isSubmitting}
                    className="w-full h-12 rounded-xl bg-primary hover:bg-primary-600 text-primary-foreground font-medium mt-6 shadow-none hover:translate-y-0 hover:scale-100 active:scale-100 transition-colors"
                  >
                    {isSubmitting ? 'Configurando espacio...' : 'Finalizar y Continuar'}
                    {!isSubmitting && <ArrowRight className="ml-2 w-4 h-4" />}
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── PANE DERECHO ─── */}
      <AuthSidebar
        titleMain="Personaliza tu"
        titleAccent="espacio de trabajo"
        subtitle="Configura tu cuenta en pocos pasos y descubre todo lo que nuestra plataforma puede hacer por tu empresa."
      />
    </div>
  );
};

export default Onboarding;
