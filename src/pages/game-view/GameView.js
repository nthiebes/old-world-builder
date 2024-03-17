import { useState, Fragment } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { FormattedMessage, useIntl } from "react-intl";
import { Helmet } from "react-helmet-async";

import { Header, Main } from "../../components/page";
import { Stats } from "../../components/stats";
import { Button } from "../../components/button";
import { NumberInput } from "../../components/number-input";
import {
  RulesIndex,
  RulesLinksText,
  RulesWithIcon,
  RuleWithIcon,
} from "../../components/rules-index";
import { getAllOptions } from "../../utils/unit";
import { getUnitPoints, getPoints, getAllPoints } from "../../utils/points";
import { useLanguage } from "../../utils/useLanguage";
import { getStats, getUnitName } from "../../utils/unit";
import gameSystems from "../../assets/armies.json";

import "./GameView.css";

export const GameView = () => {
  const { listId } = useParams();
  const { language } = useLanguage();
  const intl = useIntl();
  const [showPoints, setShowPoints] = useState(true);
  const [showSpecialRules, setShowSpecialRules] = useState(true);
  const [banners, setBanners] = useState(0);
  const [scenarioPoints, setScenarioPoints] = useState(0);
  const [generalDead, setGeneralDead] = useState(false);
  const [BSBDead, setBSBDead] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [showPageNumbers, setShowPageNumbers] = useState(false);
  const [victoryPoints, setVictoryPoints] = useState({});
  const [showVictoryPoints, setShowVictoryPoints] = useState(true);
  const list = useSelector((state) =>
    state.lists.find(({ id }) => listId === id)
  );

  if (!list) {
    return (
      <>
        <Header
          to={`/editor/${listId}`}
          headline={intl.formatMessage({
            id: "duplicate.title",
          })}
        />
        <Main />
      </>
    );
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
  const getUnitVictoryPoints = (unitId) => {
    let allPoints = 0;
    const unitVictoryPoints = victoryPoints[unitId];

    allPoints += unitVictoryPoints ? unitVictoryPoints["25"] : 0;
    allPoints += unitVictoryPoints ? unitVictoryPoints["dead"] : 0;
    allPoints += unitVictoryPoints ? unitVictoryPoints["fleeing"] : 0;

    return allPoints;
  };
  const getAllVictoryPoints = () => {
    let allVictoryPoints =
      banners * 50 +
      scenarioPoints +
      (generalDead ? 100 : 0) +
      (BSBDead ? 50 : 0);

    Object.keys(victoryPoints).forEach((unitId) => {
      allVictoryPoints += getUnitVictoryPoints(unitId);
    });

    return allVictoryPoints;
  };
  const allUnits = [
    ...(list["characters"] || []),
    ...(list["lords"] || []),
    ...(list["heroes"] || []),
    ...(list["core"] || []),
    ...(list["special"] || []),
    ...(list["rare"] || []),
    ...(list["mercenaries"] || []),
    ...(list["allies"] || []),
  ];
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
        id: "export.showPoints",
      }),
      id: "points",
      checked: showPoints,
      callback: () => {
        setShowPoints(!showPoints);
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
        id: "export.showVictoryPoints",
      }),
      id: "victory",
      checked: showVictoryPoints,
      callback: () => {
        setShowVictoryPoints(!showVictoryPoints);
      },
    },
  ];
  const getSection = ({ type }) => {
    const units = list[type];

    return (
      <ul>
        {units.map((unit, index) => {
          const stats = getStats(unit);

          return (
            <li key={index} className="list">
              <div className="list__inner game-view__list-inner">
                <h3>
                  {unit.strength || unit.minimum ? (
                    <span className="game-view__strength">
                      {`${unit.strength || unit.minimum} `}
                    </span>
                  ) : null}
                  <span className="game-view__name">
                    <span>{getUnitName({ unit, language })}</span>
                    <RuleWithIcon
                      name={unit.name_en}
                      isDark
                      className="game-view__rule-icon"
                    />
                    {showPoints && (
                      <span className="game-view__points">
                        [{getUnitPoints(unit)}{" "}
                        <FormattedMessage id="app.points" />]
                      </span>
                    )}
                  </span>
                </h3>
                <div className="game-view__details">
                  <RulesWithIcon
                    textObject={{
                      name_en: getAllOptions(unit, {
                        language: "en",
                        removeFactionName: false,
                      }),
                      [`name_${language}`]: getAllOptions(unit, {
                        removeFactionName: false,
                      }),
                    }}
                  />
                  {showSpecialRules && unit.specialRules ? (
                    <p className="game-view__special-rules">
                      <b>
                        <i>
                          <FormattedMessage id="unit.specialRules" />:
                        </i>
                      </b>{" "}
                      <RulesLinksText
                        textObject={unit.specialRules}
                        showPageNumbers={showPageNumbers}
                      />
                    </p>
                  ) : null}
                  {showStats &&
                    (stats?.length > 0 ? (
                      <Stats values={stats} className="game-view__stats" />
                    ) : (
                      <Stats
                        className="game-view__stats"
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
                  {showVictoryPoints && (
                    <>
                      {getVictoryButtons(unit)}
                      <p className="game-view__special-rules">
                        <b>
                          <i>
                            <FormattedMessage id="misc.victoryPoints" />
                            {": "}
                          </i>
                        </b>
                        {getUnitVictoryPoints(unit.id)}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    );
  };
  const updateVictoryPoints = ({ unit, value }) => {
    let unitPoints = victoryPoints[unit.id] || {
      dead: 0,
      fleeing: 0,
      25: 0,
    };
    const isGeneral = Boolean(
      unit?.command?.length &&
        unit.command.find((command) => command.name_en === "General")
    );
    const isBSB = Boolean(
      unit?.command?.length &&
        unit.command.find(
          (command) => command.name_en === "Battle Standard Bearer"
        )
    );

    // eslint-disable-next-line default-case
    switch (value) {
      case "dead": {
        unitPoints = {
          dead: unitPoints.dead ? 0 : getUnitPoints(unit),
          fleeing: 0,
          25: 0,
        };
        if (isGeneral) {
          setGeneralDead(Boolean(unitPoints.dead));
        }
        if (isBSB) {
          setBSBDead(Boolean(unitPoints.dead));
        }
        break;
      }
      case "fleeing": {
        unitPoints = {
          dead: 0,
          fleeing: unitPoints.fleeing ? 0 : Math.round(getUnitPoints(unit) / 2),
          25: 0,
        };
        if (isGeneral) {
          setGeneralDead(Boolean(unitPoints.fleeing));
        }
        if (isBSB) {
          setBSBDead(Boolean(unitPoints.fleeing));
        }
        break;
      }
      case "25": {
        unitPoints = {
          dead: 0,
          fleeing: 0,
          25: unitPoints["25"] ? 0 : Math.round(getUnitPoints(unit) / 4),
        };
      }
    }

    setVictoryPoints({
      ...victoryPoints,
      [unit.id]: { ...unitPoints, isGeneral, isBSB },
    });
  };
  const getVictoryButtons = (unit) => {
    return (
      <>
        <Button
          className="game-view__victory-button"
          type={victoryPoints[unit.id]?.dead ? "secondary" : "tertiary"}
          spaceTop
          onClick={() => updateVictoryPoints({ unit, value: "dead" })}
        >
          <FormattedMessage id="misc.dead" />
        </Button>
        <Button
          className="game-view__victory-button"
          type={victoryPoints[unit.id]?.fleeing ? "secondary" : "tertiary"}
          spaceTop
          onClick={() => updateVictoryPoints({ unit, value: "fleeing" })}
        >
          <FormattedMessage id="misc.fleeing" />
        </Button>
        <Button
          className="game-view__victory-button"
          type={victoryPoints[unit.id]?.["25"] ? "secondary" : "tertiary"}
          spaceTop
          onClick={() => updateVictoryPoints({ unit, value: "25" })}
        >
          {"<25%"}
        </Button>
      </>
    );
  };

  return (
    <>
      <Helmet>
        <title>{`Old World Builder | ${list.name}`}</title>
      </Helmet>

      <RulesIndex />

      <Header
        to={`/editor/${listId}`}
        headline={intl.formatMessage({
          id: "misc.gameView",
        })}
        subheadline={`${armyName} [${allPoints} ${intl.formatMessage({
          id: "app.points",
        })}]`}
        filters={filters}
      />

      <Main className="game-view">
        {list.game === "the-old-world" ? (
          list.characters.length > 0 && (
            <section className="game-view__section">
              <header className="editor__header">
                <h2>
                  <FormattedMessage id="editor.characters" />{" "}
                  {showPoints && (
                    <span className="game-view__points">
                      [{charactersPoints} <FormattedMessage id="app.points" />]
                    </span>
                  )}
                </h2>
              </header>
              {getSection({ type: "characters" })}
            </section>
          )
        ) : (
          <>
            {list.lords.length > 0 && (
              <section className="game-view__section">
                <header className="editor__header">
                  <h2>
                    <FormattedMessage id="editor.lords" />{" "}
                    {showPoints && (
                      <span className="game-view__points">
                        [{lordsPoints} <FormattedMessage id="app.points" />]
                      </span>
                    )}
                  </h2>
                </header>
                {getSection({ type: "lords" })}
              </section>
            )}

            {list.heroes.length > 0 && (
              <section className="game-view__section">
                <header className="editor__header">
                  <h2>
                    <FormattedMessage id="editor.heroes" />{" "}
                    {showPoints && (
                      <span className="game-view__points">
                        [{heroesPoints} <FormattedMessage id="app.points" />]
                      </span>
                    )}
                  </h2>
                </header>
                {getSection({ type: "heroes" })}
              </section>
            )}
          </>
        )}

        {list.core.length > 0 && (
          <section className="game-view__section">
            <header className="editor__header">
              <h2>
                <FormattedMessage id="editor.core" />{" "}
                {showPoints && (
                  <span className="game-view__points">
                    [{corePoints} <FormattedMessage id="app.points" />]
                  </span>
                )}
              </h2>
            </header>
            {getSection({ type: "core" })}
          </section>
        )}

        {list.special.length > 0 && (
          <section className="game-view__section">
            <header className="editor__header">
              <h2>
                <FormattedMessage id="editor.special" />{" "}
                {showPoints && (
                  <span className="game-view__points">
                    [{specialPoints} <FormattedMessage id="app.points" />]
                  </span>
                )}
              </h2>
            </header>
            {getSection({ type: "special" })}
          </section>
        )}

        {list.rare.length > 0 && (
          <section className="game-view__section">
            <header className="editor__header">
              <h2>
                <FormattedMessage id="editor.rare" />{" "}
                {showPoints && (
                  <span className="game-view__points">
                    [{rarePoints} <FormattedMessage id="app.points" />]
                  </span>
                )}
              </h2>
            </header>
            {getSection({ type: "rare" })}
          </section>
        )}

        {list.game === "the-old-world" && (
          <>
            {list.allies.length > 0 && (
              <section className="game-view__section">
                <header className="editor__header">
                  <h2>
                    <FormattedMessage id="editor.allies" />{" "}
                    {showPoints && (
                      <span className="game-view__points">
                        [{alliesPoints} <FormattedMessage id="app.points" />]
                      </span>
                    )}
                  </h2>
                </header>
                {getSection({ type: "allies" })}
              </section>
            )}

            {list.mercenaries.length > 0 && (
              <section className="game-view__section">
                <header className="editor__header">
                  <h2>
                    <FormattedMessage id="editor.mercenaries" />{" "}
                    {showPoints && (
                      <span className="game-view__points">
                        [{mercenariesPoints}{" "}
                        <FormattedMessage id="app.points" />]
                      </span>
                    )}
                  </h2>
                </header>
                {getSection({ type: "mercenaries" })}
              </section>
            )}
          </>
        )}

        {showVictoryPoints && (
          <section className="game-view__section">
            <header className="editor__header">
              <h2>
                <FormattedMessage id="misc.allVictoryPoints" />
                {": "}
              </h2>
              <strong>
                {getAllVictoryPoints()} <FormattedMessage id="app.points" />
              </strong>
            </header>
            <div className="game-view__victory-points">
              <label htmlFor="banners">
                <FormattedMessage id="misc.banners" />
              </label>
              <NumberInput
                id="banners"
                min={0}
                value={banners}
                onChange={(event) => {
                  setBanners(event.target.value);
                }}
              />
              <label htmlFor="scenarioPoints">
                <FormattedMessage id="misc.scenarioPoints" />
              </label>
              <NumberInput
                id="scenarioPoints"
                min={0}
                value={scenarioPoints}
                onChange={(event) => {
                  setScenarioPoints(event.target.value);
                }}
              />
              {generalDead && (
                <p>
                  <b>
                    <i>
                      <FormattedMessage id="misc.generalDead" />
                      {": "}
                    </i>
                  </b>
                  100
                </p>
              )}
              {BSBDead && (
                <p>
                  <b>
                    <i>
                      <FormattedMessage id="misc.bsbDead" />
                      {": "}
                    </i>
                  </b>
                  50
                </p>
              )}
              {Object.keys(victoryPoints).map((unitId) => {
                const unit = allUnits.find((unit) => unit.id === unitId);
                const unitVictoryPoints = getUnitVictoryPoints(unitId);

                if (unitVictoryPoints) {
                  return (
                    <p key={unitId}>
                      <b>
                        <i>
                          {unit.name ||
                            unit[`name_${language}`] ||
                            unit.name_en}
                          {": "}
                        </i>
                      </b>
                      {unitVictoryPoints}
                    </p>
                  );
                }
                return null;
              })}
            </div>
          </section>
        )}
      </Main>
    </>
  );
};
