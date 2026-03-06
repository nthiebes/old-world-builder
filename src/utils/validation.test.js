import { describe, expect, test } from "vitest";
import { validateList } from "./validation";
import { rules } from "./rules";

const intl = {
  formatMessage: ({ id }) => id,
};

const baseList = {
  armyComposition: "unknown-composition",
  points: 2000,
  characters: [],
  core: [
    { id: "badlands-ogre-bulls.1", name_en: "Badlands Ogre Bulls" },
    { id: "battle-pilgrims.1", name_en: "Battle Pilgrims" },
    { id: "black-guard-of-naggarond.1", name_en: "Black Guard of Naggarond" },
  ],
  special: [],
  rare: [],
  mercenaries: [],
  allies: [],
};

const getMessages = (errors) => errors.map((error) => error.message);
const getErrorByMessage = (errors, message) =>
  errors.find((error) => error.message === message);

const makeCharacter = ({
  id,
  name_en,
  isGeneral = false,
  command = [],
  options = [],
  mounts = [],
  items = [],
  points = 0,
  named = false,
}) => ({
  id,
  name_en,
  points,
  named,
  command: [
    ...(isGeneral ? [{ name_en: "General", active: true, points: 0 }] : []),
    ...command,
  ],
  options,
  mounts,
  items,
});

