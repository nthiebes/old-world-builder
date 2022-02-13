import { useEffect, useState } from "react";
import { useParams, Redirect } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { getMaxPercentData, getMinPercentData } from "../../utils/rules";
import { getUnitPoints } from "../../utils/points";
import { Button } from "../../components/button";
import { Icon } from "../../components/icon";
import { List } from "../../components/list";
import { Header, Main } from "../../components/page";
import { deleteList } from "../../state/lists";

import "./Editor.css";

const updateList = (updatedList) => {
  const localLists = JSON.parse(localStorage.getItem("lists"));
  const updatedLists = localLists.map((list) => {
    if (list.id === updatedList.id) {
      return updatedList;
    } else {
      return list;
    }
  });

  localStorage.setItem("lists", JSON.stringify(updatedLists));
};
const removeList = (listId) => {
  const localLists = JSON.parse(localStorage.getItem("lists"));
  const updatedLists = localLists.filter(({ id }) => listId !== id);

  localStorage.setItem("lists", JSON.stringify(updatedLists));
};
const getAllOptions = ({ mounts, equipment, options, command }) => {
  const allMounts = mounts
    ? mounts.filter(({ active }) => active).map(({ name_de }) => name_de)
    : [];
  const allEquipment = equipment
    ? equipment.filter(({ active }) => active).map(({ name_de }) => name_de)
    : [];
  const allOptions = options
    ? options.filter(({ active }) => active).map(({ name_de }) => name_de)
    : [];
  const allCommand = command
    ? command.filter(({ active }) => active).map(({ name_de }) => name_de)
    : [];
  const allOptionsArray = [
    ...allCommand,
    ...allEquipment,
    ...allMounts,
    ...allOptions,
  ];
  const allOptionsString = allOptionsArray.join(", ");

  if (allOptionsString) {
    return <p>{allOptionsString}</p>;
  }
  return null;
};

