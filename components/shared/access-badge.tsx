import { Badge } from "@/components/ui/badge";
import { accessLevelLabel } from "@/lib/data/users";
import type { AccessLevel } from "@/types";

export function AccessBadge({ access, className }: { access: AccessLevel; className?: string }) {
  return (
    <Badge variant={access} className={className}>
      {accessLevelLabel(access)}
    </Badge>
  );
}
