import { useCallback, useState } from "react";
import { PublicFeedbackSubmitterType } from "@/types/public-context";
import {
  getSessionFocus,
  getStoredSessionContext,
  setStoredSessionContext,
} from "@/services/public/publicSessionContext";

export function usePublicSessionContext() {
  const [contextType, setContextTypeState] = useState<PublicFeedbackSubmitterType>(getStoredSessionContext);

  const setContextType = useCallback((type: PublicFeedbackSubmitterType) => {
    setStoredSessionContext(type);
    setContextTypeState(type);
  }, []);

  const focus = getSessionFocus(contextType);

  return { contextType, setContextType, focus };
}
