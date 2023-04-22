import { create } from "zustand";

type SettingsStoreData = {
  temperature: number;
  topP: number;
  tone: string;
  format: string;
  writingStyle: string;
  setTemperature: (temperature: number) => void;
  setTopP: (topP: number) => void;
  setTone: (tone: string) => void;
  setFormat: (format: string) => void;
  setWritingStyle: (writingStyle: string) => void;
  openAiToken: string;
  setOpenAiToken: (openAiToken: string) => void;
  outputLanguage: string;
  initialInstructions: string;
  showWordCount: boolean;
  saveSettings: (settings: {
    temperature: number;
    topP: number;
    tone: string;
    format: string;
    writingStyle: string;
    outputLanguage: string;
    initialInstructions: string;
    showWordCount: boolean;
  }) => void;
};

export const useSettingsStore = create<SettingsStoreData>((set) => {
  return {
    temperature: 0,
    topP: 0,
    tone: "neutral",
    format: "text",
    writingStyle: "default",
    setTemperature: (temperature: number) => set({ temperature }),
    setTopP: (topP: number) => set({ topP }),
    setTone: (tone: string) => set({ tone }),
    setFormat: (format: string) => set({ format }),
    setWritingStyle: (writingStyle: string) => set({ writingStyle }),
    openAiToken: "",
    setOpenAiToken: (openAiToken: string) => set({ openAiToken }),
    outputLanguage: "english",
    showWordCount: true,
    initialInstructions:
      "You are ChatGPT, a large language model trained by OpenAI.",
    saveSettings: (settings: {
      temperature: number;
      topP: number;
      tone: string;
      format: string;
      writingStyle: string;
      outputLanguage: string;
      initialInstructions: string;
      showWordCount: boolean;
    }) =>
      set({
        temperature: settings.temperature,
        topP: settings.topP,
        tone: settings.tone,
        format: settings.format,
        writingStyle: settings.writingStyle,
        outputLanguage: settings.outputLanguage,
        initialInstructions: settings.initialInstructions,
        showWordCount: settings.showWordCount,
      }),
  };
});
