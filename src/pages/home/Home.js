import { Fragment, useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

import { Button } from "../../components/button";
import { List } from "../../components/list";
import { Header, Main } from "../../components/page";

import "./Home.css";

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
          <i className="home__empty">Noch keine Listen erstellt.</i>
        )}
        <ul>
          {lists.map(({ id, name, points, game, army }, index) => (
            <List
              key={index}
              to={`/editor/${id}`}
              active={location.pathname.includes(id)}
            >
              <span className="home__list-item">
                <h2 className="home__headline">{name}</h2>
                <p>{points} Pkte.</p>
              </span>
              <img
                className="home__icon"
                height="40"
                width="40"
                src={`/army-icons/${army}.svg`}
                alt=""
              />
              {/* {game === "warhammer-fantasy" && (
                <img height="20" src={`/${game}.png`} alt="Warhammer Fantasy" />
              )}
              {game === "the-old-world" && (
                <img
                  height="35"
                  src={`/${game}.png`}
                  alt="Warhammer: The Old World"
                />
              )} */}
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
