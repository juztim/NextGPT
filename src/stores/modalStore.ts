import { create } from "zustand";

type ModalStoreData = {
  activeModal: string | undefined;
  setActiveModal: (activeModal: string | undefined) => void;
}

export const useModalStore = create<ModalStoreData>((set) => {
  return {
    activeModal: undefined,
    setActiveModal: (activeModal: string | undefined) => set({ activeModal }),
  }
});