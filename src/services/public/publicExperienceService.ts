import { CitizenExperienceRecord, ExperienceStatus } from "@/types/citizen-experience";

export function countExperienceBuckets(experiences: CitizenExperienceRecord[]) {
  return {
    submitted: experiences.length,
    appreciated: experiences.filter((e) => e.sentiment === "positive" || e.experienceType === "appreciation").length,
    included: experiences.filter((e) => e.status === "included_in_improvement").length,
    acknowledged: experiences.filter((e) => e.status === "acknowledged").length,
  };
}

export function getExperienceById(
  id: string,
  experiences: CitizenExperienceRecord[]
): CitizenExperienceRecord | null {
  return experiences.find((e) => e.id === id || e.feedbackId === id) ?? null;
}

export function experienceStatusLabel(status: ExperienceStatus): string {
  const map: Record<ExperienceStatus, string> = {
    recorded: "Recorded",
    acknowledged: "Acknowledged",
    included_in_improvement: "Included in Service Improvement",
  };
  return map[status];
}
