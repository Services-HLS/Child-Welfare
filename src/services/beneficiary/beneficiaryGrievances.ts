import { ComplaintRecord } from "@/types/platform";

/** Grievances owned by the logged-in beneficiary (ID or registered mobile). */
export function filterBeneficiaryGrievances(
  complaints: ComplaintRecord[],
  userId: string,
  mobile?: string
): ComplaintRecord[] {
  return complaints
    .filter((c) => c.beneficiaryId === userId || (mobile && c.registeredMobile === mobile))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
