import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { FormattedMessage } from "react-intl";

import { Button } from "../../components/button";
import { getAllOptions } from "../../utils/unit";
import { getUnitPoints, getPoints, getAllPoints } from "../../utils/points";
import { useLanguage } from "../../utils/useLanguage";
import gameSystems from "../../assets/armies.json";

import "./Print.css";

export const Print = () => {
  const { listId } = useParams();
  const { language } = useLanguage();
  const [isDone, setIsDone] = useState(false);
  const list = useSelector((state) =>
    state.lists.find(({ id }) => listId === id)
  );

  useEffect(() => {
    if (list) {
      document.title = `${list.name} - Old World Builder`;
      window.onafterprint = () => {
        document.title = "Old World Builder";
        setIsDone(true);
      };
      window.print();
    }
  }, [list, language]);

  if (!list) {
    return null;
  }

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

  return (
    <>
      <Button
        className="print-back"
        to={`/editor/${listId}`}
        centered
        icon="back"
        spaceTop
        spaceBottom
      >
        <FormattedMessage id="header.back" />
      </Button>
      {!isDone && (
        <p className="print-info">
          <FormattedMessage id="print.printing" />
        </p>
      )}
      <main className="print">
        <h1>
          {list.name}{" "}
          <span className="print__points">
            [{allPoints} <FormattedMessage id="app.points" />]
          </span>
        </h1>
        <p className="print__subheader">
          {game.name}, {armyName}
        </p>

        <section>
          <h2>
            <FormattedMessage id="editor.lords" />{" "}
            <span className="print__points">
              [{lordsPoints} <FormattedMessage id="app.points" />]
            </span>
          </h2>
          <ul>
            {list.lords.map((unit) => (
              <li key={unit.id}>
                <h3>
                  {unit.name_de}
                  <span className="print__points">
                    [{getUnitPoints(unit)} <FormattedMessage id="app.points" />]
                  </span>
                </h3>
                {getAllOptions(unit)}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2>
            <FormattedMessage id="editor.heroes" />{" "}
            <span className="print__points">
              [{heroesPoints} <FormattedMessage id="app.points" />]
            </span>
          </h2>
          <ul>
            {list.heroes.map((unit) => (
              <li key={unit.id}>
                <h3>
                  {unit.name_de}
                  <span className="print__points">
                    [{getUnitPoints(unit)} <FormattedMessage id="app.points" />]
                  </span>
                </h3>
                {getAllOptions(unit)}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2>
            <FormattedMessage id="editor.core" />{" "}
            <span className="print__points">
              [{corePoints} <FormattedMessage id="app.points" />]
            </span>
          </h2>
          <ul>
            {list.core.map((unit) => (
              <li key={unit.id}>
                <h3>
                  <span className="print__strength">
                    {(unit.strength || unit.minimum) &&
                      `${unit.strength || unit.minimum} `}
                  </span>
                  {unit.name_de}
                  <span className="print__points">
                    [{getUnitPoints(unit)} <FormattedMessage id="app.points" />]
                  </span>
                </h3>
                {getAllOptions(unit)}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2>
            <FormattedMessage id="editor.special" />{" "}
            <span className="print__points">
              [{specialPoints} <FormattedMessage id="app.points" />]
            </span>
          </h2>
          <ul>
            {list.special.map((unit) => (
              <li key={unit.id}>
                <h3>
                  <span className="print__strength">
                    {(unit.strength || unit.minimum) &&
                      `${unit.strength || unit.minimum} `}
                  </span>
                  {unit.name_de}
                  <span className="print__points">
                    [{getUnitPoints(unit)} <FormattedMessage id="app.points" />]
                  </span>
                </h3>
                {getAllOptions(unit)}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2>
            <FormattedMessage id="editor.rare" />{" "}
            <span className="print__points">
              [{rarePoints} <FormattedMessage id="app.points" />]
            </span>
          </h2>
          <ul>
            {list.rare.map((unit) => (
              <li key={unit.id}>
                <h3>
                  <span className="print__strength">
                    {(unit.strength || unit.minimum) &&
                      `${unit.strength || unit.minimum} `}
                  </span>
                  {unit.name_de}
                  <span className="print__points">
                    [{getUnitPoints(unit)} <FormattedMessage id="app.points" />]
                  </span>
                </h3>
                {getAllOptions(unit)}
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="print-footer">
        <p>
          <FormattedMessage id="export.createdWith" />{" "}
          <b>"Old World Builder"</b>
        </p>
        <p>
          [
          <a href="https://old-world-builder.com">
            <i>old-world-builder.com</i>
          </a>
          ]
        </p>
      </footer>
    </>
  );
};
