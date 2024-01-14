import { getAllOptions } from "../../utils/unit";
import { getUnitPoints, getPoints, getAllPoints } from "../../utils/points";
import gameSystems from "../../assets/armies.json";

const getUnitsString = ({
  units,
  isShowList,
  isCompactList,
  intl,
  language,
}) => {
  return units
    .map((unit) => {
      const allOptions = getAllOptions(unit, {
        asString: true,
        noMagic: isShowList,
      });
      let optionsString = "";

      if (allOptions) {
        if (isCompactList) {
          optionsString = `(${allOptions})\n`;
        } else {
          optionsString = `- ${allOptions.split(", ").join("\n- ")}\n`;
        }
      }

      // prettier-ignore
      return `${unit.strength || unit.minimum ? `${unit.strength || unit.minimum} ` : ""
}${unit[`name_${language}`]}${isShowList ? '' : ' [' + getUnitPoints(unit) + ' ' + intl.formatMessage({
  id: "app.points",
}) + ']'}
${optionsString}
`;
    })
    .join("");
};

export const getListAsText = ({
  list,
  isShowList,
  isCompactList,
  intl,
  language,
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
  const armyName = game.armies.find((army) => army.id === list.army)[
    `name_${language}`
  ];
  let listString = "";

  // HEADER
  // prettier-ignore
  if (!isCompactList) {
    listString += `===
${list.name}${isShowList ? '' : ' [' + allPoints + ' ' + intl.formatMessage({
  id: "app.points",
}) + ']'}
${game.name}, ${armyName}
===

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
    listString += isCompactList ? '' : '\n';
    
    listString += `${getUnitsString({
      isCompactList,
      units: list.characters,
      isShowList,
      intl,
      language,
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
    listString += isCompactList ? '' : '\n';
    
    listString += `${getUnitsString({
      isCompactList,
      units: list.lords,
      isShowList,
      intl,
      language,
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
    listString += isCompactList ? '' : '\n';
    
    listString += `${getUnitsString({
      isCompactList,
      units: list.heroes,
      isShowList,
      intl,
      language,
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
    listString += isCompactList ? "" : "\n";
    
    listString += `${getUnitsString({
      isCompactList,
      units: list.core,
      isShowList,
      intl,
      language,
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
    listString += isCompactList ? "" : "\n";
    
    listString += `${getUnitsString({
      isCompactList,
      units: list.special,
      isShowList,
      intl,
      language,
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
    listString += isCompactList ? "" : "\n";
  
    listString += `${getUnitsString({
      isCompactList,
      units: list.rare,
      isShowList,
      intl,
      language,
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
    listString += isCompactList ? "" : "\n";
  
    listString += `${getUnitsString({
      isCompactList,
      units: list.mercenaries,
      isShowList,
      intl,
      language,
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
    listString += isCompactList ? "" : "\n";

    listString += `${getUnitsString({
      isCompactList,
      units: list.allies,
      isShowList,
      intl,
      language,
    })}`;
  }

  listString += `---
${intl.formatMessage({
  id: "export.createdWith",
})} "Old World Builder"

[https://old-world-builder.com]`;

  return listString;
};
