import { create } from "zustand";

type SettingsStoreData = {
  temperature: number;
  tone: string;
  format: string;
  writingStyle: string;
  setTemperature: (temperature: number) => void;
  setTone: (tone: string) => void;
  setFormat: (format: string) => void;
  setWritingStyle: (writingStyle: string) => void;
  openAiToken: string;
  setOpenAiToken: (openAiToken: string) => void;
};

export const useSettingsStore = create<SettingsStoreData>((set) => ({
  temperature: 0,
  tone: "neutral",
  format: "text",
  writingStyle: "default",
  setTemperature: (temperature: number) => set({ temperature }),
  setTone: (tone: string) => set({ tone }),
  setFormat: (format: string) => set({ format }),
  setWritingStyle: (writingStyle: string) => set({ writingStyle }),
  openAiToken: "",
  setOpenAiToken: (openAiToken: string) => set({ openAiToken }),
}));
