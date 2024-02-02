import { useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { FormattedMessage } from "react-intl";

import { Button } from "../../components/button";
import { getAllOptions } from "../../utils/unit";
import { getUnitPoints, getPoints, getAllPoints } from "../../utils/points";
import { useLanguage } from "../../utils/useLanguage";
import { nameMap } from "../magic";
import gameSystems from "../../assets/armies.json";

import "./Print.css";

export const Print = () => {
  const { listId } = useParams();
  const { language } = useLanguage();
  const [isPrinting, setIsPrinting] = useState(false);
  const [isShowList, setIsShowList] = useState(false);
  const [showSpecialRules, setShowSpecialRules] = useState(false);
  const list = useSelector((state) =>
    state.lists.find(({ id }) => listId === id)
  );

  if (!list) {
    return null;
  }

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
  const armyCompositionName =
    list.army !== list.armyComposition && nameMap[list.armyComposition]
      ? nameMap[list.armyComposition][`name_${language}`] ||
        nameMap[list.armyComposition].name_en
      : "";
  const handlePrintClick = () => {
    setIsPrinting(true);
    document.title = `${list.name} - Old World Builder`;
    window.onafterprint = () => {
      document.title = "Old World Builder";
      setIsPrinting(false);
    };
    window.print();
  };

  return (
    <>
      <div className="hide-for-printing">
        <Button
          to={`/editor/${listId}`}
          centered
          icon="back"
          spaceTop
          spaceBottom
        >
          <FormattedMessage id="header.back" />
        </Button>
        {isPrinting ? (
          <p className="print-info">
            <FormattedMessage id="print.printing" />
          </p>
        ) : (
          <>
            <div className="checkbox print-checkbox">
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
            <p className="print-checkbox-description">
              <i>
                <FormattedMessage id="export.visibleListDescription" />
              </i>
            </p>
            <div className="checkbox print-checkbox">
              <input
                type="checkbox"
                id="specialRules"
                onChange={() => setShowSpecialRules(!showSpecialRules)}
                checked={showSpecialRules}
                className="checkbox__input"
              />
              <label htmlFor="specialRules" className="checkbox__label">
                <FormattedMessage id="export.specialRules" />
              </label>
            </div>
            <p className="print-checkbox-description"></p>
            <Button
              onClick={handlePrintClick}
              centered
              icon="print"
              spaceTop
              spaceBottom
            >
              <FormattedMessage id="misc.print" />
            </Button>
          </>
        )}
      </div>

      <main className="print">
        <h1>
          {list.name}{" "}
          {!isShowList && (
            <span className="print__points">
              [{allPoints} <FormattedMessage id="app.points" />]
            </span>
          )}
        </h1>
        <p className="print__subheader">
          {game.name}, {armyName}
          {armyCompositionName ? `, ${armyCompositionName}` : ""}
        </p>

        {list.game === "the-old-world" ? (
          <section>
            <h2>
              <FormattedMessage id="editor.characters" />{" "}
              {!isShowList && (
                <span className="print__points">
                  [{charactersPoints} <FormattedMessage id="app.points" />]
                </span>
              )}
            </h2>
            <ul>
              {list.characters.map((unit) => (
                <li key={unit.id}>
                  <h3>
                    {unit[`name_${language}`] || unit.name_en}
                    {!isShowList && (
                      <span className="print__points">
                        [{getUnitPoints(unit)}{" "}
                        <FormattedMessage id="app.points" />]
                      </span>
                    )}
                  </h3>
                  {getAllOptions(unit)}
                  {showSpecialRules && unit.specialRules ? (
                    <p className="print__special-rules">
                      <b>
                        <FormattedMessage id="unit.specialRules" />:
                      </b>{" "}
                      <i>
                        {unit.specialRules[`name_${language}`] ||
                          unit.specialRules.name_en}
                      </i>
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <>
            <section>
              <h2>
                <FormattedMessage id="editor.lords" />{" "}
                {!isShowList && (
                  <span className="print__points">
                    [{lordsPoints} <FormattedMessage id="app.points" />]
                  </span>
                )}
              </h2>
              <ul>
                {list.lords.map((unit) => (
                  <li key={unit.id}>
                    <h3>
                      {unit[`name_${language}`] || unit.name_en}
                      {!isShowList && (
                        <span className="print__points">
                          [{getUnitPoints(unit)}{" "}
                          <FormattedMessage id="app.points" />]
                        </span>
                      )}
                    </h3>
                    {getAllOptions(unit)}
                    {showSpecialRules && unit.specialRules ? (
                      <p className="print__special-rules">
                        <b>
                          <FormattedMessage id="unit.specialRules" />:
                        </b>{" "}
                        <i>
                          {unit.specialRules[`name_${language}`] ||
                            unit.specialRules.name_en}
                        </i>
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2>
                <FormattedMessage id="editor.heroes" />{" "}
                {!isShowList && (
                  <span className="print__points">
                    [{heroesPoints} <FormattedMessage id="app.points" />]
                  </span>
                )}
              </h2>
              <ul>
                {list.heroes.map((unit) => (
                  <li key={unit.id}>
                    <h3>
                      {unit[`name_${language}`] || unit.name_en}
                      {!isShowList && (
                        <span className="print__points">
                          [{getUnitPoints(unit)}{" "}
                          <FormattedMessage id="app.points" />]
                        </span>
                      )}
                    </h3>
                    {getAllOptions(unit)}
                    {showSpecialRules && unit.specialRules ? (
                      <p className="print__special-rules">
                        <b>
                          <FormattedMessage id="unit.specialRules" />:
                        </b>{" "}
                        <i>
                          {unit.specialRules[`name_${language}`] ||
                            unit.specialRules.name_en}
                        </i>
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}

        <section>
          <h2>
            <FormattedMessage id="editor.core" />{" "}
            {!isShowList && (
              <span className="print__points">
                [{corePoints} <FormattedMessage id="app.points" />]
              </span>
            )}
          </h2>
          <ul>
            {list.core.map((unit) => (
              <li key={unit.id}>
                <h3>
                  {unit.strength || unit.minimum ? (
                    <span className="print__strength">
                      {`${unit.strength || unit.minimum} `}
                    </span>
                  ) : null}
                  {unit[`name_${language}`] || unit.name_en}
                  {!isShowList && (
                    <span className="print__points">
                      [{getUnitPoints(unit)}{" "}
                      <FormattedMessage id="app.points" />]
                    </span>
                  )}
                </h3>
                {getAllOptions(unit)}
                {showSpecialRules && unit.specialRules ? (
                  <p className="print__special-rules">
                    <b>
                      <FormattedMessage id="unit.specialRules" />:
                    </b>{" "}
                    <i>
                      {unit.specialRules[`name_${language}`] ||
                        unit.specialRules.name_en}
                    </i>
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2>
            <FormattedMessage id="editor.special" />{" "}
            {!isShowList && (
              <span className="print__points">
                [{specialPoints} <FormattedMessage id="app.points" />]
              </span>
            )}
          </h2>
          <ul>
            {list.special.map((unit) => (
              <li key={unit.id}>
                <h3>
                  {unit.strength || unit.minimum ? (
                    <span className="print__strength">
                      {`${unit.strength || unit.minimum} `}
                    </span>
                  ) : null}
                  {unit[`name_${language}`] || unit.name_en}
                  {!isShowList && (
                    <span className="print__points">
                      [{getUnitPoints(unit)}{" "}
                      <FormattedMessage id="app.points" />]
                    </span>
                  )}
                </h3>
                {getAllOptions(unit)}
                {showSpecialRules && unit.specialRules ? (
                  <p className="print__special-rules">
                    <b>
                      <FormattedMessage id="unit.specialRules" />:
                    </b>{" "}
                    <i>
                      {unit.specialRules[`name_${language}`] ||
                        unit.specialRules.name_en}
                    </i>
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2>
            <FormattedMessage id="editor.rare" />{" "}
            {!isShowList && (
              <span className="print__points">
                [{rarePoints} <FormattedMessage id="app.points" />]
              </span>
            )}
          </h2>
          <ul>
            {list.rare.map((unit) => (
              <li key={unit.id}>
                <h3>
                  {unit.strength || unit.minimum ? (
                    <span className="print__strength">
                      {`${unit.strength || unit.minimum} `}
                    </span>
                  ) : null}
                  {unit[`name_${language}`] || unit.name_en}
                  {!isShowList && (
                    <span className="print__points">
                      [{getUnitPoints(unit)}{" "}
                      <FormattedMessage id="app.points" />]
                    </span>
                  )}
                </h3>
                {getAllOptions(unit)}
                {showSpecialRules && unit.specialRules ? (
                  <p className="print__special-rules">
                    <b>
                      <FormattedMessage id="unit.specialRules" />:
                    </b>{" "}
                    <i>
                      {unit.specialRules[`name_${language}`] ||
                        unit.specialRules.name_en}
                    </i>
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        {list.game === "the-old-world" && (
          <>
            <section>
              <h2>
                <FormattedMessage id="editor.allies" />{" "}
                {!isShowList && (
                  <span className="print__points">
                    [{alliesPoints} <FormattedMessage id="app.points" />]
                  </span>
                )}
              </h2>
              <ul>
                {list.allies.map((unit) => (
                  <li key={unit.id}>
                    <h3>
                      {unit.strength || unit.minimum ? (
                        <span className="print__strength">
                          {`${unit.strength || unit.minimum} `}
                        </span>
                      ) : null}
                      {unit[`name_${language}`] || unit.name_en}
                      {!isShowList && (
                        <span className="print__points">
                          [{getUnitPoints(unit)}{" "}
                          <FormattedMessage id="app.points" />]
                        </span>
                      )}
                    </h3>
                    {getAllOptions(unit)}
                    {showSpecialRules && unit.specialRules ? (
                      <p className="print__special-rules">
                        <b>
                          <FormattedMessage id="unit.specialRules" />:
                        </b>{" "}
                        <i>
                          {unit.specialRules[`name_${language}`] ||
                            unit.specialRules.name_en}
                        </i>
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2>
                <FormattedMessage id="editor.mercenaries" />{" "}
                {!isShowList && (
                  <span className="print__points">
                    [{mercenariesPoints} <FormattedMessage id="app.points" />]
                  </span>
                )}
              </h2>
              <ul>
                {list.mercenaries.map((unit) => (
                  <li key={unit.id}>
                    <h3>
                      {unit.strength || unit.minimum ? (
                        <span className="print__strength">
                          {`${unit.strength || unit.minimum} `}
                        </span>
                      ) : null}
                      {unit[`name_${language}`] || unit.name_en}
                      {!isShowList && (
                        <span className="print__points">
                          [{getUnitPoints(unit)}{" "}
                          <FormattedMessage id="app.points" />]
                        </span>
                      )}
                    </h3>
                    {getAllOptions(unit)}
                    {showSpecialRules && unit.specialRules ? (
                      <p className="print__special-rules">
                        <b>
                          <FormattedMessage id="unit.specialRules" />:
                        </b>{" "}
                        <i>
                          {unit.specialRules[`name_${language}`] ||
                            unit.specialRules.name_en}
                        </i>
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
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
