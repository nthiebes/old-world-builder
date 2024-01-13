import { useEffect, Fragment, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { FormattedMessage, useIntl } from "react-intl";
import { Helmet } from "react-helmet-async";

import { Header, Main } from "../../components/page";
import { Button } from "../../components/button";
import { Expandable } from "../../components/expandable";
import { getAllOptions } from "../../utils/unit";
import { getUnitPoints, getPoints, getAllPoints } from "../../utils/points";
import { useLanguage } from "../../utils/useLanguage";
import gameSystems from "../../assets/armies.json";

import "./Export.css";

const getUnitsString = ({ units, isShowList, intl, language }) => {
  return units
    .map((unit) => {
      const allOptions = getAllOptions(unit, {
        asString: true,
        noMagic: isShowList,
      });

      if (isShowList) {
        return `${
          unit.strength || unit.minimum
            ? `${unit.strength || unit.minimum} `
            : ""
        }${unit[`name_${language}`]}
${allOptions ? `- ${allOptions.split(", ").join("\n- ")}\n` : ""}
`;
      }

      return `${
        unit.strength || unit.minimum ? `${unit.strength || unit.minimum} ` : ""
      }${unit[`name_${language}`]} [${getUnitPoints(unit)} ${intl.formatMessage(
        {
          id: "app.points",
        }
      )}]
${allOptions ? `- ${allOptions.split(", ").join("\n- ")}\n` : ""}
`;
    })
    .join("");
};

const getListAsText = ({ list, isShowList, intl, language }) => {
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

${getUnitsString({ units: list.characters, isShowList, intl, language })}
++ ${intl.formatMessage({
  id: "editor.core",
})} ++

${getUnitsString({ units: list.core, isShowList, intl, language })}
++ ${intl.formatMessage({
  id: "editor.special",
})} ++

${getUnitsString({ units: list.special, isShowList, intl, language })}
++ ${intl.formatMessage({
  id: "editor.rare",
})} ++

${getUnitsString({ units: list.rare, isShowList, intl, language })}
++ ${intl.formatMessage({
  id: "editor.mercenaries",
})} ++

${getUnitsString({ units: list.mercenaries, isShowList, intl, language })}
++ ${intl.formatMessage({
  id: "editor.allies",
})} ++

${getUnitsString({ units: list.allies, isShowList, intl, language })}

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

${getUnitsString({ units: list.lords, isShowList, intl, language })}
++ ${intl.formatMessage({
  id: "editor.heroes",
})} ++

${getUnitsString({ units: list.heroes, isShowList, intl, language })}
++ ${intl.formatMessage({
  id: "editor.core",
})} ++

${getUnitsString({ units: list.core, isShowList, intl, language })}
++ ${intl.formatMessage({
  id: "editor.special",
})} ++

${getUnitsString({ units: list.special, isShowList, intl, language })}
++ ${intl.formatMessage({
  id: "editor.rare",
})} ++

${getUnitsString({ units: list.rare, isShowList, intl, language })}

---
${intl.formatMessage({
  id: "export.createdWith",
})} "Old World Builder"

[https://old-world-builder.com]`;
    }
  } else {
    if (list.game === "the-old-world") {
      // prettier-ignore
      return `===
${list.name} [${allPoints} ${intl.formatMessage({
  id: "app.points",
})}]
${game.name}, ${armyName}
===

++ ${intl.formatMessage({
  id: "editor.characters",
})} [${charactersPoints} ${intl.formatMessage({
  id: "app.points",
})}] ++

${getUnitsString({ units: list.characters, intl, language })}
++ ${intl.formatMessage({
  id: "editor.core",
})} [${corePoints} ${intl.formatMessage({
  id: "app.points",
})}] ++

${getUnitsString({ units: list.core, intl, language })}
++ ${intl.formatMessage({
  id: "editor.special",
})} [${specialPoints} ${intl.formatMessage({
  id: "app.points",
})}] ++

${getUnitsString({ units: list.special, intl, language })}
++ ${intl.formatMessage({
  id: "editor.rare",
})} [${rarePoints} ${intl.formatMessage({
  id: "app.points",
})}] ++

${getUnitsString({ units: list.rare, intl, language })}
++ ${intl.formatMessage({
  id: "editor.mercenaries",
})} [${mercenariesPoints} ${intl.formatMessage({
  id: "app.points",
})}] ++

${getUnitsString({ units: list.mercenaries, intl, language })}
++ ${intl.formatMessage({
  id: "editor.allies",
})} [${alliesPoints} ${intl.formatMessage({
  id: "app.points",
})}] ++

${getUnitsString({ units: list.allies, intl, language })}

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

${getUnitsString({ units: list.lords, intl, language })}
++ ${intl.formatMessage({
  id: "editor.heroes",
})} [${heroesPoints} ${intl.formatMessage({
  id: "app.points",
})}] ++

${getUnitsString({ units: list.heroes, intl, language })}
++ ${intl.formatMessage({
  id: "editor.core",
})} [${corePoints} ${intl.formatMessage({
  id: "app.points",
})}] ++

${getUnitsString({ units: list.core, intl, language })}
++ ${intl.formatMessage({
  id: "editor.special",
})} [${specialPoints} ${intl.formatMessage({
  id: "app.points",
})}] ++

${getUnitsString({ units: list.special, intl, language })}
++ ${intl.formatMessage({
  id: "editor.rare",
})} [${rarePoints} ${intl.formatMessage({
  id: "app.points",
})}] ++

${getUnitsString({ units: list.rare, intl, language })}

---
${intl.formatMessage({
  id: "export.createdWith",
})} "Old World Builder"

[https://old-world-builder.com]`;
    }
  }
};

