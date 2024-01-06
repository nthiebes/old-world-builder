import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { NumberInput } from "../../components/number-input";
import { Button } from "../../components/button";
import { Expandable } from "../../components/expandable";

import "./Entity.css";

const initialUnitState = {
  name_en: "",
  name_de: "",
  id: "",
  named: false,
  points: 1,
  minimum: 0,
  maximum: 0,
  command: [],
  equipment: [],
  options: [],
  mounts: [],
  magic: {
    types: [],
    maxPoints: 0,
  },
};
const magicItemTypes = [
  "weapon",
  "armor",
  "talisman",
  "banner",
  "artifact",
  "enchanted-item",
  "triptych",
];

export const Entity = ({ onSubmit, type, unit: existingUnit }) => {
  const [unit, setUnit] = useState(
    existingUnit ? { ...initialUnitState, ...existingUnit } : initialUnitState
  );
  const handleSubmit = (event) => {
    event.preventDefault();

    onSubmit({ unit, type, isNew: !Boolean(existingUnit) });
    setUnit(initialUnitState);
  };
  const handleFieldChange = (event) => {
    setUnit({
      ...unit,
      [event.target.id]:
        event.target.type === "number"
          ? Number(event.target.value)
          : event.target.value,
    });
  };
  const handleCheckboxChange = (event) => {
    setUnit({
      ...unit,
      [event.target.id]: event.target.value === "on" ? true : false,
    });
  };
  const handleNameBlur = () => {
    setUnit({
      ...unit,
      id: unit.name_en.toLowerCase().replace(/ /g, "-"),
      name_de: !unit.name_de ? unit.name_en : unit.name_de,
    });
  };
  const handleSecondLevelFieldChange = ({ key, field, value, index }) => {
    console.log(key, field, value, index);
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
  const handleMagicChange = ({ value, item }) => {
    setUnit({
      ...unit,
      magic: {
        ...unit.magic,
        types:
          value === "on"
            ? [...unit.magic.types, item]
            : unit.magic.types.filter((name) => name !== item),
      },
    });
  };
  const handleMagicPointsChange = ({ value }) => {
    setUnit({
      ...unit,
      magic: {
        ...unit.magic,
        maxPoints: value,
      },
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
          magic: {
            types: [],
            maxPoints: 0,
          },
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
  const handleNewOption = () => {
    setUnit({
      ...unit,
      options: [
        ...unit.options,
        {
          name_en: "",
          name_de: "",
          points: 1,
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

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="name_en">
        <FormattedMessage id="Name en" />
      </label>
      <input
        type="text"
        id="name_en"
        className="input"
        value={unit.name_en}
        onChange={handleFieldChange}
        autoComplete="off"
        required
        onBlur={handleNameBlur}
      />
      <label htmlFor="name_de">
        <FormattedMessage id="Name de" />
      </label>
      <input
        type="text"
        id="name_de"
        className="input"
        value={unit.name_de}
        onChange={handleFieldChange}
        autoComplete="off"
        required
      />
      <label htmlFor="id" className="edit__label">
        <FormattedMessage id="id" />
      </label>
      <input
        type="text"
        id="id"
        className="input"
        value={unit.id}
        onChange={handleFieldChange}
        autoComplete="off"
        pattern="(([a-z]*-[a-z]*)|[a-z]*)*"
        disabled={existingUnit ? true : false}
        required
      />
      <div className="checkbox">
        <input
          type="checkbox"
          id="named"
          onChange={handleCheckboxChange}
          checked={unit.named}
          className="checkbox__input"
        />
        <label htmlFor="named" className="checkbox__label">
          <FormattedMessage id="named" />
        </label>
      </div>
      <label htmlFor="points">
        <FormattedMessage id="points" />
      </label>
      <NumberInput
        id="points"
        className="input"
        min={1}
        value={unit.points}
        onChange={handleFieldChange}
        required
      />
      <label htmlFor="minimum">
        <FormattedMessage id="minimum" />
      </label>
      <NumberInput
        id="minimum"
        className="input"
        min={0}
        value={unit.minimum}
        onChange={handleFieldChange}
        required
      />
      <label htmlFor="maximum">
        <FormattedMessage id="maximum" />
      </label>
      <NumberInput
        id="maximum"
        className="input"
        min={0}
        value={unit.maximum}
        onChange={handleFieldChange}
        required
      />

      {type !== "characters" && (
        <>
          <h3>Command</h3>
          {unit.command.map((command, index) => (
            <div className="entity__second-level">
              <label htmlFor={`command-name_en${index}`}>
                <FormattedMessage id="Name en" />
              </label>
              <input
                type="text"
                id={`command-name_en${index}`}
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
              <label htmlFor={`command-name_de${index}`}>
                <FormattedMessage id="Name de" />
              </label>
              <input
                type="text"
                id={`command-name_de${index}`}
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
              <label htmlFor={`command-points${index}`}>
                <FormattedMessage id="Command points" />
              </label>
              <NumberInput
                id={`command-points${index}`}
                className="input"
                min={1}
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
              <Expandable headline="Magic items">
                {magicItemTypes.map((item, itemIndex) => (
                  <div className="checkbox">
                    <input
                      type="checkbox"
                      id={`${item}${itemIndex}`}
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
                      htmlFor={`${item}${itemIndex}`}
                      className="checkbox__label"
                    >
                      <FormattedMessage id={item} />
                    </label>
                  </div>
                ))}
                <label htmlFor={`command-magic-points-${index}`}>
                  <FormattedMessage id="Max points" />
                </label>
                <NumberInput
                  id={`command-magic-points-${index}`}
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
            </div>
          ))}
          <Button
            type="secondary"
            onClick={handleNewCommand}
            spaceBottom
            className="entity__second-level-button"
          >
            New entry
          </Button>
        </>
      )}

      <h3>Equipment</h3>
      <p>
        All equipment options, they are mutually exclusive. Weapons belong here.
      </p>
      {unit.equipment.map((equipment, index) => (
        <div className="entity__second-level">
          <label htmlFor={`equipment-name_en${index}`}>
            <FormattedMessage id="Name en" />
          </label>
          <input
            type="text"
            id={`equipment-name_en${index}`}
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
          <label htmlFor={`equipment-name_de${index}`}>
            <FormattedMessage id="Name de" />
          </label>
          <input
            type="text"
            id={`equipment-name_de${index}`}
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
          <label htmlFor={`equipment-points${index}`}>
            <FormattedMessage id="Equipment points" />
          </label>
          <NumberInput
            id={`equipment-points${index}`}
            className="input"
            min={1}
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
          <p>Wether the points are counted per model</p>
          <div className="checkbox">
            <input
              type="checkbox"
              id={`equipment-perModel${index}`}
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
              htmlFor={`equipment-perModel${index}`}
              className="checkbox__label"
            >
              <FormattedMessage id="per model" />
            </label>
          </div>
          <p>Wether it should be selected by default</p>
          <div className="checkbox">
            <input
              type="checkbox"
              id={`equipment-active${index}`}
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
              htmlFor={`equipment-active${index}`}
              className="checkbox__label"
            >
              <FormattedMessage id="active" />
            </label>
          </div>
        </div>
      ))}
      <Button
        type="secondary"
        onClick={handleNewEquipment}
        spaceBottom
        className="entity__second-level-button"
      >
        New entry
      </Button>

      <h3>Options</h3>
      <p>All options, they are NOT mutually exclusive. eg Shield</p>
      {unit.options.map((option, index) => (
        <div className="entity__second-level">
          <label htmlFor={`options-name_en${index}`}>
            <FormattedMessage id="Name en" />
          </label>
          <input
            type="text"
            id={`options-name_en${index}`}
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
          <label htmlFor={`options-name_de${index}`}>
            <FormattedMessage id="Name de" />
          </label>
          <input
            type="text"
            id={`options-name_de${index}`}
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
          <label htmlFor={`options-points${index}`}>
            <FormattedMessage id="Pptions points" />
          </label>
          <NumberInput
            id={`options-points${index}`}
            className="input"
            min={1}
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
          <p>Allows multiple selectins of this option</p>
          <div className="checkbox">
            <input
              type="checkbox"
              id={`options-stackable${index}`}
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
              htmlFor={`options-stackable${index}`}
              className="checkbox__label"
            >
              <FormattedMessage id="stackable" />
            </label>
          </div>
          <label htmlFor={`options-minimum${index}`}>
            <FormattedMessage id="minimum" />
          </label>
          <NumberInput
            id={`options-minimum${index}`}
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
          <label htmlFor={`options-maximum${index}`}>
            <FormattedMessage id="maximum" />
          </label>
          <NumberInput
            id={`options-maximum${index}`}
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
        </div>
      ))}
      <Button
        type="secondary"
        onClick={handleNewOption}
        spaceBottom
        className="entity__second-level-button"
      >
        New entry
      </Button>

      <h3>Mounts</h3>
      <p>All mount options, they are mutually exclusive</p>
      {unit.mounts.map((mount, index) => (
        <div className="entity__second-level">
          <label htmlFor={`mounts-name_en${index}`}>
            <FormattedMessage id="Name en" />
          </label>
          <input
            type="text"
            id={`mounts-name_en${index}`}
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
          <label htmlFor={`mounts-name_de${index}`}>
            <FormattedMessage id="Name de" />
          </label>
          <input
            type="text"
            id={`mounts-name_de${index}`}
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
          <label htmlFor={`mounts-points${index}`}>
            <FormattedMessage id="mount points" />
          </label>
          <NumberInput
            id={`mounts-points${index}`}
            className="input"
            min={1}
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
          <p>Wether it should be selected by default</p>
          <div className="checkbox">
            <input
              type="checkbox"
              id={`mounts-active${index}`}
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
              htmlFor={`mounts-active${index}`}
              className="checkbox__label"
            >
              <FormattedMessage id="active" />
            </label>
          </div>
        </div>
      ))}
      <Button
        type="secondary"
        onClick={handleNewMount}
        spaceBottom
        className="entity__second-level-button"
      >
        New entry
      </Button>

      {type === "characters" && (
        <Expandable headline="Magic items">
          {magicItemTypes.map((item, itemIndex) => (
            <div className="checkbox">
              <input
                type="checkbox"
                id={`${item}-${itemIndex}`}
                onChange={(event) =>
                  handleMagicChange({
                    value: unit.magic.types.includes(item) ? "off" : "on",
                    item,
                  })
                }
                checked={unit.magic.types.includes(item)}
                className="checkbox__input"
              />
              <label
                htmlFor={`${item}-${itemIndex}`}
                className="checkbox__label"
              >
                <FormattedMessage id={item} />
              </label>
            </div>
          ))}
          <label htmlFor="magic-points">
            <FormattedMessage id="Max points" />
          </label>
          <NumberInput
            id="magic-points"
            className="input"
            min={0}
            value={unit.magic.maxPoints}
            onChange={(event) =>
              handleMagicPointsChange({
                value: Number(event.target.value),
              })
            }
          />
        </Expandable>
      )}

      <Button submitButton icon={existingUnit ? "edit" : "add"}>
        {existingUnit ? "Update" : "Add"}
      </Button>
    </form>
  );
};
