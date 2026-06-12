import { useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { buildPublicRequests, countByBucket } from "@/services/public/publicRequestService";
import { countExperienceBuckets } from "@/services/public/publicExperienceService";

/** Public citizen portal data — single login, all beneficiary types */
export function usePublicPortal() {
  const {
    user,
    activities,
    complaints,
    sessions,
    feedback,
    citizenExperiences,
    childProgress,
    notifications,
    surveys,
    omnichannelInputs,
  } = useApp();

  return useMemo(() => {
    const userId = user?.id ?? "";
    const publicRequests = buildPublicRequests(userId, feedback, complaints, omnichannelInputs, surveys);
    const buckets = countByBucket(publicRequests);
    const myExperiences = citizenExperiences.filter((e) => e.beneficiaryId === userId);
    const experienceBuckets = countExperienceBuckets(myExperiences);

    return {
      user,
      activities,
      complaints,
      sessions,
      feedback,
      childProgress,
      notifications,
      surveys,
      omnichannelInputs,
      centerId: user?.centerId,
      myComplaints: complaints.filter((c) => c.beneficiaryId === userId),
      myFeedback: feedback.filter((f) => f.beneficiaryId === userId),
      centerActs: activities.filter((a) => a.centerId === user?.centerId),
      publicRequests,
      requestBuckets: buckets,
      citizenExperiences,
      myExperiences,
      experienceBuckets,
    };
  }, [
    user,
    activities,
    complaints,
    sessions,
    feedback,
    citizenExperiences,
    childProgress,
    notifications,
    surveys,
    omnichannelInputs,
  ]);
}

/** @deprecated Use usePublicPortal */
export const useParentPortal = usePublicPortal;
