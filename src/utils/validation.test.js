import { describe, expect, test } from "vitest";
import { validateList } from "./validation";

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

    expect(getMessages(errors)).toEqual(["misc.error.noGeneral"]);
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

    expect(getMessages(errors)).toEqual(["misc.error.multipleGenerals"]);
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

    expect(getMessages(errors)).toEqual(["misc.error.generalLeadership"]);
  });

  test("adds hierophantLevel when active hierophant has lower wizard level", () => {
    const list = {
      ...baseList,
      army: "tomb-kings-of-khemri",
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

    expect(getMessages(errors)).toEqual(["misc.error.hierophantLevel"]);
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

    expect(getMessages(errors)).toEqual(["misc.error.notEnoughNonCharacters"]);
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
        { id: "chaos-warhounds.1", name_en: "Chaos Warhounds" },
      ],
    };

    const errors = validateList({ list, language: "en", intl });
    const messages = getMessages(errors);

    expect(messages).toEqual(["misc.error.notEnoughNonCharactersBattleMarch"]);
  });

  test("adds multipleHierophants when more than one active hierophant is selected", () => {
    const list = {
      ...baseList,
      army: "tomb-kings-of-khemri",
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

    expect(getMessages(errors)).toEqual(["misc.error.multipleHierophants"]);
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

    expect(getMessages(errors)).toEqual(["misc.error.multipleBSBs"]);
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

    expect(getMessages(errors)).toEqual([
      "misc.error.battleMarch25PercentPerCharacter",
    ]);
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

    expect(getMessages(errors)).toEqual(["misc.error.grandMelee25"]);
  });

  test("adds grandMeleeLevel4 when total level 4 wizards exceed the cap", () => {
    const list = {
      ...baseList,
      points: 2000,
      compositionRule: "grand-melee",
      characters: [
        makeCharacter({
          id: "archmage.1",
          name_en: "Archmage",
          options: [{ name_en: "Level 4 Wizard", active: true }],
          isGeneral: true,
        }),
        makeCharacter({
          id: "aspiring-champion.1",
          name_en: "Aspiring Champion",
          options: [{ name_en: "Level 4 Wizard", active: true }],
        }),
      ],
    };

    const errors = validateList({ list, language: "en", intl });

    expect(getMessages(errors)).toEqual(["misc.error.grandMeleeLevel4"]);
  });

  test("adds grandMeleeLevel3 when total level 3 wizards exceed the cap", () => {
    const list = {
      ...baseList,
      points: 1000,
      compositionRule: "grand-melee",
      characters: [
        makeCharacter({
          id: "archmage.1",
          name_en: "Archmage",
          options: [{ name_en: "Level 3 Wizard", active: true }],
          isGeneral: true,
        }),
        makeCharacter({
          id: "aspiring-champion.1",
          name_en: "Aspiring Champion",
          options: [{ name_en: "Level 3 Wizard", active: true }],
        }),
      ],
    };

    const errors = validateList({ list, language: "en", intl });

    expect(getMessages(errors)).toEqual(["misc.error.grandMeleeLevel3"]);
  });

  test("adds maxUnits in combined-arms when duplicate core unit count exceeds 4", () => {
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

  test("adds maxUnits in combined-arms when duplicate core unit count exceeds 5 at 3000 points", () => {
    const list = {
      ...baseList,
      compositionRule: "combined-arms",
      points: 3000,
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

    expect(maxUnitsError).toBeFalsy();

    list.core.push({ id: "badlands-ogre-bulls.6", name_en: "Badlands Ogre Bulls" });

    const errors2 = validateList({ list, language: "en", intl });
    const maxUnitsError2 = getErrorByMessage(errors2, "misc.error.maxUnits");

    expect(maxUnitsError2).toBeTruthy();
    expect(maxUnitsError2.section).toBe("core");
    expect(maxUnitsError2.diff).toBe(1);
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
        { id: "sister-of-avelorn.1", name_en: "Sisters of Avelorn" },
        { id: "badlands-ogre-bulls.1", name_en: "Badlands Ogre Bulls" },
        { id: "battle-pilgrims.1", name_en: "Battle Pilgrims" },
      ],
    };

    const errors = validateList({ list, language: "en", intl });

    expect(getMessages(errors)).toEqual(["misc.error.requiresGeneral"]);

    // no error if the required general is present
    list.characters = [
      makeCharacter({
        id: "handmaiden-of-the-everqueen.1",
        name_en: "Handmaiden of the Everqueen",
        isGeneral: true,
      }),
    ];

    const noErrors = validateList({ list, language: "en", intl });

    expect(getMessages(noErrors)).toEqual([]);
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

    expect(getMessages(errors)).toEqual(["misc.error.requiresMagicItem"]);
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

    expect(getMessages(errors)).toEqual(["misc.error.requiresMounted"]);
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

    expect(getMessages(errors)).toEqual(["misc.error.requiresOption"]);
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
        { id: "men-at-arms.1", name_en: "Men-at-Arms" },
        { id: "mounted-knights-of-the-realm.1", name_en: "Mounted Knights of the Realm" },
      ],
    };

    const errors = validateList({ list, language: "en", intl });

    expect(getMessages(errors)).toEqual(["misc.error.requiresUnits"]);
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
        { id: "mounted-knights-of-the-realm.1", name_en: "Mounted Knights of the Realm" },
        { id: "mounted-knights-of-the-realm.2", name_en: "Mounted Knights of the Realm" },
        { id: "knights-errant.1", name_en: "Knights Errant" },
      ],
    };

    const errors = validateList({ list, language: "en", intl });

    expect(getMessages(errors)).toEqual(["misc.error.minUnits"]);
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
      core: [
        { id: "mounted-knights-of-the-realm.1", name_en: "Mounted Knights of the Realm" },
        { id: "mounted-knights-of-the-realm.2", name_en: "Mounted Knights of the Realm" },
        { id: "men-at-arms.1", name_en: "Men-at-Arms" },
      ],
    };

    const errors = validateList({ list, language: "en", intl });

    expect(getMessages(errors)).toEqual(["misc.error.maxUnits"]);
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
      core: [
        { id: "mounted-knights-of-the-realm.1", name_en: "Mounted Knights of the Realm" },
        { id: "mounted-knights-of-the-realm.2", name_en: "Mounted Knights of the Realm" },
        { id: "men-at-arms.1", name_en: "Men-at-Arms" },
      ],
    };

    const errors = validateList({ list, language: "en", intl });

    expect(getMessages(errors)).toEqual([
      "misc.error.battleMarchMultiple0XUnits",
    ]);
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
    expect(getMessages(errors)).toEqual([
      "misc.error.battleMarch35PercentPerCore",
    ]);
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
    expect(getMessages(errors)).toEqual([
      "misc.error.battleMarch30PercentPerSpecial",
    ]);
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
    expect(messages).toEqual([
      "misc.error.battleMarch25PercentPerRare",
      "misc.error.battleMarch25PercentPerMercenary",
    ]);
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
      army: "tomb-kings-of-khemri",
      characters: [
        makeCharacter({
          id: "settra-the-imperishable-the-great-king-of-nehekhara.1",
          name_en: "Settra the Imperishable",
          command: [{ name_en: "The Hierophant", active: false, points: 0 }],
          options: [{ name_en: "Level 1 Wizard", active: true }],
          isGeneral: true,
        }),
        makeCharacter({
          id: "high-priest.1",
          name_en: "High Priest",
          command: [{ name_en: "The Hierophant", active: true, points: 0 }],
          options: [{ name_en: "Level 4 Wizard", active: true }],
        }),
      ],
    };

    const errors = validateList({ list, language: "en", intl });
    expect(getMessages(errors)).toEqual(["misc.error.hierophantLevel"]);
  });

  test("adds wizardGeneral if a Vampire Count general is not a wizard", () => {
    const list = {
      ...baseList,
      army: "vampire-counts",
      characters: [
        makeCharacter({
          id: "vampire-thrall",
          name_en: "Vampire Thrall",
          isGeneral: true,
        }),
      ],
    };

    const errors = validateList({ list, language: "en", intl });
    expect(getMessages(errors)).toEqual(["misc.error.wizardGeneral"]);

    // Giving the vampire thrall a wizard level makes the error go away
    list.characters = [
      makeCharacter({
        id: "vampire-thrall",
        name_en: "Vampire Thrall",
        options: [{ name_en: "Level 1 Wizard", active: true }],
        isGeneral: true,
      }),
    ];

    const errors2 = validateList({ list, language: "en", intl });
    expect(getMessages(errors2)).toEqual([]);
  });
});
