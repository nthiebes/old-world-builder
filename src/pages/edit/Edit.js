import { Fragment, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { Header, Main } from "../../components/page";
import { NumberInput } from "../../components/number-input";
import { updateList } from "../../state/lists";

import "./Edit.css";

export const Edit = ({ isMobile }) => {
  const location = useLocation();
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

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

      <MainComponent>
        {!isMobile && (
          <Header
            isSection
            to={`/editor/${listId}`}
            headline="Liste bearbeiten"
          />
        )}
        <label htmlFor="name" className="edit__label">
          Name:
        </label>
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
        <NumberInput
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
