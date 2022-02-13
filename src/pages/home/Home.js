import { useSelector } from "react-redux";

import { Button } from "../../components/button";
import { List } from "../../components/list";
import { Header, Main } from "../../components/page";

import "./Home.css";

export const Home = () => {
  const lists = useSelector((state) => state.lists);

  return (
    <>
      <Header headline="Old World Builder" />
      <Main className="home">
        {!lists.length && (
          <i className="home__empty">Noch keine Listen erstellt.</i>
        )}
        <ul>
          {lists.map(({ id, name, points, game }, index) => (
            <List key={index} to={`/editor/${id}`}>
              <span className="home__list-item">
                <h2 className="home__headline">{name}</h2>
                <p>{points} Pkte.</p>
              </span>
              {game === "warhammer-fantasy" && (
                <img height="20" src={`/${game}.png`} alt="Warhammer Fantasy" />
              )}
              {game === "the-old-world" && (
                <img
                  height="35"
                  src={`/${game}.png`}
                  alt="Warhammer: The Old World"
                />
              )}
            </List>
          ))}
        </ul>
        <Button centered to="/new" icon="new-list" spaceTop>
          {"Neue Liste"}
        </Button>
      </Main>
    </>
  );
};
