import { Fragment } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import classNames from "classnames";

import { getUnitPoints, getUnitCommandPoints } from "../../utils/points";
import { List } from "../../components/list";
import { NumberInput } from "../../components/number-input";
import { Icon } from "../../components/icon";
import { Header } from "../../components/page";
import { Button } from "../../components/button";
import { nameMap } from "../../pages/magic";
import { useLanguage } from "../../utils/useLanguage";

import "./UnitPreview.css";

export const UnitPreview = ({ unit, coreUnits, onClose }) => {
  const { language } = useLanguage();
  const intl = useIntl();
  const detachments = coreUnits.filter((coreUnit) => coreUnit.detachment);
  let magicPoints = 0;

  return (
    <>
      <button onClick={onClose} className="unit-preview-background" />
      <div className="unit-preview">
        <>
          <Header
            isSection
            headline={unit[`name_${language}`] || unit.name_en}
            subheadline={`${getUnitPoints(unit)} ${intl.formatMessage({
              id: "app.points",
            })}`}
          />
          <Button
            className="unit-preview__close"
            icon="close"
            type="text"
            label="Close preview"
            color="dark"
            onClick={onClose}
          />

          {!unit.minimum &&
            !unit.lores &&
            (!unit.command || (unit.command && !unit.command.length)) &&
            (!unit.equipment || (unit.equipment && !unit.equipment.length)) &&
            (!unit.armor || (unit.armor && !unit.armor.length)) &&
            (!unit.mounts || (unit.mounts && !unit.mounts.length)) &&
            (!unit.magic || (unit.magic && !unit.magic.maxPoints)) &&
            (!unit.items || (unit.items && !unit.items.length)) &&
            (!unit.options || (unit.options && !unit.options.length)) && (
              <i className="unit__empty">
                <FormattedMessage id="unit.noOptions" />
              </i>
            )}
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
                onChange={() => {}}
                noError
              />
            </>
          ) : null}
          {unit.command && unit.command.length > 0 && (
            <>
              <h2 className="unit__subline">
                <FormattedMessage id="unit.command" />
              </h2>
              {unit.command.map(
                (
                  {
                    name_en,
                    points,
                    perModel,
                    active = false,
                    magic,
                    ...command
                  },
                  index
                ) => {
                  let commandMagicPoints = 0;

                  if (unit.magic && unit.magic.items) {
                    unit.magic.items
                      .filter((item) => item.command === index)
                      .forEach(({ points }) => {
                        commandMagicPoints = commandMagicPoints + points;
                      });
                  }

                  return (
                    <Fragment key={index}>
                      <div className="checkbox">
                        <input
                          type="checkbox"
                          id={`command-${index}`}
                          defaultChecked={active}
                          className="checkbox__input"
                        />
                        <label
                          htmlFor={`command-${index}`}
                          className="checkbox__label"
                        >
                          {command[`name_${language}`] || name_en}
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
                      {magic?.maxPoints && active ? (
                        <List
                          className="editor__list unit__link"
                          active={false}
                        >
                          <div className="editor__list-inner">
                            <b>
                              {magic.types
                                .map(
                                  (type) =>
                                    nameMap[type][`name_${language}`] ||
                                    nameMap[type].name_en
                                )
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
                                  unit?.magic?.selected.filter(
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
                                .map(
                                  ({ name_en, ...item }) =>
                                    item[`name_${language}`] || name_en
                                )
                                .join(", ")}
                            </p>
                          )}
                        </List>
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
                (
                  { name_en, points, perModel, active = false, ...equipment },
                  index
                ) => (
                  <div className="radio" key={index}>
                    <input
                      type="radio"
                      id={`equipment-${index}`}
                      name="equipment"
                      defaultChecked={active}
                      className="radio__input"
                    />
                    <label
                      htmlFor={`equipment-${index}`}
                      className="radio__label"
                    >
                      {equipment[`name_${language}`] || name_en}
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
          {unit.armor && unit.armor.length > 0 && (
            <>
              <h2 className="unit__subline">
                <FormattedMessage id="unit.armor" />
              </h2>
              {unit.armor.map(
                (
                  { name_en, points, perModel, active = false, ...equipment },
                  index
                ) => (
                  <div className="radio" key={index}>
                    <input
                      type="radio"
                      id={`armor-${index}`}
                      name="armor"
                      defaultChecked={active}
                      className="radio__input"
                    />
                    <label htmlFor={`armor-${index}`} className="radio__label">
                      {equipment[`name_${language}`] || name_en}
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
                (
                  {
                    name_en,
                    points,
                    perModel,
                    stackable,
                    maximum,
                    minimum = 0,
                    stackableCount = minimum || 0,
                    active = false,
                    ...equipment
                  },
                  index
                ) =>
                  !stackable ? (
                    <div className="checkbox" key={index}>
                      <input
                        type="checkbox"
                        id={`options-${index}`}
                        defaultChecked={active}
                        className="checkbox__input"
                      />
                      <label
                        htmlFor={`options-${index}`}
                        className="checkbox__label"
                      >
                        {equipment[`name_${language}`] || name_en}
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
                    <Fragment key={index}>
                      <label
                        htmlFor={`options-${index}`}
                        className="unit__special-option"
                      >
                        {equipment[`name_${language}`] || name_en}:
                        <i className="checkbox__points">
                          {`${points} ${intl.formatMessage({
                            id: "app.points",
                          })} ${intl.formatMessage({
                            id: "unit.perModel",
                          })}`}
                        </i>
                      </label>
                      <NumberInput
                        id={`options-${index}`}
                        min={minimum}
                        max={maximum}
                        value={stackableCount}
                        onChange={() => {}}
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
              {detachments.map(({ name_en, id, ...regiment }) => (
                <>
                  <div className="list" key={id}>
                    <div className="list__inner unit__detachments-header">
                      <b className="unit__magic-headline">
                        {regiment[`name_${language}`] || name_en}
                      </b>
                      <Button
                        type="secondary"
                        icon="add"
                        label={intl.formatMessage({ id: "editor.add" })}
                        size="small"
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
                        ({ name_en, strength, id, points, ...detachment }) => (
                          <div className="list" key={id}>
                            <div className="list__inner unit__detachments">
                              <NumberInput
                                id={`strength-${id}`}
                                min={5}
                                value={strength}
                                onChange={() => {}}
                              />
                              <span>
                                <b>
                                  {detachment[`name_${language}`] || name_en}
                                </b>
                                <i>{`${getUnitPoints({
                                  strength,
                                  points,
                                })} ${intl.formatMessage({
                                  id: "app.points",
                                })}`}</i>
                              </span>
                              <Button
                                type="secondary"
                                icon="close"
                                label={intl.formatMessage({
                                  id: "misc.remove",
                                })}
                                size="small"
                              />
                            </div>
                          </div>
                        )
                      )}
                </>
              ))}
            </>
          )}
          {unit.mounts && unit.mounts.length > 0 && (
            <>
              <h2 className="unit__subline">
                <FormattedMessage id="unit.mount" />
              </h2>
              {unit.mounts.map(
                ({ name_en, points, active = false, ...mounts }, index) => (
                  <div className="radio" key={index}>
                    <input
                      type="radio"
                      id={`mounts-${index}`}
                      name="mounts"
                      defaultChecked={active}
                      className="radio__input"
                    />
                    <label htmlFor={`mounts-${index}`} className="radio__label">
                      {mounts[`name_${language}`] || name_en}
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
                    onChange={() => {}}
                    checked={(unit.activeLore || unit.lores[0]) === lore}
                    className="radio__input"
                  />
                  <label htmlFor={`lore-${lore}`} className="radio__label">
                    {nameMap[lore][`name_${language}`] || nameMap[lore].name_en}
                  </label>
                </div>
              ))}
            </>
          ) : null}
          {unit.items && unit.items.length ? <hr className="unit__hr" /> : null}
          {unit.items && unit.items.length
            ? unit.items.map((item, itemIndex) => (
                <List
                  className="editor__list unit__link"
                  active={false}
                  key={itemIndex}
                >
                  <div className="editor__list-inner">
                    <b className="unit__magic-headline">
                      {item[`name_${language}`] || item.name_en}
                    </b>
                    <i className="checkbox__points">
                      <span>{magicPoints}</span>
                      {item.maxPoints > 0 && <>{` / ${item.maxPoints}`}</>}{" "}
                      <FormattedMessage id="app.points" />
                    </i>
                  </div>
                  {item.items && (
                    <p>
                      {item.items
                        .map(
                          ({ name_en, ...entity }) =>
                            entity[`name_${language}`] || name_en
                        )
                        .join(", ")}
                    </p>
                  )}
                </List>
              ))
            : null}
          {unit.specialRules ? (
            <>
              <h2 className="unit__subline unit__subline--space-before">
                <FormattedMessage id="unit.specialRules" />
              </h2>
              <p>{unit.specialRules}</p>
            </>
          ) : null}
        </>
      </div>
    </>
  );
};
