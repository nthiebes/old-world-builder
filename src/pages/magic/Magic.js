import { Fragment, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FormattedMessage, useIntl } from "react-intl";
import classNames from "classnames";
import { Helmet } from "react-helmet-async";

import { getUnitMagicPoints } from "../../utils/points";
import { fetcher } from "../../utils/fetcher";
import { Header, Main } from "../../components/page";
import { NumberInput } from "../../components/number-input";
import { Button } from "../../components/button";
import { RulesIndex, rulesMap } from "../../components/rules-index";
import { setItems } from "../../state/items";
import { editUnit } from "../../state/lists";
import { openRulesIndex } from "../../state/rules-index";
import { useLanguage } from "../../utils/useLanguage";
import { updateLocalList } from "../../utils/list";
import { normalizeRuleName } from "../../utils/string";
import gameSystems from "../../assets/armies.json";
import {
  isMultipleAllowedItem,
  maxAllowedOfItem,
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
  const army =
    list &&
    gameSystems
      .find(({ id }) => id === list.game)
      .armies.find(({ id }) => armyId === id);
  const items = useSelector((state) => state.items);
  let maxMagicPoints = 0;
  const handleRulesClick = ({ name }) => {
    dispatch(openRulesIndex({ activeRule: name }));
  };
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
            ...(unit.command[command].magic.selected || []),
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
        magicItems = unit.command[command].magic.selected.filter(
          ({ id }) => id !== event.target.value
        );
      } else {
        magicItems = unit.items[group].selected.filter(
          ({ id }) => id !== event.target.value
        );
      }
    }

    if (isCommand) {
      const newCommand = unit.command.map((entry, entryIndex) =>
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
      magicItems = (unit.command[command].magic.selected || []).map((item) =>
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
      const newCommand = unit.command.map((entry, entryIndex) =>
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
    army &&
      list &&
      unit &&
      !items &&
      fetcher({
        url: `games/${list.game}/magic-items`,
        onSuccess: (data) => {
          let itemCategories = army.items;

          if (unit.magicItemsArmy) {
            itemCategories = itemCategories.filter(
              (itemCategory) => itemCategory !== army.id
            );
            itemCategories.push(unit.magicItemsArmy);
          }

          const allItems = itemCategories.map((itemCategory) => {
            return {
              items: data[itemCategory],
              name_de: nameMap[itemCategory].name_de,
              name_en: nameMap[itemCategory].name_en,
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
  }) => {
    const isCommand = Boolean(unit?.command[command]?.magic?.types.length);

    const max = !maxMagicPoints
      ? // No maximum of this item if there is no point max.
        undefined
      : maxAllowedOfItem(magicItem, selectedAmount, unitPointsRemaining);

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
              ((maxMagicPoints && magicItem.points > unitPointsRemaining) ||
                isTypeLimitReached)
            }
          />
          <label
            htmlFor={`${itemGroup.id}-${magicItem.id}`}
            className="checkbox__label"
          >
            <span className="magic__label-text">
              {magicItem[`name_${language}`] || magicItem.name_en}
            </span>
            <i className="checkbox__points">
              {magicItem.points === 0
                ? intl.formatMessage({
                    id: "app.free",
                  })
                : `${magicItem.points} ${intl.formatMessage({
                    id: "app.points",
                  })}`}
            </i>
            {rulesMap[normalizeRuleName(magicItem.name_en)] ? (
              <Button
                type="text"
                className="magic__rules"
                color="dark"
                label={intl.formatMessage({ id: "misc.showRules" })}
                icon="preview"
                onClick={() =>
                  handleRulesClick({
                    name: magicItem.name_en,
                  })
                }
              />
            ) : null}
          </label>
        </div>

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
  const hasCommandMagicItems = Boolean(
    unit?.command &&
      unit.command[command] &&
      unit.command[command]?.magic?.types.length
  );
  const hasMagicItems = Boolean(unit?.items?.length);

  if (hasCommandMagicItems) {
    maxMagicPoints =
      (unit.command[command].magic.armyComposition &&
        unit.command[command].magic.armyComposition[
          list.armyComposition || list.army
        ]?.maxPoints) ||
      unit.command[command].magic.maxPoints;
    unitMagicPoints = getUnitMagicPoints({
      selected: unit.command[command].magic.selected,
    });
  } else if (hasMagicItems) {
    maxMagicPoints =
      (unit.items[group].armyComposition &&
        unit.items[group].armyComposition[list.armyComposition || list.army]
          ?.maxPoints) ||
      unit.items[group].maxPoints;
    unitMagicPoints = getUnitMagicPoints({
      selected: unit.items[group].selected,
    });
  }

  const unitPointsRemaining = maxMagicPoints - unitMagicPoints;

  return (
    <>
      <Helmet>
        <title>{`Warhammer Fantasy Builder | ${list?.name}`}</title>
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
        {items.map((itemGroup) => {
          const commandMagicItems = itemGroup.items.filter(
            (item) =>
              hasCommandMagicItems &&
              unit.command[command].magic.types.includes(item.type)
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
              (item?.armyComposition === list?.armyComposition ||
                !item.armyComposition ||
                (item?.armyComposition &&
                  item.armyComposition.length > 0 &&
                  item.armyComposition.includes(
                    list?.armyComposition || list?.army
                  )))
          );

          if (itemGroupItems.length > 0) {
            prevItemType = null;
            isFirstItemType = false;
          }

          const unitSelectedItems = hasCommandMagicItems
            ? unit.command[command].magic.selected ?? []
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
                let runesAmountInCategory = 0;
                let masterRuneInCategory = false;

                unitSelectedItems.forEach(
                  ({ name_en, type: itemType, amount }) => {
                    if (itemType === magicItem.type) {
                      runesAmountInCategory += amount ?? 1;

                      if (name_en.includes("Master")) {
                        masterRuneInCategory = true;
                      }
                    }
                  }
                );
                const selectedAmount = selectedItem?.amount ?? 1;
                const isChecked = Boolean(selectedItem);
                const isRune = Boolean(magicItem.type.includes("runes"));
                const isTypeLimitReached = magicItem.nonExclusive
                  ? false
                  : unitSelectedItems.some(
                      (selectedItem) =>
                        (!magicItem.stackable &&
                          !selectedItem.stackable &&
                          selectedItem.type === magicItem.type &&
                          !isRune) ||
                        (isRune && runesAmountInCategory >= 3) ||
                        (isRune &&
                          masterRuneInCategory &&
                          magicItem.name_en.includes("Master")) ||
                        (isRune &&
                          magicItem.type === selectedItem.type &&
                          (magicItem.nonExclusive === false ||
                            selectedItem.nonExclusive === false)) // If the rune is exclusive, it can't be combined with other runes.
                    );

                return (
                  <Fragment key={`${magicItem.name_en}${magicItem.id}`}>
                    {isFirstItemType && (
                      <h3 className="magic__type">
                        {nameMap[magicItem.type][`name_${language}`] ||
                          nameMap[magicItem.type].name_en}
                      </h3>
                    )}
                    {getCheckbox({
                      magicItem,
                      itemGroup,
                      selectedAmount,
                      isChecked,
                      isTypeLimitReached,
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
