import { Fragment, useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

import { Button } from "../../components/button";
import { List } from "../../components/list";
import { Header, Main } from "../../components/page";
import { getAllPoints } from "../../utils/points";
// import warhammerFantasy from "../../assets/warhammer-fantasy.png";
// import warhammerTheOldWorld from "../../assets/the-old-world.png";
import theEmpire from "../../assets/army-icons/the-empire.svg";
import dwarfs from "../../assets/army-icons/dwarfs.svg";
import greenskins from "../../assets/army-icons/greenskins.svg";

import "./Home.css";

const armyIconMap = {
  "the-empire": theEmpire,
  dwarfs: dwarfs,
  greenskins: greenskins,
};

export const Home = ({ isMobile }) => {
  const MainComponent = isMobile ? Main : Fragment;
  const lists = useSelector((state) => state.lists);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      {isMobile && <Header headline="Old World Builder" />}

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
            <i className="home__empty">Erstelle jetzt deine erste Liste.</i>
          </>
        )}
        <ul>
          {lists.map(({ id, name, points, game, army, ...list }, index) => (
            <List
              key={index}
              to={`/editor/${id}`}
              active={location.pathname.includes(id)}
            >
              <span className="home__list-item">
                <h2 className="home__headline">{name}</h2>
                <p>
                  {getAllPoints({
                    ...list,
                    points,
                  })}{" "}
                  / {points} Pkte.
                </p>
              </span>
              {/* {game === "warhammer-fantasy" && (
                <img
                  height="20"
                  src={warhammerFantasy}
                  alt="Warhammer Fantasy"
                />
              )}
              {game === "the-old-world" && (
                <img
                  height="35"
                  src={warhammerTheOldWorld}
                  alt="Warhammer: The Old World"
                />
              )} */}
              <img height="40" width="40" src={armyIconMap[army]} alt="" />
            </List>
          ))}
        </ul>
        <Button centered to="/new" icon="new-list" spaceTop>
          {"Neue Liste"}
        </Button>
      </MainComponent>
    </>
  );
};
