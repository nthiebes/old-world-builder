import { Fragment, useEffect, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FormattedMessage, useIntl } from "react-intl";
import classNames from "classnames";
import { Helmet } from "react-helmet-async";

import { getUnitMagicPoints } from "../../utils/points";
import { fetcher } from "../../utils/fetcher";
import { Header, Main } from "../../components/page";
import { NumberInput } from "../../components/number-input";
import { ErrorMessage } from "../../components/error-message";
import { RulesIndex, RuleWithIcon } from "../../components/rules-index";
import { setItems } from "../../state/items";
import { editUnit } from "../../state/lists";
import { useLanguage } from "../../utils/useLanguage";
import { updateLocalList } from "../../utils/list";
import { equalsOrIncludes, namesForSpread } from "../../utils/string";
import { getUnitName, getUnitOptionNotes } from "../../utils/unit";
import { getGameSystems } from "../../utils/game-systems";
import {
  isMultipleAllowedItem,
  itemsUsedElsewhere,
  maxAllowedOfItem,
  comboExclusiveCategories,
  combosUsedElsewhere,
} from "../../utils/magic-item-limitations";

import { nameMap } from "./name-map";
import "./Magic.css";

const updateIds = (items) => {
  return items.map((item) => ({
    ...item,
    items: item.items.map((data, index) => {
      if (data.conditional) {
        return {
          ...data,
          id: index,
          conditional: data.conditional.map(
            (conditionalItem, conditionalIndex) => ({
              ...conditionalItem,
              id: `${index}-${conditionalIndex}`,
            })
          ),
        };
      }

      return {
        ...data,
        id: index,
      };
    }),
  }));
};

export const isAllowedShield = (unit) => {
  return (
    (unit.equipment &&
      unit.equipment.find((option) =>
        option.name_en.toLowerCase().includes("shield")
      )) ||
    (unit.options &&
      unit.options.find((option) =>
        option.name_en.toLowerCase().includes("shield")
      )) ||
    (unit.armor &&
      unit.armor.find((option) =>
        option.name_en.toLowerCase().includes("shield")
      ))
  );
};

export const isMagicShield = (magicItem) => {
  return (
    magicItem.type === "armor" &&
    magicItem.name_en.toLowerCase().includes("shield")
  );
};

export const isDisallowedShield = (magicItem, unit) => {
  return isMagicShield(magicItem) && !isAllowedShield(unit);
};

export const notEnoughPointsRemaining = (
  maxMagicPoints,
  magicItem,
  unitPointsRemaining
) => {
  return maxMagicPoints && magicItem.points > unitPointsRemaining;
};

