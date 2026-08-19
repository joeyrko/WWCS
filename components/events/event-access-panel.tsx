import Link from "next/link";
import { CheckCircle2, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckoutButton } from "@/components/shared/checkout-button";
import type { WwcEvent } from "@/types";

export function EventAccessPanel({
  event,
  hasAccess,
  isSignedIn,
  replaySlug,
}: {
  event: WwcEvent;
  hasAccess: boolean;
  isSignedIn: boolean;
  replaySlug?: string;
}) {
  if (hasAccess && event.status === "past") {
    return (
      <div className="flex flex-wrap items-center gap-4">
        <Button asChild size="lg">
          <Link href={replaySlug ? `/watch/${replaySlug}` : "/watch"} className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5" /> Watch Replay
          </Link>
        </Button>
      </div>
    );
  }

  if (event.includedInSubscription) {
    if (hasAccess) {
      return (
        <div className="flex items-center gap-2 rounded-sm border border-wwc-red/40 bg-wwc-red/10 px-4 py-3 text-sm font-semibold text-white">
          <CheckCircle2 className="h-5 w-5 text-wwc-red" />
          Included with your WWC+ membership
        </div>
      );
    }
    return (
      <Button asChild size="lg">
        <Link href="/">Subscribe to Watch</Link>
      </Button>
    );
  }

  if (hasAccess) {
    return (
      <div className="flex items-center gap-2 rounded-sm border border-wwc-red/40 bg-wwc-red/10 px-4 py-3 text-sm font-semibold text-white">
        <CheckCircle2 className="h-5 w-5 text-wwc-red" />
        You own this event
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <CheckoutButton size="lg" payload={{ type: "ppv", eventSlug: event.slug }}>
        Buy PPV — ${(event.priceInCents / 100).toFixed(2)}
      </CheckoutButton>
      {!isSignedIn && (
        <p className="text-sm text-wwc-grey-500">
          <Link href={`/sign-in?callbackUrl=/events/${event.slug}`} className="text-wwc-red hover:underline">
            Sign in
          </Link>{" "}
          first to purchase.
        </p>
      )}
    </div>
  );
}
