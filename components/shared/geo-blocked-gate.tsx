import { Ban } from "lucide-react";

export function GeoBlockedGate() {
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-4 rounded-md border border-wwc-grey-800 bg-wwc-grey-950 p-8 text-center">
      <Ban className="h-10 w-10 text-wwc-red" />
      <div>
        <h2 className="font-display text-2xl uppercase tracking-wide text-white">
          Not Available In Your Area
        </h2>
        <p className="mt-2 max-w-sm text-sm text-wwc-grey-400">
          This live event is blacked out for viewers in Puerto Rico due to local broadcast
          restrictions. On-demand replay will be available here once the event has ended.
        </p>
      </div>
    </div>
  );
}
