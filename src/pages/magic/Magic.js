import { Fragment, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";

import { fetcher } from "../../utils/fetcher";
import { Header, Main } from "../../components/page";
import { setItems } from "../../state/items";
import { editUnit } from "../../state/lists";
import gameSystems from "../../data/armies.json";

import "./Magic.css";

const nameMap = {
  greenskins: {
    name_de: "Glitzakram",
  },
  general: {
    name_de: "Magische Gegenstände",
  },
};

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
  const { listId, type, unitId } = useParams();
  const dispatch = useDispatch();
  const list = useSelector((state) =>
    state.lists.find(({ id }) => listId === id)
  );
  const army =
    list &&
    gameSystems.find(({ id }) => id === list.game).armies.find(() => list.army);
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
      !items &&
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
        },
      });
  }, [army, dispatch, list, items]);

  if (!items || !unit) {
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
        />
      )}

      <MainComponent>
        {!isMobile && (
          <Header
            isSection
            to={`/editor/${listId}/${type}/${unitId}`}
            headline="Magische Gegenstände"
          />
        )}
        {items.map((item) => (
          <Fragment key={item.name_de}>
            <h2 className="unit__subline">{item.name_de}</h2>
            {item.items.map((magicItem) => (
              <div className="checkbox" key={magicItem.id}>
                <input
                  type="checkbox"
                  id={`${item.id}-${magicItem.id}`}
                  value={`${item.id}-${magicItem.id}`}
                  onChange={(event) => handleMagicChange(event, magicItem)}
                  defaultChecked={
                    unit?.magic?.items
                      ? unit.magic.items.find(
                          ({ id }) => id === `${item.id}-${magicItem.id}`
                        )
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
            ))}
          </Fragment>
        ))}
      </MainComponent>
    </>
  );
};
