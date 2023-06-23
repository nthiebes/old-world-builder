import { useEffect, Fragment, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { FormattedMessage, useIntl } from "react-intl";
import { Helmet } from "react-helmet-async";

import { Header, Main } from "../../components/page";
import { Button } from "../../components/button";
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
  const corePoints = getPoints({ list, type: "core" });
  const specialPoints = getPoints({ list, type: "special" });
  const rarePoints = getPoints({ list, type: "rare" });
  const game = gameSystems.find((game) => game.id === list.game);
  const armyName = game.armies.find((army) => army.id === list.army)[
    `name_${language}`
  ];

  if (isShowList) {
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
Erstellt mit "Old World Builder"

[https://old-world-builder.com]`;
  }

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
};

export const Export = ({ isMobile }) => {
  const MainComponent = isMobile ? Main : Fragment;
  const intl = useIntl();
  const location = useLocation();
  const { language } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (!list) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>{`Old World Builder | ${list.name}`}</title>
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
        <Button
          icon={copied ? "check" : "copy"}
          centered
          spaceTop
          spaceBottom
          onClick={copyText}
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
        <p className="export__visible-description">
          <i>
            (<FormattedMessage id="export.visibleListDescription" />)
          </i>
        </p>

        <textarea className="export__text" value={listText} readOnly />
      </MainComponent>
    </>
  );
};
