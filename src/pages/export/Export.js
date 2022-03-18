import { useEffect, Fragment, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

import { Header, Main } from "../../components/page";
import { Button } from "../../components/button";
import { getAllOptions } from "../../utils/unit";
import { getUnitPoints, getPoints, getAllPoints } from "../../utils/points";

import "./Export.css";

const getUnitsString = (units) => {
  return units
    .map((unit) => {
      const allOptions = getAllOptions(unit, true);

      return `${
        unit.strength || unit.minimum ? `${unit.strength || unit.minimum} ` : ""
      }${unit.name_de} [${getUnitPoints(unit)} Pkte.]
${allOptions ? `· ${allOptions.split(", ").join("\n· ")}\n` : ""}
`;
    })
    .join("");
};

const getListAsText = (list) => {
  const allPoints = getAllPoints(list);
  const lordsPoints = getPoints({ list, type: "lords" });
  const heroesPoints = getPoints({ list, type: "heroes" });
  const corePoints = getPoints({ list, type: "core" });
  const specialPoints = getPoints({ list, type: "special" });
  const rarePoints = getPoints({ list, type: "rare" });

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
  const { listId } = useParams();
  const list = useSelector((state) =>
    state.lists.find(({ id }) => listId === id)
  );
  const listText = list ? getListAsText(list) : "";
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

        <textarea className="export__text" value={listText} readOnly />
      </MainComponent>
    </>
  );
};
