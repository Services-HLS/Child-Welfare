import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { SessionRecording, PerformanceBand, SyllabusCategory } from "@/types/session";
import { mockCenters } from "@/data/mockData";

export function useClassroomSessions(district = "Tirupati") {
  const { sessions, classroomAnalytics, getClassroomAnalytics } = useApp();
  const [dateFrom, setDateFrom] = useState("");
  const [centerId, setCenterId] = useState("");
  const [workerId, setWorkerId] = useState("");
  const [syllabus, setSyllabus] = useState<SyllabusCategory | "">("");
  const [band, setBand] = useState<PerformanceBand | "">("");

  const districtCenterIds = useMemo(
    () => mockCenters.filter((c) => c.district === district).map((c) => c.id),
    [district]
  );

  const base = useMemo(
    () =>
      sessions.filter(
        (s) => s.scorecard && districtCenterIds.includes(s.metadata.centerId)
      ),
    [sessions, districtCenterIds]
  );

  const filtered = useMemo(() => {
    return base.filter((s) => {
      if (centerId && s.metadata.centerId !== centerId) return false;
      if (workerId && s.metadata.workerId !== workerId) return false;
      if (syllabus && s.metadata.syllabusCategory !== syllabus) return false;
      if (band && s.scorecard?.band !== band) return false;
      if (dateFrom && new Date(s.createdAt) < new Date(dateFrom)) return false;
      return true;
    });
  }, [base, centerId, workerId, syllabus, band, dateFrom]);

  const withIntel = useMemo(
    () =>
      filtered.map((s) => ({
        session: s,
        intel: getClassroomAnalytics(s.id),
      })),
    [filtered, getClassroomAnalytics, classroomAnalytics]
  );

  const workers = useMemo(() => {
    const m = new Map<string, string>();
    base.forEach((s) => m.set(s.metadata.workerId, s.metadata.workerName));
    return [...m.entries()].map(([id, name]) => ({ id, name }));
  }, [base]);

  const centers = useMemo(
    () => mockCenters.filter((c) => districtCenterIds.includes(c.id)),
    [districtCenterIds]
  );

  return {
    filtered,
    withIntel,
    workers,
    centers,
    filters: { dateFrom, setDateFrom, centerId, setCenterId, workerId, setWorkerId, syllabus, setSyllabus, band, setBand },
  };
}