const getFile = ({ list, listText, asText }) => {
  const file = URL.createObjectURL(
    asText
      ? new Blob([listText], {
          type: "text/plain",
        })
      : new Blob([JSON.stringify(list)], {
          type: "application/json",
        })
  );
  const fileName = `${list?.name
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/,/g, "")}.${asText ? "txt" : "json"}`;

  return {
    file,
    fileName,
  };
};

export const Export = ({ isMobile }) => {
  const MainComponent = isMobile ? Main : Fragment;
  const intl = useIntl();
  const location = useLocation();
  const { language } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [shareError, setShareError] = useState(false);
  const [isShowList, setIsShowList] = useState(false);
  const { listId } = useParams();
  const list = useSelector((state) =>
    state.lists.find(({ id }) => listId === id)
  );
  const listText = list
    ? getListAsText({ list, isShowList, intl, language })
    : "";
  const copyText = () => {
    navigator.clipboard &&
      navigator.clipboard.writeText(listText).then(
        () => {
          setCopied(true);
        },
        () => {
          setCopyError(true);
        }
      );
  };
  const { file, fileName } = getFile({ list });
  const { file: textFile, fileName: textFileName } = getFile({
    list,
    listText,
    asText: true,
  });
  const share = async ({ asText }) => {
    const shareData = {};

    if (asText) {
      shareData.text = listText;
      setShareError(false);
    } else {
      shareData.title = list.name;
      shareData.files = file;
      shareData.text = list.description;
    }

    if (!navigator.canShare) {
      setShareError(true);
      return;
    }

    try {
      await navigator.share(shareData);
    } catch (error) {
      console.log(error);
      setShareError(true);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (!list) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>{`Old World Builder | ${list?.name}`}</title>
      </Helmet>

      {isMobile && (
        <Header
          to={`/editor/${listId}`}
          headline={intl.formatMessage({
            id: "export.title",
          })}
        />
      )}

      <MainComponent>
        {!isMobile && (
          <Header
            isSection
            to={`/editor/${listId}`}
            headline={intl.formatMessage({
              id: "export.title",
            })}
          />
        )}

        <h2 className="export__stitle">
          <FormattedMessage id="export.copyTitle" />
        </h2>
        <div className="checkbox export__visible-checkbox">
          <input
            type="checkbox"
            id="show"
            onChange={() => setIsShowList(!isShowList)}
            checked={isShowList}
            className="checkbox__input"
          />
          <label htmlFor="show" className="checkbox__label">
            <FormattedMessage id="export.visibleList" />
          </label>
        </div>
        <p className="export__description">
          <i>
            (<FormattedMessage id="export.visibleListDescription" />)
          </i>
        </p>
        <div className="checkbox export__visible-checkbox">
          <input
            type="checkbox"
            id="show"
            onChange={() => setIsShowList(!isShowList)}
            checked={isShowList}
            className="checkbox__input"
          />
          <label htmlFor="show" className="checkbox__label">
            <FormattedMessage id="export.forumText" />
          </label>
        </div>
        <p className="export__description">
          <i>
            (<FormattedMessage id="export.forumTextDescription" />)
          </i>
        </p>
        <Button icon="share" onClick={() => share({ asText: true })} spaceTop>
          <FormattedMessage id="export.shareText" />
        </Button>
        <p>
          <i>
            <FormattedMessage id="export.shareDescription" />
          </i>
        </p>
        <Button
          icon={copied ? "check" : "copy"}
          onClick={copyText}
          spaceTop
          spaceBottom
        >
          {copied
            ? intl.formatMessage({
                id: "export.copied",
              })
            : intl.formatMessage({
                id: "export.copy",
              })}
        </Button>
        {copyError && (
          <p className="export__error">
            <FormattedMessage id="export.error" />
          </p>
        )}
        <Button
          icon="download"
          href={textFile}
          download={textFileName}
          spaceBottom
        >
          <FormattedMessage id="export.downloadAsText" />
        </Button>
        <Expandable headline={<FormattedMessage id="export.preview" />}>
          <textarea className="export__text" value={listText} readOnly />
        </Expandable>

        <h2 className="export__subtitle">
          <FormattedMessage id="export.owbTitle" />
        </h2>
        <p>
          <i>
            <FormattedMessage id="export.dowloadInfo" />
          </i>
        </p>
        <Button
          icon="download"
          href={file}
          download={fileName}
          spaceBottom
          spaceTop
        >
          <FormattedMessage id="export.download" />
        </Button>
        <Button icon="share" onClick={share} spaceBottom>
          <FormattedMessage id="export.shareOwb" />
        </Button>
        <Button icon={copied ? "check" : "copy"} onClick={copyText}>
          {copied
            ? intl.formatMessage({
                id: "export.copied",
              })
            : intl.formatMessage({
                id: "export.copyOwb",
              })}
        </Button>
      </MainComponent>
    </>
  );
};
