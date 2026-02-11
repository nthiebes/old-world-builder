import { useState, useEffect, Fragment } from "react";
import { useParams, useLocation, Redirect } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FormattedMessage, useIntl } from "react-intl";
import { Helmet } from "react-helmet-async";

import { Icon } from "../../components/icon";
import { RulesIndex, RuleWithIcon } from "../../components/rules-index";
import { Header, Main } from "../../components/page";
import { Expandable } from "../../components/expandable";
import { addUnit } from "../../state/lists";
import { setArmy } from "../../state/army";
import { getUnitName } from "../../utils/unit";
import { getRandomId } from "../../utils/id";
import { useLanguage } from "../../utils/useLanguage";
import { getArmyData } from "../../utils/army";
import { fetcher } from "../../utils/fetcher";
import { getGameSystems, getCustomDatasetData } from "../../utils/game-systems";

import { nameMap } from "../magic";

import "./Add.css";

import { isOfficialSystem } from "../../utils/game-systems";

let allAllies = [];
let allMercenaries = [];

export const Add = ({ isMobile }) => {
  const MainComponent = isMobile ? Main : Fragment;
  const { listId, type } = useParams();
  const dispatch = useDispatch();
  const [redirect, setRedirect] = useState(null);
  const [alliesLoaded, setAlliesLoaded] = useState(0);
  const [mercenariesLoaded, setMercenariesLoaded] = useState(0);
  const intl = useIntl();
  const location = useLocation();
  const { language } = useLanguage();
  const list = useSelector((state) =>
    state.lists.find(({ id }) => listId === id)
  );
  const gameSystems = getGameSystems();
  const army = useSelector((state) => state.army);
  const game = gameSystems.find((game) => game.id === list?.game);
  const armyData = game?.armies.find((army) => army.id === list.army);
  const allies = armyData?.allies;
  const mercenaries = armyData?.mercenaries;
  const handleAdd = (unit, ally, unitType, magicItemsArmy) => {
    const newUnit = {
      ...unit,
      army: ally,
      unitType,
      id: `${unit.id}.${getRandomId()}`,
      magicItemsArmy: unit.magicItemsArmy || magicItemsArmy,
    };

    dispatch(addUnit({ listId, type, unit: newUnit }));
    setRedirect(newUnit.id);
  };
  const getUnit = (unit, ally, unitType, magicItemsArmy) => (
    <li key={unit.id} className="list">
      <button
        className="list__inner add__list-inner"
        onClick={() => handleAdd(unit, ally, unitType, magicItemsArmy)}
      >
        <span className="add__name">
          {unit.minimum ? `${unit.minimum} ` : null}
          <b>{getUnitName({ unit, language })}</b>
        </span>
        <i className="unit__points">{`${
          unit.minimum ? unit.points * unit.minimum : unit.points
        } ${intl.formatMessage({
          id: "app.points",
        })}`}</i>
      </button>
      <RuleWithIcon name={unit.name_en} isDark className="add__rules-icon" />
    </li>
  );

  useEffect(() => {
    window.scrollTo(0, 0);
    allAllies = [];
    allMercenaries = [];
  }, [location.pathname]);

  useEffect(() => {
    if (list && !army && type !== "allies") {
      const isCustom = !isOfficialSystem(game.id);

      if (isCustom) {
        const data = getCustomDatasetData(list.army);

        dispatch(
          setArmy(
            getArmyData({
              data,
              armyComposition: list.armyComposition,
            })
          )
        );
      } else {
        fetcher({
          url: `games/${list.game}/${list.army}`,
          onSuccess: (data) => {
            dispatch(
              setArmy(
                getArmyData({
                  data,
                  armyComposition: list.armyComposition || list.army,
                })
              )
            );
          },
        });
      }
    } else if (list && type === "allies" && allAllies.length === 0 && allies) {
      setAlliesLoaded(false);
      allies.forEach(({ army, armyComposition, magicItemsArmy }, index) => {
        const isCustom = !isOfficialSystem(game.id);
        const customData = isCustom && getCustomDatasetData(army);

        if (customData) {
          const armyData = getArmyData({
            data: customData,
            armyComposition: armyComposition || army,
          });

          allAllies = [
            ...allAllies,
            {
              ...armyData,
              ally: army,
              armyComposition: armyComposition || army,
            },
          ];
          setAlliesLoaded(index + 1);
        } else {
          fetcher({
            url: `games/${list.game}/${army}`,
            onSuccess: (data) => {
              const armyData = getArmyData({
                data,
                armyComposition: armyComposition || army,
              });

              allAllies = [
                ...allAllies,
                {
                  ...armyData,
                  ally: army,
                  armyComposition: armyComposition || army,
                  magicItemsArmy: magicItemsArmy,
                },
              ];
              setAlliesLoaded(index + 1);
            },
          });
        }
      });
    } else if (
      list &&
      type === "mercenaries" &&
      allMercenaries.length === 0 &&
      mercenaries
    ) {
      setMercenariesLoaded(false);
      mercenaries[list.armyComposition] &&
        mercenaries[list.armyComposition].forEach((mercenary, index) => {
          const isCustom = !isOfficialSystem(game.id);
          const customData = isCustom && getCustomDatasetData(mercenary.army);

          if (customData) {
            const armyData = getArmyData({
              data: customData,
              armyComposition: mercenary.army,
            });
            const allUnits = [
              ...armyData.characters,
              ...armyData.core,
              ...armyData.special,
              ...armyData.rare,
              ...armyData.mercenaries,
            ];
            const mercenaryUnits = allUnits
              .filter((unit) => mercenary.units.includes(unit.id))
              .map((unit) => ({ ...unit, army: mercenary.army }));
            allMercenaries = [...allMercenaries, ...mercenaryUnits];
            setMercenariesLoaded(index + 1);
          } else {
            fetcher({
              url: `games/${list.game}/${mercenary.army}`,
              onSuccess: (data) => {
                const armyData = getArmyData({
                  data,
                  armyComposition: mercenary.army,
                });
                const allUnits = [
                  ...armyData.characters,
                  ...armyData.core,
                  ...armyData.special,
                  ...armyData.rare,
                  ...armyData.mercenaries,
                ];
                const mercenaryUnits = allUnits
                  .filter((unit) => mercenary.units.includes(unit.id))
                  .map((unit) => ({ ...unit, army: mercenary.army }));
                allMercenaries = [...allMercenaries, ...mercenaryUnits];
                setMercenariesLoaded(index + 1);
              },
            });
          }
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list, army, allies, type]);

  if (redirect) {
    return <Redirect to={`/editor/${listId}/${type}/${redirect}`} />;
  }

  if (
    (!army && type !== "allies" && type !== "mercenaries") ||
    (type === "allies" && allAllies.length > 0 && !alliesLoaded) || // switching from custom to official
    (type === "allies" &&
      !allies &&
      alliesLoaded === 0 &&
      allAllies.length !== allies?.length) ||
    (type === "mercenaries" &&
      !mercenaries &&
      mercenariesLoaded === 0 &&
      allMercenaries.length !== mercenaries?.length)
  ) {
    if (isMobile) {
      return (
        <>
          <Header to={`/editor/${listId}`} />
          <Main loading />
        </>
      );
    } else {
      return (
        <>
          <Header to={`/editor/${listId}`} isSection />
          <Main loading />
        </>
      );
    }
  }

  return (
    <>
      <Helmet>
        <title>{`Warhammer Fantasy Builder | ${list?.name}`}</title>
      </Helmet>

      {isMobile && (
        <Header
          to={`/editor/${listId}`}
          headline={intl.formatMessage({
            id: "add.title",
          })}
        />
      )}

      <RulesIndex />

      <MainComponent>
        {!isMobile && (
          <Header
            isSection
            to={`/editor/${listId}`}
            headline={intl.formatMessage({
              id: "add.title",
            })}
          />
        )}
        {type === "allies" && (
          <>
            <p className="unit__notes">
              <Icon symbol="error" className="unit__notes-icon" />
              <FormattedMessage id="add.alliesInfo" />
            </p>
            <ul>
              {allAllies.map(
                (
                  {
                    characters,
                    core,
                    special,
                    rare,
                    ally,
                    armyComposition,
                    magicItemsArmy,
                  },
                  index
                ) => {
                  // Remove duplicate units
                  const uniqueUnits = [];
                  const tempCharacters = characters.filter((unit) => {
                    if (
                      !uniqueUnits.some((name_en) => name_en === unit.name_en)
                    ) {
                      uniqueUnits.push(unit.name_en);
                      return true;
                    }
                    return false;
                  });
                  const tempCore = core.filter((unit) => {
                    if (
                      !uniqueUnits.some((name_en) => name_en === unit.name_en)
                    ) {
                      uniqueUnits.push(unit.name_en);
                      return true;
                    }
                    return false;
                  });
                  const tempSpecial = special.filter((unit) => {
                    if (
                      !uniqueUnits.some((name_en) => name_en === unit.name_en)
                    ) {
                      uniqueUnits.push(unit.name_en);
                      return true;
                    }
                    return false;
                  });
                  const tempRare = rare.filter((unit) => {
                    if (
                      !uniqueUnits.some((name_en) => name_en === unit.name_en)
                    ) {
                      uniqueUnits.push(unit.name_en);
                      return true;
                    }
                    return false;
                  });

                  return (
                    <Expandable
                      key={index}
                      headline={`${
                        game?.armies.find((army) => army.id === ally)[
                          `name_${language}`
                        ] ||
                        game?.armies.find((army) => army.id === ally).name_en
                      } ${
                        armyComposition !== ally
                          ? ` (${
                              nameMap[armyComposition][`name_${language}`] ||
                              nameMap[armyComposition].name_en
                            })`
                          : ""
                      }`}
                    >
                      {tempCharacters.map((unit) =>
                        getUnit(
                          unit,
                          armyComposition,
                          "characters",
                          magicItemsArmy
                        )
                      )}
                      {tempCore
                        .filter((unit) => !unit.detachment)
                        .map((unit) =>
                          getUnit(unit, armyComposition, "core", magicItemsArmy)
                        )}
                      {tempSpecial
                        .filter((unit) => !unit.detachment)
                        .map((unit) =>
                          getUnit(
                            unit,
                            armyComposition,
                            "special",
                            magicItemsArmy
                          )
                        )}
                      {tempRare
                        .filter((unit) => !unit.detachment)
                        .map((unit) =>
                          getUnit(unit, armyComposition, "rare", magicItemsArmy)
                        )}
                    </Expandable>
                  );
                }
              )}
            </ul>
          </>
        )}
        {type === "mercenaries" && (
          <ul>{allMercenaries.map((unit) => getUnit(unit, unit.army))}</ul>
        )}
        {type !== "allies" && type !== "mercenaries" && (
          <ul>{army[type].map((unit) => !unit.detachment && getUnit(unit))}</ul>
        )}
      </MainComponent>
    </>
  );
};
