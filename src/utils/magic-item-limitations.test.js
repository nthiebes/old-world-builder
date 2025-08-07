import {
  isMultipleAllowedItem,
  maxAllowedOfItem,
  itemsUsedElsewhere,
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
            {
              "name_en": "Berserker Blade",
              "type": "weapon",
              "id": "general-8"
            },
            {
              "name_en": "Dragon Helm",
              "type": "armor",
              "id": "high-elf-realms-11"
            }
          ],
        }
      ],
    },{
      "name_en": "Mage",
      "id": "mage.qhhrfk",
      "items": [
        {
          "name_en": "Magic Items",
          "selected": [],
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
  test("Warns if an item is used by more than one hero", () => {
    const items = [
      magicItems.general.find(
        (item) => item.name_en === "Berserker Blade"
      )
    ];
    
    // Deep copy of list
    // structuredClone would do this cleaner, but it doesn't seem supported
    // by whatever version of node is running tests here.
    const list = JSON.parse(JSON.stringify(itemsElswhereList));

    //Add a Noble with an item shared with the Prince
    list.characters.push(
      {
        "name_en": "Noble",
        "id": "noble.xglrvqwbe",
        "items": [
          {
            "name_en": "Magic Items",
            "selected": [
              {
                "name_en": "Berserker Blade",
                "type": "weapon",
                "id": "general-8"
              }
            ],
          }
        ],
      }
    );
    expect(itemsUsedElsewhere(items, list, princeID)).toHaveLength(1);
  });
});


