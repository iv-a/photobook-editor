import { pairingSelectors } from "@/features/pairing";
import { useAppSelector } from "@/hooks";
import { Progress } from "../ui/progress";

export const PairingProgress = () => {
  const { total, seen, left } = useAppSelector(pairingSelectors.selectProgress);

  const ratio = total ? (seen / total) * 100 : 0;

  return (
    <div className="flex items-center gap-3 w-full max-w-sm">
      <Progress value={ratio} className="w-full" />
      <div className="text-xs text-muted-foreground whitespace-nowrap">{seen} / {total} • осталось {left}</div>
    </div>
  );
}
