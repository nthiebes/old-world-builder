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
          requires: ["beastlord", "wargor"],
        },
        {
          ids: ["minotaur-herd"],
          min: 0,
          max: 1,
          requiresGeneral: true,
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
          requires: ["great-bray-shaman", "bray-shaman"],
        },
        {
          ids: ["ghorgon"],
          min: 0,
          max: 1,
          requiresGeneral: true,
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
  "royal-clan": {
    characters: {
      maxPercent: 50,
      units: [
        {
          ids: ["king", "thane"],
          min: 1,
        },
        {
          ids: ["anvil-of-doom", "runelord"],
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
          ids: ["bolt-thrower", "grudge-thrower"],
          min: 0,
          max: 3,
          points: 1000,
        },
      ],
    },
    rare: {
      maxPercent: 25,
    },
    mercenaries: {
      maxPercent: 25,
      units: [
        {
          ids: ["doomseekers"],
          min: 0,
          max: 4,
        },
        {
          ids: ["goblin-hewer"],
          min: 0,
          max: 1,
          points: 1000,
        },
      ],
    },
  },
  "expeditionary-forces": {
    characters: {
      maxPercent: 50,
      units: [
        {
          ids: ["engineer", "engineer-sapper"],
          min: 1,
        },
        {
          ids: ["daemon-slayer", "dragon-slayer"],
          min: 0,
          max: 1,
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
          points: 1000,
        },
        {
          ids: ["scout-gyrocopters"],
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
          ids: ["bolt-thrower", "grudge-thrower", "cannon"],
          min: 0,
          max: 3,
          points: 1000,
        },
      ],
    },
    rare: {
      maxPercent: 33,
      units: [
        {
          ids: ["slayers"],
          min: 0,
          max: 1,
        },
        {
          ids: ["organ-gun", "flame-cannon"],
          min: 0,
          max: 2,
          points: 1000,
        },
      ],
    },
    mercenaries: {
      maxPercent: 25,
      units: [
        {
          ids: ["doomseekers"],
          min: 0,
          max: 2,
          points: 1000,
        },
        {
          ids: ["goblin-hewer"],
          min: 0,
          max: 1,
          points: 1000,
        },
      ],
    },
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
  "high-elf-realms": {
    characters: {
      maxPercent: 50,
      units: [
        {
          ids: ["prince", "archmage"],
          min: 0,
          max: 1,
          points: 1000,
        },
        {
          ids: ["dragon-mage", "handmaiden-of-the-everqueen"],
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
          ids: ["sister-of-avelorn"],
          min: 0,
          max: 1,
          requiresGeneral: true,
          requires: ["handmaiden-of-the-everqueen"],
        },
      ],
    },
    special: {
      maxPercent: 50,
      units: [
        {
          ids: ["dragon-princes"],
          min: 0,
          max: 1,
          points: 1000,
        },
        {
          ids: ["lion-chariot-of-chrace"],
          min: 0,
          max: 1,
          points: 1000,
          requiresMagicItem: "chracian-hunter",
        },
        {
          ids: ["lothern-skycutters"],
          min: 0,
          max: 1,
          requiresMagicItem: "sea-guard",
        },
      ],
    },
    rare: {
      maxPercent: 25,
      units: [
        {
          ids: ["flamespyre-phoenix", "frostheart-phoenix-"],
          min: 0,
          max: 1,
          points: 1000,
        },
        {
          ids: ["great-eagle"],
          min: 0,
          max: 2,
          points: 1000,
        },
        {
          ids: ["eagle-claw-bolt-thrower"],
          min: 0,
          max: 2,
          points: 1000,
        },
      ],
    },
    mercenaries: { maxPercent: 20 },
    allies: { maxPercent: 25 },
  },
  "chaos-dwarfs": {
    characters: {
      maxPercent: 50,
      units: [
        {
          ids: ["sorcerer-prophet", "infernal-castellan"],
          min: 0,
          max: 1,
          points: 1000,
        },
        {
          ids: ["bull-centaur-taur'ruk"],
          min: 0,
          max: 1,
          requiresType: "special",
          requires: ["bull-centaur-renders"],
        },
        {
          ids: ["black-orc-bigboss", "black-orc-warboss"],
          min: 0,
          max: 1,
        },
      ],
    },
    core: {
      minPercent: 25,
      units: [
        {
          ids: ["infernal-guard"],
          min: 1,
        },
        {
          ids: ["black-orc-mob"],
          min: 0,
          max: 1,
        },
      ],
    },
    special: {
      maxPercent: 50,
      units: [
        {
          ids: ["iron-daemon"],
          min: 0,
          max: 1,
          points: 1000,
        },
        {
          ids: ["deathshrieker-rocket-launcher", "magma-cannon"],
          min: 0,
          max: 1,
          points: 1000,
        },
        {
          ids: ["hobgoblin-bolt-thrower"],
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
          ids: ["hobgoblin-wolf-raiders"],
          min: 0,
          max: 1,
          requiresType: "characters",
          requires: ["hobgoblin-khan"],
        },
        {
          ids: ["dreadquake-mortar", "hellcannon"],
          min: 0,
          max: 1,
          points: 1000,
        },
      ],
    },
    mercenaries: { maxPercent: 20 },
    allies: { maxPercent: 25 },
  },
  "daemons-of-chaos": {
    characters: {
      maxPercent: 50,
      units: [
        {
          ids: [
            "bloodthirster",
            "great-unclean-one",
            "keeper-of-secrets",
            "lord-of-change",
          ],
          min: 0,
          max: 1,
        },
        {
          ids: ["daemonic-herald-of-khorne"],
          min: 0,
          max: 1,
          requiresType: "all",
          requires: [
            "bloodletters-of-khorne",
            "flesh-hounds-of-khorne",
            "bloodcrushers-of-khorne",
            "skull-cannon-of-khorne",
          ],
        },
        {
          ids: ["daemonic-herald-of-nurgle"],
          min: 0,
          max: 1,
          requiresType: "all",
          requires: [
            "plaguebearers-of-nurgle",
            "nurglings",
            "beasts-of-nurgle",
            "plague-drones-of-nurgle",
          ],
        },
        {
          ids: ["daemonic-herald-of-slaanesh"],
          min: 0,
          max: 1,
          requiresType: "all",
          requires: [
            "daemonettes-of-slaanesh",
            "seekers-of-slaanesh",
            "fiends-of-slaanesh",
            "hellflayer-of-slaanesh",
            "seeker-chariot-of-slaanesh",
          ],
        },
        {
          ids: ["daemonic-herald-of-tzeentch"],
          min: 0,
          max: 1,
          requiresType: "all",
          requires: [
            "pink-horrors-of-tzeentch",
            "blue-horrors-of-tzeentch",
            "brimstone-horrors-of-tzeentch",
            "flamers-of-tzeentch",
            "screamers-of-tzeentch",
          ],
        },
        {
          ids: ["daemon-prince"],
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
          ids: ["bloodletters-of-khorne", "flesh-hounds-of-khorne"],
          requiresGeneral: true,
          requires: ["bloodthirster"],
        },
        {
          ids: ["plaguebearers-of-nurgle", "nurglings"],
          requiresGeneral: true,
          requires: ["great-unclean-one"],
        },
        {
          ids: ["daemonettes-of-slaanesh", "seekers-of-slaanesh"],
          requiresGeneral: true,
          requires: ["keeper-of-secrets"],
        },
        {
          ids: [
            "pink-horrors-of-tzeentch",
            "blue-horrors-of-tzeentch",
            "brimstone-horrors-of-tzeentch",
          ],
          requiresGeneral: true,
          requires: ["lord-of-change"],
        },
      ],
    },
    special: {
      maxPercent: 50,
      units: [
        {
          ids: ["bloodcrushers-of-khorne"],
          requiresGeneral: true,
          requires: ["bloodthirster"],
        },
        {
          ids: ["beasts-of-nurgle", "plague-drones-of-nurgle"],
          requiresGeneral: true,
          requires: ["great-unclean-one"],
        },
        {
          ids: [
            "fiends-of-slaanesh",
            "hellflayer-of-slaanesh",
            "seeker-chariot-of-slaanesh",
          ],
          requiresGeneral: true,
          requires: ["keeper-of-secrets"],
        },
        {
          ids: ["flamers-of-tzeentch", "screamers-of-tzeentch"],
          requiresGeneral: true,
          requires: ["lord-of-change"],
        },
      ],
    },
    rare: {
      maxPercent: 25,
      units: [
        {
          ids: ["skull-cannon-of-khorne"],
          min: 0,
          max: 1,
          points: 1000,
        },
      ],
    },
    mercenaries: { maxPercent: 20 },
    allies: { maxPercent: 25 },
  },
  "dark-elves": {
    characters: {
      maxPercent: 50,
      units: [
        {
          ids: ["dark-elf-dreadlord", "supreme-sorceress"],
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
          ids: ["witch-elves"],
          min: 0,
          max: 1,
          requiresType: "characters",
          requires: ["death-hag"],
        },
      ],
    },
    special: {
      maxPercent: 50,
      units: [
        {
          ids: ["black-guard-of-naggarond"],
          min: 0,
          max: 1,
          requiresType: "characters",
          requires: ["dark-elf-dreadlord", "dark-elf-master"],
        },
        {
          ids: ["cold-one-knights"],
          min: 0,
          max: 1,
          points: 1000,
        },
        {
          ids: ["scourgerunner-chariots", "cold-one-chariots"],
          min: 0,
          max: 2,
          points: 1000,
        },
        {
          ids: ["war-hydra", "kharybdiss"],
          min: 0,
          max: 1,
          requiresGeneral: true,
          requires: ["high-beastmaster"],
        },
      ],
    },
    rare: {
      maxPercent: 25,
      units: [
        {
          ids: ["doomfire-warlocks"],
          min: 0,
          max: 1,
          points: 1000,
        },
        {
          ids: ["reaper-bolt-throwers"],
          min: 0,
          max: 2,
          points: 1000,
        },
      ],
    },
    mercenaries: { maxPercent: 20 },
    allies: { maxPercent: 25 },
  },
  lizardmen: {
    characters: {
      maxPercent: 50,
      units: [
        {
          ids: ["slann-mage-priest"],
          min: 0,
          max: 1,
        },
        {
          ids: ["saurus-oldblood", "skink-priest"],
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
          ids: ["saurus-warrior"],
          min: 1,
        },
        {
          ids: ["temple-guard"],
          min: 0,
          max: 1,
        },
      ],
    },
    special: {
      maxPercent: 50,
      units: [
        {
          ids: ["terradon-riders"],
          min: 0,
          max: 1,
          requiresType: "characters",
          requires: ["skink-chief", "skink-priest"],
        },
        {
          ids: ["ripperdactyl-riders"],
          min: 0,
          max: 1,
          requiresType: "characters",
          requires: ["skink-chief", "skink-priest"],
        },
        {
          ids: ["bastiladon"],
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
          ids: ["salamander-packs", "razordon-packs"],
          min: 0,
          max: 1,
          points: 1000,
        },
        {
          ids: ["stegadon", "troglodon"],
          min: 0,
          max: 1,
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
