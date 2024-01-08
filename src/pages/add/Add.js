import { useState, useEffect, Fragment } from "react";
import { useParams, useLocation, Redirect } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useIntl } from "react-intl";
import { Helmet } from "react-helmet-async";

import { fetcher } from "../../utils/fetcher";
import { List } from "../../components/list";
import { Header, Main } from "../../components/page";
import { addUnit } from "../../state/lists";
import { setArmy } from "../../state/army";
import { getRandomId } from "../../utils/id";
import { useLanguage } from "../../utils/useLanguage";
import { updateIds } from "../../utils/id";

export const Add = ({ isMobile }) => {
  const MainComponent = isMobile ? Main : Fragment;
  const { listId, type } = useParams();
  const dispatch = useDispatch();
  const [redirect, setRedirect] = useState(null);
  const intl = useIntl();
  const location = useLocation();
  const { language } = useLanguage();
  const list = useSelector((state) =>
    state.lists.find(({ id }) => listId === id)
  );
  const army = useSelector((state) => state.army);
  const handleAdd = (unitId) => {
    const unit = {
      ...army[type].find(({ id }) => unitId === id),
      id: `${unitId}.${getRandomId()}`,
    };

    dispatch(addUnit({ listId, type, unit }));
    setRedirect(unit);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    list &&
      fetcher({
        url: `games/${list.game}/${list.army}`,
        onSuccess: (data) => {
          dispatch(
            setArmy({
              lords: updateIds(data.lords),
              heroes: updateIds(data.heroes),
              characters: updateIds(data.characters),
              core: updateIds(data.core),
              special: updateIds(data.special),
              rare: updateIds(data.rare),
              mercenaries: updateIds(data.mercenaries),
              allies: updateIds(data.allies),
            })
          );
        },
      });
  }, [list, dispatch]);

  if (redirect) {
    return <Redirect to={`/editor/${listId}/${type}/${redirect.id}`} />;
  }

  if (!army) {
    if (isMobile) {
      return (
        <>
          <Header to={`/editor/${listId}`} />
          <Main loading />
        </>
      );
    } else {
      return (
        <>
          <Header to={`/editor/${listId}`} isSection />
          <Main loading />
        </>
      );
    }
  }

  return (
    <>
      <Helmet>
        <title>{`Old World Builder | ${list?.name}`}</title>
      </Helmet>

      {isMobile && (
        <Header
          to={`/editor/${listId}`}
          headline={intl.formatMessage({
            id: "add.title",
          })}
        />
      )}

      <MainComponent>
        {!isMobile && (
          <Header
            isSection
            to={`/editor/${listId}`}
            headline={intl.formatMessage({
              id: "add.title",
            })}
          />
        )}
        <ul>
          {army[type].map(({ name_de, name_en, id, minimum, points }) => (
            <List key={id} onClick={() => handleAdd(id)}>
              <span className="unit__name">
                {minimum ? `${minimum} ` : null}
                <b>{language === "de" ? name_de : name_en}</b>
              </span>
              <i className="unit__points">{`${
                minimum ? points * minimum : points
              } ${intl.formatMessage({
                id: "app.points",
              })}`}</i>
            </List>
          ))}
        </ul>
      </MainComponent>
    </>
  );
};
