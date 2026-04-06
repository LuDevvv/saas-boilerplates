import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { LoginDto, RegisterDto } from "@node-stack/types";
import { useNavigate } from "react-router-dom";

/**
 * Hook para manejar acciones comunes de autenticación como login, registro y logout.
 * Desacopla la UI del componente de la lógica del store y la navegación.
 */
export const useAuthActions = () => {
  const navigate = useNavigate();
  const { login: storeLogin, register: storeRegister, logout: storeLogout, clearError } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const login = async (data: LoginDto) => {
    setIsSubmitting(true);
    clearError();
    try {
      const success = await storeLogin(data);
      if (success) {
        navigate("/");
      }
      return success;
    } finally {
      setIsSubmitting(false);
    }
  };

  const register = async (data: RegisterDto) => {
    setIsSubmitting(true);
    clearError();
    try {
      const success = await storeRegister(data);
      if (success) {
        // La navegación se maneja dentro del store o el componente según si requiere verificación
      }
      return success;
    } finally {
      setIsSubmitting(false);
    }
  };

  const logout = async () => {
    await storeLogout();
    navigate("/auth/sign-in");
  };

  return {
    login,
    register,
    logout,
    isSubmitting,
    clearError,
  };
};
