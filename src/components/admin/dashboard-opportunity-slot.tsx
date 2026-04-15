import { getLowDemandOpportunities } from "@/lib/data/admin";
import { OpportunityCard } from "@/components/admin/opportunity-card";
import { createClient } from "@/lib/supabase/server";
import { fetchPricingWindowsForFields } from "@/lib/data/field-pricing-data";
import { resolveHourlyPriceFromWindows } from "@/lib/field-pricing";
import { hasActiveFlashOfferOverlappingWindow } from "@/lib/data/field-offers";

export async function DashboardOpportunitySlot({
  ownerId,
  venueId,
}: {
  ownerId: string;
  venueId: string | null;
}) {
  const opportunity = await getLowDemandOpportunities(ownerId, venueId);
  if (!opportunity) return null;

  const supabase = await createClient();
  const previewFieldId = opportunity.fieldIds[0];
  if (!previewFieldId) return null;

  const [hasActiveOffer, fieldRow] = await Promise.all([
    hasActiveFlashOfferOverlappingWindow(
      supabase,
      opportunity.fieldIds,
      opportunity.offerDateYmd,
      opportunity.rangeStartHour,
      opportunity.rangeEndExclusive,
    ),
    supabase
      .from("fields")
      .select("hourly_price")
      .eq("id", previewFieldId)
      .single(),
  ]);

  const previewIso = `${opportunity.offerDateYmd}T${String(opportunity.rangeStartHour).padStart(2, "0")}:00:00-05:00`;
  const winMap = await fetchPricingWindowsForFields(supabase, [previewFieldId]);
  const windows = winMap.get(previewFieldId) ?? [];
  const previewBaseHourly = resolveHourlyPriceFromWindows(
    windows,
    previewIso,
    Number(fieldRow.data?.hourly_price ?? 0),
  );

  return (
    <OpportunityCard
      opportunity={opportunity}
      initialHasActiveOffer={hasActiveOffer}
      previewFieldId={previewFieldId}
      previewBaseHourly={previewBaseHourly}
    />
  );
}
