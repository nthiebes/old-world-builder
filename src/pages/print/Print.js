import { useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { FormattedMessage, useIntl } from "react-intl";

import { Header } from "../../components/page";
import { Button } from "../../components/button";
import { Stats } from "../../components/stats";
import { getAllOptions } from "../../utils/unit";
import { getUnitPoints, getPoints, getAllPoints } from "../../utils/points";
import { useLanguage } from "../../utils/useLanguage";
import { getStats, getUnitName } from "../../utils/unit";
import { nameMap } from "../magic";
import gameSystems from "../../assets/armies.json";

import "./Print.css";

export const Print = () => {
  const { listId } = useParams();
  const { language } = useLanguage();
  const intl = useIntl();
  const [isPrinting, setIsPrinting] = useState(false);
  const [isShowList, setIsShowList] = useState(false);
  const [showSpecialRules, setShowSpecialRules] = useState(true);
  const [showPageNumbers, setShowPageNumbers] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [showCustomNotes, setShowCustomNotes] = useState(true);
  const list = useSelector((state) =>
    state.lists.find(({ id }) => listId === id)
  );

  if (!list) {
    return (
      <Header
        headline={intl.formatMessage({
          id: "print.title",
        })}
      />
    );
  }

  const armyComposition = list.armyComposition || list.army;
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
  const filters = [
    {
      name: intl.formatMessage({
        id: "export.specialRules",
      }),
      id: "specialRules",
      checked: showSpecialRules,
      callback: () => {
        setShowSpecialRules(!showSpecialRules);
      },
    },
    {
      name: intl.formatMessage({
        id: "export.showStats",
      }),
      id: "stats",
      checked: showStats,
      callback: () => {
        setShowStats(!showStats);
      },
    },
    {
      name: intl.formatMessage({
        id: "export.showPageNumbers",
      }),
      id: "pages",
      checked: showPageNumbers,
      callback: () => {
        setShowPageNumbers(!showPageNumbers);
      },
    },
    {
      name: intl.formatMessage({
        id: "export.showCustomNotes",
      }),
      id: "customNotes",
      checked: showCustomNotes,
      callback: () => {
        setShowCustomNotes(!showCustomNotes);
      },
    },
    {
      name: intl.formatMessage({
        id: "export.visibleList",
      }),
      description: intl.formatMessage({
        id: "export.visibleListDescription",
      }),
      id: "isShowList",
      checked: isShowList,
      callback: () => {
        setIsShowList(!isShowList);
      },
    },
  ];
  const handlePrintClick = () => {
    setIsPrinting(true);
    document.title = `${list.name} - Old World Builder`;
    window.onafterprint = () => {
      document.title = "Old World Builder";
      setIsPrinting(false);
    };
    window.print();
  };
  const getSection = ({ type }) => {
    const units = list[type];

    return (
      <ul>
        {units.map((unit) => {
          const stats = getStats(unit, armyComposition);

          return (
            <li key={unit.id}>
              <h3>
                {unit.strength || unit.minimum ? (
                  <span className="print__strength">
                    {`${unit.strength || unit.minimum} `}
                  </span>
                ) : null}
                {getUnitName({ unit, language })}
                {!isShowList && (
                  <span className="print__points">
                    [
                    {getUnitPoints(unit, {
                      armyComposition,
                    })}{" "}
                    <FormattedMessage id="app.points" />]
                  </span>
                )}
              </h3>
              {getAllOptions(unit, {
                noMagic: isShowList,
                pageNumbers: showPageNumbers,
                armyComposition,
              })}
              {showSpecialRules && unit.specialRules ? (
                <p className="print__special-rules">
                  <i>
                    <b>
                      <FormattedMessage id="unit.specialRules" />:
                    </b>{" "}
                    {(
                      unit.specialRules[`name_${language}`] ||
                      unit.specialRules.name_en
                    ).replace(/ *\{[^)]*\}/g, "")}
                  </i>
                </p>
              ) : null}
              {showStats &&
                (stats?.length > 0 ? (
                  <Stats isPrintPage values={stats} />
                ) : (
                  <Stats
                    isPrintPage
                    values={[
                      {
                        name: "",
                        M: "",
                        WS: "",
                        BS: "",
                        S: "",
                        T: "",
                        W: "",
                        I: "",
                        A: "",
                        LD: "",
                      },
                    ]}
                  />
                ))}
              {showCustomNotes && unit.customNote && (
                <p className="print__custom-note">
                  <i>
                    <b>
                      <FormattedMessage id="unit.customNote" />:
                    </b>{" "}
                    {unit.customNote}
                  </i>
                </p>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <>
      <div className="hide-for-printing">
        <Header
          to={`/editor/${listId}`}
          headline={intl.formatMessage({
            id: "print.title",
          })}
          filters={filters}
        />

        <Button
          onClick={handlePrintClick}
          centered
          icon="print"
          spaceTop
          spaceBottom
          size="large"
          disabled={isPrinting}
        >
          {isPrinting ? (
            <FormattedMessage id="print.printing" />
          ) : (
            <FormattedMessage id="misc.print" />
          )}
        </Button>
        <h2>
          <FormattedMessage id="print.preview" />
        </h2>
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
          list.characters.length > 0 && (
            <section>
              <h2>
                <FormattedMessage id="editor.characters" />{" "}
                {!isShowList && (
                  <span className="print__points">
                    [{charactersPoints} <FormattedMessage id="app.points" />]
                  </span>
                )}
              </h2>
              {getSection({ type: "characters" })}
            </section>
          )
        ) : (
          <>
            {list.lords.length > 0 && (
              <section>
                <h2>
                  <FormattedMessage id="editor.lords" />{" "}
                  {!isShowList && (
                    <span className="print__points">
                      [{lordsPoints} <FormattedMessage id="app.points" />]
                    </span>
                  )}
                </h2>
                {getSection({ type: "lords" })}
              </section>
            )}

            {list.heroes.length > 0 && (
              <section>
                <h2>
                  <FormattedMessage id="editor.heroes" />{" "}
                  {!isShowList && (
                    <span className="print__points">
                      [{heroesPoints} <FormattedMessage id="app.points" />]
                    </span>
                  )}
                </h2>
                {getSection({ type: "heroes" })}
              </section>
            )}
          </>
        )}

        {list.core.length > 0 && (
          <section>
            <h2>
              <FormattedMessage id="editor.core" />{" "}
              {!isShowList && (
                <span className="print__points">
                  [{corePoints} <FormattedMessage id="app.points" />]
                </span>
              )}
            </h2>
            {getSection({ type: "core" })}
          </section>
        )}

        {list.special.length > 0 && (
          <section>
            <h2>
              <FormattedMessage id="editor.special" />{" "}
              {!isShowList && (
                <span className="print__points">
                  [{specialPoints} <FormattedMessage id="app.points" />]
                </span>
              )}
            </h2>
            {getSection({ type: "special" })}
          </section>
        )}

        {list.rare.length > 0 && (
          <section>
            <h2>
              <FormattedMessage id="editor.rare" />{" "}
              {!isShowList && (
                <span className="print__points">
                  [{rarePoints} <FormattedMessage id="app.points" />]
                </span>
              )}
            </h2>
            {getSection({ type: "rare" })}
          </section>
        )}

        {list.game === "the-old-world" && (
          <>
            {list.allies.length > 0 && (
              <section>
                <h2>
                  <FormattedMessage id="editor.allies" />{" "}
                  {!isShowList && (
                    <span className="print__points">
                      [{alliesPoints} <FormattedMessage id="app.points" />]
                    </span>
                  )}
                </h2>
                {getSection({ type: "allies" })}
              </section>
            )}

            {list.mercenaries.length > 0 && (
              <section>
                <h2>
                  <FormattedMessage id="editor.mercenaries" />{" "}
                  {!isShowList && (
                    <span className="print__points">
                      [{mercenariesPoints} <FormattedMessage id="app.points" />]
                    </span>
                  )}
                </h2>
                {getSection({ type: "mercenaries" })}
              </section>
            )}
          </>
        )}
        <div className="print-footer">
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
        </div>
      </main>
    </>
  );
};
