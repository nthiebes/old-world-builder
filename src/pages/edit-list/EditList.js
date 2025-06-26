import { Fragment, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FormattedMessage, useIntl } from "react-intl";
import { Helmet } from "react-helmet-async";

import { Header, Main } from "../../components/page";
import { NumberInput } from "../../components/number-input";
import { Select } from "../../components/select";
import { Icon } from "../../components/icon";
import { updateList } from "../../state/lists";
import { updateLocalList } from "../../utils/list";
import { useLanguage } from "../../utils/useLanguage";

import { nameMap } from "../magic";

import "./EditList.css";

export const EditList = ({ isMobile }) => {
  const location = useLocation();
  const intl = useIntl();
  const MainComponent = isMobile ? Main : Fragment;
  const { listId } = useParams();
  const { language } = useLanguage();
  const dispatch = useDispatch();
  const compositionRules = [
    {
      id: "open-war",
      name_en: intl.formatMessage({ id: "misc.open-war" }),
    },
    {
      id: "grand-melee",
      name_en: intl.formatMessage({ id: "misc.grand-melee" }),
    },
    {
      id: "combined-arms",
      name_en: intl.formatMessage({ id: "misc.combined-arms" }),
    },
  ];
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
  const handleCompositionRuleChange = (value) => {
    dispatch(
      updateList({
        listId,
        compositionRule: value,
      })
    );
  };

  console.log(list);
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
        <title>{`Old World Builder | ${list?.name}`}</title>
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
        <p className="unit__notes">
          <Icon symbol="error" className="unit__notes-icon" />
          {nameMap[list.armyComposition]?.[`name_${language}`] ||
            nameMap[list.armyComposition]?.name_en ||
            nameMap[list.army]?.[`name_${language}`] ||
            nameMap[list.army]?.name_en}
        </p>
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
          min={0}
          value={list.points}
          onChange={handlePointsChange}
          required
          interval={50}
        />
        <label htmlFor="composition-rule">
          <FormattedMessage id="new.armyCompositionRule" />
        </label>
        <Select
          id="composition-rule"
          options={compositionRules}
          onChange={handleCompositionRuleChange}
          selected={list.compositionRule || "open-war"}
          spaceBottom
        />
      </MainComponent>
    </>
  );
};
