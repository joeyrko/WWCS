import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckoutButton } from "@/components/shared/checkout-button";
import type { Video } from "@/types";

export function AccessGate({ video, signedIn }: { video: Video; signedIn: boolean }) {
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-4 rounded-md border border-wwc-grey-800 bg-wwc-grey-950 p-8 text-center">
      <Lock className="h-10 w-10 text-wwc-red" />
      <div>
        <h2 className="font-display text-2xl uppercase tracking-wide text-white">
          {video.access === "subscribers" ? "Subscribers Only" : "Purchase Required"}
        </h2>
        <p className="mt-2 max-w-sm text-sm text-wwc-grey-400">
          {!signedIn
            ? "Sign in to watch — subscribers and PPV purchasers get instant access."
            : video.access === "subscribers"
              ? "Upgrade to WWC+ to unlock this video and the entire on-demand library."
              : "Purchase this event to unlock the replay."}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {!signedIn && (
          <Button asChild>
            <Link href={`/sign-in?callbackUrl=/watch/${video.slug}`}>Sign In</Link>
          </Button>
        )}
        {signedIn && video.access === "subscribers" && (
          <Button asChild>
            <Link href="/pricing">View Plans</Link>
          </Button>
        )}
        {signedIn && video.access === "purchase" && video.relatedEventSlug && (
          <CheckoutButton payload={{ type: "ppv", eventSlug: video.relatedEventSlug }}>
            Buy PPV Access
          </CheckoutButton>
        )}
        <Button asChild variant="outline">
          <Link href="/watch">Browse Free Content</Link>
        </Button>
      </div>
    </div>
  );
}
