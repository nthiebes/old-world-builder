import { getAllOptions } from "../../utils/unit";
import { getUnitPoints, getPoints, getAllPoints } from "../../utils/points";
import { getStats, getUnitName } from "../../utils/unit";
import { getGameSystems } from "../../utils/game-systems";
import { nameMap } from "../magic";

// Helper function to filter options for simple list format
const getFilteredOptions = (unit, intl, params) => {
  const allOptionsString = getAllOptions(unit, params);

  if (!allOptionsString) return "";

  // Items to exclude
  let itemsToExclude = ["Hand weapon", "Hand weapons"];

  if (unit.equipment) {
    if (unit.equipment.length === 1 && unit.equipment[0].active) {
      itemsToExclude = [
        ...itemsToExclude,
        ...unit.equipment[0].name_en.split(", "),
      ];
    } else {
      const activeEquipment = unit.equipment.find((eq) => eq.active);
      if (activeEquipment && activeEquipment.points === 0) {
        itemsToExclude = [
          ...itemsToExclude,
          ...activeEquipment.name_en.split(", "),
        ];
      }
    }
  }

  if (unit.armor) {
    if (unit.armor.length === 1 && unit.armor[0].active) {
      itemsToExclude = [
        ...itemsToExclude,
        ...unit.armor[0].name_en.split(", "),
      ];
    } else {
      const activeArmor = unit.armor.find((ar) => ar.active);
      if (activeArmor && activeArmor.points === 0) {
        itemsToExclude = [
          ...itemsToExclude,
          ...activeArmor.name_en.split(", "),
        ];
      }
    }
  }

  if (unit.mounts) {
    if (unit.mounts.length === 1 && unit.mounts[0].active) {
      itemsToExclude = [
        ...itemsToExclude,
        ...unit.mounts[0].name_en.split(", "),
      ];
    } else {
      const activeMount = unit.mounts.find((m) => m.active);
      if (activeMount && activeMount.points === 0) {
        itemsToExclude = [
          ...itemsToExclude,
          ...activeMount.name_en.split(", "),
        ];
      }
    }
  }

  // Split into array of individual options
  const optionsArray = allOptionsString.split(", ");

  let hasFullCommand = false;

  // If there are 3 or more command options and all are active, replace with "Full Command"
  if (
    unit.command &&
    unit.command.length >= 3 &&
    unit.command.every((cmd) => cmd.active)
  ) {
    hasFullCommand = true;

    unit.command.forEach((cmd) => {
      itemsToExclude.push(cmd.name_en);
    });
  }

  const filteredOptions = optionsArray.filter((option) => {
    return !itemsToExclude.includes(option);
  });

  if (hasFullCommand) {
    filteredOptions.push(
      intl.formatMessage({
        id: "unit.fullCommand",
      })
    );
  }

  return filteredOptions.join(", ");
};

