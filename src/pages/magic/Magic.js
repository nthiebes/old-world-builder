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
import { setItems } from "../../state/items";
import { editUnit } from "../../state/lists";
import { useLanguage } from "../../utils/useLanguage";
import { updateLocalList } from "../../utils/list";
import gameSystems from "../../assets/armies.json";

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
  const army =
    list &&
    gameSystems
      .find(({ id }) => id === list.game)
      .armies.find(({ id }) => list.army === id);
  const items = useSelector((state) => state.items);
  const units = list ? list[type] : null;
  const unit = units && units.find(({ id }) => id === unitId);
  let maxMagicPoints = 0;
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    list && updateLocalList(list);
  }, [list]);

  useEffect(() => {
    army &&
      list &&
      !items &&
      fetcher({
        url: `games/${list.game}/magic-items`,
        onSuccess: (data) => {
          const allItems = army.items.map((item) => {
            return {
              items: data[item],
              name_de: nameMap[item].name_de,
              name_en: nameMap[item].name_en,
              id: item,
            };
          });

          dispatch(setItems(updateIds(allItems)));
        },
      });
  }, [army, list, items, dispatch]);

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
    const isCommand = Boolean(unit?.command[command]);

    // If an item is stackable, we need to check how many of the item are already selected.
    const allowedMaxOfStackableItem = Math.min(
      magicItem.maximum ?? Infinity,
      Math.floor(unitPointsRemaining / magicItem.points) + selectedAmount
    );

    return (
      <Fragment key={magicItem.id}>
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
            {magicItem[`name_${language}`] || magicItem.name_en}
            <i className="checkbox__points">{`${
              magicItem.points
            } ${intl.formatMessage({
              id: "app.points",
            })}`}</i>
          </label>
        </div>

        {magicItem.stackable &&
          isChecked &&
          allowedMaxOfStackableItem > 1 &&
          ["arcane-item", "enchanted-item"].includes(magicItem.type) && (
            <NumberInput
              id={`${itemGroup.id}-${magicItem.id}-amount`}
              min={1}
              max={allowedMaxOfStackableItem}
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

  let hasPointsError = false;
  let unitMagicPoints = 0;
  const hasCommandMagicItems = Boolean(
    unit?.command &&
      unit.command[command] &&
      unit.command[command]?.magic?.types.length
  );
  const hasMagicItems = Boolean(unit?.items?.length);

  if (hasCommandMagicItems) {
    maxMagicPoints = unit.command[command].magic.maxPoints;
    unitMagicPoints = getUnitMagicPoints({
      selected: unit.command[command].magic.selected,
    });
    hasPointsError = unitMagicPoints > maxMagicPoints && maxMagicPoints > 0;
  } else if (hasMagicItems) {
    maxMagicPoints = unit.items[group].maxPoints;
    unitMagicPoints = getUnitMagicPoints({
      selected: unit.items[group].selected,
    });
    hasPointsError = unitMagicPoints > maxMagicPoints && maxMagicPoints > 0;
  }

  const unitPointsRemaining = maxMagicPoints - unitMagicPoints;

  return (
    <>
      <Helmet>
        <title>{`Old World Builder | ${list?.name}`}</title>
      </Helmet>

      {isMobile && (
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
              <span
                className={classNames(
                  "magic__header-points",
                  hasPointsError && "magic__header-points--error"
                )}
              >
                {`${unitMagicPoints}`}&nbsp;
              </span>
              {maxMagicPoints > 0 && `/ ${maxMagicPoints} `}
              <FormattedMessage id="app.points" />
            </>
          }
          hasPointsError={hasPointsError}
        />
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
                <span
                  className={classNames(
                    "magic__header-points",
                    hasPointsError && "magic__header-points--error"
                  )}
                >
                  {`${unitMagicPoints}`}&nbsp;
                </span>
                {maxMagicPoints > 0 && `/ ${maxMagicPoints} `}
                <FormattedMessage id="app.points" />
              </>
            }
            hasPointsError={hasPointsError}
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
                !item.armyComposition)
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

                const isChecked = Boolean(selectedItem);

                const isTypeLimitReached = unitSelectedItems.some(
                  (item) => !magicItem.stackable && item.type === magicItem.type
                );

                return (
                  <Fragment key={magicItem.name_de}>
                    {isFirstItemType && (
                      <h3 className="magic__type">
                        {nameMap[magicItem.type][`name_${language}`] ||
                          nameMap[magicItem.type].name_en}
                      </h3>
                    )}
                    {getCheckbox({
                      magicItem,
                      itemGroup,
                      selectedAmount: selectedItem
                        ? selectedItem.amount ?? 1
                        : undefined,
                      isChecked,
                      isTypeLimitReached,
                    })}

                    {magicItem.conditional && isChecked
                      ? magicItem.conditional.map((conditionalItem) =>
                          getCheckbox({
                            magicItem: conditionalItem,
                            itemGroup,
                            selectedAmount: selectedItem?.amount,
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
