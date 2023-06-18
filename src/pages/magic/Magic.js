import { Fragment, useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useIntl } from "react-intl";
import classNames from "classnames";

import { getUnitMagicPoints } from "../../utils/points";
import { fetcher } from "../../utils/fetcher";
import { Header, Main } from "../../components/page";
import { setItems } from "../../state/items";
import { editUnit } from "../../state/lists";
import { useLanguage } from "../../utils/useLanguage";
import gameSystems from "../../assets/armies.json";

import "./Magic.css";
import { nameMap } from "./name-map";

let prevItemType, isFirstItemType;

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
  const MainComponent = isMobile ? Main : Fragment;
  const location = useLocation();
  const { language } = useLanguage();
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState(true);
  const { listId, type, unitId, command } = useParams();
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
  const handleMagicChange = (event, magicItem) => {
    let magicItems;

    if (event.target.checked) {
      magicItems = [
        ...(unit?.magic?.items || []),
        {
          ...magicItem,
          command: Number(command),
          id: event.target.value,
        },
      ];
    } else {
      magicItems = unit.magic.items.filter(
        ({ id }) => id !== event.target.value
      );
    }

    dispatch(
      editUnit({
        listId,
        type,
        unitId,
        magic: {
          ...unit.magic,
          items: magicItems,
        },
      })
    );
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    army &&
      fetcher({
        url: `games/${list.game}/magic-items`,
        onSuccess: (data) => {
          const allItems = army.items.map((item) => {
            return {
              items: data[item],
              name_de: nameMap[item][`name_${language}`],
              id: item,
            };
          });

          dispatch(setItems(updateIds(allItems)));
          setIsLoading(false);
        },
      });
  }, [army, dispatch, list, setIsLoading, unit, language]);

  if (isLoading) {
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
    const isChecked = unit?.magic?.items
      ? unit.magic.items.find(
          ({ id }) => id === `${itemGroup.id}-${magicItem.id}`
        ) || false
      : false;

    return (
      <div
        className={classNames(
          "checkbox",
          isConditional && "checkbox--conditional"
        )}
        key={magicItem.id}
      >
        <input
          type="checkbox"
          id={`${itemGroup.id}-${magicItem.id}`}
          value={`${itemGroup.id}-${magicItem.id}`}
          onChange={(event) => handleMagicChange(event, magicItem)}
          checked={isChecked}
          className="checkbox__input"
        />
        <label
          htmlFor={`${itemGroup.id}-${magicItem.id}`}
          className="checkbox__label"
        >
          {magicItem.name_de}
          <i className="checkbox__points">{`${
            magicItem.points
          } ${intl.formatMessage({
            id: "app.points",
          })}`}</i>
        </label>
      </div>
    );
  };

  return (
    <>
      {isMobile && (
        <Header
          to={`/editor/${listId}/${type}/${unitId}`}
          headline={intl.formatMessage({
            id: "unit.magicItems",
          })}
          subheadline={`${getUnitMagicPoints(unit)} / ${
            unit.magic.maxPoints
          } ${intl.formatMessage({
            id: "app.points",
          })}`}
          hasPointsError={getUnitMagicPoints(unit) > unit.magic.maxPoints}
        />
      )}

      <MainComponent>
        {!isMobile && (
          <Header
            isSection
            to={`/editor/${listId}/${type}/${unitId}`}
            headline={intl.formatMessage({
              id: "unit.magicItems",
            })}
            subheadline={`${getUnitMagicPoints(unit)} / ${
              unit.magic.maxPoints
            } ${intl.formatMessage({
              id: "app.points",
            })}`}
            hasPointsError={getUnitMagicPoints(unit) > unit.magic.maxPoints}
          />
        )}
        {items.map((itemGroup) => (
          <Fragment key={itemGroup.name_de}>
            <h2 className="unit__subline">{itemGroup.name_de}</h2>
            {itemGroup.items.map((magicItem) => {
              if (prevItemType !== magicItem.type) {
                prevItemType = magicItem.type;
                isFirstItemType = true;
              } else {
                isFirstItemType = false;
              }

              // Filter command magic items
              if (
                unit?.command &&
                unit?.command[command] &&
                !unit.command[command].magic.types.includes(magicItem.type)
              ) {
                return null;
              }

              // Filter magic items
              if (
                unit?.magic?.types &&
                !unit.magic.types.includes(magicItem.type)
              ) {
                return null;
              }

              const isChecked = unit?.magic?.items
                ? unit.magic.items.find(
                    ({ id }) => id === `${itemGroup.id}-${magicItem.id}`
                  ) || false
                : false;

              return (
                <Fragment key={magicItem.name_de}>
                  {isFirstItemType && (
                    <h3 className="magic__type">
                      {nameMap[magicItem.type][`name_${language}`]}
                    </h3>
                  )}
                  {getCheckbox({ unit, magicItem, itemGroup })}
                  {magicItem.conditional && isChecked
                    ? magicItem.conditional.map((confitionalItem) =>
                        getCheckbox({
                          unit,
                          magicItem: confitionalItem,
                          itemGroup,
                          isConditional: true,
                        })
                      )
                    : null}
                </Fragment>
              );
            })}
          </Fragment>
        ))}
      </MainComponent>
    </>
  );
};
