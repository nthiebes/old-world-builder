import { useState, useEffect, Fragment } from "react";
import { useParams, useLocation, Redirect } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FormattedMessage, useIntl } from "react-intl";
import classNames from "classnames";
import { Helmet } from "react-helmet-async";

import { fetcher } from "../../utils/fetcher";
import { getUnitPoints, getUnitMagicPoints } from "../../utils/points";
import { ListItem } from "../../components/list";
import { NumberInput } from "../../components/number-input";
import { Icon } from "../../components/icon";
import { Header, Main } from "../../components/page";
import { Button } from "../../components/button";
import { RulesIndex, rulesMap } from "../../components/rules-index";
import { nameMap } from "../../pages/magic";
import { editUnit, removeUnit, duplicateUnit } from "../../state/lists";
import { setArmy } from "../../state/army";
import { openRulesIndex } from "../../state/rules-index";
import { useLanguage } from "../../utils/useLanguage";
import { updateLocalList } from "../../utils/list";
import { updateIds, getRandomId } from "../../utils/id";
import { normalizeRuleName } from "../../utils/string";

import "./Unit.css";

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
  const army = useSelector((state) => state.army);
  const detachments =
    army &&
    [...army.core, ...army.special, ...army.rare].filter(
      (coreUnit) => coreUnit.detachment
    );
  const handleRulesClick = ({ name }) => {
    dispatch(openRulesIndex({ activeRule: name }));
  };
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
  const handleAddDetachmentClick = ({ id }) => {
    const detachment = detachments.find((detachment) => detachment.id === id);
    const unitDetachments = unit.detachments ? [...unit.detachments] : [];

    unitDetachments.push({
      id: `${id}.${getRandomId()}`,
      name_de: detachment.name_de,
      name_en: detachment.name_en,
      points: detachment.points,
      strength: detachment.minDetachmentSize || 5,
      minDetachmentSize: detachment.minDetachmentSize || 5,
      maxDetachmentSize: detachment.maxDetachmentSize,
      equipment: detachment.equipment,
      armor: detachment.armor,
      options: detachment.options,
    });

    dispatch(
      editUnit({
        listId,
        type,
        unitId,
        detachments: unitDetachments,
      })
    );
  };
  const handleDeleteDetachmentClick = ({ id }) => {
    const unitDetachments = [...unit.detachments].filter(
      (detachment) => detachment.id !== id
    );

    dispatch(
      editUnit({
        listId,
        type,
        unitId,
        detachments: unitDetachments,
      })
    );
  };
  const handleDetachmentStrengthClick = ({ id, strength }) => {
    const unitDetachments = [...unit.detachments].map((detachment) =>
      detachment.id === id ? { ...detachment, strength } : detachment
    );

    dispatch(
      editUnit({
        listId,
        type,
        unitId,
        detachments: unitDetachments,
      })
    );
  };
  const handleDetachmentEquipmentChange = ({
    detachmentId,
    equipmentId,
    category,
    isCheckbox,
  }) => {
    const unitDetachments = [...unit.detachments].map((detachment) => {
      if (detachment.id === detachmentId) {
        const equipment = detachment[category].map((item) => {
          let active = false;

          if (isCheckbox && item.id === equipmentId) {
            active = !item.active;
          } else if (item.id === equipmentId) {
            active = true;
          } else if (isCheckbox) {
            active = item.active;
          }

          return {
            ...item,
            active,
          };
        });

        return { ...detachment, [category]: equipment };
      }

      return detachment;
    });

    dispatch(
      editUnit({
        listId,
        type,
        unitId,
        detachments: unitDetachments,
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
  const handleArmorChange = (id) => {
    const armor = unit.armor.map((item) => ({
      ...item,
      active: item.id === id ? true : false,
    }));

    dispatch(
      editUnit({
        listId,
        type,
        unitId,
        armor,
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
  const handleLoresChange = (lore) => {
    dispatch(
      editUnit({
        listId,
        type,
        unitId,
        activeLore: lore,
      })
    );
  };
  const getRulesLinksText = (textObject) => {
    const textEn = textObject.name_en.split(", ");
    const ruleString = textObject[`name_${language}`] || textObject.name_en;
    let ruleButtons = ruleString.split(", ");

    ruleButtons = ruleButtons.map((rule, index) => (
      <Fragment key={rule}>
        {rulesMap[normalizeRuleName(textEn[index])] ? (
          <button
            className="unit__rule"
            onClick={() =>
              dispatch(openRulesIndex({ activeRule: textEn[index] }))
            }
          >
            {rule}
            {index !== ruleButtons.length - 1 && ", "}
          </button>
        ) : (
          <>
            {rule}
            {index !== ruleButtons.length - 1 && ", "}
          </>
        )}
      </Fragment>
    ));

    return ruleButtons;
  };
  const getRulesIcon = (textObject) => {
    const textEn = textObject.name_en.split(", ");
    const ruleString = textObject[`name_${language}`] || textObject.name_en;
    let ruleButtons = ruleString.split(", ");

    ruleButtons = ruleButtons.map((rule, index) => (
      <Fragment key={rule}>
        {rulesMap[normalizeRuleName(textEn[index])] ? (
          <span className="unit__rule-wrapper">
            {rule}
            <Button
              type="text"
              className="unit__rules"
              color="dark"
              label={intl.formatMessage({ id: "misc.showRules" })}
              icon="preview"
              onClick={() =>
                handleRulesClick({
                  name: rule,
                })
              }
            />
            {index !== ruleButtons.length - 1 && ","}
          </span>
        ) : (
          <>
            {rule}
            {index !== ruleButtons.length - 1 && ", "}
          </>
        )}
      </Fragment>
    ));

    return ruleButtons;
  };
  const getPointsText = ({ points, perModel }) => {
    if (points === 0) {
      return intl.formatMessage({
        id: "app.free",
      });
    }

    return (
      <>
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
          type !== "characters" &&
          ` ${intl.formatMessage({
            id: "unit.perModel",
          })}`}
      </>
    );
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    list && updateLocalList(list);
  }, [list]);

  useEffect(() => {
    list &&
      !army &&
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
  }, [list, army, dispatch]);

  if (redirect === true) {
    return <Redirect to={`/editor/${listId}`} />;
  }

  if (!unit || !army) {
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

  const moreButtons = [
    {
      name: intl.formatMessage({
        id: "misc.rename",
      }),
      icon: "edit",
      to: `/editor/${listId}/${type}/${unit.id}/rename`,
    },
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
  ];

  return (
    <>
      <Helmet>
        <title>{`Old World Builder | ${list?.name}`}</title>
      </Helmet>

      {isMobile && (
        <Header
          to={`/editor/${listId}`}
          moreButton={moreButtons}
          headline={unit[`name_${language}`] || unit.name_en}
          subheadline={`${getUnitPoints(unit)} ${intl.formatMessage({
            id: "app.points",
          })}`}
        />
      )}

      <RulesIndex />

      <MainComponent>
        {!isMobile && (
          <Header
            isSection
            to={`/editor/${listId}`}
            moreButton={moreButtons}
            headline={unit[`name_${language}`] || unit.name_en}
            subheadline={`${getUnitPoints(unit)} ${intl.formatMessage({
              id: "app.points",
            })}`}
          />
        )}
        {!unit.minimum &&
          (!unit.lores || (unit.lores && !unit.lores.length)) &&
          (!unit.command || (unit.command && !unit.command.length)) &&
          (!unit.equipment || (unit.equipment && !unit.equipment.length)) &&
          (!unit.armor || (unit.armor && !unit.armor.length)) &&
          (!unit.mounts || (unit.mounts && !unit.mounts.length)) &&
          (!unit.magic ||
            (unit.magic && !unit.magic.maxPoints && !unit.items?.length)) &&
          (!unit.options || (unit.options && !unit.options.length)) && (
            <i className="unit__empty">
              <FormattedMessage id="unit.noOptions" />
            </i>
          )}
        {unit.notes && unit.notes.name_en ? (
          <p className="unit__notes">
            <Icon symbol="error" className="unit__notes-icon" />
            {unit.notes[`name_${language}`] || unit.notes.name_en}
          </p>
        ) : null}
        {unit.minimum ? (
          <>
            <label htmlFor="strength" className="unit__strength">
              <FormattedMessage id="unit.unitSize" />
            </label>
            <NumberInput
              id="strength"
              min={unit.minimum}
              max={unit.maximum}
              value={unit.strength}
              onChange={handleStrengthChange}
            />
          </>
        ) : null}
        {unit.command && unit.command.length > 0 && (
          <>
            {type !== "characters" && (
              <h2 className="unit__subline">
                <FormattedMessage id="unit.command" />
              </h2>
            )}
            {unit.command.map(
              (
                { points, perModel, id, active = false, magic, ...command },
                index
              ) => {
                const commandMagicPoints = getUnitMagicPoints({
                  selected: magic?.selected,
                });

                return (
                  <Fragment key={id}>
                    <div
                      className={classNames(
                        "checkbox",
                        type === "characters" && "unit__bsb"
                      )}
                    >
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
                        <span className="unit__label-text">
                          {getRulesIcon(command).map((item) => item)}
                        </span>
                        <i className="checkbox__points">
                          {getPointsText({ points })}
                        </i>
                      </label>
                    </div>
                    {magic?.types && magic.types.length && active ? (
                      <>
                        <hr className="unit__hr" />
                        <ListItem
                          to={`/editor/${listId}/${type}/${unitId}/magic/${index}`}
                          className="editor__list unit__link unit__command-list"
                          active={location.pathname.includes(`magic/${index}`)}
                        >
                          <div className="editor__list-inner">
                            <b>
                              {magic.types
                                .map(
                                  (itemType) =>
                                    nameMap[itemType][`name_${language}`] ||
                                    nameMap[itemType].name_en
                                )
                                .join(", ")}
                            </b>
                            <i className="checkbox__points">
                              <span
                                className={classNames(
                                  commandMagicPoints >
                                    unit.command[index].magic.maxPoints &&
                                    unit.command[index].magic.maxPoints > 0 &&
                                    "editor__error"
                                )}
                              >
                                {commandMagicPoints}
                              </span>{" "}
                              {unit.command[index].magic.maxPoints > 0 && (
                                <>{` / ${unit.command[index].magic.maxPoints}`}</>
                              )}{" "}
                              <FormattedMessage id="app.points" />
                            </i>
                            {commandMagicPoints >
                              unit.command[index].magic.maxPoints &&
                              unit.command[index].magic.maxPoints > 0 && (
                                <Icon
                                  symbol="error"
                                  color="red"
                                  className="unit__magic-icon"
                                />
                              )}
                          </div>
                          {magic?.selected && (
                            <p>
                              {magic.selected
                                .map((selectedItem) =>
                                  selectedItem.amount > 1
                                    ? `${selectedItem.amount}x ` +
                                      (selectedItem[`name_${language}`] ||
                                        selectedItem.name_en)
                                    : selectedItem[`name_${language}`] ||
                                      selectedItem.name_en
                                )
                                .join(", ")
                                .replace(/\*/g, "")}
                            </p>
                          )}
                        </ListItem>
                      </>
                    ) : null}
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
              ({ points, perModel, id, active = false, ...equipment }) => (
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
                    <span className="unit__label-text">
                      {getRulesIcon(equipment).map((item) => item)}
                    </span>
                    <i className="checkbox__points">
                      {getPointsText({ points, perModel })}
                    </i>
                  </label>
                </div>
              )
            )}
          </>
        )}
        {unit.armor && unit.armor.length > 0 && (
          <>
            <h2 className="unit__subline">
              <FormattedMessage id="unit.armor" />
            </h2>
            {unit.armor.map(
              ({ points, perModel, id, active = false, ...equipment }) => (
                <div className="radio" key={id}>
                  <input
                    type="radio"
                    id={`armor-${id}`}
                    name="armor"
                    value={id}
                    onChange={() => handleArmorChange(id)}
                    checked={active}
                    className="radio__input"
                  />
                  <label htmlFor={`armor-${id}`} className="radio__label">
                    <span className="unit__label-text">
                      {getRulesIcon(equipment).map((item) => item)}
                    </span>
                    <i className="checkbox__points">
                      {getPointsText({ points, perModel })}
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
                points,
                perModel,
                id,
                stackable,
                maximum,
                minimum = 0,
                stackableCount = minimum || 0,
                active = false,
                ...equipment
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
                      <span className="unit__label-text">
                        {getRulesIcon(equipment).map((item) => item)}
                      </span>
                      <i className="checkbox__points">
                        {getPointsText({ points, perModel })}
                      </i>
                    </label>
                  </div>
                ) : (
                  <Fragment key={id}>
                    <label
                      htmlFor={`options-${id}`}
                      className="unit__special-option"
                    >
                      <span className="unit__label-text">
                        {getRulesIcon(equipment).map((item) => item)}
                      </span>
                      <i className="checkbox__points">
                        {getPointsText({ points, perModel })}
                      </i>
                    </label>
                    <NumberInput
                      id={`options-${id}`}
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
        {unit.regimentalUnit && (
          <>
            <h2 className="unit__subline unit__detachments-headline">
              <FormattedMessage id="unit.detachments" />
            </h2>
            {detachments.map(({ name_en, id, ...detachment }) => (
              <Fragment key={id}>
                <div className="list">
                  <div className="list__inner unit__detachments-header">
                    <b className="unit__magic-headline">
                      {detachment[`name_${language}`] || name_en}
                    </b>
                    <Button
                      onClick={() =>
                        handleAddDetachmentClick({
                          id,
                        })
                      }
                      type="secondary"
                      icon="add"
                      label={intl.formatMessage({ id: "editor.add" })}
                      size="small"
                      disabled={
                        unit?.detachments?.length >= unit.maxDetachments
                      }
                    />
                  </div>
                </div>
                {unit.detachments &&
                  unit.detachments
                    .filter(
                      (detachment) =>
                        detachment.id.split(".")[0] === id.split(".")[0]
                    )
                    .map(
                      ({
                        name_en,
                        strength,
                        id,
                        points,
                        minDetachmentSize,
                        maxDetachmentSize,
                        equipment: detachmentEquipment,
                        armor: detachmentArmor,
                        options: detachmentOptions,
                        ...detachment
                      }) => (
                        <div
                          className="list unit__detachments-wrapper"
                          key={id}
                        >
                          <div className="list__inner unit__detachments">
                            <NumberInput
                              noError
                              id={`strength-${id}`}
                              min={minDetachmentSize || 5}
                              max={
                                maxDetachmentSize ||
                                Math.floor(unit.strength / 2)
                              }
                              value={strength}
                              onChange={(event) =>
                                handleDetachmentStrengthClick({
                                  id,
                                  strength: event.target.value,
                                })
                              }
                            />
                            <span>
                              <b>{detachment[`name_${language}`] || name_en}</b>
                              <i>{getPointsText({ points })}</i>
                            </span>
                            <Button
                              onClick={() =>
                                handleDeleteDetachmentClick({
                                  id,
                                })
                              }
                              type="secondary"
                              icon="close"
                              label={intl.formatMessage({ id: "misc.remove" })}
                              size="small"
                            />
                          </div>
                          <div className="unit__detachments-section">
                            {detachmentEquipment &&
                              detachmentEquipment.length > 0 && (
                                <>
                                  <h3 className="unit__subline">
                                    <FormattedMessage id="unit.equipment" />
                                  </h3>
                                  {detachmentEquipment.map((equipment) => (
                                    <div className="radio" key={equipment.id}>
                                      <input
                                        type="radio"
                                        id={`equipment-${id}-${equipment.id}`}
                                        name={`equipment-${id}`}
                                        value={equipment.id}
                                        onChange={() =>
                                          handleDetachmentEquipmentChange({
                                            detachmentId: id,
                                            equipmentId: equipment.id,
                                            category: "equipment",
                                          })
                                        }
                                        checked={equipment.active || false}
                                        className="radio__input"
                                      />
                                      <label
                                        htmlFor={`equipment-${id}-${equipment.id}`}
                                        className="radio__label"
                                      >
                                        <span className="unit__label-text">
                                          {getRulesIcon(equipment).map(
                                            (item) => item
                                          )}
                                        </span>
                                        <i className="checkbox__points">
                                          {getPointsText({
                                            points: equipment.points,
                                            perModel: equipment.perModel,
                                          })}
                                        </i>
                                      </label>
                                    </div>
                                  ))}
                                </>
                              )}
                            {detachmentArmor && detachmentArmor.length > 0 && (
                              <>
                                <h3 className="unit__subline">
                                  <FormattedMessage id="unit.armor" />
                                </h3>
                                {detachmentArmor.map((armor) => (
                                  <div className="radio" key={armor.id}>
                                    <input
                                      type="radio"
                                      id={`armor-${id}-${armor.id}`}
                                      name={`armor-${id}`}
                                      value={armor.id}
                                      onChange={() =>
                                        handleDetachmentEquipmentChange({
                                          detachmentId: id,
                                          equipmentId: armor.id,
                                          category: "armor",
                                        })
                                      }
                                      checked={armor.active}
                                      className="radio__input"
                                    />
                                    <label
                                      htmlFor={`armor-${id}-${armor.id}`}
                                      className="radio__label"
                                    >
                                      <span className="unit__label-text">
                                        {getRulesIcon(armor).map(
                                          (item) => item
                                        )}
                                      </span>
                                      <i className="checkbox__points">
                                        {getPointsText({
                                          points: armor.points,
                                          perModel: armor.perModel,
                                        })}
                                      </i>
                                    </label>
                                  </div>
                                ))}
                              </>
                            )}
                            {detachmentOptions && detachmentOptions.length > 0 && (
                              <>
                                <h3 className="unit__subline">
                                  <FormattedMessage id="unit.options" />
                                </h3>
                                {detachmentOptions.map((option) => (
                                  <div className="checkbox" key={option.id}>
                                    <input
                                      type="checkbox"
                                      id={`options-${id}-${option.id}`}
                                      value={option.id}
                                      onChange={() =>
                                        handleDetachmentEquipmentChange({
                                          detachmentId: id,
                                          equipmentId: option.id,
                                          category: "options",
                                          isCheckbox: true,
                                        })
                                      }
                                      checked={option.active || false}
                                      className="checkbox__input"
                                    />
                                    <label
                                      htmlFor={`options-${id}-${option.id}`}
                                      className="checkbox__label"
                                    >
                                      <span className="unit__label-text">
                                        {getRulesIcon(option).map(
                                          (item) => item
                                        )}
                                      </span>
                                      <i className="checkbox__points">
                                        {getPointsText({
                                          points: option.points,
                                          perModel: option.perModel,
                                        })}
                                      </i>
                                    </label>
                                  </div>
                                ))}
                              </>
                            )}
                          </div>
                        </div>
                      )
                    )}
              </Fragment>
            ))}
          </>
        )}
        {unit.mounts && unit.mounts.length > 0 && (
          <>
            <h2 className="unit__subline">
              <FormattedMessage id="unit.mount" />
            </h2>
            {unit.mounts.map(({ points, id, active = false, ...mount }) => (
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
                  <span className="unit__label-text">
                    {getRulesIcon(mount).map((item) => item)}
                  </span>
                  <i className="checkbox__points">
                    {getPointsText({ points })}
                  </i>
                </label>
              </div>
            ))}
          </>
        )}
        {unit.lores && unit.lores.length ? (
          <>
            <h2 className="unit__subline">
              <FormattedMessage id="unit.lore" />
            </h2>
            {unit.lores.map((lore) => (
              <div className="radio" key={lore}>
                <input
                  type="radio"
                  id={`lore-${lore}`}
                  name="lores"
                  value={lore}
                  onChange={() => handleLoresChange(lore)}
                  checked={(unit.activeLore || unit.lores[0]) === lore}
                  className="radio__input"
                />
                <label htmlFor={`lore-${lore}`} className="radio__label">
                  {nameMap[lore][`name_${language}`] || nameMap[lore].name_en}
                  {rulesMap[normalizeRuleName(nameMap[lore].name_en)] ? (
                    <Button
                      type="text"
                      className="unit__rules"
                      color="dark"
                      label={intl.formatMessage({ id: "misc.showRules" })}
                      icon="preview"
                      onClick={() =>
                        handleRulesClick({
                          name: nameMap[lore].name_en,
                        })
                      }
                    />
                  ) : null}
                </label>
              </div>
            ))}
          </>
        ) : null}
        {unit.items && unit.items.length ? (
          <hr className="unit__hr unit__hr--space-top" />
        ) : null}
        {unit.items && unit.items.length
          ? unit.items.map((item, itemIndex) => {
              const itemsPoints = getUnitMagicPoints({
                selected: item.selected,
              });

              return (
                <ListItem
                  to={`/editor/${listId}/${type}/${unitId}/items/${itemIndex}`}
                  className="editor__list unit__link"
                  active={location.pathname.includes(`items/${itemIndex}`)}
                  key={itemIndex}
                >
                  <div className="editor__list-inner">
                    <b className="unit__magic-headline">
                      {item[`name_${language}`] || item.name_en}
                    </b>
                    <i className="checkbox__points">
                      <span
                        className={classNames(
                          itemsPoints > item.maxPoints &&
                            item.maxPoints > 0 &&
                            "editor__error"
                        )}
                      >
                        {itemsPoints}
                      </span>
                      {item.maxPoints > 0 && <>{` / ${item.maxPoints}`}</>}{" "}
                      <FormattedMessage id="app.points" />
                    </i>
                    {itemsPoints > item.maxPoints && item.maxPoints > 0 && (
                      <Icon
                        symbol="error"
                        color="red"
                        className="unit__magic-icon"
                      />
                    )}
                  </div>
                  {item.selected && (
                    <p>
                      {item.selected
                        .map((selectedItem) =>
                          selectedItem.amount > 1
                            ? `${selectedItem.amount}x ` +
                              (selectedItem[`name_${language}`] ||
                                selectedItem.name_en)
                            : selectedItem[`name_${language}`] ||
                              selectedItem.name_en
                        )
                        .join(", ")
                        .replace(/\*/g, "")}
                    </p>
                  )}
                </ListItem>
              );
            })
          : null}
        {unit.specialRules && unit.specialRules.name_en ? (
          <>
            <h2 className="unit__subline unit__subline--space-before">
              <FormattedMessage id="unit.specialRules" />
            </h2>
            <p>{getRulesLinksText(unit.specialRules).map((item) => item)}</p>
          </>
        ) : null}
      </MainComponent>
    </>
  );
};
