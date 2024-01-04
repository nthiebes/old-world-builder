import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { NumberInput } from "../../components/number-input";
import { Button } from "../../components/button";
import { Select } from "../../components/select";
import { Expandable } from "../../components/expandable";
import { fetcher } from "../../utils/fetcher";
import gameSystems from "../../assets/armies.json";

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

export const Entity = ({ onSubmit }) => {
  const [unit, setUnit] = useState(initialUnitState);
  const handleSubmit = (event) => {
    event.preventDefault();

    onSubmit(unit);
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
  const handleCommandFieldChange = ({ field, value, index }) => {
    const newCommandEntries = unit.command.map((command, commandIndex) => {
      if (commandIndex === index) {
        return {
          ...command,
          [field]: value,
        };
      }
      return command;
    });

    setUnit({
      ...unit,
      command: newCommandEntries,
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
  const handleCommandNameBlur = ({ index, value }) => {
    const newCommandEntries = unit.command.map((command, commandIndex) => {
      if (commandIndex === index) {
        return {
          ...command,
          name_de: !command.name_de ? value : command.name_de,
        };
      }
      return command;
    });

    setUnit({
      ...unit,
      command: newCommandEntries,
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

      <h3>Command</h3>
      {unit.command.map((command, index) => (
        <div className="entity__command">
          <label htmlFor="command-name_en">
            <FormattedMessage id="Name en" />
          </label>
          <input
            type="text"
            id="command-name_en"
            className="input"
            value={command.name_en}
            onChange={(event) =>
              handleCommandFieldChange({
                index,
                field: "name_en",
                value: event.target.value,
              })
            }
            onBlur={(event) =>
              handleCommandNameBlur({
                index,
                value: event.target.value,
              })
            }
            autoComplete="off"
            required
          />
          <label htmlFor="command-name_de">
            <FormattedMessage id="Name de" />
          </label>
          <input
            type="text"
            id="command-name_de"
            className="input"
            value={command.name_de}
            onChange={(event) =>
              handleCommandFieldChange({
                index,
                field: "name_de",
                value: event.target.value,
              })
            }
            autoComplete="off"
            required
          />
          <label htmlFor="command-points">
            <FormattedMessage id="Command points" />
          </label>
          <NumberInput
            id="command-points"
            className="input"
            min={1}
            value={command.points}
            onChange={(event) =>
              handleCommandFieldChange({
                index,
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
                  id={`${item}-${itemIndex}`}
                  onChange={(event) =>
                    handleCommandMagicChange({
                      index,
                      value: command.magic.types.includes(item) ? "off" : "on",
                      item,
                    })
                  }
                  checked={command.magic.types.includes(item)}
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
        className="entity__command-button"
      >
        New entry
      </Button>

      <Button submitButton icon="add">
        Add
      </Button>
    </form>
  );
};
