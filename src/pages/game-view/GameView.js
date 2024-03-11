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
import { getStats } from "../../utils/unit";
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
  const [showStats, setShowStats] = useState(true);
  const [showPageNumbers, setShowPageNumbers] = useState(false);
  const [victoryPoints, setVictoryPoints] = useState({});
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
                    <span>{unit[`name_${language}`] || unit.name_en}</span>
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
                        asString: true,
                      }),
                      name_de: getAllOptions(unit, { asString: true }),
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
                  {getVictoryButtons(unit)}
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
      100: 0,
      fleeing: 0,
      25: 0,
    };

    // eslint-disable-next-line default-case
    switch (value) {
      case "100": {
        unitPoints["100"] = unitPoints["100"] ? 0 : getUnitPoints(unit);
        break;
      }
      case "fleeing": {
        unitPoints.fleeing = unitPoints.fleeing
          ? 0
          : Math.round(getUnitPoints(unit) / 2);
        break;
      }
      case "25": {
        unitPoints["25"] = unitPoints["25"]
          ? 0
          : Math.round(getUnitPoints(unit) / 4);
      }
    }

    setVictoryPoints({
      ...victoryPoints,
      [unit.id]: unitPoints,
    });
  };
  const getVictoryButtons = (unit) => {
    return (
      <>
        <Button
          className="game-view__victory-button"
          type={victoryPoints[unit.id]?.["100"] ? "secondary" : "tertiary"}
          spaceTop
          onClick={() => updateVictoryPoints({ unit, value: "100" })}
        >
          <FormattedMessage id="misc.100" />
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
          <FormattedMessage id="misc.25" />
        </Button>
      </>
    );
  };

  console.log(victoryPoints);

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

        <section className="game-view__section">
          <header className="editor__header">
            <h2>
              <FormattedMessage id="misc.victoryPoints" />{" "}
            </h2>
          </header>
          <ul>
            <li className="list">
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
            </li>
            <li className="list">
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
            </li>
          </ul>
        </section>
      </Main>
    </>
  );
};
