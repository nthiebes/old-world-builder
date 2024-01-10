import { useEffect, useState, Fragment } from "react";

import { NumberInput } from "../../components/number-input";
import { Button } from "../../components/button";
import { Expandable } from "../../components/expandable";

import { nameMap } from "../../pages/magic/name-map";

import "./Entity.css";

const initialUnitState = {
  name_en: "",
  name_de: "",
  id: "",
  points: 1,
  minimum: 0,
  maximum: 0,
  regimentalUnit: false,
  detachment: false,
  command: [],
  equipment: [],
  armor: [],
  options: [],
  mounts: [],
  magic: [
    {
      name_en: nameMap.general.name_en,
      name_de: nameMap.general.name_de,
      types: [],
      maxPoints: 0,
    },
  ],
};
const magicItemTypes = [
  "weapon",
  "armor",
  "talisman",
  "banner",
  "arcane-item",
  "enchanted-item",
  "triptych",
  "chaos-mutation",
  "gift-of-chaos",
  "weapon-runes",
  "armor-runes",
  "banner-runes",
  "talismanic-runes",
  "engineering-runes",
];
const getRandomId = () =>
  (Math.random().toString(36) + Math.random().toString(36)).replace(
    /[^a-z]+/g,
    ""
  );

export const Entity = ({ onSubmit, type, unit: existingUnit }) => {
  const randomId = getRandomId();
  const [unit, setUnit] = useState(
    existingUnit ? { ...initialUnitState, ...existingUnit } : initialUnitState
  );
  const handleSubmit = (event) => {
    const isNew = !Boolean(existingUnit);

    event.preventDefault();
    onSubmit({
      unit: {
        ...unit,
        id: isNew
          ? unit.name_en.toLowerCase().replace(/ /g, "-").replace(/,/g, "")
          : unit.id,
      },
      type,
      isNew,
    });
    isNew && setUnit(initialUnitState);
  };
  const handleFieldChange = (event) => {
    const id = event.target.id.split("-")[0];

    setUnit({
      ...unit,
      [id]:
        event.target.type === "number"
          ? Number(event.target.value)
          : event.target.value,
    });
  };
  const handleCheckboxChange = ({ field, value }) => {
    setUnit({
      ...unit,
      [field]: value,
    });
  };
  const handleNameBlur = () => {
    const isNew = !Boolean(existingUnit);

    setUnit({
      ...unit,
      id: isNew
        ? unit.name_en.toLowerCase().replace(/ /g, "-").replace(/,/g, "")
        : unit.id,
      name_de: !unit.name_de ? unit.name_en : unit.name_de,
    });
  };
  const handleSecondLevelFieldChange = ({ key, field, value, index }) => {
    const newEntries = unit[key].map((entry, entryIndex) => {
      if (index === entryIndex) {
        return {
          ...entry,
          [field]: value,
        };
      }
      return entry;
    });

    setUnit({
      ...unit,
      [key]: newEntries,
    });
  };
  const handleSecondLevelDelete = ({ index, key }) => {
    setUnit({
      ...unit,
      [key]: unit[key].filter((_, entryIndex) => entryIndex !== index),
    });
  };
  const handleSecondLevelNameBlur = ({ index, value, key }) => {
    const newEntries = unit[key].map((entry, entryIndex) => {
      if (entryIndex === index) {
        return {
          ...entry,
          name_de: !entry.name_de ? value : entry.name_de,
        };
      }
      return entry;
    });

    setUnit({
      ...unit,
      [key]: newEntries,
    });
  };
  const handleCommandMagicChange = ({ value, item, index }) => {
    const newCommandEntries = unit.command.map((command, commandIndex) => {
      if (commandIndex === index) {
        return {
          ...command,
          magic: {
            ...command.magic,
            types:
              value === "on"
                ? [...command.magic.types, item]
                : command.magic.types.filter((name) => name !== item),
          },
        };
      }
      return command;
    });

    setUnit({
      ...unit,
      command: newCommandEntries,
    });
  };
  const handleCommandMagicPointsChange = ({ value, index }) => {
    const newCommandEntries = unit.command.map((command, commandIndex) => {
      if (commandIndex === index) {
        return {
          ...command,
          magic: {
            ...command.magic,
            maxPoints: value,
          },
        };
      }
      return command;
    });

    setUnit({
      ...unit,
      command: newCommandEntries,
    });
  };
  const handleMagicChange = ({ value, item, magicIndex }) => {
    const newEntries = unit.magic.map((entry, entryIndex) => {
      if (magicIndex === entryIndex) {
        return {
          ...entry,
          types:
            value === "on"
              ? [...unit.magic[magicIndex].types, item]
              : unit.magic[magicIndex].types.filter((name) => name !== item),
        };
      }
      return entry;
    });

    setUnit({
      ...unit,
      magic: newEntries,
    });
  };
  const handleNewCommand = () => {
    setUnit({
      ...unit,
      command: [
        ...unit.command,
        {
          name_en: "",
          name_de: "",
          points: 1,
          magic: [
            {
              name_en: nameMap.general.name_en,
              name_de: nameMap.general.name_de,
              types: [],
              maxPoints: 0,
            },
          ],
        },
      ],
    });
  };
  const handleNewEquipment = () => {
    setUnit({
      ...unit,
      equipment: [
        ...unit.equipment,
        {
          name_en: "",
          name_de: "",
          points: 1,
          perModel: true,
          active: false,
        },
      ],
    });
  };
  const handleNewArmor = () => {
    setUnit({
      ...unit,
      armor: [
        ...unit.armor,
        {
          name_en: "",
          name_de: "",
          points: 1,
          perModel: true,
          active: false,
        },
      ],
    });
  };
  const handleNewOption = () => {
    setUnit({
      ...unit,
      options: [
        ...unit.options,
        {
          name_en: "",
          name_de: "",
          points: 1,
          perModel: true,
          stackable: false,
          minimum: 0,
          maximum: 0,
        },
      ],
    });
  };
  const handleNewMount = () => {
    setUnit({
      ...unit,
      mounts: [
        ...unit.mounts,
        {
          name_en: "",
          name_de: "",
          points: 1,
          active: false,
        },
      ],
    });
  };
  const handleNewMagicItemCategory = () => {
    setUnit({
      ...unit,
      magic: [
        ...unit.magic,
        {
          name_en: nameMap.general.name_en,
          name_de: nameMap.general.name_de,
          types: [],
          maxPoints: 0,
        },
      ],
    });
  };

  useEffect(() => {
    setUnit(
      existingUnit ? { ...initialUnitState, ...existingUnit } : initialUnitState
    );
  }, [existingUnit]);

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor={`name_en-${randomId}`}>Name English</label>
      <input
        type="text"
        id={`name_en-${randomId}`}
        className="input"
        value={unit.name_en}
        onChange={handleFieldChange}
        autoComplete="off"
        required
        onBlur={handleNameBlur}
      />
      <label htmlFor={`name_de-${randomId}`}>Name German</label>
      <input
        type="text"
        id={`name_de-${randomId}`}
        className="input"
        value={unit.name_de}
        onChange={handleFieldChange}
        autoComplete="off"
        required
      />
      <label htmlFor={`id-${randomId}`} className="edit__label">
        ID
      </label>
      <input
        type="text"
        id={`id-${randomId}`}
        className="input"
        value={unit.id}
        autoComplete="off"
        pattern="(([a-z]*-[a-z]*)|[a-z]*)*"
        disabled
        readOnly
        placeholder="Automatically filled"
        required
      />
      <label htmlFor={`points-${randomId}`}>
        {type === "characters" ? "Points" : "Points per model"}
      </label>
      <NumberInput
        id={`points-${randomId}`}
        className="input"
        min={1}
        value={unit.points}
        onChange={handleFieldChange}
        required
      />
      {type !== "characters" && (
        <>
          <label htmlFor={`minimum-${randomId}`}>
            Minimum number of models
          </label>
          <NumberInput
            id={`minimum-${randomId}`}
            className="input"
            min={0}
            value={unit.minimum}
            onChange={handleFieldChange}
            required
          />
          <label htmlFor={`maximum-${randomId}`}>
            Maximum number of models
          </label>
          <NumberInput
            id={`maximum-${randomId}`}
            className="input"
            min={0}
            value={unit.maximum}
            onChange={handleFieldChange}
            required
          />
          <div className="checkbox">
            <input
              type="checkbox"
              id={`regimentalUnit-${randomId}`}
              onChange={() =>
                handleCheckboxChange({
                  field: "regimentalUnit",
                  value: !unit.regimentalUnit,
                })
              }
              checked={unit.regimentalUnit}
              className="checkbox__input"
            />
            <label
              htmlFor={`regimentalUnit-${randomId}`}
              className="checkbox__label"
            >
              Unit can have detachments
            </label>
          </div>
          <div className="checkbox">
            <input
              type="checkbox"
              id={`detachment-${randomId}`}
              onChange={() =>
                handleCheckboxChange({
                  field: "detachment",
                  value: !unit.detachment,
                })
              }
              checked={unit.detachment}
              className="checkbox__input"
            />
            <label
              htmlFor={`detachment-${randomId}`}
              className="checkbox__label"
            >
              Unit is a detachment
            </label>
          </div>
        </>
      )}

      {type !== "characters" && (
        <>
          <hr />
          <h3>Command</h3>
          <p className="datasets__paragraph">
            All command options are NOT mutually exclusive.
          </p>
          {unit.command.map((command, index) => (
            <div className="entity__second-level" key={index}>
              <label htmlFor={`command-name_en${index}-${randomId}`}>
                Name English
              </label>
              <input
                type="text"
                id={`command-name_en${index}-${randomId}`}
                className="input"
                value={command.name_en}
                onChange={(event) =>
                  handleSecondLevelFieldChange({
                    index,
                    key: "command",
                    field: "name_en",
                    value: event.target.value,
                  })
                }
                onBlur={(event) =>
                  handleSecondLevelNameBlur({
                    index,
                    key: "command",
                    value: event.target.value,
                  })
                }
                autoComplete="off"
                required
              />
              <label htmlFor={`command-name_de${index}-${randomId}`}>
                Name German
              </label>
              <input
                type="text"
                id={`command-name_de${index}-${randomId}`}
                className="input"
                value={command.name_de}
                onChange={(event) =>
                  handleSecondLevelFieldChange({
                    index,
                    key: "command",
                    field: "name_de",
                    value: event.target.value,
                  })
                }
                autoComplete="off"
                required
              />
              <label htmlFor={`command-points${index}-${randomId}`}>
                Points
              </label>
              <NumberInput
                id={`command-points${index}-${randomId}`}
                className="input"
                value={command.points}
                onChange={(event) =>
                  handleSecondLevelFieldChange({
                    index,
                    key: "command",
                    field: "points",
                    value: Number(event.target.value),
                  })
                }
                required
              />
              <Expandable headline="Allowed magic item categories">
                {magicItemTypes.map((item, itemIndex) => (
                  <div className="checkbox" key={item}>
                    <input
                      type="checkbox"
                      id={`${item}${itemIndex}-${randomId}`}
                      onChange={(event) =>
                        handleCommandMagicChange({
                          index,
                          value: command.magic.types.includes(item)
                            ? "off"
                            : "on",
                          item,
                        })
                      }
                      checked={command.magic.types.includes(item)}
                      className="checkbox__input"
                    />
                    <label
                      htmlFor={`${item}${itemIndex}-${randomId}`}
                      className="checkbox__label"
                    >
                      {item}
                    </label>
                  </div>
                ))}
                <label htmlFor={`command-magic-points-${index}-${randomId}`}>
                  Max. magic item points
                </label>
                <NumberInput
                  id={`command-magic-points-${index}-${randomId}`}
                  className="input"
                  min={0}
                  value={command.magic.maxPoints}
                  onChange={(event) =>
                    handleCommandMagicPointsChange({
                      index,
                      value: Number(event.target.value),
                    })
                  }
                />
              </Expandable>
              {existingUnit ? (
                <Button
                  type="text"
                  color="dark"
                  spaceBottom
                  icon="delete"
                  onClick={() =>
                    handleSecondLevelDelete({ index, key: "command" })
                  }
                >
                  Remove entry
                </Button>
              ) : null}
            </div>
          ))}
          <Button
            type="secondary"
            icon="add"
            onClick={handleNewCommand}
            spaceBottom
            className="entity__second-level-button"
          >
            New entry
          </Button>
        </>
      )}

      <hr />

      <h3>Weapon</h3>
      <p className="datasets__paragraph">
        All weapon options are mutually exclusive and please add a default
        weapon.
        <br />
        <i>(e.g. "Hand weapon" or "Great weapon")</i>
      </p>
      {unit.equipment.map((equipment, index) => (
        <div className="entity__second-level" key={index}>
          <label htmlFor={`equipment-name_en${index}-${randomId}`}>
            Name English
          </label>
          <input
            type="text"
            id={`equipment-name_en${index}-${randomId}`}
            className="input"
            value={equipment.name_en}
            onChange={(event) =>
              handleSecondLevelFieldChange({
                index,
                key: "equipment",
                field: "name_en",
                value: event.target.value,
              })
            }
            onBlur={(event) =>
              handleSecondLevelNameBlur({
                index,
                key: "equipment",
                value: event.target.value,
              })
            }
            autoComplete="off"
            required
          />
          <label htmlFor={`equipment-name_de${index}-${randomId}`}>
            Name German
          </label>
          <input
            type="text"
            id={`equipment-name_de${index}-${randomId}`}
            className="input"
            value={equipment.name_de}
            onChange={(event) =>
              handleSecondLevelFieldChange({
                index,
                key: "equipment",
                field: "name_de",
                value: event.target.value,
              })
            }
            autoComplete="off"
            required
          />
          <label htmlFor={`equipment-points${index}-${randomId}`}>Points</label>
          <NumberInput
            id={`equipment-points${index}-${randomId}`}
            className="input"
            value={equipment.points}
            onChange={(event) =>
              handleSecondLevelFieldChange({
                index,
                key: "equipment",
                field: "points",
                value: Number(event.target.value),
              })
            }
            required
          />
          {type !== "characters" ? (
            <div className="checkbox">
              <input
                type="checkbox"
                id={`equipment-perModel${index}-${randomId}`}
                onChange={() =>
                  handleSecondLevelFieldChange({
                    index,
                    key: "equipment",
                    field: "perModel",
                    value: !equipment.perModel,
                  })
                }
                checked={equipment.perModel}
                className="checkbox__input"
              />
              <label
                htmlFor={`equipment-perModel${index}-${randomId}`}
                className="checkbox__label"
              >
                Points count for each model
              </label>
            </div>
          ) : null}
          <div className="checkbox">
            <input
              type="checkbox"
              id={`equipment-active${index}-${randomId}`}
              onChange={() =>
                handleSecondLevelFieldChange({
                  index,
                  key: "equipment",
                  field: "active",
                  value: !equipment.active,
                })
              }
              checked={equipment.active}
              className="checkbox__input"
            />
            <label
              htmlFor={`equipment-active${index}-${randomId}`}
              className="checkbox__label"
            >
              Selected by default
            </label>
          </div>
          <p>
            <i>(e.g. when "Hand weapon" is the default equipment)</i>
          </p>
          {existingUnit ? (
            <Button
              type="text"
              color="dark"
              spaceBottom
              icon="delete"
              spaceTop
              onClick={() =>
                handleSecondLevelDelete({ index, key: "equipment" })
              }
            >
              Remove entry
            </Button>
          ) : null}
        </div>
      ))}
      <Button
        type="secondary"
        icon="add"
        onClick={handleNewEquipment}
        spaceBottom
        className="entity__second-level-button"
      >
        New weapon
      </Button>

      <hr />

      <h3>Armor</h3>
      <p className="datasets__paragraph">
        All armor options are mutually exclusive and please add a default armor.
        <br />
        <i>(e.g. "Light armour" or "Heavy armour")</i>
      </p>
      {unit.armor.map((armor, index) => (
        <div className="entity__second-level" key={index}>
          <label htmlFor={`armor-name_en${index}-${randomId}`}>
            Name English
          </label>
          <input
            type="text"
            id={`armor-name_en${index}-${randomId}`}
            className="input"
            value={armor.name_en}
            onChange={(event) =>
              handleSecondLevelFieldChange({
                index,
                key: "armor",
                field: "name_en",
                value: event.target.value,
              })
            }
            onBlur={(event) =>
              handleSecondLevelNameBlur({
                index,
                key: "armor",
                value: event.target.value,
              })
            }
            autoComplete="off"
            required
          />
          <label htmlFor={`armor-name_de${index}-${randomId}`}>
            Name German
          </label>
          <input
            type="text"
            id={`armor-name_de${index}-${randomId}`}
            className="input"
            value={armor.name_de}
            onChange={(event) =>
              handleSecondLevelFieldChange({
                index,
                key: "armor",
                field: "name_de",
                value: event.target.value,
              })
            }
            autoComplete="off"
            required
          />
          <label htmlFor={`armor-points${index}-${randomId}`}>Points</label>
          <NumberInput
            id={`armor-points${index}-${randomId}`}
            className="input"
            value={armor.points}
            onChange={(event) =>
              handleSecondLevelFieldChange({
                index,
                key: "armor",
                field: "points",
                value: Number(event.target.value),
              })
            }
            required
          />
          {type !== "characters" ? (
            <div className="checkbox">
              <input
                type="checkbox"
                id={`armor-perModel${index}-${randomId}`}
                onChange={() =>
                  handleSecondLevelFieldChange({
                    index,
                    key: "armor",
                    field: "perModel",
                    value: !armor.perModel,
                  })
                }
                checked={armor.perModel}
                className="checkbox__input"
              />
              <label
                htmlFor={`armor-perModel${index}-${randomId}`}
                className="checkbox__label"
              >
                Points count for each model
              </label>
            </div>
          ) : null}
          <div className="checkbox">
            <input
              type="checkbox"
              id={`armor-active${index}-${randomId}`}
              onChange={() =>
                handleSecondLevelFieldChange({
                  index,
                  key: "armor",
                  field: "active",
                  value: !armor.active,
                })
              }
              checked={armor.active}
              className="checkbox__input"
            />
            <label
              htmlFor={`armor-active${index}-${randomId}`}
              className="checkbox__label"
            >
              Selected by default
            </label>
          </div>
          <p>
            <i>(e.g. when "Light armour" is the default equipment)</i>
          </p>
          {existingUnit ? (
            <Button
              type="text"
              color="dark"
              spaceBottom
              spaceTop
              icon="delete"
              onClick={() => handleSecondLevelDelete({ index, key: "armor" })}
            >
              Remove entry
            </Button>
          ) : null}
        </div>
      ))}
      <Button
        type="secondary"
        icon="add"
        onClick={handleNewArmor}
        spaceBottom
        className="entity__second-level-button"
      >
        New armor
      </Button>

      <hr />

      <h3>Options</h3>
      <p className="datasets__paragraph">
        All options are NOT mutually exclusive.
        <br />
        <i>(e.g. "Shield")</i>
      </p>
      {unit.options.map((option, index) => (
        <div className="entity__second-level" key={index}>
          <label htmlFor={`options-name_en${index}-${randomId}`}>
            Name English
          </label>
          <input
            type="text"
            id={`options-name_en${index}-${randomId}`}
            className="input"
            value={option.name_en}
            onChange={(event) =>
              handleSecondLevelFieldChange({
                index,
                key: "options",
                field: "name_en",
                value: event.target.value,
              })
            }
            onBlur={(event) =>
              handleSecondLevelNameBlur({
                index,
                key: "options",
                value: event.target.value,
              })
            }
            autoComplete="off"
            required
          />
          <label htmlFor={`options-name_de${index}-${randomId}`}>
            Name German
          </label>
          <input
            type="text"
            id={`options-name_de${index}-${randomId}`}
            className="input"
            value={option.name_de}
            onChange={(event) =>
              handleSecondLevelFieldChange({
                index,
                key: "options",
                field: "name_de",
                value: event.target.value,
              })
            }
            autoComplete="off"
            required
          />
          <label htmlFor={`options-points${index}-${randomId}`}>Points</label>
          <NumberInput
            id={`options-points${index}-${randomId}`}
            className="input"
            value={option.points}
            onChange={(event) =>
              handleSecondLevelFieldChange({
                index,
                key: "options",
                field: "points",
                value: Number(event.target.value),
              })
            }
            required
          />
          {type !== "characters" ? (
            <div className="checkbox">
              <input
                type="checkbox"
                id={`options-perModel${index}-${randomId}`}
                onChange={() =>
                  handleSecondLevelFieldChange({
                    index,
                    key: "options",
                    field: "perModel",
                    value: !option.perModel,
                  })
                }
                checked={option.perModel}
                className="checkbox__input"
              />
              <label
                htmlFor={`options-perModel${index}-${randomId}`}
                className="checkbox__label"
              >
                Points count for each model
              </label>
            </div>
          ) : null}
          <div className="checkbox">
            <input
              type="checkbox"
              id={`options-stackable${index}-${randomId}`}
              onChange={() =>
                handleSecondLevelFieldChange({
                  index,
                  key: "options",
                  field: "stackable",
                  value: !option.stackable,
                })
              }
              checked={option.stackable}
              className="checkbox__input"
            />
            <label
              htmlFor={`options-stackable${index}-${randomId}`}
              className="checkbox__label"
            >
              Allow multiple selections
            </label>
          </div>
          <p>
            <i>(e.g. for Nightgoblin Fanatics)</i>
          </p>
          {option.stackable && (
            <>
              <br />
              <label htmlFor={`options-minimum${index}-${randomId}`}>
                Minimum
              </label>
              <NumberInput
                id={`options-minimum${index}-${randomId}`}
                className="input"
                min={0}
                value={option.minimum}
                onChange={(event) =>
                  handleSecondLevelFieldChange({
                    index,
                    key: "options",
                    field: "stackable",
                    value: Number(event.target.value),
                  })
                }
                required
              />
              <label htmlFor={`options-maximum${index}-${randomId}`}>
                Maximum
              </label>
              <NumberInput
                id={`options-maximum${index}-${randomId}`}
                className="input"
                min={0}
                value={option.maximum}
                onChange={(event) =>
                  handleSecondLevelFieldChange({
                    index,
                    key: "options",
                    field: "stackable",
                    value: Number(event.target.value),
                  })
                }
                required
              />
            </>
          )}
          {existingUnit ? (
            <Button
              type="text"
              color="dark"
              spaceBottom
              spaceTop
              icon="delete"
              onClick={() => handleSecondLevelDelete({ index, key: "options" })}
            >
              Remove entry
            </Button>
          ) : null}
        </div>
      ))}
      <Button
        type="secondary"
        icon="add"
        onClick={handleNewOption}
        spaceBottom
        className="entity__second-level-button"
      >
        New option
      </Button>

      {type === "characters" ? (
        <>
          <hr />

          <h3>Mounts</h3>
          <p className="datasets__paragraph">
            All mount options are mutually exclusive and please add a default
            mount.
            <br />
            <i>(e.g. "On foot" or "Hippogryph")</i>
          </p>
          {unit.mounts.map((mount, index) => (
            <div className="entity__second-level" key={index}>
              <label htmlFor={`mounts-name_en${index}-${randomId}`}>
                Name English
              </label>
              <input
                type="text"
                id={`mounts-name_en${index}-${randomId}`}
                className="input"
                value={mount.name_en}
                onChange={(event) =>
                  handleSecondLevelFieldChange({
                    index,
                    key: "mounts",
                    field: "name_en",
                    value: event.target.value,
                  })
                }
                onBlur={(event) =>
                  handleSecondLevelNameBlur({
                    index,
                    key: "mounts",
                    value: event.target.value,
                  })
                }
                autoComplete="off"
                required
              />
              <label htmlFor={`mounts-name_de${index}-${randomId}`}>
                Name German
              </label>
              <input
                type="text"
                id={`mounts-name_de${index}-${randomId}`}
                className="input"
                value={mount.name_de}
                onChange={(event) =>
                  handleSecondLevelFieldChange({
                    index,
                    key: "mounts",
                    field: "name_de",
                    value: event.target.value,
                  })
                }
                autoComplete="off"
                required
              />
              <label htmlFor={`mounts-points${index}-${randomId}`}>
                Points
              </label>
              <NumberInput
                id={`mounts-points${index}-${randomId}`}
                className="input"
                value={mount.points}
                onChange={(event) =>
                  handleSecondLevelFieldChange({
                    index,
                    key: "mounts",
                    field: "points",
                    value: Number(event.target.value),
                  })
                }
                required
              />
              <div className="checkbox">
                <input
                  type="checkbox"
                  id={`mounts-active${index}-${randomId}`}
                  onChange={() =>
                    handleSecondLevelFieldChange({
                      index,
                      key: "mounts",
                      field: "active",
                      value: !mount.active,
                    })
                  }
                  checked={mount.active}
                  className="checkbox__input"
                />
                <label
                  htmlFor={`mounts-active${index}-${randomId}`}
                  className="checkbox__label"
                >
                  Selected by default
                </label>
              </div>
              <p>
                <i>(e.g. when "On foot" is the default mount)</i>
              </p>
              {existingUnit ? (
                <Button
                  type="text"
                  color="dark"
                  spaceBottom
                  spaceTop
                  icon="delete"
                  onClick={() =>
                    handleSecondLevelDelete({ index, key: "mounts" })
                  }
                >
                  Remove entry
                </Button>
              ) : null}
            </div>
          ))}
          <Button
            type="secondary"
            icon="add"
            onClick={handleNewMount}
            spaceBottom
            className="entity__second-level-button"
          >
            New mount
          </Button>
          <hr />

          <h3>Magic items</h3>
          <p className="datasets__paragraph">
            Specify what types of items are allowed. Can also be used for chaos
            mutations similar.
          </p>
          {unit.magic.map((magic, magicIndex) => (
            <div className="entity__second-level" key={magicIndex}>
              <label htmlFor={`magic-name_en-${magicIndex}-${randomId}`}>
                Name English
              </label>
              <input
                type="text"
                id={`magic-name_en-${magicIndex}-${randomId}`}
                className="input"
                value={magic.name_en}
                onChange={(event) =>
                  handleSecondLevelFieldChange({
                    index: magicIndex,
                    key: "magic",
                    field: "name_en",
                    value: event.target.value,
                  })
                }
                autoComplete="off"
                required
              />
              <label htmlFor={`magic-name_de-${magicIndex}-${randomId}`}>
                Name German
              </label>
              <input
                type="text"
                id={`magic-name_de-${magicIndex}-${randomId}`}
                className="input"
                value={magic.name_de}
                onChange={(event) =>
                  handleSecondLevelFieldChange({
                    index: magicIndex,
                    key: "magic",
                    field: "name_de",
                    value: event.target.value,
                  })
                }
                autoComplete="off"
                required
              />
              <Expandable headline="Allowed magic item types">
                {magicItemTypes.map((item, itemIndex) => (
                  <div className="checkbox" key={item}>
                    <input
                      type="checkbox"
                      id={`${item}-${itemIndex}-${magicIndex}-${randomId}`}
                      onChange={() =>
                        handleMagicChange({
                          value: magic.types.includes(item) ? "off" : "on",
                          item,
                          magicIndex,
                        })
                      }
                      checked={magic.types.includes(item)}
                      className="checkbox__input"
                    />
                    <label
                      htmlFor={`${item}-${itemIndex}-${magicIndex}-${randomId}`}
                      className="checkbox__label"
                    >
                      {item}
                    </label>
                  </div>
                ))}
              </Expandable>
              <label htmlFor={`magic-points-${randomId}`}>Max. points</label>
              <NumberInput
                id={`magic-points-${magicIndex}-${randomId}`}
                className="input"
                min={0}
                value={magic.maxPoints}
                onChange={(event) =>
                  handleSecondLevelFieldChange({
                    index: magicIndex,
                    key: "magic",
                    field: "maxPoints",
                    value: Number(event.target.value),
                  })
                }
              />
            </div>
          ))}
          <Button
            type="secondary"
            icon="add"
            onClick={handleNewMagicItemCategory}
            spaceBottom
            className="entity__second-level-button"
          >
            New category
          </Button>
        </>
      ) : null}

      <Button
        submitButton
        spaceBottom
        icon={existingUnit ? "add-list" : "new-list"}
      >
        {existingUnit ? "Update unit" : "Add unit"}
      </Button>
    </form>
  );
};
