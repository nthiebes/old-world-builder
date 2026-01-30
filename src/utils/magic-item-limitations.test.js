import {
  isMultipleAllowedItem,
  maxAllowedOfItem,
  itemsUsedElsewhere,
  combosUsedElsewhere
} from "./magic-item-limitations";
import magicItems from "../../public/games/the-old-world/magic-items.json";

describe("isMultipleAllowedItem", () => {
  test("Normally, you should not be able to have multiple of the same magic item.", () => {
    const item = magicItems.general.find(
      (item) => item.name_en === "Flying Carpet"
    );

    expect(isMultipleAllowedItem(item)).toBe(false);
  });

  test("You can have more than 1 magic scroll per unit.", () => {
    const item = magicItems.general.find(
      (item) => item.name_en === "Power Scroll*"
    );

    expect(isMultipleAllowedItem(item)).toBe(true);
  });

  test("You can have more than 1 magic potion per unit.", () => {
    const item = magicItems.general.find(
      (item) => item.name_en === "Healing Potion*"
    );

    expect(isMultipleAllowedItem(item)).toBe(true);
  });

  test("Some Dwarfen runes can be taken multiple times", () => {
    const item = magicItems["dwarfen-mountain-holds"].find(
      (item) => item.name_en === "Rune of Might*"
    );
    expect(isMultipleAllowedItem(item)).toBe(true);
  });
});

describe("maxAllowedOfItem", () => {
  test("If you have 100 points remaining, you can take 5 power scrolls.", () => {
    const item = magicItems.general.find(
      (item) => item.name_en === "Power Scroll*"
    ); // 20 points
    const selectedAmount = 0;
    const unitPointsRemaining = 100;
    expect(maxAllowedOfItem(item, selectedAmount, unitPointsRemaining)).toBe(5);
  });

  test("If you have 30 points remaining and already have 2, you can have up to 3 power scrolls.", () => {
    const item = magicItems.general.find(
      (item) => item.name_en === "Power Scroll*"
    ); // 20 points
    const selectedAmount = 2;
    const unitPointsRemaining = 30;

    expect(maxAllowedOfItem(item, selectedAmount, unitPointsRemaining)).toBe(3);
  });

  test("You can never have more than 3 of the same runes, even if enough points", () => {
    const item = magicItems["dwarfen-mountain-holds"].find(
      (item) => item.name_en === "Rune of Might*"
    ); // 20 points
    const selectedAmount = 0;
    const unitPointsRemaining = 100;

    expect(maxAllowedOfItem(item, selectedAmount, unitPointsRemaining)).toBe(3);
  });
});

const princeID = "prince.rbexhgs";
// List with a Prince and a Mage with no overlapping items
const itemsElswhereList = {
  "name": "High Elf Realms",
  "game": "the-old-world",
  "army": "high-elf-realms",
  "characters": [
    {
      "name_en": "Prince",
      "id": princeID,
      "items": [
        {
          "name_en": "Magic Items",
          "selected": [
            magicItems.general.find(
              (item) => item.name_en === "Berserker Blade"
            ),
            magicItems["high-elf-realms"].find(
              (item) => item.name_en === "Dragon Helm"
            )
          ]
        },
        {
          "name_en": "Elven Honours",
          "selected": [
            magicItems["elven-honours"].find(
              (item) => item.name_en === "Sea Guard"
            )
          ]
        }
      ]
    }, {
      "name_en": "Mage",
      "id": "mage.qhhrfk",
      "items": [
        {
          "name_en": "Magic Items",
          "selected": [
            {
              "name_en": "Elven Honours",
              "selected": [
                magicItems["elven-honours"].find(
                  (item) => item.name_en === "Pure of Heart"
                )
              ]
            }
          ]
        }
      ]
    }
  ],
  "core": [],
  "special": [],
  "rare": [],
  "mercenaries": [],
  "allies": [],
  "armyComposition": "high-elf-realms",
}

