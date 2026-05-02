// Pure hooks
export { useLogin } from "./useLogin";
export { useUser } from "./useUser";
export { useUpdateProfile } from "./useUpdateProfile";

// Raw mutations with store integration (backward compatibility)
export {
  useRegister,
  useLogout,
  useRequestPasswordReset,
  useResetPassword,
  useVerifyEmail,
  useResendVerification,
} from "./useAuthMutations.raw";