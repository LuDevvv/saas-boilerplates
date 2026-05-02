import { FC } from "react";
import { 
  Globe, 
  MapPin, 
  Briefcase, 
  Save 
} from "lucide-react";
import { Button, Input } from "@node-stack/ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CompanyFormValues, companySchema } from "../types";

interface CompanyEditFormProps {
  workspace?: { name?: string } | null;
  onSave: (data: CompanyFormValues) => Promise<void>;
}

export const CompanyEditForm: FC<CompanyEditFormProps> = ({ workspace, onSave }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: workspace?.name || "",
      vatNumber: "B12345678",
      website: "https://azteli.com",
      industry: "Tecnología / SaaS",
      address: "Calle Innovación 42, Madrid, ES",
    }
  });

  return (
    <form onSubmit={handleSubmit(onSave)} className="card-premium p-6 md:p-8 space-y-6 md:space-y-8">
      <div className="flex items-center justify-between border-b border-gray-50 dark:border-white/5 pb-4 md:pb-6">
        <h3 className="text-lg font-heading text-gray-950 dark:text-white">Datos Corporativos</h3>
        <span className="hidden sm:inline text-[11px] font-label text-gray-400 uppercase">Identidad Legal</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="space-y-1">
          <Input 
            label="Nombre Comercial"
            placeholder="Nombre de tu empresa"
            {...register("name")}
            className="rounded-xl h-12"
          />
          {errors.name && <p className="text-[10px] text-red-500 font-label ml-1">{errors.name.message}</p>}
        </div>
        <div className="space-y-1">
          <Input 
            label="CIF / NIF"
            placeholder="B-12345678"
            {...register("vatNumber")}
            className="rounded-xl h-12"
          />
          {errors.vatNumber && <p className="text-[10px] text-red-500 font-label ml-1">{errors.vatNumber.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="space-y-1">
          <Input 
            label="Sitio Web"
            icon={Globe}
            placeholder="https://tuempresa.com"
            {...register("website")}
            className="rounded-xl h-12"
          />
          {errors.website && <p className="text-[10px] text-red-500 font-label ml-1">{errors.website.message}</p>}
        </div>
        <div className="space-y-1">
          <Input 
            label="Sector Industrial"
            icon={Briefcase}
            placeholder="Ej: Finanzas, Tecnología"
            {...register("industry")}
            className="rounded-xl h-12"
          />
          {errors.industry && <p className="text-[10px] text-red-500 font-label ml-1">{errors.industry.message}</p>}
        </div>
      </div>

      <div className="space-y-1">
        <Input 
          label="Sede Social / Dirección"
          icon={MapPin}
          placeholder="Dirección fiscal completa"
          {...register("address")}
          className="rounded-xl h-12"
        />
        {errors.address && <p className="text-[10px] text-red-500 font-label ml-1">{errors.address.message}</p>}
      </div>

      <div className="pt-4 flex justify-end">
        <Button 
          type="submit" 
          loading={isSubmitting}
          className="w-full sm:w-auto px-10 h-12 rounded-xl bg-[#004080] hover:bg-[#003366] text-white font-label transition-all active:scale-95 shadow-lg shadow-blue-900/10"
        >
          <Save className="h-4 w-4 mr-2" />
          Actualizar Empresa
        </Button>
      </div>
    </form>
  );
};