import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import { fetcher } from "../../utils/fetcher";
import { getMaxPercentData, getMinPercentData } from "../../utils/rules";
import { Button } from "../../components/button";
import { Icon } from "../../components/icon";
import { List } from "../../components/list";
import { Header, Main } from "../../components/page";
import { AddUnitModal } from "./add-unit-modal/AddUnitModal";

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

export const Editor = () => {
  const { listId } = useParams();
  const list = useSelector((state) =>
    state.lists.find(({ id }) => listId === id)
  );
  const [army, setArmy] = useState(null);
  const [addUnitModalData, setAddUnitModalData] = useState(null);
  const [editUnitModalData, setEditUnitModalData] = useState(null);
  const handleCloseModal = () => {
    setAddUnitModalData(null);
    setEditUnitModalData(null);
  };
  const addUnit = (type) => {
    setAddUnitModalData({
      units: army[type],
      type,
    });
  };
  const editUnit = (unitId, type) => {
    setEditUnitModalData({
      unit: list[type].find((unit) => unit.id === unitId),
      type,
    });
  };
  const getPoints = (type) => {
    let points = 0;

    list[type].forEach((unit) => {
      let unitPoints = unit.points;

      if (unit.strength) {
        unitPoints = unit.strength * unit.strength;
      }

      points += unitPoints;
    });

    return points;
  };

  useEffect(() => {
    list && updateList(list);

    list &&
      fetcher({
        url: `armies/${list.game}/${list.army}`,
        onSuccess: (data) => {
          setArmy(data);
        },
      });
  }, [list]);

  if (!list || !army) {
    return null;
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
        backButton
        headline={list.name}
        subheadline={`${allPoints} / ${list.points} Pkte.`}
        moreButton
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
            {list.lords.map(({ name_de, id }, index) => (
              <List key={index} onClick={() => editUnit(id, "lords")}>
                <b>{name_de}</b>
              </List>
            ))}
          </ul>
          <Button spaceBottom onClick={() => addUnit("lords")}>
            <Icon symbol="add" /> Hinzufügen
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
            {list.heroes.map(({ id, name_de }, index) => (
              <List key={index} onClick={() => editUnit(id, "heroes")}>
                <b>{name_de}</b>
              </List>
            ))}
          </ul>
          <Button spaceBottom onClick={() => addUnit("heroes")}>
            <Icon symbol="add" /> Hinzufügen
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
            {list.core.map(({ id, strength, minimum, name_de }, index) => (
              <List key={index} onClick={() => editUnit(id, "core")}>
                <span>
                  {(strength || minimum) && `${strength || minimum} `}
                  <b>{name_de}</b>
                </span>
              </List>
            ))}
          </ul>
          <Button spaceBottom onClick={() => addUnit("core")}>
            <Icon symbol="add" /> Hinzufügen
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
            {list.special.map(({ id, strength, minimum, name_de }, index) => (
              <List key={index} onClick={() => editUnit(id, "specials")}>
                <span>
                  {(strength || minimum) && `${strength || minimum} `}
                  <b>{name_de}</b>
                </span>
              </List>
            ))}
          </ul>
          <Button spaceBottom onClick={() => addUnit("special")}>
            <Icon symbol="add" /> Hinzufügen
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
            {list.rare.map(({ id, strength, minimum, name_de }, index) => (
              <List key={index} onClick={() => editUnit(id, "rare")}>
                <span>
                  {(strength || minimum) && `${strength || minimum} `}
                  <b>{name_de}</b>
                </span>
              </List>
            ))}
          </ul>
          <Button spaceBottom onClick={() => addUnit("rare")}>
            <Icon symbol="add" /> Hinzufügen
          </Button>
        </section>
      </Main>
      {addUnitModalData && (
        <AddUnitModal unitData={addUnitModalData} onClose={handleCloseModal} />
      )}
      {editUnitModalData && (
        <AddUnitModal unitData={editUnitModalData} onClose={handleCloseModal} />
      )}
    </>
  );
};
