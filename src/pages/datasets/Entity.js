import { useEffect, useState } from "react";

import { NumberInput } from "../../components/number-input";
import { Button } from "../../components/button";
import { Expandable } from "../../components/expandable";

import "./Entity.css";

const initialUnitState = {
  name_en: "",
  name_de: "",
  name_es: "",
  name_fr: "",
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
  items: [],
  lores: [],
  specialRules: {
    name_en: "",
    name_de: "",
    name_es: "",
    name_fr: "",
  },
};
const magicItemTypes = [
  "weapon",
  "armor",
  "armor-mages",
  "talisman",
  "banner",
  "arcane-item",
  "enchanted-item",
  "weapon-runes",
  "armor-runes",
  "banner-runes",
  "talismanic-runes",
  "engineering-runes",
  "triptych",
  "knightly-virtue",
  "knightly-virtue-character",
  "chaos-mutation",
  "chaos-mutation-character",
  "chaos-mutation-chieftain",
  "gift-of-chaos",
  "forest-spite",
];
const loresOfMagic = [
  "daemonology",
  "dark-magic",
  "elementalism",
  "battle-magic",
  "high-magic",
  "illusion",
  "necromancy",
  "waaagh-magic",
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
  const handleSpecialRulesChange = ({ field, value }) => {
    setUnit({
      ...unit,
      specialRules: {
        ...unit.specialRules,
        [field]: value,
      },
    });
  };
  const handleCheckboxChange = ({ field, value }) => {
    setUnit({
      ...unit,
      [field]: value,
    });
  };
  const handleLoresOfMagicChange = ({ lore }) => {
    if (unit.lores.includes(lore)) {
      setUnit({
        ...unit,
        lores: unit.lores.filter((loreName) => loreName !== lore),
      });
    } else {
      setUnit({
        ...unit,
        lores: [...unit.lores, lore],
      });
    }
  };
  const handleNameBlur = () => {
    const isNew = !Boolean(existingUnit);

    setUnit({
      ...unit,
      id: isNew
        ? unit.name_en.toLowerCase().replace(/ /g, "-").replace(/,/g, "")
        : unit.id,
      name_de: !unit.name_de ? unit.name_en : unit.name_de,
      name_es: !unit.name_es ? unit.name_en : unit.name_es,
      name_fr: !unit.name_fr ? unit.name_en : unit.name_fr,
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
          name_es: !entry.name_es ? value : entry.name_es,
          name_fr: !entry.name_fr ? value : entry.name_fr,
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
  const handleItemsChange = ({ value, type, itemIndex }) => {
    const newEntries = unit.items.map((entry, entryIndex) => {
      if (itemIndex === entryIndex) {
        return {
          ...entry,
          types:
            value === "on"
              ? [...unit.items[itemIndex].types, type]
              : unit.items[itemIndex].types.filter((name) => name !== type),
        };
      }
      return entry;
    });

    setUnit({
      ...unit,
      items: newEntries,
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
          name_es: "",
          name_fr: "",
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
          name_es: "",
          name_fr: "",
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
          name_es: "",
          name_fr: "",
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
          name_es: "",
          name_fr: "",
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
          name_es: "",
          name_fr: "",
          points: 1,
          active: false,
        },
      ],
    });
  };
  const handleNewMagicItemCategory = () => {
    setUnit({
      ...unit,
      items: [
        ...unit.items,
        {
          name_en: "Magic Items",
          name_de: "Magische Gegenstände",
          name_es: "Objetos mágicos",
          name_fr: "Objets magiques",
          types: [],
          selected: [],
          mutuallyExclusive: false,
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
      <label htmlFor={`name_es-${randomId}`}>Name Spanish</label>
      <input
        type="text"
        id={`name_es-${randomId}`}
        className="input"
        value={unit.name_es}
        onChange={handleFieldChange}
        autoComplete="off"
        required
      />
      <label htmlFor={`name_fr-${randomId}`}>Name French</label>
      <input
        type="text"
        id={`name_fr-${randomId}`}
        className="input"
        value={unit.name_fr}
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
      {type === "characters" && (
        <Expandable headline="Allowed Lores of Magic">
          {loresOfMagic.map((lore, loreIndex) => (
            <div className="checkbox" key={lore}>
              <input
                type="checkbox"
                id={`${lore}-${loreIndex}-${randomId}`}
                onChange={() =>
                  handleLoresOfMagicChange({
                    lore,
                  })
                }
                checked={unit.lores.includes(lore)}
                className="checkbox__input"
              />
              <label
                htmlFor={`${lore}-${loreIndex}-${randomId}`}
                className="checkbox__label"
              >
                {lore}
              </label>
            </div>
          ))}
        </Expandable>
      )}
      <Expandable headline="Special Rules">
        <label htmlFor={`specialRules-en-${randomId}`}>English</label>
        <input
          type="text"
          id={`specialRules-en-${randomId}`}
          className="input"
          value={unit.specialRules?.name_en}
          onChange={(event) =>
            handleSpecialRulesChange({
              field: "name_en",
              value: event.target.value,
            })
          }
          placeholder="e.g. Stubborn, Regiment, etc."
          autoComplete="off"
        />
        <label htmlFor={`specialRules-de-${randomId}`}>German</label>
        <input
          type="text"
          id={`specialRules-de-${randomId}`}
          className="input"
          value={unit.specialRules?.name_de}
          onChange={(event) =>
            handleSpecialRulesChange({
              field: "name_de",
              value: event.target.value,
            })
          }
          placeholder="e.g. Stubborn, Regiment, etc."
          autoComplete="off"
        />
        <label htmlFor={`specialRules-es-${randomId}`}>Spanish</label>
        <input
          type="text"
          id={`specialRules-es-${randomId}`}
          className="input"
          value={unit.specialRules?.name_es}
          onChange={(event) =>
            handleSpecialRulesChange({
              field: "name_es",
              value: event.target.value,
            })
          }
          placeholder="e.g. Stubborn, Regiment, etc."
          autoComplete="off"
        />
        <label htmlFor={`specialRules-fr-${randomId}`}>French</label>
        <input
          type="text"
          id={`specialRules-fr-${randomId}`}
          className="input"
          value={unit.specialRules?.name_fr}
          onChange={(event) =>
            handleSpecialRulesChange({
              field: "name_fr",
              value: event.target.value,
            })
          }
          placeholder="e.g. Stubborn, Regiment, etc."
          autoComplete="off"
        />
      </Expandable>

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
              <label htmlFor={`command-name_es${index}-${randomId}`}>
                Name Spanish
              </label>
              <input
                type="text"
                id={`command-name_es${index}-${randomId}`}
                className="input"
                value={command.name_es}
                onChange={(event) =>
                  handleSecondLevelFieldChange({
                    index,
                    key: "command",
                    field: "name_es",
                    value: event.target.value,
                  })
                }
                autoComplete="off"
              />
              <label htmlFor={`command-name_fr${index}-${randomId}`}>
                Name French
              </label>
              <input
                type="text"
                id={`command-name_fr${index}-${randomId}`}
                className="input"
                value={command.name_fr}
                onChange={(event) =>
                  handleSecondLevelFieldChange({
                    index,
                    key: "command",
                    field: "name_fr",
                    value: event.target.value,
                  })
                }
                autoComplete="off"
              />
              <label htmlFor={`command-points${index}-${randomId}`}>
                Points
              </label>
              <NumberInput
                id={`command-points${index}-${randomId}`}
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
                      onChange={() =>
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
          <label htmlFor={`equipment-name_es${index}-${randomId}`}>
            Name Spanish
          </label>
          <input
            type="text"
            id={`equipment-name_es${index}-${randomId}`}
            className="input"
            value={equipment.name_es}
            onChange={(event) =>
              handleSecondLevelFieldChange({
                index,
                key: "equipment",
                field: "name_es",
                value: event.target.value,
              })
            }
            autoComplete="off"
          />
          <label htmlFor={`equipment-name_fr${index}-${randomId}`}>
            Name French
          </label>
          <input
            type="text"
            id={`equipment-name_fr${index}-${randomId}`}
            className="input"
            value={equipment.name_fr}
            onChange={(event) =>
              handleSecondLevelFieldChange({
                index,
                key: "equipment",
                field: "name_fr",
                value: event.target.value,
              })
            }
            autoComplete="off"
          />
          <label htmlFor={`equipment-points${index}-${randomId}`}>Points</label>
          <NumberInput
            id={`equipment-points${index}-${randomId}`}
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
          <label htmlFor={`armor-name_es${index}-${randomId}`}>
            Name Spanish
          </label>
          <input
            type="text"
            id={`armor-name_es${index}-${randomId}`}
            className="input"
            value={armor.name_es}
            onChange={(event) =>
              handleSecondLevelFieldChange({
                index,
                key: "armor",
                field: "name_es",
                value: event.target.value,
              })
            }
            autoComplete="off"
          />
          <label htmlFor={`armor-name_fr${index}-${randomId}`}>
            Name French
          </label>
          <input
            type="text"
            id={`armor-name_fr${index}-${randomId}`}
            className="input"
            value={armor.name_fr}
            onChange={(event) =>
              handleSecondLevelFieldChange({
                index,
                key: "armor",
                field: "name_fr",
                value: event.target.value,
              })
            }
            autoComplete="off"
          />
          <label htmlFor={`armor-points${index}-${randomId}`}>Points</label>
          <NumberInput
            id={`armor-points${index}-${randomId}`}
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
          <label htmlFor={`options-name_es${index}-${randomId}`}>
            Name Spanish
          </label>
          <input
            type="text"
            id={`options-name_es${index}-${randomId}`}
            className="input"
            value={option.name_es}
            onChange={(event) =>
              handleSecondLevelFieldChange({
                index,
                key: "options",
                field: "name_es",
                value: event.target.value,
              })
            }
            autoComplete="off"
          />
          <label htmlFor={`options-name_fr${index}-${randomId}`}>
            Name French
          </label>
          <input
            type="text"
            id={`options-name_fr${index}-${randomId}`}
            className="input"
            value={option.name_fr}
            onChange={(event) =>
              handleSecondLevelFieldChange({
                index,
                key: "options",
                field: "name_fr",
                value: event.target.value,
              })
            }
            autoComplete="off"
          />
          <label htmlFor={`options-points${index}-${randomId}`}>Points</label>
          <NumberInput
            id={`options-points${index}-${randomId}`}
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
              <label htmlFor={`mounts-name_es${index}-${randomId}`}>
                Name Spanish
              </label>
              <input
                type="text"
                id={`mounts-name_es${index}-${randomId}`}
                className="input"
                value={mount.name_es}
                onChange={(event) =>
                  handleSecondLevelFieldChange({
                    index,
                    key: "mounts",
                    field: "name_es",
                    value: event.target.value,
                  })
                }
                autoComplete="off"
              />
              <label htmlFor={`mounts-name_fr${index}-${randomId}`}>
                Name French
              </label>
              <input
                type="text"
                id={`mounts-name_fr${index}-${randomId}`}
                className="input"
                value={mount.name_fr}
                onChange={(event) =>
                  handleSecondLevelFieldChange({
                    index,
                    key: "mounts",
                    field: "name_fr",
                    value: event.target.value,
                  })
                }
                autoComplete="off"
              />
              <label htmlFor={`mounts-points${index}-${randomId}`}>
                Points
              </label>
              <NumberInput
                id={`mounts-points${index}-${randomId}`}
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
        </>
      ) : null}
      <hr />

      <h3>(Magic) items</h3>
      <p className="datasets__paragraph">
        Specify what types of items are allowed. Can also be used for chaos
        mutations, knightly vitues or similar.
      </p>
      {unit.items && unit.items.length
        ? unit.items.map((item, itemIndex) => (
            <div className="entity__second-level" key={itemIndex}>
              <label htmlFor={`magic-name_en-${itemIndex}-${randomId}`}>
                Name English
              </label>
              <input
                type="text"
                id={`magic-name_en-${itemIndex}-${randomId}`}
                className="input"
                value={item.name_en}
                onChange={(event) =>
                  handleSecondLevelFieldChange({
                    index: itemIndex,
                    key: "items",
                    field: "name_en",
                    value: event.target.value,
                  })
                }
                autoComplete="off"
                required
              />
              <label htmlFor={`magic-name_de-${itemIndex}-${randomId}`}>
                Name German
              </label>
              <input
                type="text"
                id={`magic-name_de-${itemIndex}-${randomId}`}
                className="input"
                value={item.name_de}
                onChange={(event) =>
                  handleSecondLevelFieldChange({
                    index: itemIndex,
                    key: "items",
                    field: "name_de",
                    value: event.target.value,
                  })
                }
                autoComplete="off"
                required
              />
              <label htmlFor={`magic-name_es-${itemIndex}-${randomId}`}>
                Name Spanish
              </label>
              <input
                type="text"
                id={`magic-name_es-${itemIndex}-${randomId}`}
                className="input"
                value={item.name_es}
                onChange={(event) =>
                  handleSecondLevelFieldChange({
                    index: itemIndex,
                    key: "items",
                    field: "name_es",
                    value: event.target.value,
                  })
                }
                autoComplete="off"
              />
              <label htmlFor={`magic-name_fr-${itemIndex}-${randomId}`}>
                Name French
              </label>
              <input
                type="text"
                id={`magic-name_fr-${itemIndex}-${randomId}`}
                className="input"
                value={item.name_fr}
                onChange={(event) =>
                  handleSecondLevelFieldChange({
                    index: itemIndex,
                    key: "items",
                    field: "name_fr",
                    value: event.target.value,
                  })
                }
                autoComplete="off"
              />
              <Expandable headline="Allowed (magic) item types">
                {magicItemTypes.map((type, typeIndex) => (
                  <div className="checkbox" key={type}>
                    <input
                      type="checkbox"
                      id={`${type}-${typeIndex}-${itemIndex}-${randomId}`}
                      onChange={() =>
                        handleItemsChange({
                          value: item.types.includes(type) ? "off" : "on",
                          type,
                          itemIndex,
                        })
                      }
                      checked={item.types.includes(type)}
                      className="checkbox__input"
                    />
                    <label
                      htmlFor={`${type}-${typeIndex}-${itemIndex}-${randomId}`}
                      className="checkbox__label"
                    >
                      {type}
                    </label>
                  </div>
                ))}
              </Expandable>
              <div className="checkbox">
                <input
                  type="checkbox"
                  id={`mutually-exclusive-${itemIndex}-${randomId}`}
                  onChange={(event) =>
                    handleSecondLevelFieldChange({
                      index: itemIndex,
                      key: "items",
                      field: "mutuallyExclusive",
                      value: !item.mutuallyExclusive,
                    })
                  }
                  checked={item.mutuallyExclusive}
                  className="checkbox__input"
                />
                <label
                  htmlFor={`mutually-exclusive-${itemIndex}-${randomId}`}
                  className="checkbox__label"
                >
                  Mutually exclusive
                </label>
              </div>
              <label htmlFor={`magic-points-${randomId}`}>Max. points</label>
              <NumberInput
                id={`magic-points-${itemIndex}-${randomId}`}
                min={0}
                value={item.maxPoints}
                onChange={(event) =>
                  handleSecondLevelFieldChange({
                    index: itemIndex,
                    key: "items",
                    field: "maxPoints",
                    value: Number(event.target.value),
                  })
                }
              />
            </div>
          ))
        : null}
      <Button
        type="secondary"
        icon="add"
        onClick={handleNewMagicItemCategory}
        spaceBottom
        className="entity__second-level-button"
      >
        New category
      </Button>

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
