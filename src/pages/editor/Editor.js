import { useEffect, useState, Fragment } from "react";
import { useParams, useLocation, Redirect } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FormattedMessage, useIntl } from "react-intl";
import classNames from "classnames";
import { Helmet } from "react-helmet-async";

import { getMaxPercentData, getMinPercentData } from "../../utils/rules";
import { Button } from "../../components/button";
import { Icon } from "../../components/icon";
import { List } from "../../components/list";
import { Header, Main } from "../../components/page";
import { getAllOptions } from "../../utils/unit";
import { throttle } from "../../utils/throttle";
import { getUnitPoints, getPoints, getAllPoints } from "../../utils/points";
import { deleteList } from "../../state/lists";
import { useLanguage } from "../../utils/useLanguage";
import { removeList, updateList } from "../../utils/list";

import "./Editor.css";

export const Editor = ({ isMobile }) => {
  const MainComponent = isMobile ? Main : Fragment;
  const { listId } = useParams();
  const intl = useIntl();
  const dispatch = useDispatch();
  const [redirect, setRedirect] = useState(false);
  const location = useLocation();
  const { language } = useLanguage();
  // const errors = useSelector((state) => state.errors);
  const list = useSelector((state) =>
    state.lists.find(({ id }) => listId === id)
  );

  const handleDelete = () => {
    dispatch(deleteList(listId));
    removeList(listId);
    setRedirect(true);
  };

  useEffect(() => {
    const onScroll = () => {
      if (document.location.hash === `#${location.pathname}`) {
        sessionStorage.setItem("scrollPosition", window.pageYOffset);
      }
    };
    window.addEventListener("scroll", throttle(onScroll, 100));
    window.scrollTo(0, Number(sessionStorage.getItem("scrollPosition")) || 0);

    return () => window.removeEventListener("scroll", onScroll);
  }, [location.pathname]);

  useEffect(() => {
    list && updateList(list);
  }, [list]);

  if (redirect) {
    return <Redirect to="/" />;
  }

  if (!list) {
    if (isMobile) {
      return (
        <>
          <Header to="/" />
          <Main loading />
        </>
      );
    } else {
      return (
        <>
          <Header to="/" isSection />
          <Main loading />
        </>
      );
    }
  }

  const allPoints = getAllPoints(list);
  const lordsPoints = getPoints({ list, type: "lords" });
  const heroesPoints = getPoints({ list, type: "heroes" });
  const charactersPoints = getPoints({ list, type: "characters" });
  const corePoints = getPoints({ list, type: "core" });
  const specialPoints = getPoints({ list, type: "special" });
  const rarePoints = getPoints({ list, type: "rare" });
  const mercenariesPoints = getPoints({ list, type: "mercenaries" });
  const alliesPoints = getPoints({ list, type: "allies" });
  const lordsData = getMaxPercentData({
    type: "lords",
    armyPoints: list.points,
    points: lordsPoints,
  });
  const heroesData = getMaxPercentData({
    type: "heroes",
    armyPoints: list.points,
    points: heroesPoints,
  });
  const charactersData = getMaxPercentData({
    type: "characters",
    armyPoints: list.points,
    points: charactersPoints,
  });
  const coreData = getMinPercentData({
    type: "core",
    armyPoints: list.points,
    points: corePoints,
  });
  const specialData = getMaxPercentData({
    type: "special",
    armyPoints: list.points,
    points: specialPoints,
  });
  const rareData = getMaxPercentData({
    type: "rare",
    armyPoints: list.points,
    points: rarePoints,
  });
  const mercenariesData = getMaxPercentData({
    type: "mercenaries",
    armyPoints: list.points,
    points: rarePoints,
  });
  const alliesData = getMaxPercentData({
    type: "allies",
    armyPoints: list.points,
    points: rarePoints,
  });
  const moreButtons = [
    {
      name: intl.formatMessage({
        id: "misc.edit",
      }),
      icon: "edit",
      to: `/editor/${listId}/edit`,
    },
    {
      name: intl.formatMessage({
        id: "misc.duplicate",
      }),
      icon: "duplicate",
      to: `/editor/${listId}/duplicate`,
    },
    {
      name: intl.formatMessage({
        id: "misc.delete",
      }),
      icon: "delete",
      callback: handleDelete,
    },
    {
      name: intl.formatMessage({
        id: "misc.export",
      }),
      icon: "export",
      to: `/editor/${listId}/export`,
    },
    {
      name: intl.formatMessage({
        id: "misc.print",
      }),
      icon: "print",
      to: `/print/${listId}`,
    },
  ];

  return (
    <>
      <Helmet>
        <title>{`Old World Builder | ${list.name}`}</title>
      </Helmet>

      {isMobile && (
        <Header
          to="/"
          headline={list.name}
          subheadline={
            <>
              <span
                className={classNames(
                  "magic__header-points",
                  allPoints > list.points && "magic__header-points--error"
                )}
              >
                {allPoints}&nbsp;
              </span>
              {`/ ${list.points} ${intl.formatMessage({
                id: "app.points",
              })}`}
            </>
          }
          hasPointsError={allPoints > list.points}
          moreButton={moreButtons}
        />
      )}

      <MainComponent>
        {!isMobile && (
          <Header
            isSection
            to="/"
            headline={list.name}
            subheadline={
              <>
                <span
                  className={classNames(
                    "magic__header-points",
                    allPoints > list.points && "magic__header-points--error"
                  )}
                >
                  {allPoints}&nbsp;
                </span>
                {`/ ${list.points} ${intl.formatMessage({
                  id: "app.points",
                })}`}
              </>
            }
            hasPointsError={allPoints > list.points}
            moreButton={moreButtons}
          />
        )}
        {/* <section>
          {errors.map((error) => (
            <span>
              <strong>{error}</strong>
              <Icon symbol="error" color="red" />
            </span>
          ))}
        </section> */}
        {list.lords && (
          <section className="editor__section">
            <header className="editor__header">
              <h2>
                <FormattedMessage id="editor.lords" />
              </h2>
              <p className="editor__points">
                {lordsData.diff > 0 ? (
                  <>
                    <strong>{lordsData.diff}</strong>
                    <FormattedMessage id="editor.tooManyPoints" />
                    <Icon symbol="error" color="red" />
                  </>
                ) : (
                  <>
                    <strong>{lordsData.points - lordsPoints}</strong>
                    <FormattedMessage id="editor.availablePoints" />
                    <Icon symbol="check" />
                  </>
                )}
              </p>
            </header>
            <ul>
              {list.lords.map((unit, index) => (
                <List
                  key={index}
                  to={`/editor/${listId}/lords/${unit.id}`}
                  className="editor__list"
                  active={location.pathname.includes(unit.id)}
                >
                  <div className="editor__list-inner">
                    <b>{unit[`name_${language}`]}</b>
                    <i>{`${getUnitPoints(unit)} ${intl.formatMessage({
                      id: "app.points",
                    })}`}</i>
                  </div>
                  {getAllOptions(unit)}
                </List>
              ))}
            </ul>
            <Button
              centered
              to={`/editor/${listId}/add/lords`}
              icon="add"
              spaceTop
            >
              <FormattedMessage id="editor.add" />
            </Button>
          </section>
        )}

        {list.heroes && (
          <section className="editor__section">
            <header className="editor__header">
              <h2>
                <FormattedMessage id="editor.heroes" />
              </h2>
              <p className="editor__points">
                {heroesData.diff > 0 ? (
                  <>
                    <strong>{heroesData.diff}</strong>
                    <FormattedMessage id="editor.tooManyPoints" />
                    <Icon symbol="error" color="red" />
                  </>
                ) : (
                  <>
                    <strong>{heroesData.points - heroesPoints}</strong>
                    <FormattedMessage id="editor.availablePoints" />
                    <Icon symbol="check" />
                  </>
                )}
              </p>
            </header>
            <ul>
              {list.heroes.map((unit, index) => (
                <List
                  key={index}
                  to={`/editor/${listId}/heroes/${unit.id}`}
                  className="editor__list"
                  active={location.pathname.includes(unit.id)}
                >
                  <div className="editor__list-inner">
                    <b>{unit[`name_${language}`]}</b>
                    <i>{`${getUnitPoints(unit)} ${intl.formatMessage({
                      id: "app.points",
                    })}`}</i>
                  </div>
                  {getAllOptions(unit)}
                </List>
              ))}
            </ul>
            <Button
              centered
              to={`/editor/${listId}/add/heroes`}
              icon="add"
              spaceTop
            >
              <FormattedMessage id="editor.add" />
            </Button>
          </section>
        )}

        {list.characters && (
          <section className="editor__section">
            <header className="editor__header">
              <h2>
                <FormattedMessage id="editor.characters" />
              </h2>
              <p className="editor__points">
                {charactersData.diff > 0 ? (
                  <>
                    <strong>{charactersData.diff}</strong>
                    <FormattedMessage id="editor.tooManyPoints" />
                    <Icon symbol="error" color="red" />
                  </>
                ) : (
                  <>
                    <strong>{charactersData.points - charactersPoints}</strong>
                    <FormattedMessage id="editor.availablePoints" />
                    <Icon symbol="check" />
                  </>
                )}
              </p>
            </header>
            <ul>
              {list.characters.map((unit, index) => (
                <List
                  key={index}
                  to={`/editor/${listId}/characters/${unit.id}`}
                  className="editor__list"
                  active={location.pathname.includes(unit.id)}
                >
                  <div className="editor__list-inner">
                    <b>{unit[`name_${language}`]}</b>
                    <i>{`${getUnitPoints(unit)} ${intl.formatMessage({
                      id: "app.points",
                    })}`}</i>
                  </div>
                  {getAllOptions(unit)}
                </List>
              ))}
            </ul>
            <Button
              centered
              to={`/editor/${listId}/add/characters`}
              icon="add"
              spaceTop
            >
              <FormattedMessage id="editor.add" />
            </Button>
          </section>
        )}

        <section className="editor__section">
          <header className="editor__header">
            <h2>
              <FormattedMessage id="editor.core" />
            </h2>
            <p className="editor__points">
              {coreData.diff > 0 ? (
                <>
                  <strong>{coreData.diff}</strong>
                  <FormattedMessage id="editor.missingPoints" />
                  <Icon symbol="error" color="red" />
                </>
              ) : (
                <>
                  <strong>{corePoints}</strong>
                  {` / ${coreData.points} `}
                  <FormattedMessage id="app.points" />
                  <Icon symbol="check" />
                </>
              )}
            </p>
          </header>
          <ul>
            {list.core.map((unit, index) => (
              <List
                key={index}
                to={`/editor/${listId}/core/${unit.id}`}
                className="editor__list"
                active={location.pathname.includes(unit.id)}
              >
                <div className="editor__list-inner">
                  <span>
                    {(unit.strength || unit.minimum) &&
                      `${unit.strength || unit.minimum} `}
                    <b>{unit[`name_${language}`]}</b>
                  </span>
                  <i>{`${getUnitPoints(unit)} ${intl.formatMessage({
                    id: "app.points",
                  })}`}</i>
                </div>
                {getAllOptions(unit)}
              </List>
            ))}
          </ul>
          <Button
            centered
            to={`/editor/${listId}/add/core`}
            icon="add"
            spaceTop
          >
            <FormattedMessage id="editor.add" />
          </Button>
        </section>

        <section className="editor__section">
          <header className="editor__header">
            <h2>
              <FormattedMessage id="editor.special" />
            </h2>
            <p className="editor__points">
              {specialData.diff > 0 ? (
                <>
                  <strong>{specialData.diff}</strong>
                  <FormattedMessage id="editor.tooManyPoints" />
                  <Icon symbol="error" color="red" />
                </>
              ) : (
                <>
                  <strong>{specialData.points - specialPoints}</strong>
                  <FormattedMessage id="editor.availablePoints" />
                  <Icon symbol="check" />
                </>
              )}
            </p>
          </header>
          <ul>
            {list.special.map((unit, index) => (
              <List
                key={index}
                to={`/editor/${listId}/special/${unit.id}`}
                className="editor__list"
                active={location.pathname.includes(unit.id)}
              >
                <div className="editor__list-inner">
                  <span>
                    {(unit.strength || unit.minimum) &&
                      `${unit.strength || unit.minimum} `}
                    <b>{unit[`name_${language}`]}</b>
                  </span>
                  <i>{`${getUnitPoints(unit)} ${intl.formatMessage({
                    id: "app.points",
                  })}`}</i>
                </div>
                {getAllOptions(unit)}
              </List>
            ))}
          </ul>
          <Button
            centered
            to={`/editor/${listId}/add/special`}
            icon="add"
            spaceTop
          >
            <FormattedMessage id="editor.add" />
          </Button>
        </section>

        <section className="editor__section">
          <header className="editor__header">
            <h2>
              <FormattedMessage id="editor.rare" />
            </h2>
            <p className="editor__points">
              {rareData.diff > 0 ? (
                <>
                  <strong>{rareData.diff}</strong>
                  <FormattedMessage id="editor.tooManyPoints" />
                  <Icon symbol="error" color="red" />
                </>
              ) : (
                <>
                  <strong>{rareData.points - rarePoints}</strong>
                  <FormattedMessage id="editor.availablePoints" />
                  <Icon symbol="check" />
                </>
              )}
            </p>
          </header>
          <ul>
            {list.rare.map((unit, index) => (
              <List
                key={index}
                to={`/editor/${listId}/rare/${unit.id}`}
                className="editor__list"
                active={location.pathname.includes(unit.id)}
              >
                <div className="editor__list-inner">
                  <span>
                    {(unit.strength || unit.minimum) &&
                      `${unit.strength || unit.minimum} `}
                    <b>{unit[`name_${language}`]}</b>
                  </span>
                  <i>{`${getUnitPoints(unit)} ${intl.formatMessage({
                    id: "app.points",
                  })}`}</i>
                </div>
                {getAllOptions(unit)}
              </List>
            ))}
          </ul>
          <Button
            centered
            to={`/editor/${listId}/add/rare`}
            icon="add"
            spaceTop
          >
            <FormattedMessage id="editor.add" />
          </Button>
        </section>

        {list.mercenaries && (
          <section className="editor__section">
            <header className="editor__header">
              <h2>
                <FormattedMessage id="editor.mercenaries" />
              </h2>
              <p className="editor__points">
                {mercenariesData.diff > 0 ? (
                  <>
                    <strong>{mercenariesData.diff}</strong>
                    <FormattedMessage id="editor.tooManyPoints" />
                    <Icon symbol="error" color="red" />
                  </>
                ) : (
                  <>
                    <strong>
                      {mercenariesData.points - mercenariesPoints}
                    </strong>
                    <FormattedMessage id="editor.availablePoints" />
                    <Icon symbol="check" />
                  </>
                )}
              </p>
            </header>
            <ul>
              {list.mercenaries.map((unit, index) => (
                <List
                  key={index}
                  to={`/editor/${listId}/mercenaries/${unit.id}`}
                  className="editor__list"
                  active={location.pathname.includes(unit.id)}
                >
                  <div className="editor__list-inner">
                    <b>{unit[`name_${language}`]}</b>
                    <i>{`${getUnitPoints(unit)} ${intl.formatMessage({
                      id: "app.points",
                    })}`}</i>
                  </div>
                  {getAllOptions(unit)}
                </List>
              ))}
            </ul>
            <p className="editor__soon">Coming soon</p>
            {/* <Button
              centered
              to={`/editor/${listId}/add/mercenaries`}
              icon="add"
              spaceTop
            >
              <FormattedMessage id="editor.add" />
            </Button> */}
          </section>
        )}

        {list.allies && (
          <section className="editor__section">
            <header className="editor__header">
              <h2>
                <FormattedMessage id="editor.allies" />
              </h2>
              <p className="editor__points">
                {alliesData.diff > 0 ? (
                  <>
                    <strong>{alliesData.diff}</strong>
                    <FormattedMessage id="editor.tooManyPoints" />
                    <Icon symbol="error" color="red" />
                  </>
                ) : (
                  <>
                    <strong>{alliesData.points - alliesPoints}</strong>
                    <FormattedMessage id="editor.availablePoints" />
                    <Icon symbol="check" />
                  </>
                )}
              </p>
            </header>
            <ul>
              {list.allies.map((unit, index) => (
                <List
                  key={index}
                  to={`/editor/${listId}/allies/${unit.id}`}
                  className="editor__list"
                  active={location.pathname.includes(unit.id)}
                >
                  <div className="editor__list-inner">
                    <b>{unit[`name_${language}`]}</b>
                    <i>{`${getUnitPoints(unit)} ${intl.formatMessage({
                      id: "app.points",
                    })}`}</i>
                  </div>
                  {getAllOptions(unit)}
                </List>
              ))}
            </ul>
            <p className="editor__soon">Coming soon</p>
            {/* <Button
              centered
              to={`/editor/${listId}/add/allies`}
              icon="add"
              spaceTop
            >
              <FormattedMessage id="editor.add" />
            </Button> */}
          </section>
        )}
      </MainComponent>
    </>
  );
};
