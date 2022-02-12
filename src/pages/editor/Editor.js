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

const getUnitPoints = (unit) => {
  let unitPoints = 0;

  if (unit.strength) {
    unitPoints = unit.strength * unit.points;
  } else {
    unitPoints = unit.points;
  }
  if (unit.options) {
    unit.options.forEach((option) => {
      if (option.active && option.perModel) {
        unitPoints += unit.strength * option.points;
      } else if (option.active) {
        unitPoints += option.points;
      }
    });
  }
  if (unit.equipment) {
    unit.equipment.forEach((option) => {
      if (option.active && option.perModel) {
        unitPoints += unit.strength * option.points;
      } else if (option.active) {
        unitPoints += option.points;
      }
    });
  }
  if (unit.command) {
    unit.command.forEach((option) => {
      if (option.active) {
        unitPoints += option.points;
      }
    });
  }
  if (unit.mounts) {
    unit.mounts.forEach((option) => {
      if (option.active) {
        unitPoints += option.points;
      }
    });
  }

  return unitPoints;
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
      points += getUnitPoints(unit);
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
            {list.lords.map((unit, index) => (
              <List key={index} onClick={() => editUnit(unit.id, "lords")}>
                <b>{unit.name_de}</b>
                <i>{`${getUnitPoints(unit)} Pkte.`}</i>
              </List>
            ))}
          </ul>
          <Button spaceBottom onClick={() => addUnit("lords")} icon="add">
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
              <List key={index} onClick={() => editUnit(unit.id, "heroes")}>
                <b>{unit.name_de}</b>
                <i>{`${getUnitPoints(unit)} Pkte.`}</i>
              </List>
            ))}
          </ul>
          <Button spaceBottom onClick={() => addUnit("heroes")} icon="add">
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
              <List key={index} onClick={() => editUnit(unit.id, "core")}>
                <span>
                  {(unit.strength || unit.minimum) &&
                    `${unit.strength || unit.minimum} `}
                  <b>{unit.name_de}</b>
                </span>
                <i>{`${getUnitPoints(unit)} Pkte.`}</i>
              </List>
            ))}
          </ul>
          <Button spaceBottom onClick={() => addUnit("core")} icon="add">
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
              <List key={index} onClick={() => editUnit(unit.id, "special")}>
                <span>
                  {(unit.strength || unit.minimum) &&
                    `${unit.strength || unit.minimum} `}
                  <b>{unit.name_de}</b>
                </span>
                <i>{`${getUnitPoints(unit)} Pkte.`}</i>
              </List>
            ))}
          </ul>
          <Button spaceBottom onClick={() => addUnit("special")} icon="add">
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
              <List key={index} onClick={() => editUnit(unit.id, "rare")}>
                <span>
                  {(unit.strength || unit.minimum) &&
                    `${unit.strength || unit.minimum} `}
                  <b>{unit.name_de}</b>
                </span>
                <i>{`${getUnitPoints(unit)} Pkte.`}</i>
              </List>
            ))}
          </ul>
          <Button spaceBottom onClick={() => addUnit("rare")} icon="add">
            Hinzufügen
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
