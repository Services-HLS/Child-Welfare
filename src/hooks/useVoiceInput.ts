import { useCallback, useRef, useState } from "react";
import { Lang } from "@/types/platform";
import { getVoiceLanguageLabel } from "@/lib/voiceLang";
import {
  beginSpeechCapture,
  isSpeechRecognitionSupported,
  SpeechCaptureSession,
} from "@/services/ai/speech";

export function useVoiceInput(lang: Lang) {
  const [listening, setListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const sessionRef = useRef<SpeechCaptureSession | null>(null);

  const startListening = useCallback(
    async (onInterim?: (text: string) => void): Promise<boolean> => {
      if (sessionRef.current) return false;
      setError(null);
      setInterimText("");
      setListening(true);
      try {
        const session = await beginSpeechCapture(lang, (text) => {
          setInterimText(text);
          onInterim?.(text);
        });
        sessionRef.current = session;
        return true;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Voice input failed";
        setError(msg);
        setListening(false);
        return false;
      }
    },
    [lang]
  );

  const stopListening = useCallback(async (): Promise<{
    text: string;
    usedFallback: boolean;
  } | null> => {
    const session = sessionRef.current;
    if (!session) return null;
    sessionRef.current = null;
    setListening(false);
    try {
      const { text, source } = await session.stop();
      setInterimText("");
      if (!text.trim()) {
        setError("No speech detected");
        return null;
      }
      return { text: text.trim(), usedFallback: source === "demo_fallback" };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Voice input failed";
      setError(msg);
      return null;
    }
  }, []);

  const cancelListening = useCallback(() => {
    const session = sessionRef.current;
    sessionRef.current = null;
    setListening(false);
    setInterimText("");
    if (session) void session.stop();
  }, []);

  return {
    listening,
    interimText,
    error,
    startListening,
    stopListening,
    cancelListening,
    supported: isSpeechRecognitionSupported(),
    languageLabel: getVoiceLanguageLabel(lang),
    lang,
  };
};
