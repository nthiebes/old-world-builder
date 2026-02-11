import { useEffect, useState, Fragment } from "react";
import { useParams, useLocation, Redirect } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FormattedMessage, useIntl } from "react-intl";
import classNames from "classnames";
import { Helmet } from "react-helmet-async";

import { getMaxPercentData, getMinPercentData, getMaxSlots, getMinSlots } from "../../utils/rules";
import { Button } from "../../components/button";
import { Icon } from "../../components/icon";
import { OrderableList } from "../../components/list";
import { Header, Main } from "../../components/page";
import { Dialog } from "../../components/dialog";
import { ListItem } from "../../components/list/ListItem";
import { ErrorMessage } from "../../components/error-message";
import { getAllOptions, getUnitName } from "../../utils/unit";
import { throttle } from "../../utils/throttle";
import { getUnitPoints, getPoints, getAllPoints } from "../../utils/points";
import { useLanguage } from "../../utils/useLanguage";
import { validateList } from "../../utils/validation";
import { removeFromLocalList, updateLocalList } from "../../utils/list";
import { deleteList, moveUnit } from "../../state/lists";
import { setErrors } from "../../state/errors";
import { getGameSystems } from "../../utils/game-systems";

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

  useEffect(() => {
    if (list) {
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
    }
  }, [list, dispatch, language, intl]);

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

  const armyComposition = list.armyComposition || list.army;
  const allPoints = getAllPoints(list);
  const lordsPoints = getPoints({ list, type: "lords" });
  const heroesPoints = getPoints({ list, type: "heroes" });
  const charactersPoints = getPoints({ list, type: "characters" });
  const corePoints = getPoints({ list, type: "core" });
  const specialPoints = getPoints({ list, type: "special" });
  const rarePoints = getPoints({ list, type: "rare" });
  const mercenariesPoints = getPoints({ list, type: "mercenaries" });
  const alliesPoints = getPoints({ list, type: "allies" });

  // Get game and army data to check if allies/mercenaries are available
  const gameSystems = getGameSystems();
  const game = gameSystems.find((g) => g.id === list.game);
  const armyData = game?.armies.find((a) => a.id === list.army);
  const hasAllies = armyData?.allies && armyData.allies.length > 0;
  const hasMercenaries = armyData?.mercenaries && Object.keys(armyData.mercenaries).length > 0;
  const lordsData =
    list.lords &&
    getMaxSlots({
      type: "lords",
      armyPoints: list.points,
      slots: list.lords.length,
      armyComposition,
    });
  const heroesData =
    list.lords &&
    getMaxSlots({
      type: "heroes",
      armyPoints: list.points,
      slots: list.heroes.length,
      armyComposition,
    });
  const charactersData =
    list.characters &&
    getMaxSlots({
      type: "characters",
      armyPoints: list.points,
      slots: list.characters.length,
      armyComposition,
    });
  const coreData = getMinSlots({
    type: "core",
    armyPoints: list.points,
    slots: list.core.length,
    armyComposition,
  });
  const specialData = getMaxSlots({
    type: "special",
    armyPoints: list.points,
    slots: list.special.length,
    armyComposition,
  });
  const rareData = getMaxSlots({
    type: "rare",
    armyPoints: list.points,
    slots: list.rare.length,
    armyComposition,
  });
  const mercenariesData =
    list.mercenaries &&
    getMaxPercentData({
      type: "mercenaries",
      armyPoints: list.points,
      points: mercenariesPoints,
      armyComposition,
    });
  const alliesData =
    list.allies &&
    getMaxPercentData({
      type: "allies",
      armyPoints: list.points,
      points: alliesPoints,
      armyComposition,
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
        <title>{`Warhammer Fantasy Builder | ${list?.name}`}</title>
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
              <ErrorMessage key={message} spaceAfter spaceBefore={isMobile}>
                <FormattedMessage id={message} />
              </ErrorMessage>
            ))}
        </section>
        {list.lords && list.game !== "the-old-world" && (
          <section className="editor__section">
            <header className="editor__header">
              <h2>
                <FormattedMessage id="editor.lords" />
              </h2>
              <p className="editor__points">
                {lordsData.diff > 0 ? (
                  <>
                    <strong>{lordsData.diff}</strong>
                    <FormattedMessage id="editor.tooManySlots" />
                    <Icon symbol="error" color="red" />
                  </>
                ) : (
                  <>
                    <strong>{lordsData.maxSlots - lordsData.slots}</strong>
                    <FormattedMessage id="editor.availableSlots" />
                    <Icon symbol="check" />
                  </>
                )}
              </p>
            </header>

            <OrderableUnitList
              units={list.lords}
              type="lords"
              listId={listId}
              armyComposition={armyComposition}
            />

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

        {list.heroes && list.game !== "the-old-world" && (
          <section className="editor__section">
            <header className="editor__header">
              <h2>
                <FormattedMessage id="editor.heroes" />
              </h2>
              <p className="editor__points">
                {heroesData.diff > 0 ? (
                  <>
                    <strong>{heroesData.diff}</strong>
                    <FormattedMessage id="editor.tooManySlots" />
                    <Icon symbol="error" color="red" />
                  </>
                ) : (
                  <>
                    <strong>{heroesData.maxSlots - heroesData.slots}</strong>
                    <FormattedMessage id="editor.availableSlots" />
                    <Icon symbol="check" />
                  </>
                )}
              </p>
            </header>

            <OrderableUnitList
              units={list.heroes}
              type="heroes"
              listId={listId}
              armyComposition={armyComposition}
            />

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

        {list.characters && list.game === "the-old-world" && (
          <section className="editor__section">
            <header className="editor__header">
              <h2>
                <FormattedMessage id="editor.characters" />
              </h2>
              <p className="editor__points">
                {charactersData.diff > 0 ? (
                  <>
                    <strong>{charactersData.diff}</strong>
                    <FormattedMessage id="editor.tooManySlots" />
                    <Icon symbol="error" color="red" />
                  </>
                ) : (
                  <>
                    <strong>{charactersData.maxSlots - charactersData.slots}</strong>
                    <FormattedMessage id="editor.availableSlots" />
                    <Icon symbol="check" />
                  </>
                )}
              </p>
            </header>

            <OrderableUnitList
              units={list.characters}
              type="characters"
              listId={listId}
              armyComposition={armyComposition}
            />

            {errors
              .filter(({ section }) => section === "characters")
              .map(({ message, name, diff, min, max, option }, index) => (
                <ErrorMessage key={message + index} spaceBefore>
                  <FormattedMessage
                    id={message}
                    values={{
                      name,
                      diff,
                      min,
                      max,
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
              {coreData.diff > 0 ? (
                <>
                  <strong>{coreData.diff}</strong>
                  <FormattedMessage id="editor.missingSlots" />
                  <Icon symbol="error" color="red" />
                </>
              ) : (
                <>
                  <strong>{coreData.slots}</strong>
                  {` / ${coreData.minSlots} `}
                  <FormattedMessage id="app.slots" />
                  <Icon symbol="check" />
                </>
              )}
            </p>
          </header>

          <OrderableUnitList
            units={list.core}
            type="core"
            listId={listId}
            armyComposition={armyComposition}
          />

          {errors
            .filter(({ section }) => section === "core")
            .map(({ message, name, min, max, diff, option }, index) => (
              <ErrorMessage key={message + index} spaceBefore>
                <FormattedMessage
                  id={message}
                  values={{
                    name,
                    min,
                    max,
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
              {specialData.diff > 0 ? (
                <>
                  <strong>{specialData.diff}</strong>
                  <FormattedMessage id="editor.tooManySlots" />
                  <Icon symbol="error" color="red" />
                </>
              ) : (
                <>
                  <strong>{specialData.maxSlots- specialData.slots}</strong>
                  <FormattedMessage id="editor.availableSlots" />
                  <Icon symbol="check" />
                </>
              )}
            </p>
          </header>

          <OrderableUnitList
            units={list.special}
            type="special"
            listId={listId}
            armyComposition={armyComposition}
          />

          {errors
            .filter(({ section }) => section === "special")
            .map(({ message, name, diff, min, max, option }, index) => (
              <ErrorMessage key={message + index} spaceBefore>
                <FormattedMessage
                  id={message}
                  values={{
                    name,
                    diff,
                    min,
                    max,
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
              {rareData.diff > 0 ? (
                <>
                  <strong>{rareData.diff}</strong>
                  <FormattedMessage id="editor.tooManySlots" />
                  <Icon symbol="error" color="red" />
                </>
              ) : (
                <>
                  <strong>{rareData.maxSlots- rareData.slots}</strong>
                  <FormattedMessage id="editor.availableSlots" />
                  <Icon symbol="check" />
                </>
              )}
            </p>
          </header>

          <OrderableUnitList
            units={list.rare}
            type="rare"
            listId={listId}
            armyComposition={armyComposition}
          />

          {errors
            .filter(({ section }) => section === "rare")
            .map(({ message, name, diff, min, max, option }, index) => (
              <ErrorMessage key={message + index} spaceBefore>
                <FormattedMessage
                  id={message}
                  values={{
                    name,
                    diff,
                    min,
                    max,
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

        {list.mercenaries &&
          mercenariesData &&
          armyComposition &&
          hasMercenaries && (
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
                armyComposition={armyComposition}
              />

              {errors
                .filter(({ section }) => section === "mercenaries")
                .map(({ message, name, diff, min, max, option }, index) => (
                  <ErrorMessage key={message + index} spaceBefore>
                    <FormattedMessage
                      id={message}
                      values={{
                        name,
                        diff,
                        min,
                        max,
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

        {list.allies &&
          alliesData &&
          hasAllies && (
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
                armyComposition={armyComposition}
              />

              {errors
                .filter(({ section }) => section === "allies")
                .map(({ message, name, diff, min, max, option }, index) => (
                  <ErrorMessage key={message + index} spaceBefore>
                    <FormattedMessage
                      id={message}
                      values={{
                        name,
                        diff,
                        min,
                        max,
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

        <Button
          type="secondary"
          centered
          to={`/game-view/${listId}`}
          icon="shield"
          spaceTop
        >
          <FormattedMessage id="misc.gameView" />
        </Button>
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
export const OrderableUnitList = ({ units, type, listId, armyComposition }) => {
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
              <i>{`${getUnitPoints(
                { ...unit, type },
                {
                  armyComposition,
                }
              )} ${intl.formatMessage({
                id: "app.points",
              })}`}</i>
            </div>
            <p>{getAllOptions(unit, { armyComposition })}</p>
          </ListItem>
        ))}
    </OrderableList>
  );
};
