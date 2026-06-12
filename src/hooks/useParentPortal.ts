import { useMemo } from "react";
import { useApp } from "@/context/AppContext";

export function useParentPortal() {
  const {
    user,
    activities,
    complaints,
    sessions,
    feedback,
    childProgress,
    notifications,
    surveys,
    serviceQualityScores,
  } = useApp();

  return useMemo(
    () => ({
      user,
      activities,
      complaints,
      sessions,
      feedback,
      childProgress,
      notifications,
      surveys,
      serviceQualityScores,
      centerId: user?.centerId,
      myComplaints: complaints.filter((c) => c.beneficiaryId === user?.id),
      myFeedback: feedback.filter((f) => f.beneficiaryId === user?.id),
      centerActs: activities.filter((a) => a.centerId === user?.centerId),
    }),
    [user, activities, complaints, sessions, feedback, childProgress, notifications, surveys, serviceQualityScores]
  );
}
