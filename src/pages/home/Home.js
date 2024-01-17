import { Fragment, useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { FormattedMessage } from "react-intl";
import { Helmet } from "react-helmet-async";

import { Button } from "../../components/button";
import { List } from "../../components/list";
import { Header, Main } from "../../components/page";
import { getAllPoints } from "../../utils/points";
import { setArmy } from "../../state/army";
import { setItems } from "../../state/items";
import warhammerFantasy from "../../assets/warhammer-fantasy.png";
import warhammerTheOldWorld from "../../assets/the-old-world.png";
import theEmpire from "../../assets/army-icons/the-empire.svg";
import dwarfs from "../../assets/army-icons/dwarfs.svg";
import greenskins from "../../assets/army-icons/greenskins.svg";
import beastmen from "../../assets/army-icons/beastmen.svg";
import chaosDeamons from "../../assets/army-icons/chaos-deamons.svg";
import chaosWarriors from "../../assets/army-icons/chaos-warriors.svg";
import darkElves from "../../assets/army-icons/dark-elves.svg";
import highElves from "../../assets/army-icons/high-elves.svg";
import lizardmen from "../../assets/army-icons/lizardmen.svg";
import ogres from "../../assets/army-icons/ogres.svg";
import skaven from "../../assets/army-icons/skaven.svg";
import tombKings from "../../assets/army-icons/tomb-kings.svg";
import vampireCounts from "../../assets/army-icons/vampire-counts.svg";
import woodElves from "../../assets/army-icons/wood-elves.svg";
import chaosDwarfs from "../../assets/army-icons/chaos-dwarfs.svg";
import bretonnia from "../../assets/army-icons/bretonnia.svg";

import "./Home.css";

const armyIconMap = {
  "the-empire": theEmpire,
  dwarfs: dwarfs,
  greenskins: greenskins,
  "empire-of-man": theEmpire,
  "orc-and-goblin-tribes": greenskins,
  "dwarfen-mountain-holds": dwarfs,
  "warriors-of-chaos": chaosWarriors,
  "kingdom-of-bretonnia": bretonnia,
  "beastmen-brayherds": beastmen,
  "wood-elf-realms": woodElves,
  "tomb-kings-of-khemri": tombKings,
  "high-elf-realms": highElves,
  "dark-elves": darkElves,
  skaven: skaven,
  "vampire-counts": vampireCounts,
  "daemons-of-chaos": chaosDeamons,
  "ogre-kingdoms": ogres,
  lizardmen: lizardmen,
  "chaos-dwarfs": chaosDwarfs,
};

export const Home = ({ isMobile }) => {
  const MainComponent = isMobile ? Main : Fragment;
  const lists = useSelector((state) => state.lists);
  const location = useLocation();
  const dispatch = useDispatch();
  const resetState = () => {
    dispatch(setArmy(null));
    dispatch(setItems(null));
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>
          Old World Builder - Army builder for Warhammer Fantasy and Warhammer:
          The Old World
        </title>
      </Helmet>

      {isMobile && <Header headline="Old World Builder" hasMainNavigation />}
      <MainComponent>
        {!lists.length && (
          <>
            <img
              src={theEmpire}
              alt=""
              width="100"
              height="100"
              className="home__logo"
            />
            <i className="home__empty">
              <FormattedMessage id="home.empty" />
            </i>
          </>
        )}
        <ul>
          {lists.map(
            ({ id, name, description, points, game, army, ...list }, index) => (
              <List
                key={index}
                to={`/editor/${id}`}
                active={location.pathname.includes(id)}
                onClick={resetState}
              >
                <span className="home__list-item">
                  <h2 className="home__headline">{name}</h2>
                  {description && (
                    <p className="home__description">{description}</p>
                  )}
                  <p className="home__points">
                    {getAllPoints({
                      ...list,
                      points,
                    })}{" "}
                    / {points} <FormattedMessage id="app.points" />
                  </p>
                </span>
                <div className="home__info">
                  <img
                    width="70"
                    src={
                      game === "warhammer-fantasy"
                        ? warhammerFantasy
                        : warhammerTheOldWorld
                    }
                    alt={
                      game === "warhammer-fantasy"
                        ? "Warhammer Fantasy"
                        : "Warhammer: The Old World"
                    }
                    className="home__game"
                  />
                  <img height="40" width="40" src={armyIconMap[army]} alt="" />
                </div>
              </List>
            )
          )}
        </ul>
        <Button
          centered
          to="/new"
          icon="new-list"
          spaceTop
          onClick={resetState}
        >
          <FormattedMessage id="home.newList" />
        </Button>
        <Button
          centered
          to="/import"
          type="text"
          icon="import"
          color="dark"
          spaceTop
          spaceBottom
          onClick={resetState}
        >
          <FormattedMessage id="home.import" />
        </Button>
      </MainComponent>
    </>
  );
};
