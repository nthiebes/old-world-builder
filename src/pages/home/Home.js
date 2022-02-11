// import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import { Button } from "../../components/button";
import { List } from "../../components/list";
import { Icon } from "../../components/icon";
import { Header, Main } from "../../components/page";

import "./Home.css";

export const Home = () => {
  const lists = useSelector((state) => state.lists);

  return (
    <>
      <Header headline="Old World Builder" />
      <Main>
        <ul>
          {lists.map(({ id, name, points, game }, index) => (
            <List key={index} to={`/editor/${id}`}>
              <span>
                <h2>{name}</h2>
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
        <Button to="/new">
          <Icon symbol="add" />
          {"Neue Liste"}
        </Button>
      </Main>
    </>
  );
};
