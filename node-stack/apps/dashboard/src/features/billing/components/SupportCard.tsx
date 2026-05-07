import { FC } from "react";
import { Headphones, ArrowUpRight } from "lucide-react";
import { Button, CalloutCard } from "@node-stack/ui";

interface SupportCardProps {
  onContactSupport: () => void;
  className?: string;
}

export const SupportCard: FC<SupportCardProps> = ({ onContactSupport, className }) => (
  <CalloutCard
    icon={Headphones}
    iconTone="primary"
    variant="muted"
    layout="horizontal"
    title="¿Dudas con tu factura?"
    description="Si encuentras algún error en tus cobros o necesitas una factura personalizada, nuestro equipo de soporte financiero te atenderá de inmediato."
    action={
      <Button
        onClick={onContactSupport}
        className="w-full sm:w-auto h-10 px-5 rounded-xl bg-primary hover:bg-primary-600 text-primary-foreground text-[13px] font-medium active:scale-[0.98]"
      >
        Soporte de Pagos
        <ArrowUpRight className="ml-1.5 h-4 w-4" />
      </Button>
    }
    className={className}
  />
);
