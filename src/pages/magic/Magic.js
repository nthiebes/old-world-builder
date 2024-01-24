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

  const getCheckbox = ({ unit, magicItem, itemGroup, isConditional }) => {
    let isChecked = false;
    let isCommand = false;
    let amount;

    if (
      unit?.command &&
      unit.command[command] &&
      unit.command[command]?.magic?.types.length
    ) {
      const selectedItem = (unit.command[command].magic.selected || []).find(
        ({ id }) => id === `${itemGroup.id}-${magicItem.id}`
      );
      isChecked = Boolean(selectedItem);
      isCommand = true;
      amount = selectedItem?.amount || 1;
    } else if (unit?.items?.length) {
      const selectedItem = unit.items[group].selected.find(
        ({ id }) => id === `${itemGroup.id}-${magicItem.id}`
      );
      isChecked = Boolean(selectedItem);
      amount = selectedItem?.amount || 1;
    }

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
        {magicItem.stackable && isChecked && (
          <NumberInput
            id={`${itemGroup.id}-${magicItem.id}-amount`}
            min={1}
            max={magicItem.maximum}
            value={amount}
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

  const getRadio = ({ unit, magicItem, itemGroup }) => {
    let isChecked = false;
    let isCommand = false;

    if (
      unit?.command &&
      unit.command[command] &&
      unit.command[command]?.magic?.types.length
    ) {
      isChecked =
        (unit.command[command].magic.selected || []).find(
          ({ id }) => id === `${itemGroup.id}-${magicItem.id}`
        ) || false;
      isCommand = true;
    } else if (unit?.items?.length) {
      isChecked =
        unit.items[group].selected.find(
          ({ id }) => id === `${itemGroup.id}-${magicItem.id}`
        ) || false;
    }

    return (
      <div className="radio" key={magicItem.id}>
        <input
          type="radio"
          id={`${itemGroup.id}-${magicItem.id}`}
          value={`${itemGroup.id}-${magicItem.id}`}
          onChange={(event) => handleMagicChange(event, magicItem, isCommand)}
          checked={isChecked}
          name={itemGroup.id}
          className="radio__input"
        />
        <label
          htmlFor={`${itemGroup.id}-${magicItem.id}`}
          className="radio__label"
        >
          {magicItem[`name_${language}`] || magicItem.name_en}
          <i className="checkbox__points">{`${
            magicItem.points
          } ${intl.formatMessage({
            id: "app.points",
          })}`}</i>
        </label>
      </div>
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
              item?.armyComposition === list?.armyComposition ||
              !item.armyComposition
          );

          if (itemGroupItems.length > 0) {
            prevItemType = null;
            isFirstItemType = false;
          }

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

                let isChecked = false,
                  mutuallyExclusive = false;

                if (hasCommandMagicItems) {
                  isChecked =
                    (unit.command[command].magic.selected || []).find(
                      ({ id }) => id === `${itemGroup.id}-${magicItem.id}`
                    ) || false;
                  mutuallyExclusive =
                    unit.command[command].magic.mutuallyExclusive;
                } else if (hasMagicItems) {
                  isChecked =
                    unit.items[group].selected.find(
                      ({ id }) => id === `${itemGroup.id}-${magicItem.id}`
                    ) || false;
                  mutuallyExclusive = unit.items[group].mutuallyExclusive;
                }

                return (
                  <Fragment key={magicItem.name_de}>
                    {isFirstItemType && (
                      <h3 className="magic__type">
                        {nameMap[magicItem.type][`name_${language}`] ||
                          nameMap[magicItem.type].name_en}
                      </h3>
                    )}
                    {mutuallyExclusive
                      ? getRadio({ unit, magicItem, itemGroup })
                      : getCheckbox({ unit, magicItem, itemGroup })}
                    {magicItem.conditional && isChecked
                      ? magicItem.conditional.map((conditionalItem) =>
                          getCheckbox({
                            unit,
                            magicItem: conditionalItem,
                            itemGroup,
                            isConditional: true,
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
