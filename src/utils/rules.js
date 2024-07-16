export const rules = {
  "grand-army": {
    lords: { maxPercent: 25 },
    heroes: { maxPercent: 25 },
    characters: { maxPercent: 50 },
    core: { minPercent: 25 },
    special: {
      maxPercent: 50,
    },
    rare: {
      maxPercent: 25,
    },
    mercenaries: { maxPercent: 20 },
    allies: { maxPercent: 25 },
  },
  "kingdom-of-bretonnia": {
    characters: {
      maxPercent: 50,
      units: [
        {
          ids: ["duke"],
          min: 0,
          max: 1,
        },
        {
          ids: ["baron", "prophetess"],
          min: 0,
          max: 1,
          points: 1000,
        },
      ],
    },
    core: {
      minPercent: 25,
      units: [
        {
          ids: ["knights-of-the-realm", "mounted-knights-of-the-realm"],
          min: 1,
        },
        {
          ids: ["men-at-arms", "peasant-bowmen"],
          min: 1,
        },
        {
          ids: ["knights-errant"],
          min: 0,
          max: 1,
          requiresType: "core",
          requires: ["knights-of-the-realm", "mounted-knights-of-the-realm"],
        },
      ],
    },
    special: {
      maxPercent: 50,
      units: [
        {
          ids: ["battle-pilgrims"],
          min: 0,
          max: 2,
          points: 1000,
        },
      ],
    },
    rare: {
      maxPercent: 25,
      units: [
        {
          ids: ["field-trebuchet"],
          min: 0,
          max: 1,
          points: 1000,
        },
      ],
    },
    mercenaries: { maxPercent: 20 },
    allies: {
      maxPercent: 25,
    },
  },
  "errantry-crusades": {
    characters: { maxPercent: 50 },
    core: { minPercent: 33 },
    special: {
      maxPercent: 50,
    },
    rare: {
      maxPercent: 33,
    },
    mercenaries: {
      maxPercent: 25,
    },
  },
  "bretonnian-exiles": {
    characters: { maxPercent: 50 },
    core: { minPercent: 25 },
    special: {
      maxPercent: 33,
    },
    rare: {
      maxPercent: 33,
    },
    mercenaries: {
      maxPercent: 25,
    },
  },
  "tomb-kings-of-khemri": {
    characters: {
      maxPercent: 50,
      units: [
        {
          ids: ["tomb-king", "tomb-prince"],
          min: 1,
        },
        {
          ids: ["high-priest", "mortuary-priest"],
          min: 1,
        },
        {
          ids: ["tomb-king", "high-priest"],
          min: 0,
          max: 1,
          points: 1000,
        },
      ],
    },
    core: {
      minPercent: 25,
      units: [
        {
          ids: ["skeleton-warriors", "skeleton-archers"],
          min: 1,
        },
        {
          ids: ["tomb-guard", "sepulchral-stalkers"],
          min: 0,
          max: 1,
        },
      ],
    },
    special: {
      maxPercent: 50,
      units: [
        {
          ids: ["tomb-scorpion"],
          min: 0,
          max: 3,
          points: 1000,
        },
        {
          ids: ["khemrian-warsphinx"],
          min: 0,
          max: 2,
          points: 1000,
        },
      ],
    },
    rare: {
      maxPercent: 25,
      units: [
        {
          ids: ["screaming-skull-catapult"],
          min: 0,
          max: 2,
          points: 1000,
        },
        {
          ids: ["casket-of-souls"],
          min: 0,
          max: 1,
          points: 1000,
        },
      ],
    },
    mercenaries: {
      maxPercent: 20,
    },
    allies: {
      maxPercent: 25,
    },
  },
  "nehekharan-royal-hosts": {
    characters: { maxPercent: 50 },
    core: { minPercent: 33 },
    special: {
      maxPercent: 50,
    },
    rare: {
      maxPercent: 25,
    },
  },
  "mortuary-cults": {
    characters: { maxPercent: 50 },
    core: { minPercent: 33 },
    special: {
      maxPercent: 50,
    },
    rare: {
      maxPercent: 33,
    },
  },
  "orc-and-goblin-tribes": {
    characters: {
      maxPercent: 50,
      units: [
        {
          ids: ["black-orc-warboss", "orc-warboss", "orc-weirdnob"],
          min: 0,
          max: 1,
          points: 1000,
        },
      ],
    },
    core: {
      minPercent: 25,
      units: [
        {
          ids: ["night-goblin-mob"],
          min: 0,
          max: 1,
          requiresType: "characters",
          requires: [
            "night-goblin-warboss",
            "night-goblin-bigboss",
            "night-goblin-oddnob",
            "night-goblin-oddgit",
          ],
        },
        {
          ids: ["night-goblin-squig-herd"],
          min: 0,
          max: 1,
          requiresType: "characters",
          requires: [
            "night-goblin-warboss",
            "night-goblin-bigboss",
            "night-goblin-oddnob",
            "night-goblin-oddgit",
          ],
        },
        {
          ids: ["black-orc-mob"],
          min: 0,
          max: 1,
          requiresGeneral: true,
          requiresType: "characters",
          requires: ["black-orc-warboss", "black-orc-bigboss"],
        },
      ],
    },
    special: {
      maxPercent: 50,
      units: [
        {
          ids: ["night-goblin-squig-hopper-mob"],
          min: 0,
          max: 1,
          requiresType: "characters",
          requires: [
            "night-goblin-warboss",
            "night-goblin-bigboss",
            "night-goblin-oddnob",
            "night-goblin-oddgit",
          ],
        },
        {
          ids: ["goblin-bolt-throwa"],
          min: 0,
          max: 2,
          points: 1000,
        },
      ],
    },
    rare: {
      maxPercent: 25,
      units: [
        {
          ids: ["mangler-squigs"],
          min: 0,
          max: 1,
          requiresType: "characters",
          requires: [
            "night-goblin-warboss",
            "night-goblin-bigboss",
            "night-goblin-oddnob",
            "night-goblin-oddgit",
          ],
        },
        {
          ids: ["goblin-rock-lobber"],
          min: 0,
          max: 1,
          points: 1000,
        },
        {
          ids: ["doom-diver-catapult"],
          min: 0,
          max: 1,
          points: 1000,
        },
      ],
    },
    mercenaries: { maxPercent: 20 },
    allies: { maxPercent: 25 },
  },
  "nomadic-waaagh": {
    characters: { maxPercent: 50 },
    core: { minPercent: 25 },
    special: {
      maxPercent: 50,
    },
    rare: {
      maxPercent: 25,
    },
    mercenaries: {
      maxPercent: 25,
    },
  },
  "troll-horde": {
    characters: { maxPercent: 50 },
    core: { minPercent: 33 },
    special: {
      maxPercent: 50,
    },
    rare: {
      maxPercent: 25,
    },
    mercenaries: {
      maxPercent: 25,
    },
  },
  "warriors-of-chaos": {
    characters: {
      maxPercent: 50,
      units: [
        {
          ids: ["chaos-lord", "daemon-prince"],
          min: 0,
          max: 1,
        },
        {
          ids: ["exalted-champion", "sorcerer-lord"],
          min: 0,
          max: 1,
          points: 1000,
        },
      ],
    },
    core: {
      minPercent: 25,
    },
    special: {
      maxPercent: 50,
      units: [
        {
          ids: ["chosen-chaos-warriors"],
          min: 0,
          max: 1,
        },
        {
          ids: ["chosen-chaos-knights"],
          min: 0,
          max: 1,
        },
      ],
    },
    rare: {
      maxPercent: 25,
      units: [
        {
          ids: ["hellcannon"],
          min: 0,
          max: 1,
          points: 1000,
        },
        {
          ids: ["dragon-ogre-shaggoth"],
          min: 0,
          max: 1,
          requiresType: "special",
          requires: ["dragon-ogres"],
        },
        {
          ids: ["chaos-giant"],
          min: 0,
          max: 1,
          points: 1000,
        },
      ],
    },
    mercenaries: { maxPercent: 20 },
    allies: { maxPercent: 25 },
  },
  "beastmen-brayherds": {
    characters: {
      maxPercent: 50,
      units: [
        {
          ids: ["beastlord", "great-bray-shaman", "doombull"],
          min: 0,
          max: 1,
          points: 1000,
        },
      ],
    },
    core: {
      minPercent: 25,
      units: [
        {
          ids: ["gor-herds"],
          min: 1,
        },
        {
          ids: ["bestigor-herds"],
          min: 0,
          max: 1,
          requiresGeneral: true,
          requiresType: "characters",
          requires: ["beastlord", "wargor"],
        },
        {
          ids: ["minotaur-herd"],
          min: 0,
          max: 1,
          requiresGeneral: true,
          requiresType: "characters",
          requires: ["doombull", "gorebull"],
        },
      ],
    },
    special: {
      maxPercent: 50,
      units: [
        {
          ids: ["jabberslythe", "cygor"],
          min: 0,
          max: 1,
          requiresGeneral: true,
          requiresType: "characters",
          requires: ["great-bray-shaman", "bray-shaman"],
        },
        {
          ids: ["ghorgon"],
          min: 0,
          max: 1,
          requiresGeneral: true,
          requiresType: "characters",
          requires: ["doombull", "gorebull"],
        },
      ],
    },
    rare: {
      maxPercent: 25,
    },
    mercenaries: { maxPercent: 20 },
    allies: { maxPercent: 25 },
  },
  "dwarfen-mountain-holds": {
    characters: {
      maxPercent: 50,
      units: [
        {
          ids: ["king", "anvil-of-doom"],
          min: 0,
          max: 1,
          points: 1000,
        },
      ],
    },
    core: {
      minPercent: 25,
      units: [
        {
          ids: ["rangers"],
          min: 0,
          max: 1,
        },
        {
          ids: ["long-beards"],
          min: 0,
          max: 1,
          requiresGeneral: true,
          requiresType: "characters",
          requires: ["king"],
        },
      ],
    },
    special: {
      maxPercent: 50,
      units: [
        {
          ids: ["hammerers"],
          min: 0,
          max: 1,
          requiresType: "characters",
          requires: ["king", "thane"],
        },
        {
          ids: ["bolt-thrower", "grudge-thrower", "cannon"],
          min: 0,
          max: 3,
          points: 1000,
        },
      ],
    },
    rare: {
      maxPercent: 25,
      units: [
        {
          ids: ["organ-gun", "flame-cannon"],
          min: 0,
          max: 2,
          points: 1000,
        },
      ],
    },
    mercenaries: { maxPercent: 20 },
    allies: { maxPercent: 25 },
  },
  "empire-of-man": {
    characters: {
      maxPercent: 50,
      units: [
        {
          ids: ["general-of-the-empire", "grand-master"],
          min: 0,
          max: 1,
          points: 1000,
        },
        {
          ids: ["lector-of-sigmar", "high-priest-of-ulric"],
          min: 0,
          max: 1,
          points: 1000,
        },
      ],
    },
    core: {
      minPercent: 25,
      units: [
        {
          ids: ["veteran-state-troops"],
          min: 0,
          max: 1,
          points: 1000,
        },
      ],
    },
    special: {
      maxPercent: 50,
      units: [
        {
          ids: ["inner-circle-knights"],
          min: 0,
          max: 1,
          points: 1000,
        },
        {
          ids: ["great-cannon", "mortar"],
          min: 0,
          max: 3,
          points: 1000,
        },
      ],
    },
    rare: {
      maxPercent: 25,
      units: [
        {
          ids: ["helblaster-volley-gun", "helstrom-rocket-battery"],
          min: 0,
          max: 1,
          points: 1000,
        },
        {
          ids: ["steam-tank"],
          min: 0,
          max: 1,
          points: 1000,
        },
      ],
    },
    mercenaries: { maxPercent: 20 },
    allies: { maxPercent: 25 },
  },
  "wood-elf-realms": {
    characters: {
      maxPercent: 50,
      units: [
        {
          ids: ["glade-lord", "spellweaver"],
          min: 0,
          max: 1,
          points: 1000,
        },
        {
          ids: ["treeman-ancient"],
          min: 0,
          max: 1,
          points: 1000,
        },
      ],
    },
    core: {
      minPercent: 25,
      units: [
        {
          ids: ["glade-guard"],
          min: 1,
        },
        {
          ids: ["deepwood-scouts"],
          min: 0,
          max: 1,
          points: 1000,
        },
      ],
    },
    special: {
      maxPercent: 50,
      units: [
        {
          ids: ["treekin"],
          min: 0,
          max: 2,
          points: 1000,
        },
      ],
    },
    rare: {
      maxPercent: 25,
      units: [
        {
          ids: ["waywatchers"],
          min: 0,
          max: 1,
          requiresType: "characters",
          requires: ["waystalker"],
        },
        {
          ids: ["giant-eagle"],
          min: 0,
          max: 3,
          points: 1000,
        },
      ],
    },
    mercenaries: { maxPercent: 20 },
    allies: { maxPercent: 25 },
  },
};

export const getMaxPercentData = ({
  type,
  armyPoints,
  points,
  armyComposition,
}) => {
  const categoryData = rules[armyComposition]
    ? rules[armyComposition][type]
    : rules["grand-army"][type];

  if (!categoryData) {
    return null;
  }

  const maxPercent = categoryData.maxPercent;
  const maxPoints = (armyPoints / 100) * maxPercent;

  return {
    points: Math.floor(maxPoints),
    overLimit: points > maxPoints,
    diff: points > maxPoints ? Math.ceil(points - maxPoints) : 0,
  };
};

export const getMinPercentData = ({
  type,
  armyPoints,
  points,
  armyComposition,
}) => {
  const minPercent = rules[armyComposition]
    ? rules[armyComposition][type].minPercent
    : rules["grand-army"][type].minPercent;
  const minPoints = (armyPoints / 100) * minPercent;

  return {
    points: Math.floor(minPoints),
    overLimit: points <= minPoints,
    diff: points <= minPoints ? Math.ceil(minPoints - points) : 0,
  };
};