const getUnitsString = ({
  units,
  isShowList,
  isCompactList,
  showSpecialRules,
  showPageNumbers,
  isMarkdownList,
  intl,
  language,
  showStats,
  showCustomNotes,
  armyComposition,
  isSimpleList,
}) => {
  if (isSimpleList) {
    return units
      .map((unit) => {
        const unitPoints = getUnitPoints(unit, { armyComposition });
        const unitName = getUnitName({ unit, language });

        const filteredOptions = getFilteredOptions(unit, intl, {
          noMagic: isShowList,
          pageNumbers: false,
          armyComposition,
        });

        // Format: "name, important options - points"
        let unitString = `${
          unit.strength || unit.minimum
            ? `${unit.strength || unit.minimum} `
            : ""
        }${unitName}${filteredOptions ? `, ${filteredOptions}` : ""}${
          isShowList ? "" : ` - ${unitPoints}`
        }`;

        // Clean up any double commas that might have been created
        unitString = unitString.replace(", ,", ",");
        unitString = unitString.replace(/,\s*$/, "");

        return unitString;
      })
      .join("\n");
  }

  return units
    .map((unit) => {
      const allOptions = getAllOptions(unit, {
        noMagic: isShowList,
        pageNumbers: showPageNumbers,
        armyComposition,
      });
      let optionsString = "";

      if (allOptions) {
        if (isCompactList || isMarkdownList) {
          optionsString = `(${allOptions})\n`;
        } else {
          optionsString = `- ${allOptions.split(", ").join("\n- ")}\n`;
        }
      }
      if (showSpecialRules && unit.specialRules) {
        optionsString += `${isMarkdownList ? " - __" : ""}${intl.formatMessage({
          id: "unit.specialRules",
        })}:${isMarkdownList ? "__ *" : " "}${(
          unit.specialRules[`name_${language}`] || unit.specialRules.name_en
        ).replace(/ *\{[^)]*\}/g, "")}${isMarkdownList ? "*" : ""}\n`;
      }
      if (showSpecialRules && unit.detachments) {
        unit.detachments.forEach((detachment) => {
          const specialRulesDetachment =
            detachment.armyComposition?.[armyComposition]?.specialRules ||
            detachment.specialRules;

          if (specialRulesDetachment?.name_en) {
            optionsString += `${
              isMarkdownList ? " - __" : ""
            }${intl.formatMessage({
              id: "unit.specialRules",
            })} (${detachment[`name_${language}`] || detachment.name_en}):${
              isMarkdownList ? "__ *" : " "
            }${(
              specialRulesDetachment[`name_${language}`] ||
              specialRulesDetachment.name_en
            ).replace(/ *\{[^)]*\}/g, "")}${isMarkdownList ? "*" : ""}\n`;
          }
        });
      }
      if (showCustomNotes && unit.customNote) {
        optionsString += `${isMarkdownList ? " - __" : ""}${intl.formatMessage({
          id: "unit.customNote",
        })}${isMarkdownList ? "__ *" : " "}${
          isMarkdownList ? unit.customNote.replace(/\n/g, "") : unit.customNote
        }${isMarkdownList ? "*" : ""}\n`;
      }
      if (showStats) {
        const stats = getStats(unit, armyComposition);

        if (!isCompactList && !isMarkdownList) {
          optionsString += "\n";
        }

        if (stats?.length > 0) {
          stats.forEach((unitStats, index) => {
            // prettier-ignore
            optionsString += `${isMarkdownList ? " - " : ""}[${unitStats.Name.replace(/ /g, '\xa0')}]\xa0${intl.formatMessage({id: "unit.m"})}(${unitStats.M})\xa0${intl.formatMessage({id: "unit.ws"})}(${unitStats.WS})\xa0${intl.formatMessage({id: "unit.bs"})}(${unitStats.BS})\xa0${intl.formatMessage({id: "unit.s"})}(${unitStats.S})\xa0${intl.formatMessage({id: "unit.t"})}(${unitStats.T})\xa0${intl.formatMessage({id: "unit.w"})}(${unitStats.W})\xa0${intl.formatMessage({id: "unit.i"})}(${unitStats.I})\xa0${intl.formatMessage({id: "unit.a"})}(${unitStats.A})\xa0${intl.formatMessage({id: "unit.ld"})}(${unitStats.Ld})
`;
          });
        } else {
          // prettier-ignore
          optionsString += `${isMarkdownList ? " - " : ""}${intl.formatMessage({id: "unit.m"})}(${'\xa0'})\xa0${intl.formatMessage({id: "unit.ws"})}(${'\xa0'})\xa0${intl.formatMessage({id: "unit.bs"})}(${'\xa0'})\xa0${intl.formatMessage({id: "unit.s"})}(${'\xa0'})\xa0${intl.formatMessage({id: "unit.t"})}(${'\xa0'})\xa0${intl.formatMessage({id: "unit.w"})}(${'\xa0'})\xa0${intl.formatMessage({id: "unit.i"})}(${'\xa0'})\xa0${intl.formatMessage({id: "unit.a"})}(${'\xa0'})\xa0${intl.formatMessage({id: "unit.ld"})}(${'\xa0'})
`;
        }
      }

      // prettier-ignore
      return `${isMarkdownList ? `- ` : ''}${unit.strength || unit.minimum ? `${unit.strength || unit.minimum} ` : ""
}${getUnitName({ unit, language })}${isShowList ? '' : ' [' + getUnitPoints(unit, {armyComposition}) + ' ' + intl.formatMessage({
  id: "app.points",
}) + '] '}
${isMarkdownList && optionsString ? ' -# ' : ''}${optionsString}${isMarkdownList ? '' : '\n'}`;
    })
    .join("");
};

