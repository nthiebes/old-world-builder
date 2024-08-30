import { Fragment, useEffect, useState } from "react";
import { useParams, useLocation, Redirect } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FormattedMessage, useIntl } from "react-intl";
import { Helmet } from "react-helmet-async";

import { Button } from "../../components/button";
import { Header, Main } from "../../components/page";
import { NumberInput } from "../../components/number-input";
import { getRandomId } from "../../utils/id";
import { setLists } from "../../state/lists";

import "./DuplicateList.css";

export const DuplicateList = ({ isMobile }) => {
  const location = useLocation();
  const intl = useIntl();
  const MainComponent = isMobile ? Main : Fragment;
  const { listId } = useParams();
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [points, setPoints] = useState(2000);
  const [description, setDescription] = useState("");
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
  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };
  const handleSubmit = (event) => {
    const newId = getRandomId();
    const newLists = [
      ...lists,
      {
        ...list,
        name,
        points,
        description,
        id: newId,
      },
    ];

    event.preventDefault();

    localStorage.setItem("owb.lists", JSON.stringify(newLists));
    dispatch(setLists(newLists));
    window.umami?.track("lists", {
      army: list.army,
      composition: list.armyComposition,
      points,
    });

    setRedirect(newId);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    if (list) {
      setName(
        `${intl.formatMessage({
          id: "duplicate.copyOf",
        })} ${list?.name}`
      );
      setPoints(list.points);
      setDescription(list.description);
    }
  }, [list, intl]);

  if (!list) {
    return (
      <>
        <Header
          to={`/editor/${listId}`}
          headline={intl.formatMessage({
            id: "duplicate.title",
          })}
        />
        <Main />
      </>
    );
  }

  return (
    <>
      {redirect && <Redirect to={`/editor/${redirect}`} />}

      <Helmet>
        <title>{`Old World Builder | ${list?.name}`}</title>
      </Helmet>

      {isMobile && (
        <Header
          to={`/editor/${listId}`}
          headline={intl.formatMessage({
            id: "duplicate.title",
          })}
        />
      )}

      <MainComponent>
        {!isMobile && (
          <Header
            isSection
            to={`/editor/${listId}`}
            headline={intl.formatMessage({
              id: "duplicate.title",
            })}
          />
        )}
        <form onSubmit={handleSubmit} className="duplicate">
          <label htmlFor="name">
            <FormattedMessage id="misc.name" />
          </label>
          <input
            type="text"
            id="name"
            className="input"
            value={name}
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
            value={description}
            onChange={handleDescriptionChange}
            autoComplete="off"
            maxLength="255"
          />
          <label htmlFor="points">
            <FormattedMessage id="misc.points" />
          </label>
          <NumberInput
            id="points"
            min={0}
            value={points}
            onChange={handlePointsChange}
            required
            interval={50}
          />
          <Button centered icon="duplicate" submitButton size="large">
            <FormattedMessage id="misc.duplicate" />
          </Button>
        </form>
      </MainComponent>
    </>
  );
};