export const Magic = ({ isMobile }) => {
  let prevItemType, isFirstItemType;
  const MainComponent = isMobile ? Main : Fragment;
  const location = useLocation();
  const { language } = useLanguage();
  const intl = useIntl();
  const { listId, type, unitId, command, group } = useParams();
  const dispatch = useDispatch();
  const list = useSelector((state) =>
    state.lists.find(({ id }) => listId === id)
  );
  const units = list ? list[type] : null;
  const unit = units && units.find(({ id }) => id === unitId);
  const armyId = unit?.army || list?.army;
  const gameSystems = getGameSystems();
  let army =
    list &&
    gameSystems
      .find(({ id }) => id === list.game)
      .armies.find(
        ({ id }) =>
          (unit && unit.items && unit.items[group]?.magicItemsArmy === id) ||
          (command !== undefined &&
            unit &&
            unit.command &&
            unit.command[command]?.magic?.magicItemsArmy === id)
      );
  const [usedElsewhere, setUsedElsewhere] = useState([]);
  const [comboUsedElsewhere, setComboUsedElsewhere] = useState([]);
  const getPointsText = ({
    points: regularPoints,
    perModelPoints,
    perUnitPoints,
    perModel,
  }) => {
    let points = regularPoints;

    if (type !== "characters" && perUnitPoints) {
      points = perUnitPoints;
    } else if (type !== "characters" && perModelPoints) {
      points = perModelPoints;
    }

    if (points === 0) {
      return intl.formatMessage({
        id: "app.free",
      });
    }

    return (
      <>
        {`${points} ${
          points === 1
            ? intl.formatMessage({
                id: "app.point",
              })
            : intl.formatMessage({
                id: "app.points",
              })
        }`}
        {perModel &&
          type !== "characters" &&
          ` ${intl.formatMessage({
            id: "unit.perModel",
          })}`}
      </>
    );
  };

  // Fallback to list army if no specific army for items is set
  if (!army) {
    army =
      list &&
      gameSystems
        .find(({ id }) => id === list.game)
        .armies.find(({ id }) => armyId === id);
  }

  // Use list army for arcane journals
  if (!army) {
    army =
      list &&
      gameSystems
        .find(({ id }) => id === list.game)
        .armies.find(
          ({ id }) => unit.magicItemsArmy === id || list.army === id
        );
  }

  const items = useSelector((state) => state.items);
  let maxMagicPoints = 0;
  let maxItemsPerCategory = 0;
  const handleMagicChange = (event, magicItem, isCommand) => {
    let magicItems;
    const inputType = event.target.type;

    if (event.target.checked) {
      if (isCommand) {
        if (inputType === "radio") {
          magicItems = [
            {
              ...magicItem,
              id: event.target.value,
            },
          ];
        } else {
          magicItems = [
            ...(commandOptions[command].magic.selected || []),
            {
              ...magicItem,
              id: event.target.value,
            },
          ];
        }
      } else {
        if (inputType === "radio") {
          magicItems = [
            {
              ...magicItem,
              id: event.target.value,
            },
          ];
        } else {
          magicItems = [
            ...(unit.items[group].selected || []),
            {
              ...magicItem,
              id: event.target.value,
            },
          ];
        }
      }
    } else {
      if (isCommand) {
        magicItems = commandOptions[command].magic.selected.filter(
          ({ id }) => id !== event.target.value
        );
      } else {
        magicItems = unit.items[group].selected.filter(
          ({ id }) => id !== event.target.value
        );
      }
    }

    if (isCommand) {
      const newCommand = commandOptions.map((entry, entryIndex) =>
        entryIndex === Number(command)
          ? {
              ...entry,
              magic: {
                ...entry.magic,
                selected: magicItems,
              },
            }
          : entry
      );

      dispatch(
        editUnit({
          listId,
          type,
          unitId,
          command: newCommand,
        })
      );
    } else {
      const newItems = unit.items.map((entry, entryIndex) =>
        entryIndex === Number(group)
          ? {
              ...entry,
              selected: magicItems,
            }
          : entry
      );

      dispatch(
        editUnit({
          listId,
          type,
          unitId,
          items: newItems,
        })
      );
    }
  };
  const handleAmountChange = ({ event, parentId, isCommand }) => {
    let magicItems;

    if (isCommand) {
      magicItems = (commandOptions[command].magic.selected || []).map((item) =>
        item.id === parentId
          ? {
              ...item,
              amount: event.target.value,
            }
          : item
      );
    } else {
      magicItems = (unit.items[group].selected || []).map((item) =>
        item.id === parentId
          ? {
              ...item,
              amount: event.target.value,
            }
          : item
      );
    }

    if (isCommand) {
      const newCommand = commandOptions.map((entry, entryIndex) =>
        entryIndex === Number(command)
          ? {
              ...entry,
              magic: {
                ...entry.magic,
                selected: magicItems,
              },
            }
          : entry
      );

      dispatch(
        editUnit({
          listId,
          type,
          unitId,
          command: newCommand,
        })
      );
    } else {
      const newItems = unit.items.map((entry, entryIndex) =>
        entryIndex === Number(group)
          ? {
              ...entry,
              selected: magicItems,
            }
          : entry
      );

      dispatch(
        editUnit({
          listId,
          type,
          unitId,
          items: newItems,
        })
      );
    }
  };
  const cleanup = () => {
    dispatch(setItems(null));
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    list && updateLocalList(list);
  }, [list]);

  useEffect(() => {
    if (unit && list && unitId) {
      let items = (unit?.items && unit.items[group || 0]?.selected) || [];
      if (command) {
        items = items.concat(unit?.command[command]?.magic?.selected || []);
      }
      setUsedElsewhere(itemsUsedElsewhere(items, list, unitId));

      const categoryIsComboExclusive = (type) =>
        comboExclusiveCategories.indexOf(type) >= 0;
      const hasComboExculsiveCategory =
        (unit?.items &&
          unit.items[group || 0]?.types?.some(categoryIsComboExclusive)) ||
        (command &&
          unit?.command[command]?.magic?.types?.some(categoryIsComboExclusive));
      if (hasComboExculsiveCategory) {
        setComboUsedElsewhere(combosUsedElsewhere(items, list, unitId));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit, list, unitId, command]);

  useEffect(() => {
    army &&
      list &&
      unit &&
      !items &&
      fetcher({
        url: "games/the-old-world/magic-items",
        onSuccess: (data) => {
          let itemCategories = army.items;

          if (unit.magicItemsArmy) {
            itemCategories = itemCategories.filter(
              (itemCategory) => itemCategory !== army.id
            );
            if (data[unit.magicItemsArmy]) {
              itemCategories.push(unit.magicItemsArmy);
            }
          }

          const allItems = itemCategories.map((itemCategory) => {
            return {
              items: data[itemCategory],
              ...namesForSpread(nameMap[itemCategory]),
              id: itemCategory,
            };
          });

          dispatch(setItems(updateIds(allItems)));
        },
      });
  }, [army, list, unit, items, dispatch]);

  if (!unit || !army || !items) {
    if (isMobile) {
      return (
        <>
          <Header to={`/editor/${listId}/${type}/${unitId}`} />
          <Main loading />
        </>
      );
    } else {
      return (
        <>
          <Header to={`/editor/${listId}/${type}/${unitId}`} isSection />
          <Main loading />
        </>
      );
    }
  }

  const getCheckbox = ({
    isChecked,
    selectedAmount,
    magicItem,
    itemGroup,
    isConditional,
    isTypeLimitReached,
    usedElsewhereErrors,
  }) => {
    const isCommand = Boolean(
      unit && commandOptions[command]?.magic?.types.length
    );

    const max = !maxMagicPoints
      ? // No maximum of this item if there is no point max.
        undefined
      : maxAllowedOfItem(magicItem, selectedAmount, unitPointsRemaining);

    const usedElsewhereBy = usedElsewhereErrors?.map((error, index) => (
      <Fragment key={`${error.unit.id}-error-link`}>
        <Link to={error.url}>
          {getUnitName({ unit: error.unit, language })}
        </Link>
        {index !== usedElsewhereErrors.length - 1 ? ", " : ""}
      </Fragment>
    ));

    return (
      <Fragment key={`${magicItem.name_en}-${magicItem.id}`}>
        <div
          className={classNames(
            "checkbox",
            isConditional && "checkbox--conditional"
          )}
        >
          <input
            type="checkbox"
            id={`${itemGroup.id}-${magicItem.id}`}
            value={`${itemGroup.id}-${magicItem.id}`}
            onChange={(event) => handleMagicChange(event, magicItem, isCommand)}
            checked={isChecked}
            className="checkbox__input"
            disabled={
              !isChecked &&
              // Sometimes there is no limit (often for magic banners),
              // otherwise we need to check if the unit has enough points left.
              (notEnoughPointsRemaining(
                maxMagicPoints,
                magicItem,
                unitPointsRemaining
              ) ||
                isTypeLimitReached ||
                isDisallowedShield(magicItem, unit))
            }
          />
          <label
            htmlFor={`${itemGroup.id}-${magicItem.id}`}
            className="checkbox__label"
          >
            <span className="magic__label-text">
              {(magicItem[`name_${language}`] || magicItem.name_en).replace(
                / *\{[^)]*\}/g,
                ""
              )}
            </span>
            <i className="checkbox__points">
              {getPointsText({
                points: magicItem.points,
                perModelPoints: magicItem.perModelPoints,
                perUnitPoints: magicItem.perUnitPoints,
                perModel: magicItem.perModel,
              })}
            </i>
            <RuleWithIcon
              name={magicItem.name_en}
              isDark
              className="magic__rules"
            />
          </label>
        </div>
        {usedElsewhereErrors && usedElsewhereErrors.length > 0 && (
          <ErrorMessage
            key={`${magicItem.name_en}-${magicItem.id}-usedElsewhere`}
            spaceAfter
            spaceBefore={isMobile}
          >
            <span>
              <FormattedMessage
                id="misc.error.itemUsedElsewhereBy"
                values={{
                  usedby: usedElsewhereBy,
                }}
              />
            </span>
          </ErrorMessage>
        )}

        {isMultipleAllowedItem(magicItem) && isChecked && max !== 1 && (
          <NumberInput
            id={`${itemGroup.id}-${magicItem.id}-amount`}
            min={1}
            max={isTypeLimitReached ? selectedAmount : max}
            value={selectedAmount}
            onChange={(event) => {
              handleAmountChange({
                parentId: `${itemGroup.id}-${magicItem.id}`,
                event,
                isCommand,
              });
            }}
          />
        )}
      </Fragment>
    );
  };

  let unitMagicPoints = 0;
  const commandOptions = unit?.command.filter(
    (commandOption) =>
      !commandOption.armyComposition ||
      commandOption.armyComposition.includes(
        unit.army || list?.armyComposition || list?.army
      )
  );
  const hasCommandMagicItems = Boolean(
    commandOptions &&
      commandOptions[command] &&
      commandOptions[command]?.magic?.types.length
  );
  const hasMagicItems = Boolean(unit?.items?.length);

  if (hasCommandMagicItems) {
    maxMagicPoints =
      (commandOptions[command].magic.armyComposition &&
        commandOptions[command].magic.armyComposition[
          list.armyComposition || list.army
        ]?.maxPoints) ||
      commandOptions[command].magic.maxPoints;
    unitMagicPoints = getUnitMagicPoints({
      selected: commandOptions[command].magic.selected,
    });
    maxItemsPerCategory =
      (commandOptions[command].magic.armyComposition &&
        commandOptions[command].magic.armyComposition[
          list.armyComposition || list.army
        ]?.maxItemsPerCategory) ||
      commandOptions[command].magic.maxItemsPerCategory ||
      0;
  } else if (hasMagicItems) {
    maxMagicPoints =
      (unit.items[group].armyComposition &&
        unit.items[group].armyComposition[list.armyComposition || list.army]
          ?.maxPoints) ||
      unit.items[group].maxPoints;
    unitMagicPoints = getUnitMagicPoints({
      selected: unit.items[group].selected,
    });
    maxItemsPerCategory =
      (unit.items[group].armyComposition &&
        unit.items[group].armyComposition[list.armyComposition || list.army]
          ?.maxItemsPerCategory) ||
      unit.items[group].maxItemsPerCategory ||
      0;
  }

  // Backwards compatibility for runes
  if (list.army === "dwarfen-mountain-holds") {
    maxItemsPerCategory = 3;
  }

  const unitPointsRemaining = maxMagicPoints - unitMagicPoints;

  return (
    <>
      <Helmet>
        <title>{`Old World Builder | ${list?.name}`}</title>
      </Helmet>

      {isMobile && (
        <>
          <Header
            to={`/editor/${listId}/${type}/${unitId}`}
            headline={
              unit?.items?.length && !unit?.command?.length
                ? unit.items[group][`name_${language}`] ||
                  unit.items[group].name_en
                : intl.formatMessage({
                    id: "unit.magicItems",
                  })
            }
            subheadline={
              <>
                <span className="magic__header-points">
                  {unitMagicPoints}&nbsp;
                </span>
                {maxMagicPoints > 0 && `/ ${maxMagicPoints} `}
                <FormattedMessage id="app.points" />
              </>
            }
          />
          <RulesIndex />
        </>
      )}

      <MainComponent>
        {!isMobile && (
          <Header
            isSection
            to={`/editor/${listId}/${type}/${unitId}`}
            headline={
              unit?.items?.length && !unit?.command?.length
                ? unit.items[group][`name_${language}`] ||
                  unit.items[group].name_en
                : intl.formatMessage({
                    id: "unit.magicItems",
                  })
            }
            subheadline={
              <>
                <span className="magic__header-points">
                  {unitMagicPoints}&nbsp;
                </span>
                {maxMagicPoints > 0 && `/ ${maxMagicPoints} `}
                <FormattedMessage id="app.points" />
              </>
            }
          />
        )}
        {items.map((itemGroup, index) => {
          const commandMagicItems = itemGroup.items.filter(
            (item) =>
              hasCommandMagicItems &&
              commandOptions[command].magic.types.includes(item.type)
          );
          const magicItems = itemGroup.items.filter(
            (item) =>
              hasMagicItems &&
              !command &&
              unit.items[group].types.includes(item.type)
          );
          const itemGroupItems = (
            hasCommandMagicItems ? commandMagicItems : magicItems
          ).filter(
            (item) =>
              (!maxMagicPoints || item.points <= maxMagicPoints) &&
              (!item.armyComposition ||
                equalsOrIncludes(
                  item.armyComposition,
                  unit.army || list?.armyComposition || list?.army
                ))
          );

          if (itemGroupItems.length > 0) {
            prevItemType = null;
            isFirstItemType = false;
          }

          const unitSelectedItems = hasCommandMagicItems
            ? commandOptions[command].magic.selected ?? []
            : unit.items[group].selected ?? [];

          return (
            <Fragment key={itemGroup.name_de}>
              {itemGroupItems.length > 0 && (
                <h2 className="unit__subline">
                  {itemGroup[`name_${language}`] || itemGroup.name_en}
                </h2>
              )}
              {itemGroupItems.map((magicItem) => {
                if (prevItemType !== magicItem.type) {
                  prevItemType = magicItem.type;
                  isFirstItemType = true;
                } else {
                  isFirstItemType = false;
                }

                const selectedItem = unitSelectedItems.find(
                  ({ id }) => id === `${itemGroup.id}-${magicItem.id}`
                );
                let itemCountInCategory = 0;
                let masterRuneInCategory = false;
                unitSelectedItems.forEach(
                  ({ name_en, type: itemType, amount }) => {
                    if (itemType === magicItem.type) {
                      itemCountInCategory += amount ?? 1;

                      if (name_en.includes("Master")) {
                        masterRuneInCategory = true;
                      }
                    }
                  }
                );
                const selectedAmount = selectedItem?.amount ?? 1;
                const isChecked = Boolean(selectedItem);
                const isComboExclusiveCategory =
                  comboExclusiveCategories.indexOf(magicItem.type) >= 0;

                const isTypeLimitReached =
                  magicItem.nonExclusive && magicItem.type !== "chaotic-trait"
                    ? false
                    : unitSelectedItems.some(
                        (selectedItem) =>
                          (!magicItem.stackable &&
                            !selectedItem.stackable &&
                            selectedItem.type === magicItem.type &&
                            !isComboExclusiveCategory &&
                            !maxItemsPerCategory) ||
                          (!isComboExclusiveCategory &&
                            maxItemsPerCategory > 0 &&
                            itemCountInCategory >= maxItemsPerCategory) ||
                          (isComboExclusiveCategory &&
                            itemCountInCategory >= maxItemsPerCategory) ||
                          (isComboExclusiveCategory &&
                            masterRuneInCategory &&
                            magicItem.name_en.includes("Master")) ||
                          (isComboExclusiveCategory &&
                            magicItem.type === selectedItem.type &&
                            (magicItem.nonExclusive === false ||
                              selectedItem.nonExclusive === false)) // If a rune is exclusive, it can't be combined with other runes.
                      );

                const usedElsewhereErrors = usedElsewhere.filter(
                  (e) => e.itemName === magicItem.name_en
                );
                const comboUsedElsewhereErrors =
                  isFirstItemType &&
                  comboUsedElsewhere.filter(
                    (e) => e.category === magicItem.type
                  );
                const comboUsedBy =
                  comboUsedElsewhereErrors?.length > 0 &&
                  comboUsedElsewhereErrors.map((error, index) => (
                    <Fragment key={`${error.unit.id}-combo-error-link`}>
                      <Link to={error.url}>
                        {getUnitName({ unit: error.unit, language })}
                      </Link>
                      {index !== comboUsedElsewhereErrors.length - 1
                        ? ", "
                        : ""}
                    </Fragment>
                  ));

                return (
                  <Fragment key={`${magicItem.name_en}${magicItem.id}`}>
                    {isFirstItemType && (
                      <>
                        <h3 className="magic__type">
                          <span>
                            {nameMap[magicItem.type][`name_${language}`] ||
                              nameMap[magicItem.type].name_en}
                          </span>
                          {maxItemsPerCategory > 0 && (
                            <i className="magic__item-count">{`${itemCountInCategory}/${maxItemsPerCategory}`}</i>
                          )}
                        </h3>
                        {comboUsedBy && (
                          <ErrorMessage
                            key={`${magicItem.name_en}-${magicItem.id}-usedElsewhere`}
                          >
                            <span>
                              <FormattedMessage
                                id="misc.error.itemComboUsedElsewhereBy"
                                values={{
                                  usedby: comboUsedBy,
                                }}
                              />
                            </span>
                          </ErrorMessage>
                        )}
                      </>
                    )}
                    {getCheckbox({
                      magicItem,
                      itemGroup,
                      selectedAmount,
                      isChecked,
                      isTypeLimitReached,
                      usedElsewhereErrors,
                    })}
                    {getUnitOptionNotes({
                      notes: magicItem.notes,
                      key: `magic-${index}-note`,
                      className: "unit__option-note",
                      language,
                    })}

                    {magicItem.conditional && isChecked
                      ? magicItem.conditional.map((conditionalItem) =>
                          getCheckbox({
                            magicItem: conditionalItem,
                            itemGroup,
                            selectedAmount,
                            isChecked,
                            isConditional: true,
                            isTypeLimitReached,
                            usedElsewhereErrors,
                          })
                        )
                      : null}
                  </Fragment>
                );
              })}
            </Fragment>
          );
        })}
      </MainComponent>
    </>
  );
};
