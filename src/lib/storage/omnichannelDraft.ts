import { OmnichannelDraftBundle } from "@/types/omnichannel-draft";
import { FeedbackChannel } from "@/types/feedback-channels";
import { idbGet, idbPut, STORES } from "./db";

const KEY = "drafts";

export async function loadOmnichannelDrafts(workerOrBeneficiaryId: string): Promise<OmnichannelDraftBundle | null> {
  const all = await idbGet<Record<string, OmnichannelDraftBundle>>(STORES.omnichannel_drafts, KEY);
  return all?.[workerOrBeneficiaryId] ?? null;
}

export async function saveOmnichannelDrafts(
  beneficiaryId: string,
  bundle: OmnichannelDraftBundle
): Promise<void> {
  const all = (await idbGet<Record<string, OmnichannelDraftBundle>>(STORES.omnichannel_drafts, KEY)) ?? {};
  all[beneficiaryId] = bundle;
  await idbPut(STORES.omnichannel_drafts, KEY, all);
}

export async function persistChannelDraft(
  beneficiaryId: string,
  channel: FeedbackChannel,
  draft: OmnichannelDraftBundle[FeedbackChannel]
): Promise<void> {
  const bundle = (await loadOmnichannelDrafts(beneficiaryId)) ?? {};
  bundle[channel] = draft;
  await saveOmnichannelDrafts(beneficiaryId, bundle);
}
