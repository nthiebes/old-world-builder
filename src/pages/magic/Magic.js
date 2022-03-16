import { Fragment, useEffect } from "react";
import { useParams } from "react-router-dom";
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
  const { listId, type, unitId } = useParams();
  const dispatch = useDispatch();
  const list = useSelector((state) =>
    state.lists.find(({ id }) => listId === id)
  );
  const army =
    list &&
    gameSystems
      .find(({ id }) => id === list.game)
      .armies.find(({ id }) => list.army);
  const items = useSelector((state) => state.items);

  const handleMagicChange = (blubb) => {
    const magic = items.map((item) => ({
      ...item,
      items: item.items.map((bla) => {
        if (bla.id === blubb.id && bla.name_de === blubb.name_de) {
          return {
            ...bla,
            active: bla.active ? false : true,
          };
        }
        return bla;
      }),
    }));

    // dispatch(
    //   editUnit({
    //     listId,
    //     type,
    //     unitId,
    //     magic,
    //   })
    // );
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [unitId]);

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
        },
      });
  }, [army, dispatch, list]);

  if (!items) {
    return (
      <>
        <Header
          headline="Magische Gegenstände"
          to={`/editor/${listId}/${type}/${unitId}`}
        />
        <Main></Main>
      </>
    );
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
            {item.items.map((bla) => (
              <div className="checkbox" key={bla.id}>
                <input
                  type="checkbox"
                  id={`${item.id}-${bla.id}`}
                  value={bla.id}
                  onChange={() => handleMagicChange(bla)}
                  defaultChecked={bla.active}
                  className="checkbox__input"
                />
                <label
                  htmlFor={`${item.id}-${bla.id}`}
                  className="checkbox__label"
                >
                  {bla.name_de}
                  <i className="checkbox__points">{`${bla.points} Pkte.`}</i>
                </label>
              </div>
            ))}
          </Fragment>
        ))}
      </MainComponent>
    </>
  );
};