describe("itemsUsedElsewhere", () => {
  test("No errors if no items are shared", () => {
    const items = itemsElswhereList.characters[0].items[0].selected; // Berserker Blade and Dragon Helm
    // Deep copy of list. structuredClone() would do this cleaner, but it 
    // doesn't seem supported by whatever version of node is running tests here.
    const list = JSON.parse(JSON.stringify(itemsElswhereList));
    expect(itemsUsedElsewhere(items, list, princeID)).toHaveLength(0);
  })

  test("Warns if an item is used by more than one hero", () => {
    const items = itemsElswhereList.characters[0].items[0].selected; // Berserker Blade and Dragon Helm
    const list = JSON.parse(JSON.stringify(itemsElswhereList));

    // Add a Noble with Berserk Blade, which is shared with the Prince
    list.characters.push(
      {
        "name_en": "Noble",
        "id": "noble.xglrvqwbe",
        "items": [
          {
            "name_en": "Magic Items",
            "selected": [
              magicItems.general.find(
                (item) => item.name_en === "Berserker Blade"
              )
            ]
          }
        ]
      }
    );
    
    let elsewhereErrors = itemsUsedElsewhere(items, list, princeID);
    expect(elsewhereErrors).toHaveLength(1);

    // Add a Dragon Helm to the Noble, which is shared with the Prince
    list.characters[2].items[0].selected.push(
      magicItems["high-elf-realms"].find(
        (item) => item.name_en === "Dragon Helm"
      )
    );
    elsewhereErrors = itemsUsedElsewhere(items, list, princeID);
    expect(elsewhereErrors).toHaveLength(2);
  });

  test("Warns if a character's item is used by command models", () => {
    const items = itemsElswhereList.characters[0].items[0].selected; // Berserker Blade and Dragon Helm
    const list = JSON.parse(JSON.stringify(itemsElswhereList));

    // Add a unit of Silver Helms whose champion has a Berserker Blade
    list.core.push(
      {
        "name_en": "Silver Helms",
        "id": "silver-helms.qjbtqm",
        "command": [
          {
            "name_en": "High Helm (champion)",
            "active": true,
            "magic": {
              "selected": [
                magicItems.general.find(
                  (item) => item.name_en === "Berserker Blade"
                )
              ]
            }
          }
        ]
      }
    );
    let elsewhereErrors = itemsUsedElsewhere(items, list, princeID);
    expect(elsewhereErrors).toHaveLength(1);
  });

  test("No error if an item can be used by more than one unit", () => {
    const items = itemsElswhereList.characters[0].items[1].selected; // Elven Honour Sea Guard
    const list = JSON.parse(JSON.stringify(itemsElswhereList));

    // Add a Noble with the Sea Guard Honour
    list.characters.push(
      {
        "name_en": "Noble",
        "id": "noble.xglrvqwbe",
        "items": [
          {
            "name_en": "Elven Honours",
            "selected": [
              magicItems["elven-honours"].find(
                (item) => item.name_en === "Sea Guard"
              )
            ]
          }
        ]
      }
    );
    let elsewhereErrors = itemsUsedElsewhere(items, list, princeID);
    expect(elsewhereErrors).toHaveLength(0);
  });
});

const kingId = "king.grdbtm";
const runesElsewhereList = {
  "name": "Dwarfen Mountain Holds",
  "game": "the-old-world",
  "army": "dwarfen-mountain-holds",
  "characters": [
    {
      "name_en": "King",
      "id": kingId,
      "items": [
        {
          "name_en": "Runes",
          "types": ["weapon-runes", "ranged-weapon-runes", "armor-runes", "talismanic-runes"],
          "selected": [
            magicItems["dwarfen-mountain-holds"].find(
              (item) => item.name_en === "Rune of Striking*"
            ),
            magicItems["dwarfen-mountain-holds"].find(
              (item) => item.name_en === "Rune of Cleaving*"
            )
          ]
        }
      ]
    },
    {
      "name_en": "Runesmith",
      "id": "runesmith.tmsvbwmcec",
      "items": [
        {
          "name_en": "Runes",
          "types": [
            "weapon-runes",
            "armor-runes",
            "talismanic-runes"
          ],
          "selected": [
            magicItems["dwarfen-mountain-holds"].find(
              (item) => item.name_en === "Rune of Speed*"
            )
          ],
          "maxPoints": 75,
          "armyComposition": {
            "royal-clan": {
              "maxPoints": 100
            }
          }
        }
      ]
    }
  ],
  "core": [],
  "special": [],
  "rare": [],
  "mercenaries": [],
  "allies": [],
  "id": "lcqmhc",
  "armyComposition": "dwarfen-mountain-holds"
};

