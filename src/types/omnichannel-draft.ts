import { FeedbackChannel } from "@/types/feedback-channels";
import { Lang } from "@/types/platform";

export type OmnichannelPriority = "low" | "medium" | "high" | "urgent";

export type ParentOmnichannelCategory =
  | "meals"
  | "teaching"
  | "infrastructure"
  | "safety"
  | "hygiene"
  | "suggestions";

export interface OmnichannelChannelPayload {
  channel: FeedbackChannel;
  text: string;
  transcript?: string;
  attachments: string[];
  qrCenter?: { centerId: string; centerName: string; verified: boolean };
  rating: number;
  category: ParentOmnichannelCategory;
  priority: OmnichannelPriority;
  metadata: {
    anonymous: boolean;
    allowContact: boolean;
    detectedLanguage?: Lang;
    ivrState?: "idle" | "started" | "listening" | "processing" | "ready";
    smsCharCount?: number;
    photoDescriptions?: string[];
    whatsappMessages?: { role: "parent" | "center"; text: string; at: string }[];
  };
}

export type OmnichannelDraftBundle = Record<string, Partial<OmnichannelChannelPayload>>;

export const EMPTY_OMNI_PAYLOAD = (): OmnichannelChannelPayload => ({
  channel: "whatsapp",
  text: "",
  attachments: [],
  rating: 3,
  category: "suggestions",
  priority: "medium",
  metadata: { anonymous: false, allowContact: true },
});
