export type TranscriptSpeaker = "teacher" | "children" | "heading" | "footer";

export interface TranscriptUtterance {
  speaker: TranscriptSpeaker;
  label: string;
  text: string;
}

const TEACHER_MARKERS = /^(టీచర్|Teacher):?\s*$/i;
const CHILDREN_MARKERS = /^(పిల్లలు|Children):?\s*$/i;
const FOOTER_MARKERS = /^(కథ ముగిసింది|End of Story)$/i;

export function parseClassroomTranscript(raw: string, lang: "te" | "en"): TranscriptUtterance[] {
  const lines = raw.split(/\r?\n/).map((l) => l.trim());
  const utterances: TranscriptUtterance[] = [];
  let current: TranscriptUtterance | null = null;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line) {
      i += 1;
      continue;
    }

    if (FOOTER_MARKERS.test(line)) {
      if (current) utterances.push(current);
      current = null;
      utterances.push({
        speaker: "footer",
        label: line,
        text: line,
      });
      i += 1;
      continue;
    }

    if (TEACHER_MARKERS.test(line)) {
      if (current) utterances.push(current);
      current = {
        speaker: "teacher",
        label: lang === "te" ? "టీచర్" : "Teacher",
        text: "",
      };
      i += 1;
      continue;
    }

    if (CHILDREN_MARKERS.test(line)) {
      if (current) utterances.push(current);
      current = {
        speaker: "children",
        label: lang === "te" ? "పిల్లలు" : "Children",
        text: "",
      };
      i += 1;
      continue;
    }

    if (
      !TEACHER_MARKERS.test(lines[i + 1] ?? "") &&
      !CHILDREN_MARKERS.test(lines[i + 1] ?? "") &&
      (line.includes("–") || line.includes("-")) &&
      (line.includes("కథ") || line.includes("Fox") || line.includes("Tortoise") || line.includes("తాబేలు"))
    ) {
      if (current) utterances.push(current);
      current = null;
      utterances.push({ speaker: "heading", label: line, text: line });
      i += 1;
      continue;
    }

    if (
      line.startsWith("వీడియో") ||
      line.startsWith("Context Extracted")
    ) {
      utterances.push({ speaker: "heading", label: line, text: line });
      i += 1;
      continue;
    }

    if (current) {
      current.text = current.text ? `${current.text}\n${line}` : line;
    } else {
      utterances.push({ speaker: "heading", label: "", text: line });
    }
    i += 1;
  }

  if (current) utterances.push(current);
  return utterances;
}
