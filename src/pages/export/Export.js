import { useEffect, Fragment, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

import { Header, Main } from "../../components/page";
import { Button } from "../../components/button";
import { getAllOptions } from "../../utils/unit";
import { getUnitPoints, getPoints, getAllPoints } from "../../utils/points";

import "./Export.css";

const getUnitsString = (units, isShowList) => {
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
        }${unit.name_de}
${allOptions ? `- ${allOptions.split(", ").join("\n- ")}\n` : ""}
`;
      }

      return `${
        unit.strength || unit.minimum ? `${unit.strength || unit.minimum} ` : ""
      }${unit.name_de} [${getUnitPoints(unit)} Pkte.]
${allOptions ? `- ${allOptions.split(", ").join("\n- ")}\n` : ""}
`;
    })
    .join("");
};

const getListAsText = (list, isShowList) => {
  const allPoints = getAllPoints(list);
  const lordsPoints = getPoints({ list, type: "lords" });
  const heroesPoints = getPoints({ list, type: "heroes" });
  const corePoints = getPoints({ list, type: "core" });
  const specialPoints = getPoints({ list, type: "special" });
  const rarePoints = getPoints({ list, type: "rare" });

  if (isShowList) {
    return `===
${list.name}
${list.game}, ${list.army}
===

++ Kommandanten ++

${getUnitsString(list.lords, isShowList)}
++ Helden ++

${getUnitsString(list.heroes, isShowList)}
++ Kerneinheiten ++

${getUnitsString(list.core, isShowList)}
++ Eliteeinheiten ++

${getUnitsString(list.special, isShowList)}
++ Seltene Einheiten ++

${getUnitsString(list.rare, isShowList)}

---
Erstellt mit "Old World Builder"

[https://old-world-builder.com]`;
  }

  return `===
${list.name} [${allPoints} Pkte.]
${list.game}, ${list.army}
===

++ Kommandanten [${lordsPoints} Pkte.] ++

${getUnitsString(list.lords)}
++ Helden [${heroesPoints} Pkte.] ++

${getUnitsString(list.heroes)}
++ Kerneinheiten [${corePoints} Pkte.] ++

${getUnitsString(list.core)}
++ Eliteeinheiten [${specialPoints} Pkte.] ++

${getUnitsString(list.special)}
++ Seltene Einheiten [${rarePoints} Pkte.] ++

${getUnitsString(list.rare)}

---
Erstellt mit "Old World Builder"

[https://old-world-builder.com]`;
};

export const Export = ({ isMobile }) => {
  const MainComponent = isMobile ? Main : Fragment;
  const location = useLocation();
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [isShowList, setIsShowList] = useState(false);
  const { listId } = useParams();
  const list = useSelector((state) =>
    state.lists.find(({ id }) => listId === id)
  );
  const listText = list ? getListAsText(list, isShowList) : "";
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
      {isMobile && (
        <Header to={`/editor/${listId}`} headline="Liste exportieren" />
      )}

      <MainComponent>
        {!isMobile && (
          <Header
            isSection
            to={`/editor/${listId}`}
            headline="Liste exportieren"
          />
        )}
        <Button
          icon={copied ? "check" : "copy"}
          centered
          spaceTop
          spaceBottom
          onClick={copyText}
        >
          {copied ? "Text kopiert!" : "Als Text kopieren"}
        </Button>
        {copyError && (
          <p className="export__error">Das hat leider nicht geklappt :(.</p>
        )}

        <div className="checkbox">
          <input
            type="checkbox"
            id="show"
            onChange={() => setIsShowList(!isShowList)}
            checked={isShowList}
            className="checkbox__input"
          />
          <label htmlFor="show" className="checkbox__label">
            Sichtbare Liste
          </label>
        </div>

        <textarea className="export__text" value={listText} readOnly />
      </MainComponent>
    </>
  );
};
