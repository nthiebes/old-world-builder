import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
// import classNames from "classnames";

import { fetcher } from "../../utils/fetcher";
import { getMaxPercentData, getMinPercentData } from "../../utils/rules";
import { Button } from "../../components/button";
import { Icon } from "../../components/icon";
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
  const { id } = useParams();
  const [army, setArmy] = useState(null);
  const [list, setList] = useState(null);
  const [addUnitModalData, setAddUnitModalData] = useState(null);

  const handleCloseModal = () => {
    setAddUnitModalData(null);
  };
  const addLord = () => {
    // const lord = army.lords.find(({ id }) => id === "grimgor");
    // const newList = {
    //   ...list,
    //   lords: [...list.lords, lord],
    // };

    // setList(newList);
    // updateList(newList);
    setAddUnitModalData(army.lords);
  };
  const addHero = () => {
    // const hero = army.heroes.find(({ id }) => id === "ng-shaman");
    // const newList = {
    //   ...list,
    //   heroes: [...list.heroes, hero],
    // };

    // setList(newList);
    // updateList(newList);
    setAddUnitModalData(army.heroes);
  };
  const removeHero = () => {
    // const hero = army.heroes.find(({ id }) => id === "ng-shaman");
    // const newList = {
    //   ...list,
    //   heroes: [...list.heroes, hero],
    // };
    // setList(newList);
    // updateList(newList);
  };
  const addCore = () => {
    // const unit = army.core.find(({ id }) => id === "savageorks");
    // const newList = {
    //   ...list,
    //   core: [...list.core, unit],
    // };

    // setList(newList);
    // updateList(newList);
    setAddUnitModalData(army.core);
  };
  const addSpecial = () => {
    // const unit = army.special.find(({ id }) => id === "blackorks");
    // const newList = {
    //   ...list,
    //   special: [...list.special, unit],
    // };

    // setList(newList);
    // updateList(newList);
    setAddUnitModalData(army.special);
  };
  const addRare = () => {
    // const unit = army.rare.find(({ id }) => id === "doomdiver");
    // const newList = {
    //   ...list,
    //   rare: [...list.rare, unit],
    // };

    // setList(newList);
    // updateList(newList);
    setAddUnitModalData(army.rare);
  };
  const getPoints = (type) => {
    let points = 0;

    list[type].forEach((unit) => {
      const unitPoints = army[type].find(({ id }) => id === unit.id).points;

      points += unitPoints;
    });

    return points;
  };

  useEffect(() => {
    const localLists = JSON.parse(localStorage.getItem("lists"));
    const localList = localLists.find(({ id: localId }) => id === localId);

    setList(localList);

    fetcher({
      url: `armies/${localList.game}/${localList.army}`,
      onSuccess: (data) => {
        setArmy(data);
      },
    });
  }, [id]);

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
                  <Icon symbol="check" color="green" />
                </>
              )}
            </p>
          </header>
          <ul>
            {list.lords.map(({ name_de }, index) => (
              <li className="unit" key={index}>
                {name_de}
              </li>
            ))}
          </ul>
          <Button type="tertiary" spaceBottom fullWidth onClick={addLord}>
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
                  <Icon symbol="check" color="green" />
                </>
              )}
            </p>
          </header>
          <ul>
            {list.heroes.map(({ id, name_de }, index) => (
              <li className="unit" key={`${id + index}`}>
                {name_de}
              </li>
            ))}
          </ul>
          <Button type="tertiary" spaceBottom fullWidth onClick={addHero}>
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
                <Icon symbol="check" color="green" />
              )}
            </p>
          </header>
          <ul>
            {list.core.map(({ name_de }, index) => (
              <li className="unit" key={index}>
                {name_de}
              </li>
            ))}
          </ul>
          <Button type="tertiary" spaceBottom fullWidth onClick={addCore}>
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
                  verfügbar <Icon symbol="check" color="green" />
                </>
              )}
            </p>
          </header>
          <ul>
            {list.special.map(({ name_de }, index) => (
              <li className="unit" key={index}>
                {name_de}
              </li>
            ))}
          </ul>
          <Button type="tertiary" spaceBottom fullWidth onClick={addSpecial}>
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
                  <Icon symbol="check" color="green" />
                </>
              )}
            </p>
          </header>
          <ul>
            {list.rare.map(({ name_de }, index) => (
              <li className="unit" key={index}>
                {name_de}
              </li>
            ))}
          </ul>
          <Button type="tertiary" spaceBottom fullWidth onClick={addRare}>
            <Icon symbol="add" /> Hinzufügen
          </Button>
        </section>
      </Main>
      {addUnitModalData && (
        <AddUnitModal unitData={addUnitModalData} onCancel={handleCloseModal} />
      )}
    </>
  );
};
