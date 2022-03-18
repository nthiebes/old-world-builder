import { useState, useEffect, Fragment } from "react";
import { useParams, useLocation, Redirect } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";

import { fetcher } from "../../utils/fetcher";
import { List } from "../../components/list";
import { Header, Main } from "../../components/page";
import { addUnit } from "../../state/lists";
import { setArmy } from "../../state/army";
import { getRandomId } from "../../utils/id";

const updateIds = (type) => {
  return type.map((unit) => {
    return {
      ...unit,
      command: unit.command
        ? unit.command.map((commandData, index) => ({
            ...commandData,
            id: index,
          }))
        : null,
      equipment: unit.equipment
        ? unit.equipment.map((equipmentData, index) => ({
            ...equipmentData,
            id: index,
          }))
        : null,
      mounts: unit.mounts
        ? unit.mounts.map((mountsData, index) => ({
            ...mountsData,
            id: index,
          }))
        : null,
      options: unit.options
        ? unit.options.map((optionsData, index) => ({
            ...optionsData,
            id: index,
          }))
        : null,
    };
  });
};

export const Add = ({ isMobile }) => {
  const MainComponent = isMobile ? Main : Fragment;
  const { listId, type } = useParams();
  const dispatch = useDispatch();
  const [redirect, setRedirect] = useState(null);
  const location = useLocation();
  const list = useSelector((state) =>
    state.lists.find(({ id }) => listId === id)
  );
  const army = useSelector((state) => state.army);
  const handleAdd = (unitId) => {
    const unit = {
      ...army[type].find(({ id }) => unitId === id),
      id: `${unitId}.${getRandomId()}`,
    };

    dispatch(addUnit({ listId, type, unit }));
    setRedirect(unit);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    list &&
      fetcher({
        url: `games/${list.game}/${list.army}`,
        onSuccess: (data) => {
          dispatch(
            setArmy({
              lords: updateIds(data.lords),
              heroes: updateIds(data.heroes),
              core: updateIds(data.core),
              special: updateIds(data.special),
              rare: updateIds(data.rare),
            })
          );
        },
      });
  }, [list, dispatch]);

  if (redirect) {
    return <Redirect to={`/editor/${listId}/${type}/${redirect.id}`} />;
  }

  if (!army) {
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
      {isMobile && (
        <Header to={`/editor/${listId}`} headline="Einheit auswählen" />
      )}

      <MainComponent>
        {!isMobile && (
          <Header
            isSection
            to={`/editor/${listId}`}
            headline="Einheit auswählen"
          />
        )}
        <ul>
          {army[type].map(({ name_de, id, minimum, points }) => (
            <List key={id} onClick={() => handleAdd(id)}>
              <span className="unit__name">
                {minimum && `${minimum} `}
                <b>{name_de}</b>
              </span>
              <i className="unit__points">{`${
                minimum ? points * minimum : points
              } Pkte.`}</i>
            </List>
          ))}
        </ul>
      </MainComponent>
    </>
  );
};
