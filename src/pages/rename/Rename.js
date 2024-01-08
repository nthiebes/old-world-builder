import { Fragment, useEffect } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useParams, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";

import { Header, Main } from "../../components/page";
import { editUnit } from "../../state/lists";
import { updateList } from "../../utils/list";
import { useLanguage } from "../../utils/useLanguage";

import "./Rename.css";

export const Rename = ({ isMobile }) => {
  const MainComponent = isMobile ? Main : Fragment;
  const location = useLocation();
  const intl = useIntl();
  const { language } = useLanguage();
  const { listId, type, unitId } = useParams();
  const dispatch = useDispatch();
  const list = useSelector((state) =>
    state.lists.find(({ id }) => listId === id)
  );
  const units = list ? list[type] : null;
  const unit = units && units.find(({ id }) => id === unitId);
  const name = unit ? unit[language === "de" ? "name_de" : "name_en"] : "";

  const handleNameChange = (event) => {
    dispatch(
      editUnit({
        listId,
        type,
        unitId,
        name: event.target.value,
      })
    );
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    list && updateList(list);
  }, [list]);

  if (!list) {
    return (
      <>
        <Header
          to={`/editor/${listId}/${type}/${unitId}`}
          headline={intl.formatMessage({
            id: "rename.title",
          })}
        />
        <Main />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Old World Builder | ${list?.name}`}</title>
      </Helmet>

      {isMobile && (
        <Header
          to={`/editor/${listId}/${type}/${unitId}`}
          headline={intl.formatMessage({
            id: "rename.title",
          })}
        />
      )}

      <MainComponent>
        {!isMobile && (
          <Header
            isSection
            to={`/editor/${listId}/${type}/${unitId}`}
            headline={intl.formatMessage({
              id: "rename.title",
            })}
          />
        )}
        <label htmlFor="name" className="rename__label">
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
      </MainComponent>
    </>
  );
};
