import { categories, getAllOptions } from "../../utils/unit";
import {
  sumUnitPoints,
  sumCategoryPoints,
  sumArmyListPoints,
} from "../../utils/points";
import gameSystems from "../../assets/armies.json";
import { nameMap } from "../magic";

/**
 * Get the army list as a markdown string.
 */
export const armyListAsMarkdown = ({
  list,
  isShowList,
  isCompactList,
  intl,
  language,
  showSpecialRules,
}) => {
  const unitsByCategories = categories
    .filter((category) => list[category]?.length)
    .flatMap((category) => [
      categoryHeader({ list, category, isShowList, intl }),

      ...list[category].map((unit) =>
        unitAsMarkdown({
          unit,
          isCompactList,
          showSpecialRules,
          isShowList,
          intl,
          language,
        })
      ),
    ]);

  return [
    !isCompactList && armyListHeader({ list, isShowList, intl }),
    !isCompactList && armyListDescription({ list, language }),
    ...unitsByCategories,
    "---",
    footer({ intl }),
  ]
    .filter(Boolean)
    .join("\n\n");
};

/**
 * @example
 * ```md
 * # My Empire List [2000 pts]
 * ```
 */
export const armyListHeader = ({ list, isShowList, intl }) => {
  const name = list.name || list.army;
  const points = `[${sumArmyListPoints(list)} ${intl.formatMessage({
    id: "app.points",
  })}]`;

  return ["#", name, !isShowList && points].filter(Boolean).join(" ");
};

/**
 * @example
 * ```md
 * Warhammer: The Old world, Empire of Man
 * ```
 */
export const armyListDescription = ({ list, language }) => {
  const game = gameSystems.find((game) => game.id === list.game);
  const army = game.armies.find((army) => army.id === list.army);

  const armyName = army[`name_${language}`] || army.name_en;
  const armyCompositionName =
    list.army !== list.armyComposition && nameMap[list.armyComposition]
      ? nameMap[list.armyComposition][`name_${language}`] ||
        nameMap[list.armyComposition].name_en
      : "";

  return [game.name, armyName, armyCompositionName].filter(Boolean).join(", ");
};

/**
 * @example
 * ```md
 * ## Core Units [300 pts]
 * ```
 */
export const categoryHeader = ({ list, category, isShowList, intl }) => {
  const name = intl.formatMessage({ id: `editor.${category}` });
  const points = `[${sumCategoryPoints(list, category)} ${intl.formatMessage({
    id: "app.points",
  })}]`;

  return ["##", name, !isShowList && points].filter(Boolean).join(" ");
};

/**
 * @example
 * ```md
 * ### 20 State troops [200 pts]
 * ```
 */
export const unitHeader = ({ unit, language, isShowList, intl }) => {
  const strength = unit.strength || unit.minimum;
  const name = unit[`name_${language}`] || unit.name_en;
  const points = `[${sumUnitPoints(unit)} ${intl.formatMessage({
    id: "app.points",
  })}]`;

  return ["###", strength, name, !isShowList && points]
    .filter(Boolean)
    .join(" ");
};

/**
 * @example
 * ```md
 * 20 State troops [200 pts]
 *
 * - shields
 *
 * **Special Rules:** Special Rule 1, Special Rule 2
 * ```
 */
export const unitAsMarkdown = ({
  unit,
  isShowList,
  isCompactList,
  showSpecialRules,
  intl,
  language,
}) => {
  const allOptions = getAllOptions(unit, {
    asString: true,
    noMagic: isShowList,
  });

  const optionsString = isCompactList
    ? allOptions
    : allOptions
        ?.split(", ")
        .map((o) => `- ${o}`)
        .join("\n");

  const specialRulesString = unit.specialRules
    ? `**${intl.formatMessage({
        id: "unit.specialRules",
      })}:** ${
        unit.specialRules[`name_${language}`] || unit.specialRules.name_en
      }`
    : undefined;

  return [
    unitHeader({ unit, language, isShowList, intl }),
    optionsString,
    showSpecialRules && specialRulesString,
  ]
    .filter(Boolean)
    .join("\n\n");
};

export const footer = ({ intl }) =>
  `${intl.formatMessage({
    id: "export.createdWith",
  })} [Old World Builder](https://old-world-builder.com)`;
