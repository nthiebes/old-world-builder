import { Fragment, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FormattedMessage, useIntl } from "react-intl";
import { Helmet } from "react-helmet-async";

import { Header, Main } from "../../components/page";
import { NumberInput } from "../../components/number-input";
import { updateList } from "../../state/lists";
import { updateList as updateLocalList } from "../../utils/list";

import "./EditList.css";

export const EditList = ({ isMobile }) => {
  const location = useLocation();
  const intl = useIntl();
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
        points: Number(event.target.value),
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
  const handleDescriptionChange = (event) => {
    dispatch(
      updateList({
        listId,
        description: event.target.value,
      })
    );
  };

  useEffect(() => {
    list && updateLocalList(list);
  }, [list]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (!list) {
    return (
      <>
        <Header
          to={`/editor/${listId}`}
          headline={intl.formatMessage({
            id: "edit.title",
          })}
        />
        <Main />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Old World Builder | ${list.name}`}</title>
      </Helmet>

      {isMobile && (
        <Header
          to={`/editor/${listId}`}
          headline={intl.formatMessage({
            id: "edit.title",
          })}
        />
      )}

      <MainComponent>
        {!isMobile && (
          <Header
            isSection
            to={`/editor/${listId}`}
            headline={intl.formatMessage({
              id: "edit.title",
            })}
          />
        )}
        <label htmlFor="name" className="edit__label">
          <FormattedMessage id="misc.name" />
        </label>
        <input
          type="text"
          id="name"
          className="input"
          value={list.name}
          onChange={handleNameChange}
          autoComplete="off"
          required
          maxLength="100"
        />
        <label htmlFor="description" className="edit__label">
          <FormattedMessage id="misc.description" />
        </label>
        <input
          type="text"
          id="description"
          className="input"
          value={list.description}
          onChange={handleDescriptionChange}
          autoComplete="off"
          maxLength="255"
        />
        <label htmlFor="points">
          <FormattedMessage id="misc.points" />
        </label>
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
