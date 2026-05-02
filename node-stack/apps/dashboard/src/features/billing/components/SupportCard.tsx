import { FC } from "react";
import { ChevronRight } from "lucide-react";
import { Button, Card } from "@node-stack/ui";

interface SupportCardProps {
  onContactSupport: () => void;
  className?: string;
}

export const SupportCard: FC<SupportCardProps> = ({ onContactSupport, className }) => {
  return (
    <Card className={`bg-[#004080] dark:bg-[#001a33] rounded-[32px] p-6 sm:p-10 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-blue-900/20 overflow-hidden relative ${className || ""}`}>
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[80px] rounded-full -mr-20 -mt-20" />
      
      <div className="max-w-xl text-center md:text-left relative z-10">
        <h3 className="text-xl md:text-3xl font-heading mb-3">¿Dudas con tu factura?</h3>
        <p className="text-xs md:text-base font-label opacity-70 leading-relaxed">
          Si encuentras algún error en tus cobros o necesitas una factura personalizada, nuestro equipo de soporte financiero te atenderá de inmediato.
        </p>
      </div>
      
      <Button 
        onClick={onContactSupport}
        className="w-full md:w-auto px-10 h-11 md:h-12 rounded-xl bg-[#00E6E6] text-[#004080] font-label hover:bg-[#00CCCC] active:scale-95 transition-all shadow-xl relative z-10 text-xs md:text-base"
      >
        Soporte de Pagos
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </Card>
  );
};