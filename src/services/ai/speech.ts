/** Speech-to-text — Web Speech API with simulated fallback for unsupported browsers */

import { getVoiceLanguageBcp47 } from "@/lib/voiceLang";
import { Lang } from "@/types/platform";

const samples: Record<string, string> = {
  en: "The children were not served eggs for the last three days. Food was unavailable at the center and storage containers were empty.",
  te: "పిల్లలకు గత మూడు రోజులుగా గుడ్లు అందించలేదు. ఆహారం అందుబాటులో లేదు.",
  hi: "बच्चों को पिछले तीन दिनों से अंडे नहीं दिए गए। भोजन उपलब्ध नहीं था।",
};

function langToBcp47(lang?: Lang | string): string {
  if (lang === "te" || lang === "hi" || lang === "en") return getVoiceLanguageBcp47(lang);
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

/** Simulated STT for file upload or browsers without mic API */
export async function speechToText(_audioBlob?: Blob, lang?: Lang): Promise<string> {
  await new Promise((r) => setTimeout(r, 800));
  return samples[lang ?? "en"] ?? samples.en;
}

/** Live microphone capture — resolves with transcribed text */
export function captureSpeechFromMicrophone(lang?: Lang): Promise<string> {
  const Ctor = getSpeechRecognition();
  if (!Ctor) {
    return speechToText(undefined, lang);
  }

  return new Promise((resolve, reject) => {
    const recognition = new Ctor();
    recognition.lang = langToBcp47(lang);
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    let finalTranscript = "";
    let settled = false;

    const done = (text: string) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        recognition.stop();
      } catch {
        /* already stopped */
      }
      resolve(text.trim());
    };

    const fail = (message: string) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        recognition.stop();
      } catch {
        /* already stopped */
      }
      reject(new Error(message));
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const part = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscript += `${part} `;
        else interim = part;
      }
      if (finalTranscript.trim()) done(finalTranscript);
      else if (interim.trim() && event.results[event.results.length - 1]?.isFinal) {
        done(interim);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "aborted" || event.error === "no-speech") return;
      if (event.error === "not-allowed") {
        fail("Microphone permission denied. Allow microphone access and try again.");
        return;
      }
      fail(`Voice recognition error: ${event.error}`);
    };

    recognition.onend = () => {
      if (!settled && finalTranscript.trim()) done(finalTranscript);
    };

    const timer = setTimeout(() => {
      if (finalTranscript.trim()) done(finalTranscript);
      else fail("No speech detected. Speak clearly and try again.");
    }, 12000);

    try {
      recognition.start();
    } catch {
      speechToText(undefined, lang).then(done).catch(() => fail("Could not start voice recognition"));
    }
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
