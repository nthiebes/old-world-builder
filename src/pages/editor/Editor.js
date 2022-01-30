import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import classNames from "classnames";
import { fetcher } from "../../utils/fetcher";
import { getMaxPercentData, getMinPercentData } from "../../utils/rules";

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

  const addLord = () => {
    const lord = army.lords.find(({ id }) => id === "grimgor");
    const newList = {
      ...list,
      lords: [...list.lords, lord],
    };

    setList(newList);
    updateList(newList);
  };
  const addHero = () => {
    const hero = army.heroes.find(({ id }) => id === "ng-shaman");
    const newList = {
      ...list,
      heroes: [...list.heroes, hero],
    };

    setList(newList);
    updateList(newList);
  };
  const addCore = () => {
    const unit = army.core.find(({ id }) => id === "savageorks");
    const newList = {
      ...list,
      core: [...list.core, unit],
    };

    setList(newList);
    updateList(newList);
  };
  const addSpecial = () => {
    const unit = army.special.find(({ id }) => id === "blackorks");
    const newList = {
      ...list,
      special: [...list.special, unit],
    };

    setList(newList);
    updateList(newList);
  };
  const addRare = () => {
    const unit = army.rare.find(({ id }) => id === "doomdiver");
    const newList = {
      ...list,
      rare: [...list.rare, unit],
    };

    setList(newList);
    updateList(newList);
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
      url: `armies/${localList.army}`,
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
      <header className="header">
        <div className="title">
          <h1>
            {list.name} <button className="button">Edit</button>
          </h1>
          <p>
            {allPoints} / {list.points} Punkte
          </p>
        </div>
        <Link to="/">Zurück</Link>
      </header>
      <main>
        <header className="list__header">
          <h2>Kommandanten</h2>
          <div className="list__points">
            <p>
              {lordsData.diff > 0 ? (
                <>
                  <br />
                  {`❌ ${lordsData.diff} Punkte zu viel`}
                </>
              ) : (
                <>
                  ✓ <b>{lordsPoints}</b> Punkte (Max. {lordsData.points})
                </>
              )}
            </p>
            <progress
              value={lordsPoints}
              max={lordsData.points}
              className={classNames(
                "progress",
                lordsData.overLimit && "progress--red"
              )}
            >
              {lordsPoints}
            </progress>
          </div>
          <button className="button" onClick={addLord}>
            Neu +
          </button>
        </header>
        <ul>
          {list.lords.map(({ name_de }, index) => (
            <li key={index}>{name_de}</li>
          ))}
        </ul>

        <header className="list__header">
          <h2>Helden</h2>
          <div className="list__points">
            <p>
              {heroesData.diff > 0 ? (
                <>
                  <br />
                  {`❌ ${heroesData.diff} Punkte zu viel`}
                </>
              ) : (
                <>
                  ✓ <b>{heroesPoints}</b> / {heroesData.points} Punkten
                </>
              )}
            </p>
            <progress
              value={heroesPoints}
              max={heroesData.points}
              className={classNames(
                "progress",
                heroesData.overLimit && "progress--red"
              )}
            >
              {heroesPoints}
            </progress>
          </div>
          <button className="button" onClick={addHero}>
            Neu +
          </button>
        </header>
        <ul>
          {list.heroes.map(({ name_de }, index) => (
            <li key={index}>{name_de}</li>
          ))}
        </ul>

        <header className="list__header">
          <h2>Kerneinheiten</h2>
          <div className="list__points">
            <p>
              {/* <b>{corePoints}</b> / {coreData.points} Punkten */}

              {coreData.diff > 0 ? (
                <>
                  <br />
                  {`Es fehlen ${coreData.diff} Punkte`}
                </>
              ) : (
                <>
                  <b>{corePoints}</b> Punkte (Min. {coreData.points})
                </>
              )}
            </p>
            <progress
              value={corePoints}
              max={coreData.points}
              className={classNames(
                "progress",
                coreData.overLimit && "progress--red"
              )}
            >
              {corePoints}
            </progress>
          </div>
          <button className="button" onClick={addCore}>
            Neu +
          </button>
        </header>
        <ul>
          {list.core.map(({ name_de }, index) => (
            <li key={index}>{name_de}</li>
          ))}
        </ul>

        <header className="list__header">
          <h2>Eliteeinheiten</h2>
          <div className="list__points">
            <p>
              <b>{specialPoints}</b> / {specialData.points} Punkten
            </p>
            <progress
              value={specialPoints}
              max={specialData.points}
              className={classNames(
                "progress",
                specialData.overLimit && "progress--red"
              )}
            >
              {specialPoints}
            </progress>
          </div>
          <button className="button" onClick={addSpecial}>
            Neu +
          </button>
        </header>
        <ul>
          {list.special.map(({ name_de }, index) => (
            <li key={index}>{name_de}</li>
          ))}
        </ul>

        <header className="list__header">
          <h2>Seltene Einheiten</h2>
          <div className="list__points">
            <p>
              <b>{rarePoints}</b> / {rareData.points} Punkten
            </p>
            <progress
              value={rarePoints}
              max={rareData.points}
              className={classNames(
                "progress",
                rareData.overLimit && "progress--red"
              )}
            >
              {rarePoints}
            </progress>
          </div>
          <button className="button" onClick={addRare}>
            Neu +
          </button>
        </header>
        <ul>
          {list.rare.map(({ name_de }, index) => (
            <li key={index}>{name_de}</li>
          ))}
        </ul>
      </main>
    </>
  );
};
