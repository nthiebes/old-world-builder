import { Fragment, useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";

import { getUnitMagicPoints } from "../../utils/points";
import { fetcher } from "../../utils/fetcher";
import { Header, Main } from "../../components/page";
import { setItems } from "../../state/items";
import { editUnit } from "../../state/lists";
import gameSystems from "../../assets/armies.json";

import "./Magic.css";

export const nameMap = {
  greenskins: {
    name_de: "Glitzakram",
  },
  "the-empire": {
    name_de: "Magische Erbstücke",
  },
  heirlooms: {
    name_de: "Erbstücke",
    name_en: "Ancestral Heirlooms",
  },
  dwarfs: {
    name_de: "Zwergenrunen",
    name_en: "Runic Items",
  },
  general: {
    name_de: "Magische Gegenstände",
  },
  weapon: {
    name_de: "Magische Waffen",
  },
  armor: {
    name_de: "Magische Rüstungen",
  },
  talisman: {
    name_de: "Talismane",
  },
  banner: {
    name_de: "Magische Standarten",
  },
  artifact: {
    name_de: "Arkane Artifakte",
  },
  "enchanted-item": {
    name_de: "Verzauberte Gegenstände",
  },
  "weapon-runes": {
    name_de: "Waffenrunen",
    name_en: "Weapon Runes",
  },
  "armour-runes": {
    name_de: "Rüstungsrunen",
    name_en: "Armour Runes",
  },
  "banner-runes": {
    name_de: "Standartenrunen",
    name_en: "Banner Runes",
  },
  "talismanic-runes": {
    name_de: "Talismanrunen",
    name_en: "Talismanic Runes",
  },
  "engineering-runes": {
    name_de: "Maschinenrunen",
    name_en: "Engineering Runes",
  },
};
let prevItemType, isFirstItemType;

const updateIds = (items) => {
  return items.map((item) => ({
    ...item,
    items: item.items.map((bla, index) => ({
      ...bla,
      id: index,
    })),
  }));
};

export const Magic = ({ isMobile }) => {
  const MainComponent = isMobile ? Main : Fragment;
  const location = useLocation();
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
              name_de: nameMap[item].name_de,
              id: item,
            };
          });

          dispatch(setItems(updateIds(allItems)));
          setIsLoading(false);
        },
      });
  }, [army, dispatch, list, setIsLoading, unit]);

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

  return (
    <>
      {isMobile && (
        <Header
          to={`/editor/${listId}/${type}/${unitId}`}
          headline="Magische Gegenstände"
          subheadline={`${getUnitMagicPoints(unit)} / ${
            unit.magic.maxPoints
          } Pkte.`}
          hasPointsError={getUnitMagicPoints(unit) > unit.magic.maxPoints}
        />
      )}

      <MainComponent>
        {!isMobile && (
          <Header
            isSection
            to={`/editor/${listId}/${type}/${unitId}`}
            headline="Magische Gegenstände"
            subheadline={`${getUnitMagicPoints(unit)} / ${
              unit.magic.maxPoints
            } Pkte.`}
            hasPointsError={getUnitMagicPoints(unit) > unit.magic.maxPoints}
          />
        )}
        {items.map((item) => (
          <Fragment key={item.name_de}>
            <h2 className="unit__subline">{item.name_de}</h2>
            {item.items.map((magicItem) => {
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

              return (
                <Fragment key={magicItem.name_de}>
                  {isFirstItemType && (
                    <h3 className="magic__type">
                      {nameMap[magicItem.type].name_de}
                    </h3>
                  )}
                  <div className="checkbox" key={magicItem.id}>
                    <input
                      type="checkbox"
                      id={`${item.id}-${magicItem.id}`}
                      value={`${item.id}-${magicItem.id}`}
                      onChange={(event) => handleMagicChange(event, magicItem)}
                      checked={
                        unit?.magic?.items
                          ? unit.magic.items.find(
                              ({ id }) => id === `${item.id}-${magicItem.id}`
                            ) || false
                          : false
                      }
                      className="checkbox__input"
                    />
                    <label
                      htmlFor={`${item.id}-${magicItem.id}`}
                      className="checkbox__label"
                    >
                      {magicItem.name_de}
                      <i className="checkbox__points">{`${magicItem.points} Pkte.`}</i>
                    </label>
                  </div>
                </Fragment>
              );
            })}
          </Fragment>
        ))}
      </MainComponent>
    </>
  );
};
