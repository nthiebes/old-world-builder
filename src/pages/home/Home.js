import { Fragment, useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import { Helmet } from "react-helmet-async";

import { Button } from "../../components/button";
import { List } from "../../components/list";
import { Header, Main } from "../../components/page";
import { getAllPoints } from "../../utils/points";
import warhammerFantasy from "../../assets/warhammer-fantasy.png";
import warhammerTheOldWorld from "../../assets/the-old-world.png";
import theEmpire from "../../assets/army-icons/the-empire.svg";
import dwarfs from "../../assets/army-icons/dwarfs.svg";
import greenskins from "../../assets/army-icons/greenskins.svg";

import "./Home.css";

const armyIconMap = {
  "the-empire": theEmpire,
  dwarfs: dwarfs,
  greenskins: greenskins,
  "empire-of-man": theEmpire,
  "orc-and-goblins-tribes": greenskins,
  "dwarven-mountain-holds": dwarfs,
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
      <Helmet>
        <title>Old World Builder</title>
      </Helmet>

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
        <Button centered to="/new" icon="new-list" spaceTop>
          <FormattedMessage id="home.newList" />
        </Button>
      </MainComponent>
    </>
  );
};
