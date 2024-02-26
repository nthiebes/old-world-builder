import type { rules } from "./src/utils/rules";

declare type ArmyComposition = keyof typeof rules;

type Category =
  | "characters"
  | "heroes"
  | "lords"
  | "core"
  | "special"
  | "rare"
  | "mercenaries"
  | "allies";

interface ArmyList {
  id: string;
  name: string;
  description: string;
  game: string;
  points: number;
  army: string;
  lords?: Unit[];
  heroes?: Unit[];
  characters?: Unit[];
  core: Unit[];
  special: Unit[];
  rare: Unit[];
  mercenaries?: Unit[];
  allies?: Unit[];
  armyComposition: ArmyComposition;
}
interface Equipment {
  name_en: string;
  name_de: string;
  name_fr: string;
  points: number;
  perModel?: boolean;
  active?: boolean;
  id: number;
}

interface Armor {
  name_en: string;
  name_de: string;
  name_fr: string;
  points: number;
  perModel?: boolean;
  active?: boolean;
  id: number;
}

interface Item {
  name_en: string;
  name_de: string;
  name_fr: string;
  types: string[];
  selected?: Selected[];
  maxPoints?: number;
}

interface Selected {
  name_de: string;
  name_en: string;
  name_fr: string;
  points: number;
  type: string;
  nonExclusive?: boolean;
  id: string;
}

interface SpecialRules {
  name_en: string;
  name_de: string;
  name_es: string;
  name_fr: string;
}

interface Unit {
  name_en: string;
  name_de: string;
  name_fr: string;
  id: string;
  points: number;
  minimum?: number;
  maximum?: number;
  regimentalUnit: boolean;
  detachment: boolean;
  command?: Command[];
  equipment?: Equipment[];
  armor?: Armor[];
  options?: UnitOption[];
  mounts?: UnitOption[];
  lores?: string[];
  specialRules?: SpecialRules;
  strength?: number;
  items?: UnitOption[];
  magic?: Magic;
  specialRules: SpecialRules;
  strength?: number;
  detachments?: Detachment[];
  activeLore?: string;
}

interface Detachment {
  name_en: string;
  name_de: string;
  name_fr: string;
  points: number;
  id: number;
  strength: number;
  equipment?: Equipment[];
  armor?: Armor[];
  options?: UnitOption[];
}

interface Command {
  name_en: string;
  name_de: string;
  name_fr: string;
  points: number;
  magic?: CommandMagic;
  options?: CommandOption[];
  id: number;
  active?: boolean;
}

interface CommandOption {
  name_en: string;
  name_de: string;
  name_fr: string;
  points: number;
  id: number;
  active?: boolean;
  exclusive?: boolean;
}

interface CommandMagic {
  types: string[];
  maxPoints?: number;
  selected?: Selected[];
}

interface UnitOption {
  name_en: string;
  name_de: string;
  name_fr: string;
  points: number;
  perModel?: boolean;
  stackable?: boolean;
  minimum?: number;
  maximum?: number;
  id: number;
  active?: boolean;
  stackableCount?: number;
}

interface Magic {
  types: string[];
  maxPoints?: number;
  items?: string[];
}
