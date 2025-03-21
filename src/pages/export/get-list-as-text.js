import { getAllOptions } from "../../utils/unit";
import { getUnitPoints, getPoints, getAllPoints } from "../../utils/points";
import { getStats, getUnitName } from "../../utils/unit";
import gameSystems from "../../assets/armies.json";
import { nameMap } from "../magic";

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
}) => {
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
      if (showCustomNotes && unit.customNote) {
        optionsString += `${isMarkdownList ? " - __" : ""}${intl.formatMessage({
          id: "unit.customNote",
        })}${isMarkdownList ? "__ *" : " "}${
          isMarkdownList ? unit.customNote.replace(/\n/g, "") : unit.customNote
        }${isMarkdownList ? "*" : ""}\n`;
      }
      if (showStats) {
        const stats = getStats(unit);

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
  let listString = "";

  // HEADER
  // prettier-ignore
  if (!isCompactList && !isMarkdownList) {
    listString += `===
${list.name}${isShowList ? '' : ' [' + allPoints + ' ' + intl.formatMessage({
  id: "app.points",
}) + ']'}
${game.name}, ${armyName}${armyCompositionString}
===

`;
  }
  // prettier-ignore
  if (!isCompactList && isMarkdownList) {
    listString += `## ${list.name}${isShowList ? '' : ' [' + allPoints + ' ' + intl.formatMessage({
  id: "app.points",
}) + ']'}
${game.name}, ${armyName}${armyCompositionString}

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
