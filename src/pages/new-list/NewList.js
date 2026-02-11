import { useState, useEffect, Fragment } from "react";
import { useLocation, Redirect } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FormattedMessage, useIntl } from "react-intl";
import classNames from "classnames";

import { Button } from "../../components/button";
import { Header, Main } from "../../components/page";
import { Select } from "../../components/select";
import { NumberInput } from "../../components/number-input";
import { getGameSystems } from "../../utils/game-systems";
import { getRandomId } from "../../utils/id";
import { useLanguage } from "../../utils/useLanguage";
import { setLists } from "../../state/lists";
import { updateSetting } from "../../state/settings";
import { RulesIndex, RuleWithIcon } from "../../components/rules-index";

import { nameMap } from "../magic";

import "./NewList.css";

export const NewList = ({ isMobile }) => {
  const MainComponent = isMobile ? Main : Fragment;
  const location = useLocation();
  const dispatch = useDispatch();
  const intl = useIntl();
  const { language } = useLanguage();
  const gameSystems = getGameSystems();
  const lists = useSelector((state) => state.lists);
  const game = useSelector((state) => state.settings.selectedGame);
  const [army, setArmy] = useState("empire-of-man");
  const [compositionRule, setCompositionRule] = useState("open-war");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [points, setPoints] = useState(2000);
  const [armyComposition, setArmyComposition] = useState("empire-of-man");
  const [redirect, setRedirect] = useState(null);
  const armies = gameSystems
    .filter(({ id }) => id === game)[0]
    .armies.sort((a, b) => a.id.localeCompare(b.id));
  const journalArmies = armies.find(({ id }) => army === id)?.armyComposition;
  const compositionRules = [
    {
      id: "open-war",
      name_en: intl.formatMessage({ id: "misc.open-war" }),
    },
    {
      id: "grand-melee",
      name_en: intl.formatMessage({ id: "misc.grand-melee" }),
    },
    {
      id: "combined-arms",
      name_en: intl.formatMessage({ id: "misc.combined-arms" }),
    },
    {
      id: "grand-melee-combined-arms",
      name_en: intl.formatMessage({ id: "misc.grand-melee-combined-arms" }),
    },
    {
      id: "battle-march",
      name_en: intl.formatMessage({ id: "misc.battle-march" }),
    },
  ];
  const listsPoints = [...lists.map((list) => list.points)].reverse();
  const quickActions =
    compositionRule === "battle-march"
      ? [500, 600, 750]
      : lists.length
      ? [...new Set([...listsPoints, 500, 1000, 1500, 2000, 2500])].slice(0, 5)
      : [500, 1000, 1500, 2000, 2500];
  const createList = () => {
    const newId = getRandomId();
    const newList = {
      name:
        name ||
        nameMap[armyComposition]?.[`name_${language}`] ||
        nameMap[armyComposition]?.name_en ||
        (nameMap[army] && nameMap[army][`name_${language}`]) ||
        nameMap[army]?.name_en ||
        army,
      description: description,
      game: game,
      points: points,
      army: army,
      lords: [],
      heroes: [],
      characters: [],
      core: [],
      special: [],
      rare: [],
      mercenaries: [],
      allies: [],
      id: newId,
      armyComposition,
      compositionRule,
    };
    const newLists = [newList, ...lists];

    localStorage.setItem("whfb.lists", JSON.stringify(newLists));
    dispatch(setLists(newLists));

    setRedirect(newId);
  };
  const handleSystemChange = (event) => {
    dispatch(updateSetting({ key: "selectedGame", value: event.target.value }));
    setArmy(
      gameSystems.filter(({ id }) => id === event.target.value)[0].armies[0].id,
    );
    setCompositionRule("open-war");
  };
  const handleArmyChange = (value) => {
    setArmy(value);
    setArmyComposition(
      armies.find(({ id }) => value === id).armyComposition[0],
    );
    setCompositionRule("open-war");
  };
  const handleArcaneJournalChange = (value) => {
    setArmyComposition(value);
  };
  const handleCompositionRuleChange = (value) => {
    setCompositionRule(value);
  };
  const handlePointsChange = (event) => {
    setPoints(event.target.value);
  };
  const handleNameChange = (event) => {
    setName(event.target.value);
  };
  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    createList();
  };
  const handleQuickActionClick = (event) => {
    event.preventDefault();
    setPoints(Number(event.target.value));
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    // Sincronizar ejército cuando cambia el sistema de juego
    if (armies && armies.length > 0) {
      const firstArmy = armies[0].id;
      setArmy(firstArmy);
      setCompositionRule("open-war");
    }
  }, [game, armies]);

  useEffect(() => {
    // Sincronizar armyComposition cuando cambia el ejército seleccionado
    const selectedArmy = armies.find(({ id }) => army === id);
    if (selectedArmy?.armyComposition) {
      setArmyComposition(selectedArmy.armyComposition[0]);
    }
  }, [army, armies]);

  return (
    <>
      {redirect && <Redirect to={`/editor/${redirect}`} />}

      {isMobile && (
        <Header to="/" headline={intl.formatMessage({ id: "new.title" })} />
      )}

      <RulesIndex />

      <MainComponent>
        {!isMobile && (
          <Header
            isSection
            to="/"
            headline={intl.formatMessage({ id: "new.title" })}
          />
        )}
        <form onSubmit={handleSubmit} className="new-list">
          {gameSystems.map(({ name, id }, index) => (
            <div
              className={classNames(
                "radio",
                "new-list__radio",
                index === gameSystems.length - 1 &&
                  "new-list__radio--last-item",
              )}
              key={id}
            >
              <input
                type="radio"
                id={id}
                name="new-list"
                value={id}
                onChange={handleSystemChange}
                checked={id === game}
                className="radio__input"
                aria-label={name}
              />
              <label htmlFor={id} className="radio__label">
                <span className="new-list__game-name">{name}</span>
              </label>
            </div>
          ))}
          <label htmlFor="army">
            <FormattedMessage id="new.army" />
          </label>
          <Select
            id="army"
            options={armies}
            onChange={handleArmyChange}
            selected={army}
            spaceBottom
            required
          />
          {journalArmies ? (
            <>
              <label htmlFor="arcane-journal">
                <FormattedMessage id="new.armyComposition" />
              </label>
              <Select
                id="arcane-journal"
                options={[
                  ...journalArmies.map((journalArmy) => ({
                    id: journalArmy,
                    name_en:
                      journalArmy === army
                        ? intl.formatMessage({ id: "new.grandArmy" })
                        : nameMap[journalArmy][`name_${language}`] ||
                          nameMap[journalArmy].name_en,
                  })),
                ]}
                onChange={handleArcaneJournalChange}
                selected={armyComposition}
                spaceBottom
              />
            </>
          ) : null}
          {game === "the-old-world" && (
            <>
              <label htmlFor="composition-rule">
                <FormattedMessage id="new.armyCompositionRule" />
              </label>
              <Select
                id="composition-rule"
                options={compositionRules}
                onChange={handleCompositionRuleChange}
                selected={compositionRule}
                spaceBottom
              />
              <p className="new-list__composition-description">
                <i>
                  <FormattedMessage
                    id={`new.armyCompositionRuleDescription.${compositionRule}`}
                  />
                </i>
                <RuleWithIcon
                  name={compositionRule}
                  isDark
                  className="game-view__rule-icon"
                />
              </p>
            </>
          )}
          <label htmlFor="points">
            <FormattedMessage id="misc.points" />
          </label>
          <NumberInput
            id="points"
            min={0}
            value={points}
            onChange={handlePointsChange}
            required
            interval={50}
          />
          <p className="new-list__quick-actions">
            <i className="new-list__quick-actions-label">
              <FormattedMessage id="misc.suggestions" />
              {": "}
            </i>
            {quickActions.map((points, index) => (
              <Button
                type="tertiary"
                size="small"
                color="dark"
                className="new-list__quick-action"
                value={points}
                onClick={handleQuickActionClick}
                key={index}
              >
                {points}
              </Button>
            ))}
          </p>

          <label htmlFor="name">
            <FormattedMessage id="misc.name" />
          </label>
          <input
            type="text"
            id="name"
            className="input"
            value={name}
            onChange={handleNameChange}
            autoComplete="off"
            maxLength="100"
          />
          <label htmlFor="description">
            <FormattedMessage id="misc.description" />
          </label>
          <input
            type="text"
            id="description"
            className="input"
            value={description}
            onChange={handleDescriptionChange}
            autoComplete="off"
            maxLength="255"
          />
          <Button
            centered
            icon="add-list"
            submitButton
            spaceBottom
            size="large"
          >
            <FormattedMessage id="new.create" />
          </Button>
        </form>
      </MainComponent>
    </>
  );
};
