import { useState, Fragment } from "react";
import { Redirect } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { Button } from "../../components/button";
import { getRandomId } from "../../utils/id";
import { Header, Main } from "../../components/page";
import { Select } from "../../components/select/Select";
import gameSystems from "../../data/armies.json";
import { setLists } from "../../state/lists";

import "./NewList.css";

export const NewList = ({ isMobile }) => {
  const MainComponent = isMobile ? Main : Fragment;
  const dispatch = useDispatch();
  const lists = useSelector((state) => state.lists);
  const [game, setGame] = useState(gameSystems[0].id);
  const [army, setArmy] = useState(gameSystems[0].armies[0].id);
  const [name, setName] = useState("");
  const [points, setPoints] = useState(2000);
  const [redirect, setRedirect] = useState(null);
  const createList = () => {
    const newId = getRandomId();
    const newList = {
      name: name,
      game: game,
      points: points,
      army: army,
      lords: [],
      heroes: [],
      core: [],
      special: [],
      rare: [],
      id: newId,
    };
    const newLists = [...lists, newList];

    localStorage.setItem("lists", JSON.stringify(newLists));
    dispatch(setLists(newLists));

    setRedirect(newId);
  };
  const handleSystemChange = (event) => {
    setGame(event.target.value);
    setArmy(
      gameSystems.filter(({ id }) => id === event.target.value)[0].armies[0].id
    );
  };
  const handleArmyChange = (value) => {
    setArmy(value);
  };
  const handlePointsChange = (event) => {
    setPoints(event.target.value);
  };
  const handleNameChange = (event) => {
    setName(event.target.value);
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    createList();
  };

  return (
    <>
      {redirect && <Redirect to={`/editor/${redirect}`} />}

      {isMobile && <Header to="/" headline="Neue Liste" />}

      <MainComponent className="new-list">
        {!isMobile && <Header isSection headline="Neue Liste" />}
        <form onSubmit={handleSubmit}>
          {gameSystems.map(({ name, id, enabled }) => (
            <div className="radio" key={id}>
              <input
                type="radio"
                id={id}
                name="new-list"
                value={id}
                onChange={handleSystemChange}
                defaultChecked={id === "warhammer-fantasy"}
                className="radio__input"
                disabled={!enabled}
              />
              <label htmlFor={id} className="radio__label">
                {id === "warhammer-fantasy" && (
                  <img height="20" src={`/${id}.png`} alt={name} />
                )}
                {id === "the-old-world" && (
                  <img height="35" src={`/${id}.png`} alt={name} />
                )}
              </label>
            </div>
          ))}
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            className="input"
            value={name}
            onChange={handleNameChange}
            autoComplete="off"
            required
          />
          <label htmlFor="points">Punkte:</label>
          <input
            type="number"
            id="points"
            className="input"
            min={0}
            value={points}
            onChange={handlePointsChange}
            required
          />
          <label htmlFor="army">Armee:</label>
          <Select
            id="army"
            options={gameSystems.filter(({ id }) => id === game)[0].armies}
            onChange={handleArmyChange}
            selected="warhammer-fantasy"
            spaceBottom
            required
          />
          <Button centered icon="add-list">
            {"Liste anlegen"}
          </Button>
        </form>
      </MainComponent>
    </>
  );
};
