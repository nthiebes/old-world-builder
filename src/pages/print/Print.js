import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import { getAllOptions } from "../../utils/unit";
import { getUnitPoints, getPoints, getAllPoints } from "../../utils/points";

import "./Print.css";

export const Print = () => {
  const { listId } = useParams();
  const list = useSelector((state) =>
    state.lists.find(({ id }) => listId === id)
  );

  if (!list) {
    return null;
  }

  const allPoints = getAllPoints(list);
  const lordsPoints = getPoints({ list, type: "lords" });
  const heroesPoints = getPoints({ list, type: "heroes" });
  const corePoints = getPoints({ list, type: "core" });
  const specialPoints = getPoints({ list, type: "special" });
  const rarePoints = getPoints({ list, type: "rare" });

  return (
    <>
      <main className="print">
        <h1>
          {list.name} <span className="print__points">[{allPoints} Pkte.]</span>
        </h1>
        <p className="print__subheader">
          {list.game}, {list.army}
        </p>

        <section>
          <h2>
            Kommandanten{" "}
            <span className="print__points">[{lordsPoints} Pkte.]</span>
          </h2>
          <ul>
            {list.lords.map((unit) => (
              <li key={unit.id}>
                <h3>
                  {unit.name_de}
                  <span className="print__points">
                    [{getUnitPoints(unit)} Pkte.]
                  </span>
                </h3>
                {getAllOptions(unit)}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2>
            Helden <span className="print__points">[{heroesPoints} Pkte.]</span>
          </h2>
          <ul>
            {list.heroes.map((unit) => (
              <li key={unit.id}>
                <h3>
                  {unit.name_de}
                  <span className="print__points">
                    [{getUnitPoints(unit)} Pkte.]
                  </span>
                </h3>
                {getAllOptions(unit)}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2>
            Kerneinheiten{" "}
            <span className="print__points">[{corePoints} Pkte.]</span>
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
                    [{getUnitPoints(unit)} Pkte.]
                  </span>
                </h3>
                {getAllOptions(unit)}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2>
            Eliteeinheiten{" "}
            <span className="print__points">[{specialPoints} Pkte.]</span>
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
                    [{getUnitPoints(unit)} Pkte.]
                  </span>
                </h3>
                {getAllOptions(unit)}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2>
            Seltene Einheiten{" "}
            <span className="print__points">[{rarePoints} Pkte.]</span>
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
                    [{getUnitPoints(unit)} Pkte.]
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
          Erstellt mit <b>"Old World Builder"</b>
        </p>
        <p>
          [<i>old-world-builder.com</i>]
        </p>
      </footer>
    </>
  );
};
