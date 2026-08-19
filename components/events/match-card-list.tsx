import { Trophy } from "lucide-react";
import { getWrestlerBySlug } from "@/data/wrestlers";
import type { Match } from "@/types";

export function MatchCardList({ matches }: { matches: Match[] }) {
  return (
    <ol className="flex flex-col gap-3">
      {matches.map((match, index) => {
        const wrestlers = match.participants.map((slug) => getWrestlerBySlug(slug));
        return (
          <li
            key={match.id}
            className="rounded-md border border-wwc-grey-800 bg-wwc-grey-950 p-5"
          >
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-wwc-grey-500">
                Match {index + 1}
              </span>
              {match.isTitleMatch && (
                <span className="flex items-center gap-1 rounded-sm bg-wwc-red px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                  <Trophy className="h-3 w-3" /> Title Match
                </span>
              )}
              {match.stipulation && (
                <span className="rounded-sm border border-wwc-grey-700 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-wwc-grey-300">
                  {match.stipulation}
                </span>
              )}
            </div>

            {match.titleName && (
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-wwc-red">
                {match.titleName}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3">
              {wrestlers.map((wrestler, i) => (
                <div key={wrestler?.slug ?? i} className="flex items-center gap-3">
                  {i > 0 && (
                    <span className="font-display text-sm text-wwc-grey-600">
                      {i === wrestlers.length / 2 ? "vs." : "&"}
                    </span>
                  )}
                  <div>
                    <p className="font-display text-lg uppercase leading-tight tracking-wide text-white">
                      {wrestler?.name ?? "TBD"}
                    </p>
                    {wrestler && (
                      <p className="text-xs text-wwc-grey-500">{wrestler.gimmick}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
