/** Official WDCW AP branding — visual only, no business logic */
export const GOV_BRAND = {
  title: "AnganSakti 360",
  department: "Women Development and Child Welfare Department",
  government: "Government of Andhra Pradesh",
  pilotLocation: "Tirupati District · Pilot Phase",
  environment: "Pilot Environment" as const,
};

export type GovEnvironment = "Demo" | "Pilot" | "Production";

export function getEnvironmentLabel(demoMode?: boolean): GovEnvironment {
  if (demoMode) return "Demo";
  return "Pilot";
}