describe("combosUsedElsewhere", () => {
  test("No errors if no rune loadouts are shared", () => {
    // Deep copy of list. structuredClone() would do this cleaner, but it 
    // doesn't seem supported by whatever version of node is running tests here.
    const list = JSON.parse(JSON.stringify(runesElsewhereList));
    const items = list.characters[0].items[0].selected; // Runes of Striking and Cleaving
    expect(combosUsedElsewhere(items, list, kingId)).toHaveLength(0);
  });
  
  test("Warns if a rune loadout is used by more than one hero", () => {
    const list = JSON.parse(JSON.stringify(runesElsewhereList));
    const items = list.characters[0].items[0].selected; // Runes of Striking and Cleaving

    // Add a Thane with Rune of Striking, which is shared with the King, but not a fully shared loadout
    list.characters.push(
      {
        "name_en": "Thane",
        "id": "thane.gwrngoed",
        "items": [
          {
            "name_en": "Magic Items",
            "selected": [
              magicItems["dwarfen-mountain-holds"].find(
                (item) => item.name_en === "Rune of Striking*"
              )
            ]
          }
        ]
      }
    );
    let elsewhereErrors = combosUsedElsewhere(items, list, kingId);
    expect(elsewhereErrors).toHaveLength(0);

    // Add a Rune of Cleaving to the Thane, completing a shared loudout with the King
    list.characters[2].items[0].selected.push(
      magicItems["dwarfen-mountain-holds"].find(
        (item) => item.name_en === "Rune of Cleaving*"
      )
    );
    elsewhereErrors = combosUsedElsewhere(items, list, kingId);
    expect(elsewhereErrors).toHaveLength(1);
    
    // Add a Rune of Speed to the Thane, making the loadout different again
    list.characters[2].items[0].selected.push(
      magicItems["dwarfen-mountain-holds"].find(
        (item) => item.name_en === "Rune of Speed*"
      )
    );
    elsewhereErrors = combosUsedElsewhere(items, list, kingId);
    expect(elsewhereErrors).toHaveLength(0);
  });

  test("Warns if a rune loadout is shared by a unit command model", () => {
    const list = JSON.parse(JSON.stringify(runesElsewhereList));
    const items = list.characters[0].items[0].selected; // Runes of Striking and Cleaving

    // Add Dwarf Warriors champion with Rune of Striking, which is shared with the King, but not a fully shared loadout
    list.core.push(
      {
        "name_en": "Dwarf Warriors",
        "id": "dwarf-warriors.yfnqemhtz",
        "command": [
          {
            "name_en": "Veteran (champion)",
            "magic": {
              "types": [
                "weapon-runes"
              ],
              "selected": [
                magicItems["dwarfen-mountain-holds"].find(
                  (item) => item.name_en === "Rune of Striking*"
                )
              ]
            },
            "id": 0,
            "active": true
          }
        ]
      }
    );
    let elsewhereErrors = combosUsedElsewhere(items, list, kingId);
    expect(elsewhereErrors).toHaveLength(0);

    // Add a Rune of Cleaving to the champion, completing a shared loudout with the King
    list.core[0].command[0].magic.selected.push(
      magicItems["dwarfen-mountain-holds"].find(
        (item) => item.name_en === "Rune of Cleaving*"
      )
    );
    elsewhereErrors = combosUsedElsewhere(items, list, kingId);
    expect(elsewhereErrors).toHaveLength(1);
    
    // Add a Rune of Speed to the champion, making the loadout different again
    list.core[0].command[0].magic.selected.push(
      magicItems["dwarfen-mountain-holds"].find(
        (item) => item.name_en === "Rune of Speed*"
      )
    );
    elsewhereErrors = combosUsedElsewhere(items, list, kingId);
    expect(elsewhereErrors).toHaveLength(0);
  });

  test("Takes stackable amounts into account when comparing rune loadouts", () => {
    const list = JSON.parse(JSON.stringify(runesElsewhereList));
    list.characters[0].items[0].selected[0].amount = 2; // Give King a second Rune of Striking
    const items = list.characters[0].items[0].selected; // Runes of Striking (x2) and Cleaving

    // Add a Thane with Runes of Striking (x1) and Cleaving
    list.characters.push(
      {
        "name_en": "Thane",
        "id": "thane.gwrngoed",
        "items": [
          {
            "name_en": "Magic Items",
            "selected": [
              magicItems["dwarfen-mountain-holds"].find(
                (item) => item.name_en === "Rune of Striking*"
              ),
              magicItems["dwarfen-mountain-holds"].find(
                (item) => item.name_en === "Rune of Cleaving*"
              )
            ]
          }
        ]
      }
    );
    let elsewhereErrors = combosUsedElsewhere(items, list, kingId);
    expect(elsewhereErrors).toHaveLength(0);

    // Give a second Rune of Striking, matching the King
    list.characters[2].items[0].selected[0].amount = 2;
    elsewhereErrors = combosUsedElsewhere(items, list, kingId);
    expect(elsewhereErrors).toHaveLength(1);

    // Change the Thane to 1 Rune of Striking and 2 of Cleaving
    list.characters[2].items[0].selected[0].amount = 1;
    list.characters[2].items[0].selected[1].amount = 2;
    elsewhereErrors = combosUsedElsewhere(items, list, kingId);
    expect(elsewhereErrors).toHaveLength(0);
  });
});
