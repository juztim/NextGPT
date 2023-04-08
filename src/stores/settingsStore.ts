import { create } from "zustand";
import { api } from "~/utils/api";

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
  saveSettings: (settings: {
    temperature: number;
    tone: string;
    format: string;
    writingStyle: string;
  }) => void;
};

export const useSettingsStore = create<SettingsStoreData>((set) => {
  return {
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
    saveSettings: (settings: {
      temperature: number;
      tone: string;
      format: string;
      writingStyle: string;
    }) =>
      set({
        temperature: settings.temperature,
        tone: settings.tone,
        format: settings.format,
        writingStyle: settings.writingStyle,
      }),
  };
});
