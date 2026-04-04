import { useUserStore } from "../stores/useUserStore";

/**
 * useUser Hook.
 * Access the current user state and actions.
 */
export function useUser() {
  const { user, updateUser } = useUserStore();
  return { user, updateUser };
}