export const Editor = () => {
  const { listId } = useParams();
  const dispatch = useDispatch();
  const [redirect, setRedirect] = useState(false);
  const list = useSelector((state) =>
    state.lists.find(({ id }) => listId === id)
  );
  const getPoints = (type) => {
    let points = 0;

    list[type].forEach((unit) => {
      points += getUnitPoints(unit);
    });

    return points;
  };
  const handleDelete = () => {
    dispatch(deleteList(listId));
    removeList(listId);
    setRedirect(true);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [listId]);

  useEffect(() => {
    list && updateList(list);
  }, [list]);

  if (redirect) {
    return <Redirect to="/" />;
  }

  if (!list) {
    return (
      <>
        <Header to="/" />
        <Main></Main>
      </>
    );
  }

  const lordsPoints = getPoints("lords");
  const heroesPoints = getPoints("heroes");
  const corePoints = getPoints("core");
  const specialPoints = getPoints("special");
  const rarePoints = getPoints("rare");
  const allPoints =
    lordsPoints + heroesPoints + corePoints + specialPoints + rarePoints;
  const lordsData = getMaxPercentData({
    type: "lords",
    armyPoints: list.points,
    points: lordsPoints,
  });
  const heroesData = getMaxPercentData({
    type: "heroes",
    armyPoints: list.points,
    points: heroesPoints,
  });
  const coreData = getMinPercentData({
    type: "core",
    armyPoints: list.points,
    points: corePoints,
  });
  const specialData = getMaxPercentData({
    type: "special",
    armyPoints: list.points,
    points: specialPoints,
  });
  const rareData = getMaxPercentData({
    type: "rare",
    armyPoints: list.points,
    points: rarePoints,
  });

  return (
    <>
      <Header
        to="/"
        headline={list.name}
        subheadline={`${allPoints} / ${list.points} Pkte.`}
        moreButton={[
          {
            name_de: "Bearbeiten",
            icon: "edit",
            to: `/editor/${listId}/edit`,
          },
          {
            name_de: "Löschen",
            icon: "delete",
            callback: handleDelete,
          },
        ]}
      />

      <Main className="editor">
        <section className="editor__section">
          <header className="editor__header">
            <h2>Kommandanten</h2>
            <p className="editor__points">
              {lordsData.diff > 0 ? (
                <>
                  <strong>{lordsData.diff}</strong>Punkte zu viel
                  <Icon symbol="error" color="red" />
                </>
              ) : (
                <>
                  <strong>{lordsData.points - lordsPoints}</strong>
                  Pkte. verfügbar
                  <Icon symbol="check" />
                </>
              )}
            </p>
          </header>
          <ul>
            {list.lords.map((unit, index) => (
              <List
                key={index}
                to={`/editor/${listId}/lords/${unit.id}`}
                className="editor__list"
              >
                <div className="editor__list-inner">
                  <b>{unit.name_de}</b>
                  <i>{`${getUnitPoints(unit)} Pkte.`}</i>
                </div>
                {getAllOptions(unit)}
              </List>
            ))}
          </ul>
          <Button
            centered
            to={`/editor/${listId}/add/lords`}
            icon="add"
            spaceTop
          >
            Hinzufügen
          </Button>
        </section>

        <section className="editor__section">
          <header className="editor__header">
            <h2>Helden</h2>
            <p className="editor__points">
              {heroesData.diff > 0 ? (
                <>
                  <strong>{heroesData.diff}</strong> Pkte. zu viel
                  <Icon symbol="error" color="red" />
                </>
              ) : (
                <>
                  <strong>{heroesData.points - heroesPoints}</strong>
                  Pkte. verfügbar
                  <Icon symbol="check" />
                </>
              )}
            </p>
          </header>
          <ul>
            {list.heroes.map((unit, index) => (
              <List
                key={index}
                to={`/editor/${listId}/heroes/${unit.id}`}
                className="editor__list"
              >
                <div className="editor__list-inner">
                  <b>{unit.name_de}</b>
                  <i>{`${getUnitPoints(unit)} Pkte.`}</i>
                </div>
                {getAllOptions(unit)}
              </List>
            ))}
          </ul>
          <Button
            centered
            to={`/editor/${listId}/add/heroes`}
            icon="add"
            spaceTop
          >
            Hinzufügen
          </Button>
        </section>

        <section className="editor__section">
          <header className="editor__header">
            <h2>Kerneinheiten</h2>
            <p className="editor__points">
              {coreData.diff > 0 ? (
                <>
                  <>
                    Es fehlen<strong>{coreData.diff}</strong> Pkte.
                    <Icon symbol="error" color="red" />
                  </>
                </>
              ) : (
                <Icon symbol="check" />
              )}
            </p>
          </header>
          <ul>
            {list.core.map((unit, index) => (
              <List
                key={index}
                to={`/editor/${listId}/core/${unit.id}`}
                className="editor__list"
              >
                <div className="editor__list-inner">
                  <span>
                    {(unit.strength || unit.minimum) &&
                      `${unit.strength || unit.minimum} `}
                    <b>{unit.name_de}</b>
                  </span>
                  <i>{`${getUnitPoints(unit)} Pkte.`}</i>
                </div>
                {getAllOptions(unit)}
              </List>
            ))}
          </ul>
          <Button
            centered
            to={`/editor/${listId}/add/core`}
            icon="add"
            spaceTop
          >
            Hinzufügen
          </Button>
        </section>

        <section className="editor__section">
          <header className="editor__header">
            <h2>Eliteeinheiten</h2>
            <p className="editor__points">
              {specialData.diff > 0 ? (
                <>
                  <strong>{specialData.diff}</strong> Pkte. zu viel
                  <Icon symbol="error" color="red" />
                </>
              ) : (
                <>
                  <strong>{specialData.points - specialPoints}</strong> Pkte.
                  verfügbar <Icon symbol="check" />
                </>
              )}
            </p>
          </header>
          <ul>
            {list.special.map((unit, index) => (
              <List
                key={index}
                to={`/editor/${listId}/special/${unit.id}`}
                className="editor__list"
              >
                <div className="editor__list-inner">
                  <span>
                    {(unit.strength || unit.minimum) &&
                      `${unit.strength || unit.minimum} `}
                    <b>{unit.name_de}</b>
                  </span>
                  <i>{`${getUnitPoints(unit)} Pkte.`}</i>
                </div>
                {getAllOptions(unit)}
              </List>
            ))}
          </ul>
          <Button
            centered
            to={`/editor/${listId}/add/special`}
            icon="add"
            spaceTop
          >
            Hinzufügen
          </Button>
        </section>

        <section className="editor__section">
          <header className="editor__header">
            <h2>Seltene Einheiten</h2>
            <p className="editor__points">
              {rareData.diff > 0 ? (
                <>
                  <strong>{rareData.diff}</strong> Pkte. zu viel
                  <Icon symbol="error" color="red" />
                </>
              ) : (
                <>
                  <strong>{rareData.points - rarePoints}</strong> Pkte.
                  verfügbar
                  <Icon symbol="check" />
                </>
              )}
            </p>
          </header>
          <ul>
            {list.rare.map((unit, index) => (
              <List
                key={index}
                to={`/editor/${listId}/rare/${unit.id}`}
                className="editor__list"
              >
                <div className="editor__list-inner">
                  <span>
                    {(unit.strength || unit.minimum) &&
                      `${unit.strength || unit.minimum} `}
                    <b>{unit.name_de}</b>
                  </span>
                  <i>{`${getUnitPoints(unit)} Pkte.`}</i>
                </div>
                {getAllOptions(unit)}
              </List>
            ))}
          </ul>
          <Button
            centered
            to={`/editor/${listId}/add/rare`}
            icon="add"
            spaceTop
          >
            Hinzufügen
          </Button>
        </section>
      </Main>
    </>
  );
};