describe("validateList", () => {
  test("adds noGeneral when no active general is selected", () => {
    const list = {
      ...baseList,
      characters: [
        {
          id: "archmage.1",
          name_en: "Archmage",
          command: [{ name_en: "General", active: false }],
        },
      ],
    };

    const errors = validateList({ list, language: "en", intl });

    expect(getMessages(errors)).toContain("misc.error.noGeneral");
  });

  test("adds multipleGenerals when more than one active general is selected", () => {
    const list = {
      ...baseList,
      characters: [
        {
          id: "archmage.1",
          name_en: "Archmage",
          command: [{ name_en: "General", active: true }],
        },
        {
          id: "baron.1",
          name_en: "Baron",
          command: [{ name_en: "General", active: true }],
        },
      ],
    };

    const errors = validateList({ list, language: "en", intl });

    expect(getMessages(errors)).toContain("misc.error.multipleGenerals");
  });

  test("adds generalLeadership when active general does not have the highest leadership", () => {
    const list = {
      ...baseList,
      characters: [
        {
          id: "archmage.1",
          name_en: "Archmage",
          command: [{ name_en: "General", active: true }],
        },
        {
          id: "baron.1",
          name_en: "Baron",
          command: [{ name_en: "General", active: false }],
        },
      ],
    };

    const errors = validateList({ list, language: "en", intl });

    expect(getMessages(errors)).toContain("misc.error.generalLeadership");
  });

  test("adds hierophantLevel when active hierophant has lower wizard level", () => {
    const list = {
      ...baseList,
      characters: [
        {
          id: "baron.1",
          name_en: "Baron",
          command: [{ name_en: "General", active: true }],
        },
        {
          id: "archmage.1",
          name_en: "Archmage",
          command: [{ name_en: "The Hierophant", active: true }],
          options: [{ name_en: "Level 1 Wizard", active: true }],
        },
        {
          id: "aspiring-champion.1",
          name_en: "Aspiring Champion",
          command: [{ name_en: "The Hierophant", active: false }],
          options: [{ name_en: "Level 4 Wizard", active: true }],
        },
      ],
    };

    const errors = validateList({ list, language: "en", intl });

    expect(getMessages(errors)).toContain("misc.error.hierophantLevel");
  });

  test("adds notEnoughNonCharacters when fewer than 3 qualifying non-character units are present", () => {
    const list = {
      ...baseList,
      characters: [
        {
          id: "baron.1",
          name_en: "Baron",
          command: [{ name_en: "General", active: true }],
        },
      ],
      core: [
        { id: "badlands-ogre-bulls.1", name_en: "Badlands Ogre Bulls" },
        { id: "battle-pilgrims.1", name_en: "Battle Pilgrims" },
        { id: "helblaster-volley-gun.1", name_en: "Helblaster Volley Gun" },
      ],
    };

    const errors = validateList({ list, language: "en", intl });

    expect(getMessages(errors)).toContain("misc.error.notEnoughNonCharacters");
  });

  test("adds notEnoughNonCharactersBattleMarch when battle-march has fewer than 2 qualifying non-character units", () => {
    const list = {
      ...baseList,
      compositionRule: "battle-march",
      characters: [
        {
          id: "baron.1",
          name_en: "Baron",
          command: [{ name_en: "General", active: true }],
        },
      ],
      core: [
        { id: "badlands-ogre-bulls.1", name_en: "Badlands Ogre Bulls" },
        { id: "helblaster-volley-gun.1", name_en: "Helblaster Volley Gun" },
      ],
    };

    const errors = validateList({ list, language: "en", intl });
    const messages = getMessages(errors);

    expect(messages).toContain("misc.error.notEnoughNonCharactersBattleMarch");
    expect(messages).not.toContain("misc.error.notEnoughNonCharacters");
  });

  test("adds multipleHierophants when more than one active hierophant is selected", () => {
    const list = {
      ...baseList,
      characters: [
        {
          id: "baron.1",
          name_en: "Baron",
          command: [{ name_en: "General", active: true }],
        },
        {
          id: "archmage.1",
          name_en: "Archmage",
          command: [{ name_en: "The Hierophant", active: true }],
          options: [{ name_en: "Level 1 Wizard", active: true }],
        },
        {
          id: "aspiring-champion.1",
          name_en: "Aspiring Champion",
          command: [{ name_en: "The Hierophant", active: true }],
          options: [{ name_en: "Level 1 Wizard", active: true }],
        },
      ],
    };

    const errors = validateList({ list, language: "en", intl });

    expect(getMessages(errors)).toContain("misc.error.multipleHierophants");
  });

  test("adds multipleBSBs when more than one active battle standard bearer is selected", () => {
    const list = {
      ...baseList,
      characters: [
        {
          id: "baron.1",
          name_en: "Baron",
          command: [{ name_en: "General", active: true }],
        },
        {
          id: "archmage.1",
          name_en: "Archmage",
          command: [{ name_en: "Battle Standard Bearer", active: true }],
        },
        {
          id: "aspiring-champion.1",
          name_en: "Aspiring Champion",
          command: [{ name_en: "Battle Standard Bearer", active: true }],
        },
      ],
    };

    const errors = validateList({ list, language: "en", intl });

    expect(getMessages(errors)).toContain("misc.error.multipleBSBs");
  });

  test("adds battleMarch25PercentPerCharacter when a character exceeds 25% points in battle-march", () => {
    const list = {
      ...baseList,
      points: 1000,
      compositionRule: "battle-march",
      characters: [
        {
          id: "baron.1",
          name_en: "Baron",
          points: 300,
          command: [{ name_en: "General", active: true, points: 0 }],
        },
      ],
    };

    const errors = validateList({ list, language: "en", intl });

    expect(getMessages(errors)).toContain(
      "misc.error.battleMarch25PercentPerCharacter",
    );
  });

  test("adds grandMelee25 when a single unit exceeds 25% in grand-melee", () => {
    const list = {
      ...baseList,
      points: 2000,
      compositionRule: "grand-melee",
      characters: [
        makeCharacter({
          id: "baron.1",
          name_en: "Baron",
          isGeneral: true,
          points: 600,
        }),
      ],
    };

    const errors = validateList({ list, language: "en", intl });

    expect(getMessages(errors)).toContain("misc.error.grandMelee25");
  });

  test("adds grandMeleeLevel4 when total level 4 wizards exceed the cap", () => {
    const list = {
      ...baseList,
      points: 2000,
      compositionRule: "grand-melee",
      characters: [
        makeCharacter({
          id: "baron.1",
          name_en: "Baron",
          isGeneral: true,
        }),
        makeCharacter({
          id: "archmage.1",
          name_en: "Archmage",
          options: [{ name_en: "Level 4 Wizard", active: true }],
        }),
        makeCharacter({
          id: "aspiring-champion.1",
          name_en: "Aspiring Champion",
          options: [{ name_en: "Level 4 Wizard", active: true }],
        }),
      ],
    };

    const errors = validateList({ list, language: "en", intl });

    expect(getMessages(errors)).toContain("misc.error.grandMeleeLevel4");
  });

  test("adds grandMeleeLevel3 when total level 3 wizards exceed the cap", () => {
    const list = {
      ...baseList,
      points: 1000,
      compositionRule: "grand-melee",
      characters: [
        makeCharacter({
          id: "baron.1",
          name_en: "Baron",
          isGeneral: true,
        }),
        makeCharacter({
          id: "archmage.1",
          name_en: "Archmage",
          options: [{ name_en: "Level 3 Wizard", active: true }],
        }),
        makeCharacter({
          id: "aspiring-champion.1",
          name_en: "Aspiring Champion",
          options: [{ name_en: "Level 3 Wizard", active: true }],
        }),
      ],
    };

    const errors = validateList({ list, language: "en", intl });

    expect(getMessages(errors)).toContain("misc.error.grandMeleeLevel3");
  });

  test("adds maxUnits in combined-arms when duplicate core unit count exceeds cap", () => {
    const list = {
      ...baseList,
      compositionRule: "combined-arms",
      characters: [
        makeCharacter({
          id: "baron.1",
          name_en: "Baron",
          isGeneral: true,
        }),
      ],
      core: [
        { id: "badlands-ogre-bulls.1", name_en: "Badlands Ogre Bulls" },
        { id: "badlands-ogre-bulls.2", name_en: "Badlands Ogre Bulls" },
        { id: "badlands-ogre-bulls.3", name_en: "Badlands Ogre Bulls" },
        { id: "badlands-ogre-bulls.4", name_en: "Badlands Ogre Bulls" },
        { id: "badlands-ogre-bulls.5", name_en: "Badlands Ogre Bulls" },
      ],
    };

    const errors = validateList({ list, language: "en", intl });
    const maxUnitsError = getErrorByMessage(errors, "misc.error.maxUnits");

    expect(maxUnitsError).toBeTruthy();
    expect(maxUnitsError.section).toBe("core");
    expect(maxUnitsError.diff).toBe(1);
  });

  test("adds requiresGeneral for a unit that needs a specific general choice", () => {
    const list = {
      ...baseList,
      armyComposition: "high-elf-realms",
      characters: [
        makeCharacter({
          id: "baron.1",
          name_en: "Baron",
          isGeneral: true,
        }),
      ],
      core: [
        { id: "sister-of-avelorn.1", name_en: "Sister of Avelorn" },
        { id: "badlands-ogre-bulls.1", name_en: "Badlands Ogre Bulls" },
        { id: "battle-pilgrims.1", name_en: "Battle Pilgrims" },
      ],
    };

    const errors = validateList({ list, language: "en", intl });

    expect(getMessages(errors)).toContain("misc.error.requiresGeneral");
  });

  test("adds requiresMagicItem when a restricted unit is taken without the required item", () => {
    const list = {
      ...baseList,
      armyComposition: "high-elf-realms",
      characters: [
        makeCharacter({
          id: "baron.1",
          name_en: "Baron",
          isGeneral: true,
          items: [],
        }),
      ],
      special: [
        { id: "lion-chariot-of-chrace.1", name_en: "Lion Chariot of Chrace" },
      ],
    };

    const errors = validateList({ list, language: "en", intl });

    expect(getMessages(errors)).toContain("misc.error.requiresMagicItem");
  });

  test("adds requiresMounted when nomadic-waaagh character is not mounted", () => {
    const list = {
      ...baseList,
      armyComposition: "nomadic-waaagh",
      characters: [
        makeCharacter({
          id: "orc-warboss.1",
          name_en: "Orc Warboss",
          isGeneral: true,
          mounts: [{ name_en: "On foot", active: true }],
        }),
      ],
    };

    const errors = validateList({ list, language: "en", intl });

    expect(getMessages(errors)).toContain("misc.error.requiresMounted");
  });

  test("adds requiresOption when a character is missing a required active option", () => {
    const list = {
      ...baseList,
      armyComposition: "heralds-of-darkness",
      characters: [
        makeCharacter({
          id: "daemon-prince.1",
          name_en: "Daemon Prince",
          isGeneral: true,
          options: [{ id: "fly", name_en: "Fly", active: false }],
        }),
      ],
      core: [
        { id: "chaos-knights.1", name_en: "Chaos Knights" },
        { id: "badlands-ogre-bulls.1", name_en: "Badlands Ogre Bulls" },
        { id: "battle-pilgrims.1", name_en: "Battle Pilgrims" },
      ],
    };

    const errors = validateList({ list, language: "en", intl });

    expect(getMessages(errors)).toContain("misc.error.requiresOption");
  });

  test("adds requiresUnits for per-unit dependency when required units are missing", () => {
    const list = {
      ...baseList,
      armyComposition: "kingdom-of-bretonnia",
      characters: [
        makeCharacter({
          id: "baron.1",
          name_en: "Baron",
          isGeneral: true,
        }),
      ],
      core: [
        { id: "knights-errant.1", name_en: "Knights Errant" },
        { id: "knights-errant.2", name_en: "Knights Errant" },
        { id: "battle-pilgrims.1", name_en: "Battle Pilgrims" },
      ],
    };

    const errors = validateList({ list, language: "en", intl });

    expect(getMessages(errors)).toContain("misc.error.requiresUnits");
  });

  test("adds minUnits from composition rules when mandatory unit groups are missing", () => {
    const list = {
      ...baseList,
      armyComposition: "kingdom-of-bretonnia",
      characters: [
        makeCharacter({
          id: "baron.1",
          name_en: "Baron",
          isGeneral: true,
        }),
      ],
      core: [
        { id: "battle-pilgrims.1", name_en: "Battle Pilgrims" },
        { id: "badlands-ogre-bulls.1", name_en: "Badlands Ogre Bulls" },
        {
          id: "black-guard-of-naggarond.1",
          name_en: "Black Guard of Naggarond",
        },
      ],
    };

    const errors = validateList({ list, language: "en", intl });

    expect(getMessages(errors)).toContain("misc.error.minUnits");
  });

  test("adds maxUnits from composition rules when an explicit cap is exceeded", () => {
    const list = {
      ...baseList,
      armyComposition: "kingdom-of-bretonnia",
      characters: [
        makeCharacter({
          id: "duke.1",
          name_en: "Duke",
          isGeneral: true,
        }),
        makeCharacter({
          id: "duke.2",
          name_en: "Duke",
        }),
      ],
    };

    const errors = validateList({ list, language: "en", intl });

    expect(getMessages(errors)).toContain("misc.error.maxUnits");
  });

  test("adds battleMarchMultiple0XUnits when battle-march exceeds a 0-X-per-1000 cap", () => {
    const list = {
      ...baseList,
      armyComposition: "kingdom-of-bretonnia",
      points: 1000,
      compositionRule: "battle-march",
      characters: [
        makeCharacter({
          id: "baron.1",
          name_en: "Baron",
          isGeneral: true,
        }),
        makeCharacter({
          id: "baron.2",
          name_en: "Baron",
        }),
      ],
    };

    const errors = validateList({ list, language: "en", intl });

    expect(getMessages(errors)).toContain(
      "misc.error.battleMarchMultiple0XUnits",
    );
  });

  test("adds battleMarch35PercentPerCore when a core unit exceeds 35% in battle-march", () => {
    const list = {
      ...baseList,
      points: 1000,
      compositionRule: "battle-march",
      characters: [
        makeCharacter({
          id: "baron.1",
          name_en: "Baron",
          isGeneral: true,
        }),
      ],
      core: [
        {
          id: "badlands-ogre-bulls.1",
          name_en: "Badlands Ogre Bulls",
          points: 400,
        },
        { id: "battle-pilgrims.1", name_en: "Battle Pilgrims" },
      ],
    };

    const errors = validateList({ list, language: "en", intl });
    expect(getMessages(errors)).toContain(
      "misc.error.battleMarch35PercentPerCore",
    );
  });

  test("adds battleMarch30PercentPerSpecial when a special unit exceeds 30% in battle-march", () => {
    const list = {
      ...baseList,
      points: 1000,
      compositionRule: "battle-march",
      characters: [
        makeCharacter({
          id: "baron.1",
          name_en: "Baron",
          isGeneral: true,
        }),
      ],
      special: [{ id: "doomseeker.1", name_en: "Doomseeker", points: 350 }],
    };

    const errors = validateList({ list, language: "en", intl });
    expect(getMessages(errors)).toContain(
      "misc.error.battleMarch30PercentPerSpecial",
    );
  });

  test("adds battleMarch25PercentPerRare and battleMarch25PercentPerMercenary for oversized units", () => {
    const list = {
      ...baseList,
      points: 1000,
      compositionRule: "battle-march",
      characters: [
        makeCharacter({
          id: "baron.1",
          name_en: "Baron",
          isGeneral: true,
        }),
      ],
      rare: [{ id: "black-coach.1", name_en: "Black Coach", points: 300 }],
      mercenaries: [
        {
          id: "badlands-ogre-bulls.merc1",
          name_en: "Badlands Ogre Bulls",
          points: 300,
        },
      ],
    };

    const errors = validateList({ list, language: "en", intl });
    const messages = getMessages(errors);
    expect(messages).toContain("misc.error.battleMarch25PercentPerRare");
    expect(messages).toContain("misc.error.battleMarch25PercentPerMercenary");
  });

  test("counts sharedCombinedArmsUnits toward combined-arms cap", () => {
    const list = {
      ...baseList,
      points: 2000,
      compositionRule: "combined-arms",
      characters: [
        makeCharacter({
          id: "baron.1",
          name_en: "Baron",
          isGeneral: true,
        }),
      ],
      core: [
        {
          id: "badlands-ogre-bulls.1",
          name_en: "Badlands Ogre Bulls",
          sharedCombinedArmsUnits: ["battle-pilgrims"],
        },
        {
          id: "badlands-ogre-bulls.2",
          name_en: "Badlands Ogre Bulls",
          sharedCombinedArmsUnits: ["battle-pilgrims"],
        },
        {
          id: "badlands-ogre-bulls.3",
          name_en: "Badlands Ogre Bulls",
          sharedCombinedArmsUnits: ["battle-pilgrims"],
        },
        {
          id: "badlands-ogre-bulls.4",
          name_en: "Badlands Ogre Bulls",
          sharedCombinedArmsUnits: ["battle-pilgrims"],
        },
        { id: "battle-pilgrims.1", name_en: "Battle Pilgrims" },
      ],
    };

    const errors = validateList({ list, language: "en", intl });
    const maxUnitsError = errors.find(
      (error) =>
        error.message === "misc.error.maxUnits" &&
        error.section === "core" &&
        error.name === "Battle Pilgrims",
    );

    expect(maxUnitsError).toBeTruthy();
    expect(maxUnitsError.diff).toBe(1);
  });

  test("applies Settra special hierophant priority level", () => {
    const list = {
      ...baseList,
      characters: [
        makeCharacter({
          id: "baron.1",
          name_en: "Baron",
          isGeneral: true,
        }),
        makeCharacter({
          id: "settra-the-imperishable-the-great-king-of-nehekhara.1",
          name_en: "Settra the Imperishable",
          command: [{ name_en: "The Hierophant", active: false, points: 0 }],
          options: [{ name_en: "Level 1 Wizard", active: true }],
        }),
        makeCharacter({
          id: "archmage.1",
          name_en: "Archmage",
          command: [{ name_en: "The Hierophant", active: true, points: 0 }],
          options: [{ name_en: "Level 4 Wizard", active: true }],
        }),
      ],
    };

    const errors = validateList({ list, language: "en", intl });
    expect(getMessages(errors)).toContain("misc.error.hierophantLevel");
  });
});
