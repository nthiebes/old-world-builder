import { describe, expect, test } from "vitest";
import { checkOptionRestrictions } from "./option-restrictions";

const baseList = {
  id: "test-army",
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

describe("checkOptionRestrictions", () => {
  test("adds maxOptionPerArmy when two units have a max 1 option", () => {
    const orcMob1 = {
      id: "orc-mob.1",
      name_en: "Orc Mob",
      options: [{
        id: "orc-mob-biguns",
        active: true,
        name_en: "Big 'Uns",
        notes: {
          name_en: "0-1 per army",
        },
        restrictions: {
          max: 1
        },
      }]
    }
    const orcMob2 = {
      ...orcMob1,
      id: "orc-mob.2",
    }
    const list = {
      ...baseList,
      core: [...baseList.core, orcMob1, orcMob2]
    }

    const errors = checkOptionRestrictions(orcMob1.id, orcMob1.options[0], list, "options");
    expect(errors.message).toEqual("misc.error.maxOptionPerArmy");
    expect(errors.otherUnits[0].url).toEqual("/editor/test-army/core/orc-mob.2/");
  });

  test("adds maxOptionPerArmy when exceeding a max 1 per 1000 option", () => {
    const orcMob1 = {
      id: "orc-mob.1",
      name_en: "Orc Mob",
      options: [{
        id: "orc-mob-frenzy",
        active: true,
        name_en: "Frenzy",
        notes: {
          name_en: "0-1 per 1,000 points",
        },
        restrictions: {
          max: 1,
          points: 1000
        },
      }]
    }
    const orcMob2 = {
      ...orcMob1,
      id: "orc-mob.2",
    }
    const list = {
      ...baseList,
      core: [...baseList.core, orcMob1, orcMob2]
    }

    // No errors with 2 units at 2000 points
    const errors1 = checkOptionRestrictions(orcMob1.id, orcMob1.options[0], list, "options");
    expect(errors1).toBeUndefined();

    // Error with 2 units at 1000 points
    list.points = 1000;

    const errors2 = checkOptionRestrictions(orcMob1.id, orcMob1.options[0], list, "options");
    expect(errors2).toBeDefined();
    expect(errors2.message).toEqual("misc.error.maxOptionPerArmy");
    expect(errors2.otherUnits[0].url).toEqual("/editor/test-army/core/orc-mob.2/");

    // Error with 3 units at 2000 points
    const orcMob3 = {
      ...orcMob1,
      id: "orc-mob.3",
    }
    list.points = 2000;
    list.core.push(orcMob3);
    const errors3 = checkOptionRestrictions(orcMob1.id, orcMob1.options[0], list, "options");
    expect(errors3).toBeDefined();
    expect(errors3.message).toEqual("misc.error.maxOptionPerArmy");
    expect(errors3.otherUnits.length).toEqual(2);
    expect(errors3.otherUnits[0].url).toEqual("/editor/test-army/core/orc-mob.2/");
  });

  test("works with other option types like weapon and armour", () => {
    const orcMob1 = {
      id: "orc-mob.1",
      name_en: "Orc Mob",
      weapons: [{
        id: "orc-mob-big-guns",
        active: true,
        name_en: "Big Guns",
        notes: {
          name_en: "0-1 per army",
        },
        restrictions: {
          max: 1
        },
      }]
    }
    const orcMob2 = {
      ...orcMob1,
      id: "orc-mob.2",
    }
    const list = {
      ...baseList,
      core: [...baseList.core, orcMob1, orcMob2]
    }

    const errors = checkOptionRestrictions(orcMob1.id, orcMob1.weapons[0], list, "weapons");
    expect(errors).toBeDefined();
    expect(errors.message).toEqual("misc.error.maxOptionPerArmy");
    expect(errors.otherUnits[0].url).toEqual("/editor/test-army/core/orc-mob.2/");
  });

  test("options with an id in 'restrictions.ids' are counted", () => {
    const orcChariot1 = {
      id: "orc-chariot.1",
      name_en: "Orc Chariot",
      options: [{
        id: "orc-chariot-frenzy-2",
        active: true,
        name_en: "Frenzy with two crew",
        notes: {
          name_en: "0-1 per army",
        },
        restrictions: {
          max: 1,
          ids: ["orc-chariot-frenzy-2", "orc-chariot-frenzy-3"]
        },
      }]
    }
    const orcChariot2 = {
      id: "orc-chariot.2",
      name_en: "Orc Chariot",
      options: [{
        id: "orc-chariot-frenzy-3",
        active: true,
        name_en: "Frenzy with three crew",
        notes: {
          name_en: "0-1 per army",
        },
        restrictions: {
          max: 1,
          ids: ["orc-chariot-frenzy-2", "orc-chariot-frenzy-3"]
        },
      }]
    }
    const list = {
      ...baseList,
      core: [...baseList.core, orcChariot1, orcChariot2]
    }

    const errors = checkOptionRestrictions(orcChariot1.id, orcChariot1.options[0], list, "options");
    expect(errors).toBeDefined();
    expect(errors.message).toEqual("misc.error.maxOptionPerArmy");
    expect(errors.otherUnits[0].url).toEqual("/editor/test-army/core/orc-chariot.2/");
  });

  test("adds errors if requires character max limit is exceeded", () => {
    const wolfRiders1 = {
      id: "goblin-wolf-riders.1",
      name: "Goblin Wolf Riders",
      options: [
        {
          id: "wolf-rider-kiknik-ambushers",
          name_en: "Ambushers",
          active: true,
          notes: {
            name_en: "0-1 Goblin Wolf Rider Mob if Kiknik is in the army",
          },
          restrictions: {
            requires: {
              unitIds: ["kiknik-toofsnatcha"],
              type: "characters"
            },
            max: 1
          }
        }
      ]
    }
    const list = {
      ...baseList,
      core: [...baseList.core, wolfRiders1]
    }
    // Without Kiknik, having the option enabled throws throws an error
    const errors1 = checkOptionRestrictions(wolfRiders1.id, wolfRiders1.options[0], list, "options");
    expect(errors1).toBeDefined();
    expect(errors1.message).toEqual("misc.error.optionRequiresUnit");
    expect(errors1.otherUnits.length).toEqual(0);

    // With Kiknik, the error goes away
    list.characters = [{
      id: "kiknik-toofsnatcha.1",
      name_en: "Kiknik Toofsnatcha",
    }];
    const errors2 = checkOptionRestrictions(wolfRiders1.id, wolfRiders1.options[0], list, "options");
    expect(errors2).toBeUndefined();

    // With another wolf rider with the option, throws a different error
    const wolfRiders2 = {
      ...wolfRiders1,
      id: "wolfRiders2"
    }
    list.core.push(wolfRiders2);
    const errors3 = checkOptionRestrictions(wolfRiders1.id, wolfRiders1.options[0], list, "options");
    expect(errors3).toBeDefined();
    expect(errors3.message).toEqual("misc.error.maxOptionPerArmy");
    expect(errors3.otherUnits.length).toEqual(1);
  });

  test("adds errors if requires character with specific option max limit is exceeded", () => {
    const freebladeKnights1 = {
      id: "freebladeKnights.1",
      name: "Freeblade Knights",
      options: [
        {
          id: "knights-lance-noble-disdain",
          name_en: "Lance Formation, Noble Disdain",
          active: true,
          notes: {
            name_en: "0-1 unit for each character with the Renegade Knight Infamous Origin",
          },
          restrictions: {
            requires: {
              unitIds: ["renegade-prince", "renegade-captain", "outcast-wizard"],
              option: "renegade-knight",
              optionType: "command",
              perUnit: true,
              type: "characters"
            },
            max: 1
          }
        }
      ]
    }
    const list = {
      ...baseList,
      core: [...baseList.core, freebladeKnights1]
    }
    // Without a Renegade Knight, having the option enabled throws throws an error
    const errors1 = checkOptionRestrictions(freebladeKnights1.id, freebladeKnights1.options[0], list, "options");
    expect(errors1).toBeDefined();
    expect(errors1.message).toEqual("misc.error.optionRequiresUnitWithOption");
    expect(errors1.otherUnits.length).toEqual(0);

    // Error still occurs if a character of the right type is added who doesn't have the option
    const prince1 = {
      id: "renegade-prince.1",
      name_en: "Renegade Prince",
      command: []
    }
    list.characters = [prince1];
    const errors2 = checkOptionRestrictions(freebladeKnights1.id, freebladeKnights1.options[0], list, "options");
    expect(errors2).toBeDefined();
    expect(errors2.message).toEqual("misc.error.optionRequiresUnitWithOption");
    expect(errors2.otherUnits.length).toEqual(0);

    // Adding required option makes error go away
    list.characters[0].command = [
      {
        id: "renegade-knight",
        name_en: "Renegade Knight",
        active: true
      }
    ]
    const errors3 = checkOptionRestrictions(freebladeKnights1.id, freebladeKnights1.options[0], list, "options");
    expect(errors3).toBeUndefined();

    // Adding another unit with the option throws a different error
    const freebladeKnights2 = {
      ...freebladeKnights1,
      id: "freebladeKnights.2"
    }
    list.core.push(freebladeKnights2);
    const errors4 = checkOptionRestrictions(freebladeKnights1.id, freebladeKnights1.options[0], list, "options");
    expect(errors4).toBeDefined();
    expect(errors4.message).toEqual("misc.error.maxOptionPerArmy");
    expect(errors4.otherUnits.length).toEqual(1);

    // Adding another character with the required option makes error go away
    const captain1 = {
      id: "renegade-captain.1",
      name_en: "Renegade Captain",
      command: [
        {
          id: "renegade-knight",
          name_en: "Renegade Knight",
          active: true
        }
      ]
    }
    list.characters.push(captain1);
    const errors5 = checkOptionRestrictions(freebladeKnights1.id, freebladeKnights1.options[0], list, "options");
    expect(errors5).toBeUndefined();
  });

  test("adds maxOptionPerArmy if subOption: magic (command banners)", () => {
    const orcMob1 = {
      id: "orc-mob.1",
      name_en: "Orc Mob",
      command: [{
        id: "orc-mob-standard-bearer",
        name_en: "Standard Bearer",
        active: true,
        magic: {
          types: ["banner"],
          selected: [
            {
              name_en: "War Banner",
              points: 25
            }
          ]
        },
        notes: {
          name_en: "0-1 unit per 1000 points may purchase a magic standard",
        },
        restrictions: {
          restrictMagicItems: true,
          max: 1,
          points: 1000
        }
      }],
    }
    const orcMob2 = {
      ...orcMob1,
      id: "orc-mob.2",
    }
    // One mob with a standard bearer but no magic banner
    const orcMob3 = {
      ...orcMob1,
      id: "orc-mob.3",
      command: [{
        id: "orc-mob-standard-bearer",
        name_en: "Standard Bearer",
        active: true,
      }]
    }
    const list = {
      ...baseList,
      core: [...baseList.core, orcMob1, orcMob2, orcMob3]
    }

    // No errors with 2 units at 2000 points
    const errors1 = checkOptionRestrictions(orcMob1.id, orcMob1.command[0], list, "command");
    expect(errors1).toBeUndefined();

    // Error with 2 units at 1000 points
    list.points = 1000;

    const errors2 = checkOptionRestrictions(orcMob1.id, orcMob1.command[0], list, "command");
    expect(errors2).toBeDefined();
    expect(errors2.message).toEqual("misc.error.maxOptionPerArmy");
    expect(errors2.otherUnits[0].url).toEqual("/editor/test-army/core/orc-mob.2/");
  });
});
