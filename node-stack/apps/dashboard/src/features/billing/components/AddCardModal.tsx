import { FC } from "react";
import { CreditCard, Calendar, Lock, ShieldCheck, Loader2 } from "lucide-react";
import { Button, Input } from "@node-stack/ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ModalLayout } from "@/layouts/ModalLayout";

// ─── Schema ───────────────────────────────────────────────────────────────────

const cardSchema = z.object({
  cardName: z.string()
    .min(2, "Ingresa el nombre tal como aparece en la tarjeta")
    .max(60, "Nombre demasiado largo"),
  cardNumber: z.string()
    .min(16, "Número de tarjeta inválido")
    .max(19, "Número de tarjeta inválido"),
  expiry: z.string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Formato inválido — usa MM/AA"),
  cvc: z.string()
    .min(3, "Mínimo 3 dígitos")
    .max(4, "Máximo 4 dígitos"),
});

type CardFormValues = z.infer<typeof cardSchema>;

// ─── Live card preview ────────────────────────────────────────────────────────

const CardPreview: FC<{ number: string; name: string; expiry: string }> = ({
  number,
  name,
  expiry,
}) => {
  const digits  = number.replace(/\D/g, "");
  const padded  = digits.padEnd(16, "·");
  const display = padded.match(/.{1,4}/g)?.join("  ") ?? "····  ····  ····  ····";

  return (
    <div
      className="h-[110px] w-full rounded-[16px] p-4 flex flex-col justify-between relative overflow-hidden select-none"
      style={{ background: "linear-gradient(135deg, #1A1F71 0%, #0A0E40 100%)" }}
    >
      {/* Decorative circles */}
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/[0.05]" />
      <div className="absolute right-6 top-6 h-14 w-14 rounded-full bg-white/[0.04]" />

      {/* Chip */}
      <div
        className="h-[11px] w-[15px] rounded-[2px] relative z-10"
        style={{ background: "linear-gradient(135deg, #D4AF37 0%, #B8920A 50%, #D4AF37 100%)" }}
      />

      {/* Bottom */}
      <div className="relative z-10">
        <p className="text-white font-mono text-[13px] leading-none mb-1.5">
          {display}
        </p>
        <div className="flex items-end justify-between">
          <p className="text-white/55 text-[10px] uppercase flex-1 truncate">
            {name || "Nombre del titular"}
          </p>
          <p className="text-white/55 text-[10px] ml-3 shrink-0">
            {expiry || "MM/AA"}
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CardFormValues) => Promise<void>;
  isEditing?: boolean;
  isSubmitting?: boolean;
}

export const AddCardModal: FC<AddCardModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isEditing = false,
  isSubmitting = false,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema as any),
    mode: "onBlur",
  });

  const cardName   = watch("cardName")   ?? "";
  const cardNumber = watch("cardNumber") ?? "";
  const expiry     = watch("expiry")     ?? "";

  const handleClose = () => {
    reset();
    onClose();
  };

  // ── Formatters ──────────────────────────────────────────────────────────────

  const formatCardNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    e.target.value = raw.match(/.{1,4}/g)?.join(" ") ?? raw;
    register("cardNumber").onChange(e);
  };

  const formatExpiry = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    e.target.value = raw.length >= 3 ? `${raw.slice(0, 2)}/${raw.slice(2)}` : raw;
    register("expiry").onChange(e);
  };

  const formatCvc = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4);
    register("cvc").onChange(e);
  };

  return (
    <ModalLayout
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? "Editar tarjeta" : "Añadir tarjeta"}
      description={
        isEditing
          ? "Actualiza los datos de tu método de pago."
          : "Introduce los datos de tu tarjeta para pagos seguros."
      }
      variant="drawer-right"
      footer={
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="w-full sm:w-auto h-11 px-6 rounded-xl text-[13px] font-medium"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="add-card-form"
            disabled={isSubmitting}
            className="w-full sm:w-auto h-11 px-8 rounded-xl text-white text-[13px] font-medium shadow-lg active:scale-[0.98] border-none"
            style={{ background: "linear-gradient(to right, #4D94DB, #004080)" }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              isEditing ? "Guardar cambios" : "Guardar tarjeta"
            )}
          </Button>
        </div>
      }
    >
      <form
        id="add-card-form"
        onSubmit={handleSubmit(onSubmit)}
        className="px-6 py-6 space-y-5"
      >
        {/* Live card preview */}
        <CardPreview number={cardNumber} name={cardName} expiry={expiry} />

        {/* Card name */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase text-gray-400">
            Nombre en la tarjeta
          </label>
          <Input
            icon={CreditCard}
            placeholder="Ej: María García"
            className="h-11 rounded-xl text-[14px]"
            {...register("cardName")}
            error={errors.cardName?.message}
          />
        </div>

        {/* Card number */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase text-gray-400">
            Número de tarjeta
          </label>
          <Input
            icon={CreditCard}
            placeholder="1234 5678 9012 3456"
            className="h-11 rounded-xl text-[14px] font-mono"
            {...register("cardNumber")}
            error={errors.cardNumber?.message}
            onChange={formatCardNumber}
          />
        </div>

        {/* Expiry + CVC */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase text-gray-400">
              Vencimiento
            </label>
            <Input
              icon={Calendar}
              placeholder="MM/AA"
              className="h-11 rounded-xl text-[14px]"
              {...register("expiry")}
              error={errors.expiry?.message}
              onChange={formatExpiry}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase text-gray-400">
              Código CVC
            </label>
            <Input
              icon={Lock}
              placeholder="···"
              className="h-11 rounded-xl text-[14px]"
              maxLength={4}
              {...register("cvc")}
              error={errors.cvc?.message}
              onChange={formatCvc}
            />
          </div>
        </div>

        {/* Security note */}
        <div className="flex items-center gap-2.5 p-3.5 rounded-[12px] bg-surface-muted border border-border">
          <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
          <p className="text-[11px] text-fg-muted leading-relaxed">
            Tus datos se cifran con TLS 256-bit. Nunca almacenamos tu número de tarjeta.
          </p>
        </div>
      </form>
    </ModalLayout>
  );
};
