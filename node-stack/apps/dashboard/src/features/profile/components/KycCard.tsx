import { FC } from "react";
import { ShieldCheck } from "lucide-react";
import { Button, CalloutCard } from "@node-stack/ui";

export const KycCard: FC = () => (
  <CalloutCard
    icon={ShieldCheck}
    iconTone="success"
    variant="card"
    eyebrow="Seguridad legal"
    title="KYC Verificado"
    description="Tu empresa cumple con todas las normativas fiscales vigentes."
    action={
      <Button
        variant="secondary"
        className="w-full rounded-xl py-2 text-[11px] font-label uppercase tracking-wider"
      >
        Documentación Legal
      </Button>
    }
  />
);
