import { useCallback, useState } from "react";
import { Lang } from "@/types/platform";
import { getVoiceLanguageLabel } from "@/lib/voiceLang";
import { captureSpeechFromMicrophone, isSpeechRecognitionSupported } from "@/services/ai/speech";

export function useVoiceInput(lang: Lang) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listen = useCallback(async (): Promise<string | null> => {
    setError(null);
    setListening(true);
    try {
      const text = await captureSpeechFromMicrophone(lang);
      if (!text) {
        setError("No speech detected");
        return null;
      }
      return text;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Voice input failed";
      setError(msg);
      return null;
    } finally {
      setListening(false);
    }
  }, [lang]);

  return {
    listening,
    error,
    listen,
    supported: isSpeechRecognitionSupported(),
    languageLabel: getVoiceLanguageLabel(lang),
    lang,
  };
}
