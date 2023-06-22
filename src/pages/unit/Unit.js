import { useState, useEffect, Fragment } from "react";
import { useParams, useLocation, Redirect } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FormattedMessage, useIntl } from "react-intl";
import classNames from "classnames";

import { getUnitPoints } from "../../utils/points";
import { List } from "../../components/list";
import { NumberInput } from "../../components/number-input";
import { Icon } from "../../components/icon";
import { Header, Main } from "../../components/page";
import { nameMap } from "../../pages/magic";
import { editUnit, removeUnit, duplicateUnit } from "../../state/lists";
import { useLanguage } from "../../utils/useLanguage";

import "./Unit.css";

const getUnitCommandPoints = (items) => {
  let commandPoints = 0;

  if (items) {
    items.forEach((option) => {
      commandPoints += option.points;
    });
  }

  return commandPoints;
};

export const Unit = ({ isMobile }) => {
  const MainComponent = isMobile ? Main : Fragment;
  const { listId, type, unitId } = useParams();
  const dispatch = useDispatch();
  const { language } = useLanguage();
  const [redirect, setRedirect] = useState(null);
  const location = useLocation();
  const intl = useIntl();
  const list = useSelector((state) =>
    state.lists.find(({ id }) => listId === id)
  );
  const units = list ? list[type] : null;
  const unit = units && units.find(({ id }) => id === unitId);
  let magicPoints = 0;
  const handleRemove = (unitId) => {
    dispatch(removeUnit({ listId, type, unitId }));
    setRedirect(true);
  };
  const handleDuplicate = (unitId) => {
    dispatch(duplicateUnit({ listId, type, unitId }));
    setRedirect(true);
  };
  const handleStrengthChange = (event) => {
    dispatch(
      editUnit({
        listId,
        type,
        unitId,
        strength: event.target.value,
      })
    );
  };
  const handleStackableOptionChange = ({ id, stackableCount }) => {
    const options = unit.options.map((option) => {
      if (option.id === id) {
        return {
          ...option,
          stackableCount,
        };
      }
      return option;
    });

    dispatch(
      editUnit({
        listId,
        type,
        unitId,
        options,
      })
    );
  };
  const handleOptionsChange = (id) => {
    const options = unit.options.map((option) => {
      if (option.id === id) {
        return {
          ...option,
          active: option.active ? false : true,
        };
      }
      return option;
    });

    dispatch(
      editUnit({
        listId,
        type,
        unitId,
        options,
      })
    );
  };
  const handleCommandChange = (id) => {
    let magicItems = unit.magic?.items || [];
    const command = unit.command.map((option, index) => {
      if (option.id === id) {
        // Also remove banner runes
        if (option.active) {
          magicItems = magicItems.filter(({ command }) => command !== index);
        }

        return {
          ...option,
          active: option.active ? false : true,
        };
      }
      return option;
    });

    dispatch(
      editUnit({
        listId,
        type,
        unitId,
        command,
        magic: {
          ...unit.magic,
          items: magicItems,
        },
      })
    );
  };
  const handleEquipmentChange = (id) => {
    const equipment = unit.equipment.map((item) => ({
      ...item,
      active: item.id === id ? true : false,
    }));

    dispatch(
      editUnit({
        listId,
        type,
        unitId,
        equipment,
      })
    );
  };
  const handleMountsChange = (id) => {
    const mounts = unit.mounts.map((item) => ({
      ...item,
      active: item.id === id ? true : false,
    }));

    dispatch(
      editUnit({
        listId,
        type,
        unitId,
        mounts,
      })
    );
  };

  unit?.magic?.items &&
    unit?.magic?.items.forEach((option) => {
      magicPoints += option.points;
    });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (redirect === true) {
    return <Redirect to={`/editor/${listId}`} />;
  }

  if (!unit) {
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
      {isMobile && (
        <Header
          to={`/editor/${listId}`}
          moreButton={[
            {
              name: intl.formatMessage({
                id: "misc.duplicate",
              }),
              icon: "duplicate",
              callback: () => handleDuplicate(unit.id),
            },
            {
              name: intl.formatMessage({
                id: "misc.remove",
              }),
              icon: "delete",
              callback: () => handleRemove(unit.id),
            },
          ]}
          headline={unit[`name_${language}`]}
          subheadline={`${getUnitPoints(unit)} ${intl.formatMessage({
            id: "app.points",
          })}`}
        />
      )}

      <MainComponent>
        {!isMobile && (
          <Header
            isSection
            to={`/editor/${listId}`}
            moreButton={[
              {
                name: intl.formatMessage({
                  id: "misc.duplicate",
                }),
                icon: "duplicate",
                callback: () => handleDuplicate(unit.id),
              },
              {
                name: intl.formatMessage({
                  id: "misc.remove",
                }),
                icon: "delete",
                callback: () => handleRemove(unit.id),
              },
            ]}
            headline={unit[`name_${language}`]}
            subheadline={`${getUnitPoints(unit)} ${intl.formatMessage({
              id: "app.points",
            })}`}
          />
        )}
        {!unit.minimum &&
          !unit.command &&
          !unit.equipment &&
          !unit.mounts &&
          !unit.magic &&
          !unit.options && (
            <i className="unit__empty">
              <FormattedMessage id="unit.noOptions" />
            </i>
          )}
        {unit.minimum && (
          <>
            <label htmlFor="strength" className="unit__strength">
              <FormattedMessage id="unit.unitSize" />
            </label>
            <NumberInput
              id="strength"
              className="input"
              min={unit.minimum}
              max={unit.maximum}
              value={unit.strength}
              onChange={handleStrengthChange}
            />
          </>
        )}
        {unit.command && unit.command.length > 0 && (
          <>
            <h2 className="unit__subline">
              <FormattedMessage id="unit.command" />
            </h2>
            {unit.command.map(
              (
                {
                  name_de,
                  name_en,
                  points,
                  perModel,
                  id,
                  active = false,
                  magic,
                },
                index
              ) => {
                let commandMagicPoints = 0;

                if (magic) {
                  unit.magic.items
                    .filter((item) => item.command === index)
                    .forEach(({ points }) => {
                      commandMagicPoints = commandMagicPoints + points;
                    });
                }

                return (
                  <Fragment key={id}>
                    <div className="checkbox">
                      <input
                        type="checkbox"
                        id={`command-${id}`}
                        value={id}
                        onChange={() => handleCommandChange(id)}
                        checked={active}
                        className="checkbox__input"
                      />
                      <label
                        htmlFor={`command-${id}`}
                        className="checkbox__label"
                      >
                        {language === "de" ? name_de : name_en}
                        <i className="checkbox__points">
                          {`${points} ${
                            points === 1
                              ? intl.formatMessage({
                                  id: "app.point",
                                })
                              : intl.formatMessage({
                                  id: "app.points",
                                })
                          }`}
                          {perModel &&
                            ` ${intl.formatMessage({
                              id: "unit.perModel",
                            })}`}
                        </i>
                      </label>
                    </div>
                    {magic && active && (
                      <List
                        to={`/editor/${listId}/${type}/${unitId}/magic/${index}`}
                        className="editor__list unit__link"
                        active={location.pathname.includes("magic")}
                      >
                        <div className="editor__list-inner">
                          <b>
                            {magic.types
                              .map((type) => nameMap[type][`name_${language}`])
                              .join(", ")}
                          </b>
                          <i className="checkbox__points">
                            <span
                              className={classNames(
                                commandMagicPoints >
                                  unit.command[index].magic.maxPoints &&
                                  "editor__error"
                              )}
                            >
                              {getUnitCommandPoints(
                                unit?.magic?.items.filter(
                                  ({ command }) => command === index
                                )
                              )}
                            </span>{" "}
                            / {unit.command[index].magic.maxPoints}{" "}
                            <FormattedMessage id="app.points" />
                          </i>
                          {commandMagicPoints >
                            unit.command[index].magic.maxPoints && (
                            <Icon
                              symbol="error"
                              color="red"
                              className="unit__magic-icon"
                            />
                          )}
                        </div>
                        {unit?.magic?.items && (
                          <p>
                            {unit.magic.items
                              .filter(({ command }) => command === index)
                              .map(({ name_de, name_en }) =>
                                language === "de" ? name_de : name_en
                              )
                              .join(", ")}
                          </p>
                        )}
                      </List>
                    )}
                  </Fragment>
                );
              }
            )}
          </>
        )}
        {unit.equipment && unit.equipment.length > 0 && (
          <>
            <h2 className="unit__subline">
              <FormattedMessage id="unit.equipment" />
            </h2>
            {unit.equipment.map(
              ({ name_de, name_en, points, perModel, id, active = false }) => (
                <div className="radio" key={id}>
                  <input
                    type="radio"
                    id={`equipment-${id}`}
                    name="equipment"
                    value={id}
                    onChange={() => handleEquipmentChange(id)}
                    checked={active}
                    className="radio__input"
                  />
                  <label htmlFor={`equipment-${id}`} className="radio__label">
                    {language === "de" ? name_de : name_en}
                    <i className="checkbox__points">
                      {`${points} ${
                        points === 1
                          ? intl.formatMessage({
                              id: "app.point",
                            })
                          : intl.formatMessage({
                              id: "app.points",
                            })
                      }`}
                      {perModel &&
                        ` ${intl.formatMessage({
                          id: "unit.perModel",
                        })}`}
                    </i>
                  </label>
                </div>
              )
            )}
          </>
        )}
        {unit.options && unit.options.length > 0 && (
          <>
            <h2 className="unit__subline">
              <FormattedMessage id="unit.options" />
            </h2>
            {unit.options.map(
              ({
                name_de,
                name_en,
                points,
                perModel,
                id,
                stackable,
                maximum,
                minimum = 0,
                stackableCount = minimum || 0,
                active = false,
              }) =>
                !stackable ? (
                  <div className="checkbox" key={id}>
                    <input
                      type="checkbox"
                      id={`options-${id}`}
                      value={id}
                      onChange={() => handleOptionsChange(id)}
                      checked={active}
                      className="checkbox__input"
                    />
                    <label
                      htmlFor={`options-${id}`}
                      className="checkbox__label"
                    >
                      {language === "de" ? name_de : name_en}
                      <i className="checkbox__points">
                        {`${points} ${
                          points === 1
                            ? intl.formatMessage({
                                id: "app.point",
                              })
                            : intl.formatMessage({
                                id: "app.points",
                              })
                        }`}
                        {perModel &&
                          ` ${intl.formatMessage({
                            id: "unit.perModel",
                          })}`}
                      </i>
                    </label>
                  </div>
                ) : (
                  <Fragment key={id}>
                    <label
                      htmlFor={`options-${id}`}
                      className="unit__special-option"
                    >
                      {language === "de" ? name_de : name_en}:
                      <i className="checkbox__points">
                        {`${points} ${intl.formatMessage({
                          id: "app.points",
                        })} ${intl.formatMessage({
                          id: "unit.perModel",
                        })}`}
                      </i>
                    </label>
                    <NumberInput
                      id={`options-${id}`}
                      className="input"
                      min={minimum}
                      max={maximum}
                      value={stackableCount}
                      onChange={(event) =>
                        handleStackableOptionChange({
                          id,
                          stackableCount: event.target.value,
                        })
                      }
                    />
                  </Fragment>
                )
            )}
          </>
        )}
        {unit.mounts && unit.mounts.length > 0 && (
          <>
            <h2 className="unit__subline">
              <FormattedMessage id="unit.mount" />
            </h2>
            {unit.mounts.map(
              ({ name_de, name_en, points, id, active = false }) => (
                <div className="radio" key={id}>
                  <input
                    type="radio"
                    id={`mounts-${id}`}
                    name="mounts"
                    value={id}
                    onChange={() => handleMountsChange(id)}
                    checked={active}
                    className="radio__input"
                  />
                  <label htmlFor={`mounts-${id}`} className="radio__label">
                    {language === "de" ? name_de : name_en}
                    <i className="checkbox__points">{`${points} ${intl.formatMessage(
                      {
                        id: "app.points",
                      }
                    )}`}</i>
                  </label>
                </div>
              )
            )}
          </>
        )}
        {unit?.magic?.maxPoints && (
          <List
            to={`/editor/${listId}/${type}/${unitId}/magic`}
            className="editor__list unit__link"
            active={location.pathname.includes("magic")}
          >
            <div className="editor__list-inner">
              <b className="unit__magic-headline">
                <FormattedMessage id="unit.magicItems" />
              </b>
              <i className="checkbox__points">
                <span
                  className={classNames(
                    magicPoints > unit.magic.maxPoints && "editor__error"
                  )}
                >
                  {magicPoints}
                </span>{" "}
                / {unit.magic.maxPoints} <FormattedMessage id="app.points" />
              </i>
              {magicPoints > unit.magic.maxPoints && (
                <Icon symbol="error" color="red" className="unit__magic-icon" />
              )}
            </div>
            {unit.magic.items && (
              <p>
                {unit.magic.items
                  .map(({ name_de, name_en }) =>
                    language === "de" ? name_de : name_en
                  )
                  .join(", ")}
              </p>
            )}
          </List>
        )}
      </MainComponent>
    </>
  );
};
