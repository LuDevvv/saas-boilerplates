import { FC } from "react";
import { CreditCard, Calendar, Lock as LockIcon } from "lucide-react";
import { Button, Input } from "@node-stack/ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ModalLayout } from "@/layouts/ModalLayout";

const cardSchema = z.object({
  cardName: z.string().min(2, "El nombre es obligatorio"),
  cardNumber: z.string().min(16, "Mínimo 16 dígitos").max(19, "Máximo 19 dígitos"),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "MM/YY"),
  cvc: z.string().min(3, "Mínimo 3").max(4, "Máximo 4"),
});

type CardFormValues = z.infer<typeof cardSchema>;

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
  const { register, handleSubmit, formState: { errors }, reset } = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema)
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = val.match(/.{1,4}/g)?.join(" ") || val;
    e.target.value = formatted;
    register("cardNumber").onChange(e);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (val.length >= 2) {
      e.target.value = `${val.slice(0, 2)} / ${val.slice(2)}`;
    } else {
      e.target.value = val;
    }
    register("expiry").onChange(e);
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 4);
    e.target.value = val;
    register("cvc").onChange(e);
  };

  return (
    <ModalLayout
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? "Editar Tarjeta" : "Añadir Nueva Tarjeta"}
      subtitle={isEditing ? "Modifica los detalles de tu método de pago." : "Introduce los detalles de tu tarjeta para pagos seguros."}
      variant="drawer"
      drawerPlacement="right"
      maxWidth="md"
      footer={
        <div className="flex items-center justify-end w-full gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            className="px-6 rounded-xl font-label h-11 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="add-card-form"
            loading={isSubmitting}
            className="px-8 rounded-xl bg-primary hover:bg-primary/90 text-white font-label h-11 shadow-lg shadow-blue-900/10 active:scale-95"
          >
            {isEditing ? "Guardar Cambios" : "Guardar Tarjeta"}
          </Button>
        </div>
      }
    >
      <form id="add-card-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Input
          label="Nombre en la tarjeta"
          placeholder="Ej: Juan Pérez"
          {...register("cardName")}
          error={errors.cardName?.message}
        />
        
        <Input
          label="Número de tarjeta"
          placeholder="1234 1234 1234 1234"
          icon={<CreditCard />}
          {...register("cardNumber")}
          error={errors.cardNumber?.message}
          onChange={handleNumberChange}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Vencimiento"
            placeholder="MM / AA"
            icon={<Calendar />}
            {...register("expiry")}
            error={errors.expiry?.message}
            onChange={handleExpiryChange}
          />
          <Input
            label="Código CVC"
            placeholder="CVC"
            icon={<LockIcon />}
            {...register("cvc")}
            error={errors.cvc?.message}
            maxLength={4}
            onChange={handleCvcChange}
          />
        </div>
      </form>
    </ModalLayout>
  );
};