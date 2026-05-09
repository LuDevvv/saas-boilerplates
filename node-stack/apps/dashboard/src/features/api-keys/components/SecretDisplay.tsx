import { Button } from "@node-stack/ui";
import { Check, Copy, Eye, EyeOff } from "lucide-react";
import { FC, useState } from "react";

import { appToast } from "@/components/alerts/Toasts";

interface SecretDisplayProps {
  secret: string;
}

export const SecretDisplay: FC<SecretDisplayProps> = ({ secret }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    appToast.success({ title: "Copiado", description: "Clave API copiada al portapapeles." });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between group">
        <code className="text-cyan-400 font-mono text-sm break-all">
          {isVisible ? secret : "•".repeat(secret.length > 32 ? 32 : secret.length)}
        </code>
        <div className="flex items-center gap-1 ml-4 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10"
            onClick={() => setIsVisible(!isVisible)}
          >
            {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10"
            onClick={handleCopy}
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          </Button>
        </div>
      </div>
      <p className="text-[10px] text-amber-500 font-label leading-relaxed bg-amber-500/5 p-3 rounded-xl border border-amber-500/10">
        ⚠️ Por seguridad, esta es la única vez que podrás ver la clave completa. Por favor, cópiala y guárdala en un lugar seguro.
      </p>
    </div>
  );
};
