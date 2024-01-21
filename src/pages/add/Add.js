import { useState, useEffect, Fragment } from "react";
import { useParams, useLocation, Redirect } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useIntl } from "react-intl";
import { Helmet } from "react-helmet-async";

import { fetcher } from "../../utils/fetcher";
import { List } from "../../components/list";
import { Header, Main } from "../../components/page";
import { addUnit } from "../../state/lists";
import { setArmy } from "../../state/army";
import { getRandomId } from "../../utils/id";
import { useLanguage } from "../../utils/useLanguage";
import { updateIds } from "../../utils/id";

const getArmyData = ({ data, armyComposition }) => {
  // Remove units that don't belong to the army composition
  const characters = data.characters.filter(
    (unit) =>
      unit?.armyComposition?.list === armyComposition || !unit.armyComposition
  );
  const core = data.core.filter(
    (unit) =>
      unit?.armyComposition?.list === armyComposition || !unit.armyComposition
  );
  const special = data.special.filter(
    (unit) =>
      unit?.armyComposition?.list === armyComposition || !unit.armyComposition
  );
  const rare = data.rare.filter(
    (unit) =>
      unit?.armyComposition?.list === armyComposition || !unit.armyComposition
  );

  // Get units moving category
  const specialToCore = special.filter(
    (unit) => unit?.armyComposition?.category === "core"
  );
  const rareToCore = rare.filter(
    (unit) => unit?.armyComposition?.category === "rare"
  );
  const rareToSpecial = rare.filter(
    (unit) => unit?.armyComposition?.category === "special"
  );

  // Remove units from old category
  const allCore = [...core, ...specialToCore, ...rareToCore].filter(
    (unit) =>
      unit?.armyComposition?.category === "core" || !unit.armyComposition
  );
  const allSpecial = [...special, ...rareToSpecial].filter(
    (unit) =>
      unit?.armyComposition?.category === "special" || !unit.armyComposition
  );
  const allRare = rare.filter(
    (unit) =>
      unit?.armyComposition?.category === "rare" || !unit.armyComposition
  );

  return {
    lords: updateIds(data.lords),
    heroes: updateIds(data.heroes),
    characters: updateIds(characters),
    core: updateIds(allCore),
    special: updateIds(allSpecial),
    rare: updateIds(allRare),
    mercenaries: updateIds(data.mercenaries),
    allies: updateIds(data.allies),
  };
};

export const Add = ({ isMobile }) => {
  const MainComponent = isMobile ? Main : Fragment;
  const { listId, type } = useParams();
  const dispatch = useDispatch();
  const [redirect, setRedirect] = useState(null);
  const intl = useIntl();
  const location = useLocation();
  const { language } = useLanguage();
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
      !army &&
      fetcher({
        url: `games/${list.game}/${list.army}`,
        onSuccess: (data) => {
          const armyData = getArmyData({
            data,
            armyComposition: list.armyComposition || list.army,
          });

          dispatch(setArmy(armyData));
        },
      });
  }, [list, army, dispatch]);

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
      <Helmet>
        <title>{`Old World Builder | ${list?.name}`}</title>
      </Helmet>

      {isMobile && (
        <Header
          to={`/editor/${listId}`}
          headline={intl.formatMessage({
            id: "add.title",
          })}
        />
      )}

      <MainComponent>
        {!isMobile && (
          <Header
            isSection
            to={`/editor/${listId}`}
            headline={intl.formatMessage({
              id: "add.title",
            })}
          />
        )}
        <ul>
          {army[type].map(({ id, minimum, points, name_en, ...army }) => (
            <List key={id} onClick={() => handleAdd(id)}>
              <span className="unit__name">
                {minimum ? `${minimum} ` : null}
                <b>{army[`name_${language}`] || name_en}</b>
              </span>
              <i className="unit__points">{`${
                minimum ? points * minimum : points
              } ${intl.formatMessage({
                id: "app.points",
              })}`}</i>
            </List>
          ))}
        </ul>
      </MainComponent>
    </>
  );
};
