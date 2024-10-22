import { useEffect, useState, Fragment } from "react";
import { useParams, useLocation, Redirect } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FormattedMessage, useIntl } from "react-intl";
import classNames from "classnames";
import { Helmet } from "react-helmet-async";

import { getMaxPercentData, getMinPercentData, getSlots } from "../../utils/rules";
import { Button } from "../../components/button";
import { Icon } from "../../components/icon";
import { OrderableList } from "../../components/list";
import { Header, Main } from "../../components/page";
import { Dialog } from "../../components/dialog";
import { ListItem } from "../../components/list/ListItem";
import { ErrorMessage } from "../../components/error-message";
import { getAllOptions, getUnitName } from "../../utils/unit";
import { throttle } from "../../utils/throttle";
import { getUnitPoints, getPoints, getAllPoints, getOccupiedSlots } from "../../utils/points";
import { useLanguage } from "../../utils/useLanguage";
import { validateList, validateWhfbList } from "../../utils/validation";
import { removeFromLocalList, updateLocalList } from "../../utils/list";
import { deleteList, moveUnit } from "../../state/lists";
import { setErrors } from "../../state/errors";

import "./Editor.css";

export const Editor = ({ isMobile }) => {
  const MainComponent = isMobile ? Main : Fragment;
  const { listId } = useParams();
  const intl = useIntl();
  const dispatch = useDispatch();
  const { language } = useLanguage();
  const [redirect, setRedirect] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const location = useLocation();
  const errors = useSelector((state) => state.errors);
  const list = useSelector((state) =>
    state.lists.find(({ id }) => listId === id)
  );

  const handleDeleteClick = (event) => {
    event.preventDefault();
    setIsDialogOpen(false);
  };

  const handleDeleteConfirm = () => {
    setIsDialogOpen(false);
    dispatch(deleteList(listId));
    removeFromLocalList(listId);
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

  if ( list && list.game == "the-old-world" ) {
    useEffect(() => {
        dispatch(
          setErrors(
            validateList({
              list,
              language,
              intl,
            })
          )
        );
        updateLocalList(list);
    }, [list, dispatch, language, intl]);
  } 
  else {
    useEffect(() => {
      dispatch(
        setErrors(
          validateWhfbList({
            list,
            language,
            intl,
          })
        )
      );
      updateLocalList(list);
  }, [list, dispatch, language, intl]);
  }

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

  const gameMode = list.game;
  const allPoints = getAllPoints(list);
  const lordsPoints = getPoints({ list, type: "lords" });
  const heroesPoints = getPoints({ list, type: "heroes" });
  const charactersPoints = getPoints({ list, type: "characters" });
  const corePoints = getPoints({ list, type: "core" });
  const specialPoints = getPoints({ list, type: "special" });
  const rarePoints = getPoints({ list, type: "rare" });
  const mercenariesPoints = getPoints({ list, type: "mercenaries" });
  const alliesPoints = getPoints({ list, type: "allies" });
  // Split out defintion to separate files and load only those required
  // for the the list
  const lordsData =
    list.lords &&
    getMaxPercentData({
      type: "lords",
      armyPoints: list.points,
      points: lordsPoints,
      armyComposition: list.armyComposition,
    });
  const heroesData =
    list.lords &&
    getMaxPercentData({
      type: "heroes",
      armyPoints: list.points,
      points: heroesPoints,
      armyComposition: list.armyComposition,
    });
  const charactersData =
    list.characters &&
    getMaxPercentData({
      type: "characters",
      armyPoints: list.points,
      points: charactersPoints,
      armyComposition: list.armyComposition,
    });
  const coreData = getMinPercentData({
    type: "core",
    armyPoints: list.points,
    points: corePoints,
    armyComposition: list.armyComposition,
  });
  const specialData = getMaxPercentData({
    type: "special",
    armyPoints: list.points,
    points: specialPoints,
    armyComposition: list.armyComposition,
  });
  const rareData = getMaxPercentData({
    type: "rare",
    armyPoints: list.points,
    points: rarePoints,
    armyComposition: list.armyComposition,
  });
  const mercenariesData =
    list.mercenaries &&
    getMaxPercentData({
      type: "mercenaries",
      armyPoints: list.points,
      points: mercenariesPoints,
      armyComposition: list.armyComposition,
    });
  const alliesData =
    list.allies &&
    getMaxPercentData({
      type: "allies",
      armyPoints: list.points,
      points: alliesPoints,
      armyComposition: list.armyComposition,
    });

  const sixthLordsSlots = getOccupiedSlots({ list, type: "lords" });
  const sixthHeroesSlots = getOccupiedSlots({ list, type: "heroes" });
  const sixthCoreSlots = getOccupiedSlots({ list, type: "core" });
  const sixthSpecialSlots = getOccupiedSlots({ list, type: "special" });
  const sixthRareSlots = getOccupiedSlots({ list, type: "rare" });
  
  const sixthLordData =
    list.lords &&
    getSlots({
      type: "lords",
      occupiedSlots: sixthLordsSlots,
      armyPoints: list.points
    });
  const sixthHeroesData =
    list.heroes &&
    getSlots({
      type: "heroes",
      occupiedSlots: sixthHeroesSlots,
      armyPoints: list.points
    });
  const sixthCoreData = getSlots({
      type: "core",
      occupiedSlots: sixthCoreSlots,
      armyPoints: list.points
    });
  const sixthSpecialData = getSlots({
      type: "special",
      occupiedSlots: sixthSpecialSlots,
      armyPoints: list.points
    });
  const sixthRareData = getSlots({
      type: "rare",
      occupiedSlots: sixthRareSlots,
      armyPoints: list.points
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
        id: "misc.gameView",
      }),
      icon: "shield",
      to: `/game-view/${listId}`,
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
    {
      name: intl.formatMessage({
        id: "misc.delete",
      }),
      icon: "delete",
      callback: () => setIsDialogOpen(true),
    },
  ];

  return (
    <>
      <Helmet>
        <title>{`Old World Builder | ${list?.name}`}</title>
      </Helmet>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <p>
          <FormattedMessage
            id="editor.confirmDelete"
            values={{
              list: <b>{list.name}</b>,
            }}
          />
        </p>
        <div className="editor__delete-dialog">
          <Button
            type="text"
            onClick={handleDeleteClick}
            icon="close"
            spaceTop
            color="dark"
          >
            <FormattedMessage id="misc.cancel" />
          </Button>
          <Button
            type="primary"
            submitButton
            onClick={handleDeleteConfirm}
            icon="delete"
            spaceTop
          >
            <FormattedMessage id="misc.delete" />
          </Button>
        </div>
      </Dialog>

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
          navigationIcon="more"
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
            navigationIcon="more"
          />
        )}
        <section>
          {errors
            .filter(({ section }) => section === "global")
            .map(({ message }) => (
              <ErrorMessage key={message} spaceAfter>
                <FormattedMessage id={message} />
              </ErrorMessage>
            ))}
        </section>
        {/* Disable Lords section for WHFB lists under 2,000 points */}
        { (list.lords && list.points >= 2000 ) && (
          <section className="editor__section">
            <header className="editor__header">
              <h2>
                <FormattedMessage id="editor.lords" />
              </h2>
              <p className="editor__points">
                { (gameMode == "the-old-world" && lordsData.diff > 0) || (gameMode == "warhammer-fantasy-6" && sixthLordData.overLimit ) ? (
                  <>
                    <strong>{
                      gameMode === "warhammer-fantasy-6"
                        ? sixthLordData.diff - sixthLordData.maxSlots
                        : lordsData.diff
                    }</strong>
                    <FormattedMessage id={
                      gameMode === "warhammer-fantasy-6"
                        ? "editor.tooManySlots"
                        : "editor.tooManyPoints"
                    }/>
                    <Icon symbol="error" color="red" />
                  </>
                ) : (
                  <>
                    <strong>{
                      gameMode === "warhammer-fantasy-6"
                        ? sixthLordData.maxSlots - sixthLordData.diff
                        : lordsData.points - lordsPoints
                    }</strong>
                    <FormattedMessage id={
                      gameMode === "warhammer-fantasy-6"
                        ? "editor.availableSlots"
                        : "editor.availablePoints"
                    }/>
                    <Icon symbol="check" />
                  </>
                )}
              </p>
            </header>

            <OrderableUnitList
              units={list.lords}
              type="lords"
              listId={listId}
            />

            {errors
              .filter(({ section }) => section === "lords")
              .map(({ message, name, diff, min, option }, index) => (
                <ErrorMessage key={message + index} spaceBefore>
                  <FormattedMessage
                    id={message}
                    values={{
                      name,
                      diff,
                      min,
                      option,
                    }}
                  />
                </ErrorMessage>
              ))
            }

            <Button
              type="primary"
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
                {(gameMode == "the-old-world" && heroesData.diff > 0) || (gameMode == "warhammer-fantasy-6" && sixthHeroesData.overLimit ) ? (
                  <>
                    <strong>{
                      gameMode === "warhammer-fantasy-6"
                        ? sixthHeroesData.diff - sixthHeroesData.maxSlots
                        : lordsData.diff
                    }</strong>
                    <FormattedMessage id={
                      gameMode === "warhammer-fantasy-6"
                        ? "editor.tooManySlots"
                        : "editor.tooManyPoints"
                    }/>
                    <Icon symbol="error" color="red" />
                  </>
                ) : (
                  <>
                    <strong>{
                      gameMode === "warhammer-fantasy-6"
                        ? sixthHeroesData.maxSlots - sixthHeroesData.diff
                        : heroesData.points - heroesPoints
                    }</strong>
                    <FormattedMessage id={
                      gameMode === "warhammer-fantasy-6"
                        ? "editor.availableSlots"
                        : "editor.availablePoints"
                    } />
                    <Icon symbol="check" />
                  </>
                )}
              </p>
            </header>

            <OrderableUnitList
              units={list.heroes}
              type="heroes"
              listId={listId}
            />

            {errors
              .filter(({ section }) => section === "heroes")
              .map(({ message, name, diff, min, option }, index) => (
                <ErrorMessage key={message + index} spaceBefore>
                  <FormattedMessage
                    id={message}
                    values={{
                      name,
                      diff,
                      min,
                      option,
                    }}
                  />
                </ErrorMessage>
              ))
            }

            <Button
              type="primary"
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

            <OrderableUnitList
              units={list.characters}
              type="characters"
              listId={listId}
            />

            {errors
              .filter(({ section }) => section === "characters")
              .map(({ message, name, diff, min, option }, index) => (
                <ErrorMessage key={message + index} spaceBefore>
                  <FormattedMessage
                    id={message}
                    values={{
                      name,
                      diff,
                      min,
                      option,
                    }}
                  />
                </ErrorMessage>
              ))}

            <Button
              type="primary"
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
              {(gameMode == "the-old-world" && coreData.diff > 0) || (gameMode == "warhammer-fantasy-6" && sixthCoreData.diff < sixthCoreData.minSlots) ? (
                <>
                  <strong>{
                    gameMode === "warhammer-fantasy-6"
                      ? sixthCoreData.minSlots - sixthCoreData.occupiedSlots
                      : coreData.diff
                  }</strong>
                  <FormattedMessage id={
                    gameMode === "warhammer-fantasy-6"
                      ? "editor.tooFewSlots"
                      : "editor.missingPoints"
                  }/>
                  <Icon symbol="error" color="red" />
                </>
              ) : (
                <>
                  <strong>{
                    gameMode === "warhammer-fantasy-6"
                      ? sixthCoreData.occupiedSlots
                      : corePoints
                  }</strong>
                  <FormattedMessage id={
                    gameMode === "warhammer-fantasy-6"
                      ? "editor.satisfactorySlots"
                      : "app.points"
                  }/>
                  <Icon symbol="check" />
                </>
              )}
            </p>
          </header>

          <OrderableUnitList units={list.core} type="core" listId={listId} />

          {errors
            .filter(({ section }) => section === "core")
            .map(({ message, name, min, diff, option }, index) => (
              <ErrorMessage key={message + index} spaceBefore>
                <FormattedMessage
                  id={message}
                  values={{
                    name,
                    min,
                    diff,
                    option,
                  }}
                />
              </ErrorMessage>
            ))}

          <Button
            type="primary"
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
              {(gameMode == "the-old-world" && specialData.diff > 0) || (gameMode == "warhammer-fantasy-6" && sixthSpecialData.overLimit ) ? (
                <>
                  <strong>{
                    gameMode === "warhammer-fantasy-6"
                      ? sixthSpecialData.diff - sixthSpecialData.maxSlots
                      : specialData.diff
                  }</strong>
                  <FormattedMessage id={
                    gameMode === "warhammer-fantasy-6"
                      ? "editor.tooManySlots"
                      : "editor.tooManyPoints"
                  }/>
                  <Icon symbol="error" color="red" />
                </>
              ) : (
                <>
                  <strong>{
                    gameMode === "warhammer-fantasy-6"
                      ? sixthSpecialData.maxSlots - sixthSpecialData.diff
                      : specialData.points - specialPoints
                  }</strong>
                  <FormattedMessage id={
                    gameMode === "warhammer-fantasy-6"
                      ? "editor.availableSlots"
                      : "editor.availablePoints"
                  }/>
                  <Icon symbol="check" />
                </>
              )}
            </p>
          </header>

          <OrderableUnitList
            units={list.special}
            type="special"
            listId={listId}
          />

          {errors
            .filter(({ section }) => section === "special")
            .map(({ message, name, diff, min, option }, index) => (
              <ErrorMessage key={message + index} spaceBefore>
                <FormattedMessage
                  id={message}
                  values={{
                    name,
                    diff,
                    min,
                    option,
                  }}
                />
              </ErrorMessage>
            ))}

          <Button
            type="primary"
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
              {(gameMode == "the-old-world" && rareData.diff > 0) || (gameMode == "warhammer-fantasy-6" && sixthRareData.overLimit ) ? (
                <>
                  <strong>{
                    gameMode === "warhammer-fantasy-6"
                      ? sixthRareData.diff - sixthRareData.maxSlots
                      : rareData.diff
                  }</strong>
                  <FormattedMessage id={
                    gameMode === "warhammer-fantasy-6"
                      ? "editor.tooManySlots"
                      : "editor.tooManyPoints"
                  }/>
                  <Icon symbol="error" color="red" />
                </>
              ) : (
                <>
                  <strong>{
                      gameMode === "warhammer-fantasy-6"
                        ? sixthRareData.maxSlots - sixthRareData.diff
                        : rareData.points - rarePoints
                  }</strong>
                  <FormattedMessage id={
                    gameMode === "warhammer-fantasy-6"
                      ? "editor.availableSlots"
                      : "editor.availablePoints"
                  }/>
                  <Icon symbol="check" />
                </>
              )}
            </p>
          </header>

          <OrderableUnitList units={list.rare} type="rare" listId={listId} />

          {errors
            .filter(({ section }) => section === "rare")
            .map(({ message, name, diff, min, option }, index) => (
              <ErrorMessage key={message + index} spaceBefore>
                <FormattedMessage
                  id={message}
                  values={{
                    name,
                    diff,
                    min,
                    option,
                  }}
                />
              </ErrorMessage>
            ))}

          <Button
            type="primary"
            centered
            to={`/editor/${listId}/add/rare`}
            icon="add"
            spaceTop
          >
            <FormattedMessage id="editor.add" />
          </Button>
        </section>

        {list.allies && alliesData && list?.army !== "daemons-of-chaos" && (
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

            <OrderableUnitList
              units={list.allies}
              type="allies"
              listId={listId}
            />

            {errors
              .filter(({ section }) => section === "allies")
              .map(({ message, name, diff, min, option }, index) => (
                <ErrorMessage key={message + index} spaceBefore>
                  <FormattedMessage
                    id={message}
                    values={{
                      name,
                      diff,
                      min,
                      option,
                    }}
                  />
                </ErrorMessage>
              ))}

            <Button
              type="primary"
              centered
              to={`/editor/${listId}/add/allies`}
              icon="add"
              spaceTop
            >
              <FormattedMessage id="editor.add" />
            </Button>
          </section>
        )}

        {list.mercenaries &&
          mercenariesData &&
          list.armyComposition &&
          list?.army !== "daemons-of-chaos" &&
          list?.army !== "vampire-counts" && (
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

              <OrderableUnitList
                units={list.mercenaries}
                type="mercenaries"
                listId={listId}
              />

              {errors
                .filter(({ section }) => section === "mercenaries")
                .map(({ message, name, diff, min, option }, index) => (
                  <ErrorMessage key={message + index} spaceBefore>
                    <FormattedMessage
                      id={message}
                      values={{
                        name,
                        diff,
                        min,
                        option,
                      }}
                    />
                  </ErrorMessage>
                ))}

              <Button
                type="primary"
                centered
                to={`/editor/${listId}/add/mercenaries`}
                icon="add"
                spaceTop
              >
                <FormattedMessage id="editor.add" />
              </Button>
            </section>
          )}
      </MainComponent>
    </>
  );
};

/**
 * @param {object} props
 * @param {object[]} props.units
 * @param {string} props.type
 * @param {string} props.listId
 */
export const OrderableUnitList = ({ units, type, listId }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const intl = useIntl();
  const { language } = useLanguage();

  const handleMoved = (indexes) =>
    dispatch(
      moveUnit({
        listId,
        type,
        ...indexes,
      })
    );

  return (
    <OrderableList id={type} onMoved={handleMoved}>
      {units?.length > 0 &&
        units.map((unit, index) => (
          <ListItem
            key={index}
            to={`/editor/${listId}/${type}/${unit.id}`}
            className="editor__list"
            active={location.pathname.includes(unit.id)}
          >
            <div className="editor__list-inner">
              {unit.strength || unit.minimum ? (
                <span>{`${unit.strength || unit.minimum}`}</span>
              ) : null}
              <b>{getUnitName({ unit, language })}</b>
              <i>{`${getUnitPoints(unit)} ${intl.formatMessage({
                id: "app.points",
              })}`}</i>
            </div>
            <p>{getAllOptions(unit)}</p>
          </ListItem>
        ))}
    </OrderableList>
  );
};
