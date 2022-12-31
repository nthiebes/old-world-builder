import { Fragment, useEffect, useState } from "react";
import { useParams, useLocation, Redirect } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { Button } from "../../components/button";
import { Header, Main } from "../../components/page";
import { NumberInput } from "../../components/number-input";
import { getRandomId } from "../../utils/id";
import { setLists } from "../../state/lists";

import "./Duplicate.css";

export const Duplicate = ({ isMobile }) => {
  const location = useLocation();
  const MainComponent = isMobile ? Main : Fragment;
  const { listId } = useParams();
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [points, setPoints] = useState(2000);
  const [redirect, setRedirect] = useState(null);
  const lists = useSelector((state) => state.lists);
  const list = useSelector((state) =>
    state.lists.find(({ id }) => listId === id)
  );

  const handlePointsChange = (event) => {
    setPoints(event.target.value);
  };
  const handleNameChange = (event) => {
    setName(event.target.value);
  };
  const handleSubmit = (event) => {
    const newId = getRandomId();
    const newLists = [
      ...lists,
      {
        ...list,
        name,
        points,
        id: newId,
      },
    ];

    event.preventDefault();

    localStorage.setItem("owb.lists", JSON.stringify(newLists));
    dispatch(setLists(newLists));

    setRedirect(newId);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    if (list) {
      setName(`Kopie von ${list.name}`);
      setPoints(list.points);
    }
  }, [list]);

  if (!list) {
    return (
      <>
        <Header to={`/editor/${listId}`} headline="Liste duplizieren" />
        <Main />
      </>
    );
  }

  return (
    <>
      {redirect && <Redirect to={`/editor/${redirect}`} />}

      {isMobile && (
        <Header to={`/editor/${listId}`} headline="Liste duplizieren" />
      )}

      <MainComponent>
        {!isMobile && (
          <Header
            isSection
            to={`/editor/${listId}`}
            headline="Liste duplizieren"
          />
        )}
        <form onSubmit={handleSubmit} className="duplicate">
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
          <NumberInput
            id="points"
            className="input"
            min={0}
            value={points}
            onChange={handlePointsChange}
            required
          />
          <Button centered icon="duplicate" submitButton>
            {"Liste duplizieren"}
          </Button>
        </form>
      </MainComponent>
    </>
  );
};
