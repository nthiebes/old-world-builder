import { useEffect, useState, Fragment } from "react";
import { useParams, useLocation, Redirect } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FormattedMessage, useIntl } from "react-intl";
import classNames from "classnames";
import { Helmet } from "react-helmet-async";

import { Button } from "../../components/button";
import { Icon } from "../../components/icon";
import { OrderableList } from "../../components/list";
import { Header, Main } from "../../components/page";
import { Dialog } from "../../components/dialog";
import { ListItem } from "../../components/list/ListItem";
import { getAllOptions } from "../../utils/unit";
import { throttle } from "../../utils/throttle";
import {
  sumUnitPoints,
  sumCategoryPoints,
  sumArmyListPoints,
  getAvailablePoints,
  getRequiredPoints,
} from "../../utils/points";
import { deleteList, moveUnit } from "../../state/lists";
import { useLanguage } from "../../utils/useLanguage";
import { removeFromLocalList, updateLocalList } from "../../utils/list";

import "./Editor.css";

export const Editor = ({ isMobile }) => {
  const MainComponent = isMobile ? Main : Fragment;
  const { listId } = useParams();
  const intl = useIntl();
  const dispatch = useDispatch();
  const [redirect, setRedirect] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const location = useLocation();
  // const errors = useSelector((state) => state.errors);
  const list = useSelector((state) =>
    state.lists.find(({ id }) => listId === id)
  );

  const handleCancelClick = (event) => {
    event.preventDefault();
    setIsDialogOpen(false);
  };

  const handleDeleteConfirm = () => {
    setIsDialogOpen(false);
    dispatch(deleteList(listId));
    removeFromLocalList(listId);
    setRedirect(true);
  };

  useRememberScroll(location.pathname);

  useEffect(() => {
    list && updateLocalList(list);
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

  const allPoints = sumArmyListPoints(list);

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
            onClick={handleCancelClick}
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
              <MaximumPoints points={getAvailablePoints(list, "lords")} />
            </header>

            <OrderableUnitList units={list.lords} category="lords" />

            <AddButton category="lords" />
          </section>
        )}

        {list.heroes && (
          <section className="editor__section">
            <header className="editor__header">
              <h2>
                <FormattedMessage id="editor.heroes" />
              </h2>
              <MaximumPoints points={getAvailablePoints(list, "heroes")} />
            </header>

            <OrderableUnitList units={list.heroes} category="heroes" />

            <AddButton category="heroes" />
          </section>
        )}

        {list.characters && (
          <section className="editor__section">
            <header className="editor__header">
              <h2>
                <FormattedMessage id="editor.characters" />
              </h2>
              <MaximumPoints points={getAvailablePoints(list, "characters")} />
            </header>

            <OrderableUnitList units={list.characters} category="characters" />

            <AddButton category="characters" />
          </section>
        )}

        <section className="editor__section">
          <header className="editor__header">
            <h2>
              <FormattedMessage id="editor.core" />
            </h2>
            <MinimumPoints
              points={sumCategoryPoints(list, "core")}
              requiredPoints={getRequiredPoints(list, "core")}
            />
          </header>

          <OrderableUnitList units={list.core} category="core" />

          <AddButton category="core" />
        </section>

        <section className="editor__section">
          <header className="editor__header">
            <h2>
              <FormattedMessage id="editor.special" />
            </h2>
            <MaximumPoints points={getAvailablePoints(list, "special")} />
          </header>

          <OrderableUnitList units={list.special} category="special" />

          <AddButton category="special" />
        </section>

        <section className="editor__section">
          <header className="editor__header">
            <h2>
              <FormattedMessage id="editor.rare" />
            </h2>
            <MaximumPoints points={getAvailablePoints(list, "rare")} />
          </header>

          <OrderableUnitList units={list.rare} category="rare" />

          <AddButton category="rare" />
        </section>

        {list.allies && list?.army !== "daemons-of-chaos" && (
          <section className="editor__section">
            <header className="editor__header">
              <h2>
                <FormattedMessage id="editor.allies" />
              </h2>
              <MaximumPoints points={getAvailablePoints(list, "allies")} />
            </header>

            <OrderableUnitList units={list.allies} category="allies" />

            <AddButton category="allies" />
          </section>
        )}

        {list.mercenaries &&
          list.armyComposition &&
          list.army !== list.armyComposition && (
            <section className="editor__section">
              <header className="editor__header">
                <h2>
                  <FormattedMessage id="editor.mercenaries" />
                </h2>
                <MaximumPoints
                  points={getAvailablePoints(list, "mercenaries")}
                />
              </header>

              <OrderableUnitList
                units={list.mercenaries}
                category="mercenaries"
              />

              <AddButton category="mercenaries" />
            </section>
          )}
      </MainComponent>
    </>
  );
};

export const MinimumPoints = ({ points, requiredPoints }) => (
  <p className="editor__points">
    {points < requiredPoints ? (
      <>
        <strong>{requiredPoints - points}</strong>
        <FormattedMessage id="editor.missingPoints" />
        <Icon symbol="error" color="red" />
      </>
    ) : (
      <>
        <strong>{points}</strong>
        {` / ${requiredPoints} `}
        <FormattedMessage id="app.points" />
        <Icon symbol="check" />
      </>
    )}
  </p>
);

export const MaximumPoints = ({ points }) => (
  <p className="editor__points">
    {points < 0 ? (
      <>
        <strong>{points * -1}</strong>
        <FormattedMessage id="editor.tooManyPoints" />
        <Icon symbol="error" color="red" />
      </>
    ) : (
      <>
        <strong>{points}</strong>
        <FormattedMessage id="editor.availablePoints" />
        <Icon symbol="check" />
      </>
    )}
  </p>
);

/**
 * @param {object} props
 * @param {object[]} props.units
 * @param {string} props.category
 * @param {string} props.listId
 */
export const OrderableUnitList = ({ units, category }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { listId } = useParams();
  const intl = useIntl();
  const { language } = useLanguage();

  const handleMoved = (indexes) =>
    dispatch(
      moveUnit({
        listId,
        type: category,
        ...indexes,
      })
    );

  return (
    <OrderableList id={category} onMoved={handleMoved}>
      {units.map((unit, index) => (
        <ListItem
          key={index}
          to={`/editor/${listId}/${category}/${unit.id}`}
          className="editor__list"
          active={location.pathname.includes(unit.id)}
        >
          <div className="editor__list-inner">
            {unit.strength || unit.minimum ? (
              <span>{`${unit.strength || unit.minimum}`}</span>
            ) : null}
            <b>{unit[`name_${language}`] || unit.name_en}</b>
            <i>{`${sumUnitPoints(unit)} ${intl.formatMessage({
              id: "app.points",
            })}`}</i>
          </div>
          {getAllOptions(unit)}
        </ListItem>
      ))}
    </OrderableList>
  );
};

const AddButton = ({ category }) => {
  const { listId } = useParams();

  return (
    <Button
      type="primary"
      centered
      to={`/editor/${listId}/add/${category}`}
      icon="add"
      spaceTop
    >
      <FormattedMessage id="editor.add" />
    </Button>
  );
};

export const useRememberScroll = (pathname) =>
  useEffect(() => {
    const onScroll = () => {
      if (document.location.hash === `#${pathname}`) {
        sessionStorage.setItem("scrollPosition", window.scrollY);
      }
    };
    window.addEventListener("scroll", throttle(onScroll, 100));
    window.scrollTo(0, Number(sessionStorage.getItem("scrollPosition")) || 0);

    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);
