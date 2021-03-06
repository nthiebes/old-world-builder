import { useEffect, useState, Fragment } from "react";
import { useParams, useLocation, Redirect } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { getMaxPercentData, getMinPercentData } from "../../utils/rules";
import { Button } from "../../components/button";
import { Icon } from "../../components/icon";
import { List } from "../../components/list";
import { Header, Main } from "../../components/page";
import { getAllOptions } from "../../utils/unit";
import { throttle } from "../../utils/throttle";
import { getUnitPoints, getPoints, getAllPoints } from "../../utils/points";
import { deleteList } from "../../state/lists";

import { removeList, updateList } from "./helpers";
import "./Editor.css";

export const Editor = ({ isMobile }) => {
  const MainComponent = isMobile ? Main : Fragment;
  const { listId } = useParams();
  const dispatch = useDispatch();
  const [redirect, setRedirect] = useState(false);
  const location = useLocation();
  // const errors = useSelector((state) => state.errors);
  const list = useSelector((state) =>
    state.lists.find(({ id }) => listId === id)
  );

  const handleDelete = () => {
    dispatch(deleteList(listId));
    removeList(listId);
    setRedirect(true);
  };

  useEffect(() => {
    const onScroll = () => {
      if (document.location.hash === `#${location.pathname}`) {
        sessionStorage.setItem("scrollPosition", window.pageYOffset);
      }
    };
    window.addEventListener("scroll", throttle(onScroll, 100));
    window.scrollTo(0, Number(sessionStorage.getItem("scrollPosition")) || 0);

    return () => window.removeEventListener("scroll", onScroll);
  }, [location.pathname]);

  useEffect(() => {
    list && updateList(list);
  }, [list]);

  if (redirect) {
    return <Redirect to="/" />;
  }

  if (!list) {
    if (isMobile) {
      return (
        <>
          <Header to="/" />
          <Main loading />
        </>
      );
    } else {
      return (
        <>
          <Header to="/" isSection />
          <Main loading />
        </>
      );
    }
  }

  const allPoints = getAllPoints(list);
  const lordsPoints = getPoints({ list, type: "lords" });
  const heroesPoints = getPoints({ list, type: "heroes" });
  const corePoints = getPoints({ list, type: "core" });
  const specialPoints = getPoints({ list, type: "special" });
  const rarePoints = getPoints({ list, type: "rare" });
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
  const moreButtons = [
    {
      name_de: "Bearbeiten",
      icon: "edit",
      to: `/editor/${listId}/edit`,
    },
    {
      name_de: "Duplizieren",
      icon: "duplicate",
      to: `/editor/${listId}/duplicate`,
    },
    {
      name_de: "L??schen",
      icon: "delete",
      callback: handleDelete,
    },
    {
      name_de: "Exportieren",
      icon: "export",
      to: `/editor/${listId}/export`,
    },
    {
      name_de: "Drucken",
      icon: "print",
      to: `/print/${listId}`,
    },
  ];

  return (
    <>
      {isMobile && (
        <Header
          to="/"
          headline={list.name}
          subheadline={`${allPoints} / ${list.points} Pkte.`}
          hasPointsError={allPoints > list.points}
          moreButton={moreButtons}
        />
      )}

      <MainComponent>
        {!isMobile && (
          <Header
            isSection
            to="/"
            headline={list.name}
            subheadline={`${allPoints} / ${list.points} Pkte.`}
            hasPointsError={allPoints > list.points}
            moreButton={moreButtons}
          />
        )}
        {/* <section>
          {errors.map((error) => (
            <span>
              <strong>{error}</strong>
              <Icon symbol="error" color="red" />
            </span>
          ))}
        </section> */}
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
                  Pkte. verf??gbar
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
                active={location.pathname.includes(unit.id)}
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
            Hinzuf??gen
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
                  Pkte. verf??gbar
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
                active={location.pathname.includes(unit.id)}
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
            Hinzuf??gen
          </Button>
        </section>

        <section className="editor__section">
          <header className="editor__header">
            <h2>Kerneinheiten</h2>
            <p className="editor__points">
              {coreData.diff > 0 ? (
                <>
                  <strong>{coreData.diff}</strong> Pkte. fehlen
                  <Icon symbol="error" color="red" />
                </>
              ) : (
                <>
                  <strong>{corePoints}</strong>
                  {` / ${coreData.points} `}
                  Pkte. <Icon symbol="check" />
                </>
              )}
            </p>
          </header>
          <ul>
            {list.core.map((unit, index) => (
              <List
                key={index}
                to={`/editor/${listId}/core/${unit.id}`}
                className="editor__list"
                active={location.pathname.includes(unit.id)}
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
            Hinzuf??gen
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
                  verf??gbar <Icon symbol="check" />
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
                active={location.pathname.includes(unit.id)}
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
            Hinzuf??gen
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
                  verf??gbar
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
                active={location.pathname.includes(unit.id)}
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
            Hinzuf??gen
          </Button>
        </section>
      </MainComponent>
    </>
  );
};
