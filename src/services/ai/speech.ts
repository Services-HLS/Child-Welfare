/** Speech-to-text — manual stop recording with live interim transcript */

import { getVoiceLanguageBcp47 } from "@/lib/voiceLang";
import { Lang } from "@/types/platform";

const samples: Record<string, string> = {
  en: "The children were not served eggs for the last three days. Food was unavailable at the center and storage containers were empty.",
  te: "పిల్లలకు గత మూడు రోజులుగా గుడ్లు అందించలేదు. ఆహారం అందుబాటులో లేదు.",
  hi: "बच्चों को पिछले तीन दिनों से अंडे नहीं दिए गए। भोजन उपलब्ध नहीं था।",
};

export type SpeechCaptureResult = {
  text: string;
  source: "microphone" | "demo_fallback";
};

export type SpeechCaptureSession = {
  stop: () => Promise<SpeechCaptureResult>;
};

function langToBcp47(lang?: Lang | string): string {
  if (lang === "te" || lang === "hi" || lang === "en") return getVoiceLanguageBcp47(lang as Lang);
  return "en-IN";
}

type SpeechRecognitionCtor = new () => SpeechRecognition;

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & { webkitSpeechRecognition?: SpeechRecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isSpeechRecognitionSupported(): boolean {
  return getSpeechRecognition() !== null;
}

export async function speechToText(_audioBlob?: Blob, lang?: Lang): Promise<string> {
  await new Promise((r) => setTimeout(r, 400));
  return samples[lang ?? "en"] ?? samples.en;
}

async function requestMicrophoneAccess(): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return false;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((t) => t.stop());
    return true;
  } catch {
    return false;
  }
}

/** @deprecated Use beginSpeechCapture + session.stop() */
export async function captureSpeechFromMicrophone(lang?: Lang): Promise<string> {
  const session = await beginSpeechCapture(lang);
  const result = await session.stop();
  return result.text;
}

/** @deprecated Use beginSpeechCapture + session.stop() */
export async function captureSpeechWithMeta(lang?: Lang): Promise<SpeechCaptureResult> {
  const session = await beginSpeechCapture(lang);
  return session.stop();
}

function createFallbackSession(lang?: Lang, onInterim?: (text: string) => void): SpeechCaptureSession {
  let stopped = false;
  return {
    stop: async () => {
      if (stopped) return { text: "", source: "demo_fallback" as const };
      stopped = true;
      const text = await speechToText(undefined, lang);
      onInterim?.(text);
      return { text, source: "demo_fallback" };
    },
  };
}

/**
 * Start listening — recording continues until session.stop() is called.
 * onInterim fires as the user speaks (live preview).
 */
export async function beginSpeechCapture(
  lang?: Lang,
  onInterim?: (text: string) => void
): Promise<SpeechCaptureSession> {
  const Ctor = getSpeechRecognition();
  if (!Ctor) return createFallbackSession(lang, onInterim);

  const micOk = await requestMicrophoneAccess();
  if (!micOk) return createFallbackSession(lang, onInterim);

  return new Promise((resolveSession) => {
    const recognition = new Ctor();
    recognition.lang = langToBcp47(lang);
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    let finalTranscript = "";
    let interimTranscript = "";
    let manualStop = false;
    let settled = false;
    let resolveStop: (r: SpeechCaptureResult) => void;

    const stopPromise = new Promise<SpeechCaptureResult>((resolve) => {
      resolveStop = resolve;
    });

    const combined = () => `${finalTranscript}${interimTranscript}`.trim();

    const emitInterim = () => {
      const text = combined();
      if (text) onInterim?.(text);
    };

    const finishStop = async () => {
      if (settled) return;
      settled = true;
      const spoken = combined();
      if (spoken) {
        resolveStop({ text: spoken, source: "microphone" });
        return;
      }
      const text = await speechToText(undefined, lang);
      resolveStop({ text, source: "demo_fallback" });
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const chunk = event.results[i][0]?.transcript ?? "";
        if (event.results[i].isFinal) finalTranscript += `${chunk} `;
        else interimTranscript = chunk;
      }
      emitInterim();
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "aborted" && manualStop) return;
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        if (!settled) {
          settled = true;
          speechToText(undefined, lang).then((text) =>
            resolveStop({ text, source: "demo_fallback" })
          );
        }
        return;
      }
      if (event.error === "no-speech" && manualStop) return;
    };

    recognition.onend = () => {
      if (manualStop) {
        void finishStop();
        return;
      }
      if (!settled) {
        try {
          recognition.start();
        } catch {
          void finishStop();
        }
      }
    };

    try {
      recognition.start();
    } catch {
      resolveSession(createFallbackSession(lang, onInterim));
      return;
    }

    resolveSession({
      stop: () => {
        if (settled) return stopPromise;
        manualStop = true;
        try {
          recognition.stop();
        } catch {
          void finishStop();
        }
        return stopPromise;
      },
    });
  });
}

export function stopSpeechRecognition(recognition: SpeechRecognition | null) {
  if (!recognition) return;
  try {
    recognition.stop();
  } catch {
    /* ignore */
  }
}
