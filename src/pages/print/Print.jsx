import { useState, useEffect } from "react";
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
import { getGameSystems } from "../../utils/game-systems";
import { normalizeRuleName } from "../../utils/string";
import { rulesMap, synonyms } from "../../components/rules-index/rules-map";
import { fetchRuleDescription } from "../../utils/rule-descriptions";

import "./Print.css";
import classNames from "classnames";

const collectUniqueRules = (list, armyComposition) => {
  const allUnits = [
    ...(list.characters || []),
    ...(list.core || []),
    ...(list.special || []),
    ...(list.rare || []),
    ...(list.allies || []),
    ...(list.mercenaries || []),
  ];
  const seen = new Map();
  for (const unit of allUnits) {
    const processRules = (sr) => {
      if (!sr?.name_en) return;
      for (const rawName of sr.name_en.split(", ")) {
        const displayName = rawName.replace(/\s\{.*?\}/g, "").trim();
        if (!displayName) continue;
        const normalized = normalizeRuleName(displayName);
        if (seen.has(normalized)) continue;
        const synonym = synonyms[normalized];
        const ruleData = rulesMap[normalized] || rulesMap[synonym];
        if (ruleData?.url) {
          seen.set(normalized, {
              displayName,
              rulePath: ruleData.url,
              pageRef: ruleData.page || null,
            });
        }
      }
    };
    processRules(
      unit.armyComposition?.[armyComposition]?.specialRules || unit.specialRules
    );
    for (const det of unit.detachments || []) {
      processRules(
        det.armyComposition?.[armyComposition]?.specialRules || det.specialRules
      );
    }
  }
  return Array.from(seen.values()).sort((a, b) =>
    a.displayName.localeCompare(b.displayName)
  );
};

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
  const [useTwoColumns, setUseTwoColumns] = useState(false);
  const [useThreeColumns, setUseThreeColumns] = useState(false);
  const [showHeadings, setShowHeadings] = useState(true);
  const [showRuleDescriptions, setShowRuleDescriptions] = useState(false);
  const [ruleDescriptions, setRuleDescriptions] = useState({});
  const [isLoadingDescriptions, setIsLoadingDescriptions] = useState(false);
  const list = useSelector((state) =>
    state.lists.find(({ id }) => listId === id),
  );

  useEffect(() => {
    if (!showRuleDescriptions || !list) return;
    const armyComposition = list.armyComposition || list.army;
    const rules = collectUniqueRules(list, armyComposition);
    if (rules.length === 0) return;
    setIsLoadingDescriptions(true);
    Promise.all(
      rules.map(({ rulePath }) =>
        fetchRuleDescription(rulePath).then((desc) => [rulePath, desc])
      )
    ).then((results) => {
      setRuleDescriptions(Object.fromEntries(results));
      setIsLoadingDescriptions(false);
    });
  }, [showRuleDescriptions]); // only re-fetch when the toggle changes

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
  const charactersPoints = getPoints({ list, type: "characters" });
  const corePoints = getPoints({ list, type: "core" });
  const specialPoints = getPoints({ list, type: "special" });
  const rarePoints = getPoints({ list, type: "rare" });
  const mercenariesPoints = getPoints({ list, type: "mercenaries" });
  const alliesPoints = getPoints({ list, type: "allies" });
  const gameSystems = getGameSystems();
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
    {
      name: intl.formatMessage({
        id: "print.showHeadings",
      }),
      id: "isShowHeadings",
      checked: showHeadings,
      callback: () => {
        setShowHeadings(!showHeadings);
      },
    },
    {
      name: intl.formatMessage({
        id: "print.useTwoColumns",
      }),
      id: "isShowTwoColumns",
      checked: useTwoColumns,
      callback: () => {
        setUseTwoColumns(!useTwoColumns);
        setUseThreeColumns(false);
        setShowHeadings(false);
      },
    },
    {
      name: intl.formatMessage({
        id: "print.useThreeColumns",
      }),
      id: "isShowThreeColumns",
      checked: useThreeColumns,
      callback: () => {
        setUseThreeColumns(!useThreeColumns);
        setUseTwoColumns(false);
        setShowHeadings(false);
      },
    },
    {
      name: intl.formatMessage({
        id: "print.showRuleDescriptions",
      }),
      id: "showRuleDescriptions",
      checked: showRuleDescriptions,
      callback: () => {
        setShowRuleDescriptions(!showRuleDescriptions);
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
      <>
        {units.map((unit) => {
          const stats = unit.profile?.stats || getStats(unit, armyComposition);
          const specialRules =
            unit.armyComposition?.[armyComposition]?.specialRules ||
            unit.specialRules;

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
                    {getUnitPoints(
                      { ...unit, type },
                      {
                        armyComposition,
                      },
                    )}{" "}
                    <FormattedMessage id="app.points" />]
                  </span>
                )}
              </h3>
              {getAllOptions(unit, {
                noMagic: isShowList,
                pageNumbers: showPageNumbers,
                armyComposition,
              })}
              {showSpecialRules && specialRules ? (
                <>
                  <p className="print__special-rules">
                    <i>
                      <b>
                        <FormattedMessage id="unit.specialRules" />:
                      </b>{" "}
                      {(
                        specialRules[`name_${language}`] || specialRules.name_en
                      )?.replace(/\s\{.*?\}/g, "")}
                    </i>
                  </p>
                  {unit.detachments &&
                    unit.detachments.map((detachment) => {
                      const specialRulesDetachment =
                        detachment.armyComposition?.[
                          list?.armyComposition || list?.army
                        ]?.specialRules || detachment.specialRules;

                      if (!specialRulesDetachment?.name_en) {
                        return null;
                      }

                      return (
                        <p
                          className="game-view__special-rules"
                          key={detachment.id}
                        >
                          <b>
                            <i>
                              <FormattedMessage id="unit.specialRules" /> (
                              {detachment[`name_${language}`] ||
                                detachment.name_en}
                              ):
                            </i>
                          </b>{" "}
                          {(
                            specialRulesDetachment[`name_${language}`] ||
                            specialRulesDetachment.name_en
                          ).replace(/\s\{.*?\}/g, "")}
                        </p>
                      );
                    })}
                </>
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
      </>
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
          className="print__button"
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

      <main
        className={classNames(
          "print",
          useTwoColumns && "print--two-columns",
          useThreeColumns && "print--three-columns",
        )}
      >
        <ul>
          {showHeadings && (
            <>
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
                {armyCompositionName ? `, ${armyCompositionName}` : ""},{" "}
                <FormattedMessage
                  id={`misc.${list.compositionRule || "open-war"}`}
                />
              </p>
            </>
          )}

          {list.characters.length > 0 && (
            <>
              {showHeadings && (
                <h2>
                  <FormattedMessage id="editor.characters" />{" "}
                  {!isShowList && (
                    <span className="print__points">
                      [{charactersPoints} <FormattedMessage id="app.points" />]
                    </span>
                  )}
                </h2>
              )}
              {getSection({ type: "characters" })}
            </>
          )}

          {list.core.length > 0 && (
            <>
              {showHeadings && (
                <h2>
                  <FormattedMessage id="editor.core" />{" "}
                  {!isShowList && (
                    <span className="print__points">
                      [{corePoints} <FormattedMessage id="app.points" />]
                    </span>
                  )}
                </h2>
              )}
              {getSection({ type: "core" })}
            </>
          )}

          {list.special.length > 0 && (
            <>
              {showHeadings && (
                <h2>
                  <FormattedMessage id="editor.special" />{" "}
                  {!isShowList && (
                    <span className="print__points">
                      [{specialPoints} <FormattedMessage id="app.points" />]
                    </span>
                  )}
                </h2>
              )}
              {getSection({ type: "special" })}
            </>
          )}

          {list.rare.length > 0 && (
            <>
              {showHeadings && (
                <h2>
                  <FormattedMessage id="editor.rare" />{" "}
                  {!isShowList && (
                    <span className="print__points">
                      [{rarePoints} <FormattedMessage id="app.points" />]
                    </span>
                  )}
                </h2>
              )}
              {getSection({ type: "rare" })}
            </>
          )}

          {list.allies.length > 0 && (
            <>
              {showHeadings && (
                <h2>
                  <FormattedMessage id="editor.allies" />{" "}
                  {!isShowList && (
                    <span className="print__points">
                      [{alliesPoints} <FormattedMessage id="app.points" />]
                    </span>
                  )}
                </h2>
              )}
              {getSection({ type: "allies" })}
            </>
          )}

          {list.mercenaries.length > 0 && (
            <>
              {showHeadings && (
                <h2>
                  <FormattedMessage id="editor.mercenaries" />{" "}
                  {!isShowList && (
                    <span className="print__points">
                      [{mercenariesPoints} <FormattedMessage id="app.points" />]
                    </span>
                  )}
                </h2>
              )}
              {getSection({ type: "mercenaries" })}
            </>
          )}

          {showRuleDescriptions && (
            <li className="print__rules-reference">
              <h2>
                <FormattedMessage id="print.rulesReference" />
              </h2>
              {isLoadingDescriptions ? (
                <p className="print__rules-loading">
                  <FormattedMessage id="print.loadingRules" />
                </p>
              ) : (
                <dl className="print__rules-list">
                  {collectUniqueRules(list, armyComposition).map(
                    ({ displayName, rulePath, pageRef }) => {
                      const desc = ruleDescriptions[rulePath];
                      const content = desc || pageRef;
                      if (!content) return null;
                      return (
                        <div key={rulePath} className="print__rule-entry">
                          <dt>{displayName}</dt>
                          <dd className={!desc ? "print__rule-pageref" : undefined}>
                            {content}
                          </dd>
                        </div>
                      );
                    }
                  )}
                </dl>
              )}
            </li>
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
        </ul>
      </main>
    </>
  );
};
