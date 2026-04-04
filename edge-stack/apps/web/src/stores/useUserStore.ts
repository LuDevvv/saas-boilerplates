import { create } from "zustand";
import type { IUser } from "../types";

interface UserStore {
  user: IUser | null;
  setUser: (user: IUser | null) => void;
  updateUser: (data: Partial<IUser>) => void;
  clearUser: () => void;
}

/**
 * User Store.
 * Manages the authenticated user's profile state.
 */
export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  updateUser: (data) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    })),
  clearUser: () => set({ user: null }),
}));
