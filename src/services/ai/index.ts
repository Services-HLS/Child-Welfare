export { translateText } from "./translation";
export { analyzeSentiment } from "./sentiment";
export { classifyFeedback } from "./classification";
export { speechToText, isSpeechRecognitionSupported, captureSpeechFromMicrophone } from "./speech";
export { extractTextFromDocument, isOcrSupportedFile, detectDocumentLanguage } from "./document-ocr";
export { verifyServiceDelivery } from "./verification";
export { generateRiskAlerts } from "./alerts";
export { computeExecutiveKpis, predictInterventionCenters } from "./analytics";

export async function processFeedbackWithAI(
  text: string,
  rating: number,
  lang: import("@/types/platform").Lang
) {
  const { translateText } = await import("./translation");
  const { analyzeSentiment } = await import("./sentiment");
  const { classifyFeedback } = await import("./classification");

  const translatedText = lang !== "en" ? await translateText(text, lang, "en") : text;
  const sentiment = await analyzeSentiment(translatedText);
  const classification = await classifyFeedback(translatedText, rating);

  return { translatedText, sentiment, classification };
}
