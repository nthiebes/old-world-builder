import { Fragment } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { Header, Main } from "../../components/page";
import { updateList } from "../../state/lists";

import "./Edit.css";

export const Edit = ({ isMobile }) => {
  const MainComponent = isMobile ? Main : Fragment;
  const { listId } = useParams();
  const dispatch = useDispatch();
  const list = useSelector((state) =>
    state.lists.find(({ id }) => listId === id)
  );

  const handlePointsChange = (event) => {
    dispatch(
      updateList({
        listId,
        points: event.target.value,
      })
    );
  };
  const handleNameChange = (event) => {
    dispatch(
      updateList({
        listId,
        name: event.target.value,
      })
    );
  };

  if (!list) {
    return (
      <>
        <Header to={`/editor/${listId}`} headline="Liste bearbeiten" />
        <Main></Main>
      </>
    );
  }

  return (
    <>
      {isMobile && (
        <Header to={`/editor/${listId}`} headline="Liste bearbeiten" />
      )}

      <MainComponent className="edit">
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          className="input"
          value={list.name}
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
          value={list.points}
          onChange={handlePointsChange}
          required
        />
      </MainComponent>
    </>
  );
};
