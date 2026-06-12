/** Simulated speech-to-text — replace with Web Speech API / cloud STT in production */

const samples = [
  "The midday meal was served late today and children were waiting.",
  "నేటు ఆహారం ఆలసంగా వచ్చింది.",
  "आज भोजन देर से मिला।",
];

export async function speechToText(_audioBlob?: Blob, lang?: string): Promise<string> {
  await new Promise((r) => setTimeout(r, 1200));
  const idx = lang === "te" ? 1 : lang === "hi" ? 2 : 0;
  return samples[idx] ?? samples[0];
}

export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window);
}
