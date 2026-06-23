import { create } from "zustand";

type MobileMenuStore = {
  open: boolean;
  toggle: () => void;
  close: () => void;
};

export const useMobileMenu = create<MobileMenuStore>((set) => ({
  open: false,
  toggle: () => set((s) => ({ open: !s.open })),
  close: () => set({ open: false }),
}));
