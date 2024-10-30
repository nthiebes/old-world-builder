import * as React from "react";
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
import {
  RulesIndex,
  RulesLinksText,
  RulesWithIcon,
  RuleWithIcon,
} from "../../components/rules-index";
import { nameMap } from "../magic";
import { editUnit, removeUnit, duplicateUnit } from "../../state/lists";
import { setArmy } from "../../state/army";
import { useLanguage } from "../../utils/useLanguage";
import { updateLocalList } from "../../utils/list";
import { getRandomId } from "../../utils/id";
import { getArmyData } from "../../utils/army";
import { getUnitName, getUnitOptionNotes, unitHasItem } from "../../utils/unit";

import "./Unit.css";

export const Unit = ({ isMobile, previewData = {} }) => {
  const isPreview = Boolean(previewData?.type);
  const { type: previewType, unit: previewUnit } = previewData;
  const MainComponent = isMobile ? Main : Fragment;
  const { listId, type = previewType, unitId } = useParams();
  const dispatch = useDispatch();
  const { language } = useLanguage();
  const [redirect, setRedirect] = useState(null);
  const location = useLocation();
  const intl = useIntl();
  const list = useSelector((state) =>
    state.lists.find(({ id }) => listId === id)
  );
  const units = list ? list[type] : null;
  const unit = units ? units.find(({ id }) => id === unitId) : previewUnit;
  const army = useSelector((state) => state.army);
  const detachmentActive =
    unit &&
    unit?.options?.length > 0 &&
    Boolean(
      unit.options.find(
        (option) => option.name_en === "Detachment" && option.active
      )
    );
  const detachments =
    army &&
    [...army.core, ...army.special, ...army.rare].filter(
      (coreUnit) => coreUnit.detachment
    );
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
  const handleCustomNoteChange = (event) => {
    dispatch(
      editUnit({
        listId,
        type,
        unitId,
        customNote: event.target.value,
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
  const handleOptionsChange = (id, optionIndex) => {
    let newOptions;

    if (optionIndex !== undefined) {
      newOptions = unit.options.map((parentOption) => {
        if (parentOption.id === id) {
          const options = parentOption.options.map((option, index) => {
            if (index === optionIndex) {
              return {
                ...option,
                active: option.active ? false : true,
              };
            }

            return option;
          });

          return {
            ...parentOption,
            options,
          };
        }
        return parentOption;
      });
    } else {
      newOptions = unit.options.map((option) => {
        if (option.id === id) {
          return {
            ...option,
            active: option.active ? false : true,
          };
        }
        return option;
      });
    }

    dispatch(
      editUnit({
        listId,
        type,
        unitId,
        options: newOptions,
      })
    );
  };
  const handleCommandChange = (id, optionIndex) => {
    let magicItems = unit.magic?.items || [];
    let command;

    if (optionIndex !== undefined) {
      command = unit.command.map((commandOption) => {
        if (commandOption.id === id) {
          const options = commandOption.options.map((option, index) => {
            if (index === optionIndex) {
              return {
                ...option,
                active: option.active ? false : true,
              };
            }

            return option;
          });

          return {
            ...commandOption,
            options,
          };
        }
        return commandOption;
      });
    } else {
      command = unit.command.map((option, index) => {
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
    }

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
    let armor;
    if (unit.armor.length === 1) {
      armor = unit.armor.map((item) => ({
        ...item,
        active: item.id === id ? !item.active : item.active,
      }));
    } else if (unit.armor.length > 1) {
      armor = unit.armor.map((item) => ({
        ...item,
        active: item.id === id ? true : false,
      }));
    }

    dispatch(
      editUnit({
        listId,
        type,
        unitId,
        armor,
      })
    );
  };
  const handleMountsChange = (id, optionIndex) => {
    let mounts;

    if (optionIndex !== undefined) {
      mounts = unit.mounts.map((mountOption) => {
        if (mountOption.id === id) {
          const options = mountOption.options.map((option, index) => {
            if (index === optionIndex) {
              return {
                ...option,
                active: option.active ? false : true,
              };
            }

            return option;
          });

          return {
            ...mountOption,
            options,
          };
        }
        return mountOption;
      });
    } else {
      mounts = unit.mounts.map((item) => ({
        ...item,
        active: item.id === id ? true : false,
      }));
    }

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
            setArmy(
              getArmyData({
                data,
                armyComposition: list.armyComposition || list.army,
              })
            )
          );
        },
      });
  }, [list, army, dispatch]);

  if (redirect === true) {
    return <Redirect to={`/editor/${listId}`} />;
  }

  if (!unit || (!army && !isPreview)) {
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

  const notes =
    unit?.armyComposition?.[list?.armyComposition || list?.army]?.notes ||
    unit.notes;

  return (
    <>
      <Helmet>
        <title>{`Old World Builder | ${list?.name}`}</title>
      </Helmet>

      {isMobile && (
        <Header
          to={`/editor/${listId}`}
          moreButton={moreButtons}
          headline={getUnitName({ unit, language })}
          headlineIcon={
            <RuleWithIcon
              name={unit.name_en}
              className="unit__header-rule-icon"
            />
          }
          subheadline={`${getUnitPoints(unit)} ${intl.formatMessage({
            id: "app.points",
          })}`}
          navigationIcon="more"
        />
      )}

      <RulesIndex />

      <MainComponent>
        {!isMobile && (
          <Header
            isSection
            to={isPreview ? "" : `/editor/${listId}`}
            moreButton={isPreview ? null : moreButtons}
            headline={getUnitName({ unit, language })}
            headlineIcon={
              <RuleWithIcon
                name={unit.name_en}
                isDark
                className="unit__header-rule-icon"
              />
            }
            subheadline={`${getUnitPoints(unit)} ${intl.formatMessage({
              id: "app.points",
            })}`}
            navigationIcon="more"
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
        {notes && notes.name_en ? (
          <p className="unit__notes">
            <Icon symbol="error" className="unit__notes-icon" />
            {notes[`name_${language}`] || notes.name_en}
          </p>
        ) : null}
        {unit.minimum ? (
          <>
            <label htmlFor="strength" className="unit__strength">
              <FormattedMessage id="unit.unitSize" />
            </label>
            <NumberInput
              id="strength"
              min={
                detachmentActive && unit.minDetachmentSize
                  ? unit.minDetachmentSize
                  : unit.minimum
              }
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
                {
                  points,
                  perModel,
                  id,
                  active = false,
                  magic,
                  options,
                  exclusive = true,
                  notes,
                  ...command
                },
                index
              ) => {
                const commandMagicPoints = getUnitMagicPoints({
                  selected: magic?.selected,
                });
                let commandMaxPoints = 0;

                if (magic?.types && magic.types.length && active) {
                  commandMaxPoints =
                    (magic.armyComposition &&
                      magic.armyComposition[list.armyComposition || list.army]
                        ?.maxPoints) ||
                    magic.maxPoints;
                }

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
                        disabled={
                          detachmentActive ||
                          (type === "characters" &&
                            exclusive &&
                            unit.command.find(
                              (commandUnit) =>
                                commandUnit.active && commandUnit.id !== id
                            ))
                        }
                      />
                      <label
                        htmlFor={`command-${id}`}
                        className="checkbox__label"
                      >
                        <span className="unit__label-text">
                          <RulesWithIcon textObject={command} />
                        </span>
                        <i className="checkbox__points">
                          {getPointsText({ points })}
                        </i>
                      </label>
                    </div>
                    {getUnitOptionNotes({
                      notes: notes,
                      key: `options-${index}-note`,
                      className: "unit__option-note",
                      language,
                    })}
                    {magic?.types && magic.types.length && active ? (
                      <>
                        <hr className="unit__hr" />
                        <ListItem
                          to={`/editor/${listId}/${type}/${unitId}/magic/${index}`}
                          className="editor__list unit__link unit__command-list"
                          active={location.pathname.includes(`magic/${index}`)}
                          disabled={detachmentActive}
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
                                  commandMagicPoints > commandMaxPoints &&
                                    commandMaxPoints > 0 &&
                                    "editor__error"
                                )}
                              >
                                {commandMagicPoints}
                              </span>{" "}
                              {magic.maxPoints > 0 && (
                                <>{` / ${commandMaxPoints}`}</>
                              )}{" "}
                              <FormattedMessage id="app.points" />
                            </i>
                            {commandMagicPoints > commandMaxPoints &&
                              commandMaxPoints > 0 && (
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
                    {options?.length > 0 && active && (
                      <Fragment>
                        {options.map((option, optionIndex) => {
                          const exclusiveCheckedOption = options.find(
                            (exclusiveOption) =>
                              exclusiveOption.exclusive &&
                              exclusiveOption.active
                          );

                          return (
                            <div
                              className="checkbox checkbox--conditional"
                              key={option.name_en}
                            >
                              <input
                                type="checkbox"
                                id={`command-${id}-option-${optionIndex}`}
                                value={`${id}-${optionIndex}`}
                                onChange={() =>
                                  handleCommandChange(id, optionIndex)
                                }
                                checked={Boolean(option.active)}
                                className="checkbox__input"
                                disabled={
                                  (exclusiveCheckedOption &&
                                    option.exclusive &&
                                    !option.active) ||
                                  detachmentActive
                                }
                              />
                              <label
                                htmlFor={`command-${id}-option-${optionIndex}`}
                                className="checkbox__label"
                              >
                                <span className="unit__label-text">
                                  <RulesWithIcon textObject={option} />
                                </span>
                                <i className="checkbox__points">
                                  {getPointsText({ points: option.points })}
                                </i>
                              </label>
                            </div>
                          );
                        })}
                        <hr className="unit__command-option-hr" />
                      </Fragment>
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
            {unit.equipment
              .filter(({ requiredMagicItem }) =>
                requiredMagicItem ? unitHasItem(unit, requiredMagicItem) : true
              )
              .map(
                ({
                  points,
                  perModel,
                  id,
                  active = false,
                  notes,
                  ...equipment
                }) => (
                  <Fragment key={id}>
                    <div className="radio">
                      <input
                        type="radio"
                        id={`equipment-${id}`}
                        name="equipment"
                        value={id}
                        onChange={() => handleEquipmentChange(id)}
                        checked={active}
                        className="radio__input"
                      />
                      <label
                        htmlFor={`equipment-${id}`}
                        className="radio__label"
                      >
                        <span className="unit__label-text">
                          <RulesWithIcon textObject={equipment} />
                        </span>
                        <i className="checkbox__points">
                          {getPointsText({ points, perModel })}
                        </i>
                      </label>
                    </div>
                    {getUnitOptionNotes({
                      notes,
                      key: `equipment-${id}-note`,
                      className: "unit__option-note",
                      language,
                    })}
                  </Fragment>
                )
              )}
          </>
        )}
        {unit.armor && unit.armor.length > 0 && (
          <>
            <h2 className="unit__subline">
              <FormattedMessage id="unit.armor" />
            </h2>
            {unit.armor
              .filter(({ requiredMagicItem }) =>
                requiredMagicItem ? unitHasItem(unit, requiredMagicItem) : true
              )
              .map(
                ({
                  points,
                  perModel,
                  id,
                  activeDefault,
                  active = false,
                  notes,
                  ...equipment
                }) => {
                  const isRadio = unit.armor.length > 1 || activeDefault;

                  return (
                    <Fragment key={id}>
                      <div className={isRadio ? "radio" : "checkbox"}>
                        <input
                          type={isRadio ? "radio" : "checkbox"}
                          id={`armor-${id}`}
                          name="armor"
                          value={id}
                          onChange={() => handleArmorChange(id)}
                          checked={active}
                          className={
                            isRadio ? "radio__input" : "checkbox__input"
                          }
                        />
                        <label
                          htmlFor={`armor-${id}`}
                          className={
                            isRadio ? "radio__label" : "checkbox__label"
                          }
                        >
                          <span className="unit__label-text">
                            <RulesWithIcon textObject={equipment} />
                          </span>
                          <i className="checkbox__points">
                            {getPointsText({ points, perModel })}
                          </i>
                        </label>
                      </div>
                      {getUnitOptionNotes({
                        notes,
                        key: `armor-${id}-note`,
                        className: "unit__option-note",
                        language,
                      })}
                    </Fragment>
                  );
                }
              )}
          </>
        )}
        {unit.options && unit.options.length > 0 && (
          <>
            <h2 className="unit__subline">
              <FormattedMessage id="unit.options" />
            </h2>
            {unit.options
              .filter(
                (unitOption) =>
                  !unitOption.armyComposition ||
                  unitOption.armyComposition.includes(list.armyComposition)
              )
              .filter(({ requiredMagicItem }) =>
                requiredMagicItem ? unitHasItem(unit, requiredMagicItem) : true
              )
              .map(
                ({
                  points,
                  perModel,
                  id,
                  notes,
                  stackable,
                  maximum,
                  minimum = 0,
                  stackableCount = minimum || 0,
                  active = false,
                  exclusive = false,
                  options,
                  ...equipment
                }) => {
                  const exclusiveUnitCheckedOption = unit.options.find(
                    (exclusiveOption) =>
                      exclusiveOption.exclusive && exclusiveOption.active
                  );

                  if (!stackable) {
                    return (
                      <Fragment key={id}>
                        <div className="checkbox">
                          <input
                            type="checkbox"
                            id={`options-${id}`}
                            value={id}
                            onChange={() => handleOptionsChange(id)}
                            checked={active}
                            className="checkbox__input"
                            disabled={
                              exclusiveUnitCheckedOption && exclusive && !active
                            }
                          />
                          <label
                            htmlFor={`options-${id}`}
                            className="checkbox__label"
                          >
                            <span className="unit__label-text">
                              <RulesWithIcon textObject={equipment} />
                            </span>
                            <i className="checkbox__points">
                              {getPointsText({ points, perModel })}
                            </i>
                          </label>
                        </div>
                        {getUnitOptionNotes({
                          notes,
                          key: `options-${id}-note`,
                          className: "unit__option-note",
                          language,
                        })}
                        {options?.length > 0 && active && (
                          <>
                            {options
                              .filter(
                                (option) =>
                                  !option.armyComposition ||
                                  option.armyComposition.includes(
                                    list.armyComposition
                                  )
                              )
                              .map((option, optionIndex) => {
                                const exclusiveCheckedOption = options.find(
                                  (exclusiveOption) =>
                                    exclusiveOption.exclusive &&
                                    exclusiveOption.active
                                );

                                return (
                                  <Fragment key={option.name_en}>
                                    <div className="checkbox checkbox--conditional">
                                      <input
                                        type="checkbox"
                                        id={`option-${id}-option-${optionIndex}`}
                                        value={`${id}-${optionIndex}`}
                                        onChange={() =>
                                          handleOptionsChange(id, optionIndex)
                                        }
                                        checked={Boolean(option.active)}
                                        className="checkbox__input"
                                        disabled={
                                          exclusiveCheckedOption &&
                                          option.exclusive &&
                                          !option.active
                                        }
                                      />
                                      <label
                                        htmlFor={`option-${id}-option-${optionIndex}`}
                                        className="checkbox__label"
                                      >
                                        <span className="unit__label-text">
                                          <RulesWithIcon textObject={option} />
                                        </span>
                                        <i className="checkbox__points">
                                          {getPointsText({
                                            points: option.points,
                                          })}
                                        </i>
                                      </label>
                                    </div>
                                    {optionIndex === options.length - 1 && (
                                      <hr className="unit__command-option-hr" />
                                    )}
                                  </Fragment>
                                );
                              })}
                          </>
                        )}
                      </Fragment>
                    );
                  }

                  return (
                    <Fragment key={id}>
                      <label
                        htmlFor={`options-${id}`}
                        className="unit__special-option"
                      >
                        <span className="unit__label-text">
                          <RulesWithIcon textObject={equipment} />
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
                      {getUnitOptionNotes({
                        notes,
                        key: `options-${id}-note`,
                        className:
                          "unit__option-note unit__option-note--stackable",
                        language,
                      })}
                    </Fragment>
                  );
                }
              )}
          </>
        )}
        {unit.regimentalUnit && (
          <>
            <h2 className="unit__subline unit__detachments-headline">
              <FormattedMessage id="unit.detachments" />
            </h2>
            {detachments &&
              detachments.map(({ name_en, id, ...detachment }) => (
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
                                <b>
                                  {detachment[`name_${language}`] || name_en}
                                </b>
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
                                label={intl.formatMessage({
                                  id: "misc.remove",
                                })}
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
                                            <RulesWithIcon
                                              textObject={equipment}
                                            />
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
                              {detachmentArmor &&
                                detachmentArmor.length > 0 && (
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
                                            <RulesWithIcon textObject={armor} />
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
                              {detachmentOptions &&
                                detachmentOptions.length > 0 && (
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
                                            <RulesWithIcon
                                              textObject={option}
                                            />
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
            {unit.mounts
              .filter(
                ({ armyComposition }) =>
                  !armyComposition ||
                  armyComposition.includes(list.armyComposition)
              )
              .map(
                ({ points, id, active = false, options, notes, ...mount }) => (
                  <Fragment key={id}>
                    <div className="radio">
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
                          <RulesWithIcon textObject={mount} />
                        </span>
                        <i className="checkbox__points">
                          {getPointsText({ points })}
                        </i>
                      </label>
                    </div>
                    {getUnitOptionNotes({
                      notes,
                      key: `mounts-${id}-note`,
                      className: "unit__option-note",
                      language,
                    })}
                    {options?.length > 0 && active && (
                      <>
                        {options
                          .filter(
                            (option) =>
                              !option.armyComposition ||
                              option.armyComposition.includes(
                                list.armyComposition
                              )
                          )
                          .map((option, optionIndex) => {
                            const exclusiveCheckedOption = options.find(
                              (exclusiveOption) =>
                                exclusiveOption.exclusive &&
                                exclusiveOption.active
                            );

                            return (
                              <Fragment key={option.name_en}>
                                <div className="checkbox checkbox--conditional">
                                  <input
                                    type="checkbox"
                                    id={`mount-${id}-option-${optionIndex}`}
                                    value={`${id}-${optionIndex}`}
                                    onChange={() =>
                                      handleMountsChange(id, optionIndex)
                                    }
                                    checked={Boolean(option.active)}
                                    className="checkbox__input"
                                    disabled={
                                      (exclusiveCheckedOption &&
                                        option.exclusive &&
                                        !option.active) ||
                                      detachmentActive
                                    }
                                  />
                                  <label
                                    htmlFor={`mount-${id}-option-${optionIndex}`}
                                    className="checkbox__label"
                                  >
                                    <span className="unit__label-text">
                                      <RulesWithIcon textObject={option} />
                                    </span>
                                    <i className="checkbox__points">
                                      {getPointsText({ points: option.points })}
                                    </i>
                                  </label>
                                </div>
                                {getUnitOptionNotes({
                                  notes: option.notes,
                                  key: `mount-${id}-option-${optionIndex}`,
                                  className:
                                    "unit__option-note unit__option-note--conditionnal",
                                  language,
                                })}
                                {optionIndex === options.length - 1 && (
                                  <hr className="unit__command-option-hr" />
                                )}
                              </Fragment>
                            );
                          })}
                      </>
                    )}
                  </Fragment>
                )
              )}
          </>
        )}
        {unit.lores && unit.lores.length ? (
          <>
            <h2 className="unit__subline">
              <FormattedMessage id="unit.lore" />
            </h2>
            {unit.lores
              .filter((lore, index) => {
                if (
                  lore === "troll-magic" &&
                  list.armyComposition !== "troll-horde" &&
                  unit.items
                    .find((items) => items.name_en === "Magic Items")
                    ?.selected.find(
                      (item) => item.name_en === "Da Hag's Brew"
                    ) === undefined &&
                  index !== 0
                ) {
                  if (unit.activeLore === "troll-magic") {
                    handleLoresChange(unit.lores[0]);
                  }
                  return false;
                }
                return true;
              })
              .map((lore) => (
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
                    <RuleWithIcon
                      name={nameMap[lore].name_en}
                      isDark
                      className="unit__rules"
                    />
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
              const maxPoints =
                (item.armyComposition &&
                  item.armyComposition[list?.armyComposition || list.army]
                    ?.maxPoints) ||
                item.maxPoints;

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
                          itemsPoints > maxPoints &&
                            maxPoints > 0 &&
                            "editor__error"
                        )}
                      >
                        {itemsPoints}
                      </span>
                      {maxPoints > 0 && <>{` / ${maxPoints}`}</>}{" "}
                      <FormattedMessage id="app.points" />
                    </i>
                    {itemsPoints > maxPoints && maxPoints > 0 && (
                      <Icon
                        symbol="error"
                        color="red"
                        className="unit__magic-icon"
                      />
                    )}
                  </div>
                  {getUnitOptionNotes({
                    notes: item.notes,
                    key: `options-${itemIndex}-note`,
                    className: "unit__option-note unit__option-note--items",
                    language,
                  })}
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
            <p>
              <RulesLinksText textObject={unit.specialRules} />
            </p>
          </>
        ) : null}

        <hr />
        <label htmlFor="customNote">
          <FormattedMessage id="unit.customNote" />
        </label>
        <textarea
          id="customNote"
          className="input textarea"
          rows="2"
          value={unit.customNote || ""}
          onChange={handleCustomNoteChange}
          autoComplete="off"
          maxLength="200"
        />
      </MainComponent>
    </>
  );
};
