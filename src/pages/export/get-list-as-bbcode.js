import { getAllOptions } from "../../utils/unit";
import { getUnitPoints, getPoints, getAllPoints } from "../../utils/points";
import gameSystems from "../../assets/armies.json";

const getUnitsString = ({ units, isShowList, intl, language }) => {
  return units
    .map((unit) => {
      const allOptions = getAllOptions(unit, {
        asString: true,
        noMagic: isShowList,
      });

      if (isShowList) {
        // prettier-ignore
        return `${unit.strength || unit.minimum ? `${unit.strength || unit.minimum} ` : ""
  }${unit[`name_${language}`]}
${
  allOptions ? `[list][*] ${allOptions.split(", ").join("\n[*] ")}[/list]\n` : ""
}
`;
      }

      // prettier-ignore
      return `${unit.strength || unit.minimum ? `${unit.strength || unit.minimum} ` : ""}${
  unit[`name_${language}`]
} [${getUnitPoints(unit)} ${intl.formatMessage({
  id: "app.points",
})}]
[list]
${allOptions ? `[*] ${allOptions.split(", ").join("\n[*] ")}\n[/list]` : ""}
`;
    })
    .join("");
};

export const getListAsBBCode = ({
  list,
  isShowList,
  isForumList,
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

  if (isShowList) {
    if (list.game === "the-old-world") {
      // prettier-ignore
      return `===
${list.name}
${game.name}, ${armyName}
===

++ ${intl.formatMessage({
  id: "editor.characters",
})} ++

${getUnitsString({ isForumList, units: list.characters, isShowList, intl, language })}
++ ${intl.formatMessage({
  id: "editor.core",
})} ++

${getUnitsString({ isForumList, units: list.core, isShowList, intl, language })}
++ ${intl.formatMessage({
  id: "editor.special",
})} ++

${getUnitsString({ isForumList, units: list.special, isShowList, intl, language })}
++ ${intl.formatMessage({
  id: "editor.rare",
})} ++

${getUnitsString({ isForumList, units: list.rare, isShowList, intl, language })}
++ ${intl.formatMessage({
  id: "editor.mercenaries",
})} ++

${getUnitsString({ isForumList, units: list.mercenaries, isShowList, intl, language })}
++ ${intl.formatMessage({
  id: "editor.allies",
})} ++

${getUnitsString({ isForumList, units: list.allies, isShowList, intl, language })}

---
${intl.formatMessage({
id: "export.createdWith",
})} "Old World Builder"

[https://old-world-builder.com]`;
    } else {
      // Warhammer fantasy
      // prettier-ignore
      return `===
${list.name}
${game.name}, ${armyName}
===

++ ${intl.formatMessage({
  id: "editor.lords",
})} ++

${getUnitsString({ isForumList, units: list.lords, isShowList, intl, language })}
++ ${intl.formatMessage({
  id: "editor.heroes",
})} ++

${getUnitsString({ isForumList, units: list.heroes, isShowList, intl, language })}
++ ${intl.formatMessage({
  id: "editor.core",
})} ++

${getUnitsString({ isForumList, units: list.core, isShowList, intl, language })}
++ ${intl.formatMessage({
  id: "editor.special",
})} ++

${getUnitsString({ isForumList, units: list.special, isShowList, intl, language })}
++ ${intl.formatMessage({
  id: "editor.rare",
})} ++

${getUnitsString({ isForumList, units: list.rare, isShowList, intl, language })}

---
${intl.formatMessage({
  id: "export.createdWith",
})} "Old World Builder"

[https://old-world-builder.com]`;
    }
  } else {
    if (list.game === "the-old-world") {
      // prettier-ignore
      return `[b]${list.name} [${allPoints} ${intl.formatMessage({
  id: "app.points",
})}]
${game.name}, ${armyName}[/b]

[b]${intl.formatMessage({
  id: "editor.characters",
})} [${charactersPoints} ${intl.formatMessage({
  id: "app.points",
})}][/b]

${getUnitsString({ isForumList, units: list.characters, intl, language })}
[b]${intl.formatMessage({
  id: "editor.core",
})} [${corePoints} ${intl.formatMessage({
  id: "app.points",
})}][/b]

${getUnitsString({ isForumList, units: list.core, intl, language })}
[b]${intl.formatMessage({
  id: "editor.special",
})} [${specialPoints} ${intl.formatMessage({
  id: "app.points",
})}][/b]

${getUnitsString({ isForumList, units: list.special, intl, language })}
[b]${intl.formatMessage({
  id: "editor.rare",
})} [${rarePoints} ${intl.formatMessage({
  id: "app.points",
})}][/b]

${getUnitsString({ isForumList, units: list.rare, intl, language })}
[b]${intl.formatMessage({
  id: "editor.mercenaries",
})} [${mercenariesPoints} ${intl.formatMessage({
  id: "app.points",
})}][/b]

${getUnitsString({ isForumList, units: list.mercenaries, intl, language })}
[b]${intl.formatMessage({
  id: "editor.allies",
})} [${alliesPoints} ${intl.formatMessage({
  id: "app.points",
})}][/b]

${getUnitsString({ isForumList, units: list.allies, intl, language })}

---
${intl.formatMessage({
  id: "export.createdWith",
})} "Old World Builder"

[https://old-world-builder.com]`;
    } else {
      // Warhammer fantasy
      // prettier-ignore
      return `===
${list.name} [${allPoints} ${intl.formatMessage({
  id: "app.points",
})}]
${game.name}, ${armyName}
===

++ ${intl.formatMessage({
  id: "editor.lords",
})} [${lordsPoints} ${intl.formatMessage({
  id: "app.points",
})}] ++

${getUnitsString({ isForumList, units: list.lords, intl, language })}
++ ${intl.formatMessage({
  id: "editor.heroes",
})} [${heroesPoints} ${intl.formatMessage({
  id: "app.points",
})}] ++

${getUnitsString({ isForumList, units: list.heroes, intl, language })}
++ ${intl.formatMessage({
  id: "editor.core",
})} [${corePoints} ${intl.formatMessage({
  id: "app.points",
})}] ++

${getUnitsString({ isForumList, units: list.core, intl, language })}
++ ${intl.formatMessage({
  id: "editor.special",
})} [${specialPoints} ${intl.formatMessage({
  id: "app.points",
})}] ++

${getUnitsString({ isForumList, units: list.special, intl, language })}
++ ${intl.formatMessage({
  id: "editor.rare",
})} [${rarePoints} ${intl.formatMessage({
  id: "app.points",
})}] ++

${getUnitsString({ isForumList, units: list.rare, intl, language })}

---
${intl.formatMessage({
  id: "export.createdWith",
})} "Old World Builder"

[https://old-world-builder.com]`;
    }
  }
};
