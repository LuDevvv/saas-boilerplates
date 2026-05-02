import { FC } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@node-stack/ui";

export const KycCard: FC = () => (
  <div className="rounded-[24px] bg-[#004080] text-white p-6 shadow-xl shadow-blue-900/20 group hover:scale-[1.01] transition-all">
    <div className="flex items-center justify-between mb-4">
      <p className="text-[10px] font-label uppercase opacity-60">Seguridad Legal</p>
      <ShieldCheck className="h-5 w-5 text-[#00E6E6]" />
    </div>
    <h3 className="text-xl font-heading mb-1">KYC Verificado</h3>
    <p className="text-xs font-label opacity-70 leading-relaxed">
      Tu empresa cumple con todas las normativas fiscales vigentes.
    </p>
    <Button className="mt-6 w-full bg-white/10 hover:bg-white/20 border border-white/5 rounded-xl py-2 text-[11px] font-label transition-all">
      Documentación Legal
    </Button>
  </div>
);