export const getListAsText = ({
  list,
  isShowList,
  isCompactList,
  intl,
  language,
  showSpecialRules,
  showPageNumbers,
  showStats,
  isMarkdownList,
  showCustomNotes,
  isSimpleList,
}) => {
  const allPoints = getAllPoints(list);
  const lordsPoints = getPoints({ list, type: "lords" });
  const heroesPoints = getPoints({ list, type: "heroes" });
  const charactersPoints = getPoints({ list, type: "characters" });
  const corePoints = getPoints({ list, type: "core" });
  const specialPoints = getPoints({ list, type: "special" });
  const rarePoints = getPoints({ list, type: "rare" });
  const mercenariesPoints = getPoints({ list, type: "mercenaries" });
  const alliesPoints = getPoints({ list, type: "allies" });
  const gameSystems = getGameSystems();
  const game = gameSystems.find((game) => game.id === list.game);
  const army = game.armies.find((army) => army.id === list.army);
  const armyName = army[`name_${language}`] || army.name_en;
  const armyComposition = list.armyComposition || list.army;
  const armyCompositionName =
    list.army !== list.armyComposition && nameMap[list.armyComposition]
      ? nameMap[list.armyComposition][`name_${language}`] ||
        nameMap[list.armyComposition].name_en
      : "";
  const armyCompositionString = armyCompositionName
    ? `, ${armyCompositionName}`
    : "";
  const compositionRuleString = intl.formatMessage({
    id: `misc.${list.compositionRule || "open-war"}`,
  });
  let listString = "";

  if (isSimpleList) {
    listString += `${list.name}${
      isShowList
        ? ""
        : ` [${allPoints} ${intl.formatMessage({ id: "app.points" })}]`
    }\n`;
    listString += `${game.name}, ${armyName}${armyCompositionString}, ${compositionRuleString}\n\n`;

    const allUnits = [
      ...(list.characters || []),
      ...(list.lords || []),
      ...(list.heroes || []),
      ...(list.core || []),
      ...(list.special || []),
      ...(list.rare || []),
      ...(list.mercenaries || []),
      ...(list.allies || []),
    ];

    listString += getUnitsString({
      units: allUnits,
      isShowList,
      isCompactList,
      showSpecialRules: false,
      showPageNumbers: false,
      isMarkdownList: false,
      showCustomNotes: false,
      intl,
      language,
      showStats: false,
      armyComposition,
      isSimpleList: true,
    });

    listString += `\n\n---\n${intl.formatMessage({
      id: "export.createdWith",
    })} "Old World Builder"\n\n[https://old-world-builder.com]`;

    return listString;
  }

  // HEADER
  // prettier-ignore
  if (!isCompactList && !isMarkdownList) {
    listString += `===
${list.name}${isShowList ? '' : ' [' + allPoints + ' ' + intl.formatMessage({
  id: "app.points",
}) + ']'}
${game.name}, ${armyName}${armyCompositionString}, ${compositionRuleString}
===

`;
  }
  // prettier-ignore
  if (!isCompactList && isMarkdownList) {
    listString += `## ${list.name}${isShowList ? '' : ' [' + allPoints + ' ' + intl.formatMessage({
  id: "app.points",
}) + ']'}
${game.name}, ${armyName}${armyCompositionString}, ${compositionRuleString}

`;
  }

  // CHARACTERS
  // prettier-ignore
  if (list.characters?.length) {
    listString += `++ ${intl.formatMessage({
  id: "editor.characters",
})}${isShowList ? '' : ' [' + charactersPoints + ' ' + intl.formatMessage({
  id: "app.points",
}) + ']'} ++
`
    listString += isCompactList || isMarkdownList ? '' : '\n';
    
    listString += `${getUnitsString({
      isCompactList,
      showSpecialRules,
      showPageNumbers,
      isMarkdownList,
      showCustomNotes,
      units: list.characters,
      isShowList,
      intl,
      language,showStats,
      armyComposition
    })}`;
  }

  // LORDS
  // prettier-ignore
  if (list.lords?.length) {
    listString += `++ ${intl.formatMessage({
  id: "editor.lords",
})}${isShowList ? '' : ' [' + lordsPoints + ' ' + intl.formatMessage({
  id: "app.points",
}) + ']'} ++
`
    listString += isCompactList || isMarkdownList ? '' : '\n';
    
    listString += `${getUnitsString({
      isCompactList,
      showSpecialRules,
      showPageNumbers,
      isMarkdownList,
      showCustomNotes,
      units: list.lords,
      isShowList,
      intl,
      language,showStats,
      armyComposition
    })}`;
  }

  // HEROES
  // prettier-ignore
  if (list.heroes?.length) {
      listString += `++ ${intl.formatMessage({
  id: "editor.heroes",
})}${isShowList ? '' : ' [' + heroesPoints + ' ' + intl.formatMessage({
  id: "app.points",
}) + ']'} ++
`
    listString += isCompactList || isMarkdownList ? '' : '\n';
    
    listString += `${getUnitsString({
      isCompactList,
      showSpecialRules,
      showPageNumbers,
      isMarkdownList,
      showCustomNotes,
      units: list.heroes,
      isShowList,
      intl,
      language,
      armyComposition
    })}`;
  }

  // CORE
  // prettier-ignore
  if (list.core.length) {
    listString += `++ ${intl.formatMessage({
  id: "editor.core",
})}${isShowList ? '' : ' [' + corePoints + ' ' + intl.formatMessage({
  id: "app.points",
}) + ']'} ++
`
    listString += isCompactList || isMarkdownList ? "" : "\n";
    
    listString += `${getUnitsString({
      isCompactList,
      showSpecialRules,
      showPageNumbers,
      isMarkdownList,
      showCustomNotes,
      units: list.core,
      isShowList,
      intl,
      language,
      showStats,
      armyComposition
    })}`;
  }

  // SPECIAL
  // prettier-ignore
  if (list.special.length) {
    listString += `++ ${intl.formatMessage({
  id: "editor.special",
})}${isShowList ? '' : ' [' + specialPoints + ' ' + intl.formatMessage({
  id: "app.points",
}) + ']'} ++
`
    listString += isCompactList || isMarkdownList ? "" : "\n";
    
    listString += `${getUnitsString({
      isCompactList,
      showSpecialRules,
      showPageNumbers,
      isMarkdownList,
      showCustomNotes,
      units: list.special,
      isShowList,
      intl,
      language,
      showStats,
      armyComposition
    })}`;
  }

  // RARE
  // prettier-ignore
  if (list.rare.length) {
    listString += `++ ${intl.formatMessage({
  id: "editor.rare",
})}${isShowList ? '' : ' [' + rarePoints + ' ' + intl.formatMessage({
  id: "app.points",
}) + ']'} ++
`
    listString += isCompactList || isMarkdownList ? "" : "\n";
  
    listString += `${getUnitsString({
      isCompactList,
      showSpecialRules,
      showPageNumbers,
      isMarkdownList,
      showCustomNotes,
      units: list.rare,
      isShowList,
      intl,
      language,
      showStats,
      armyComposition
    })}`;
  }

  // MERCENARIES
  // prettier-ignore
  if (list.mercenaries?.length) {
    listString += `++ ${intl.formatMessage({
  id: "editor.mercenaries",
})}${isShowList ? '' : ' [' + mercenariesPoints + ' ' + intl.formatMessage({
  id: "app.points",
}) + ']'} ++
`
    listString += isCompactList || isMarkdownList ? "" : "\n";
  
    listString += `${getUnitsString({
      isCompactList,
      showSpecialRules,
      showPageNumbers,
      isMarkdownList,
      showCustomNotes,
      units: list.mercenaries,
      isShowList,
      intl,
      language,
      showStats,
      armyComposition
    })}`;
  }

  // ALLIES
  // prettier-ignore
  if (list.allies?.length) {
  listString += `++ ${intl.formatMessage({
  id: "editor.allies",
})}${isShowList ? '' : ' [' + alliesPoints + ' ' + intl.formatMessage({
  id: "app.points",
}) + ']'} ++
`
    listString += isCompactList || isMarkdownList ? "" : "\n";

    listString += `${getUnitsString({
      isCompactList,
      showSpecialRules,
      showPageNumbers,
      isMarkdownList,
      showCustomNotes,
      units: list.allies,
      isShowList,
      intl,
      language,
      showStats,
      armyComposition
    })}`;
  }

  if (isMarkdownList) {
    listString += `
*${intl.formatMessage({
      id: "export.createdWith",
    })} "Old World Builder"* - https://old-world-builder.com`;
  } else {
    listString += `---
${intl.formatMessage({
  id: "export.createdWith",
})} "Old World Builder"

[https://old-world-builder.com]`;
  }

  if (isMarkdownList) {
    listString = listString.replace(/ \+\+/g, "").replace(/\+\+/g, "###");
  }

  return listString;
};
