import {
  Waves,
  Fish,
  Anchor,
  Sailboat,
  Mountain,
  UtensilsCrossed,
  Users,
  Heart,
  Martini,
  Trees,
  Landmark,
  Umbrella,
  Car,
  Sunset,
  Sparkles,
  type LucideProps,
} from "lucide-react";

const map = {
  Waves,
  Fish,
  Anchor,
  Sailboat,
  Mountain,
  UtensilsCrossed,
  Users,
  Heart,
  Martini,
  Trees,
  Landmark,
  Umbrella,
  Car,
  Sunset,
  Sparkles,
} as const;

export type IconName = keyof typeof map;

export function DynamicIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = map[name as IconName] ?? Sparkles;
  return <Icon {...props} />;
}
