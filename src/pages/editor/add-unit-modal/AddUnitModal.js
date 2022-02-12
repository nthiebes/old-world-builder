import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";
import classNames from "classnames";

import { Button } from "../../../components/button";
import { List } from "../../../components/list";
import { addUnit, editUnit, removeUnit } from "../../../state/lists";

import "./AddUnitModal.css";

export const AddUnitModal = ({ unitData, onClose }) => {
  const { listId } = useParams();
  const dispatch = useDispatch();
  const { units, type, unit } = unitData;
  const [animate, setAnimate] = useState(false);
  const [options, setOptions] = useState(
    unit && unit.options ? unit.options : []
  );
  const [equipment, setEquipment] = useState(
    unit && unit.equipment ? unit.equipment : []
  );
  const [mounts, setMounts] = useState(unit && unit.mounts ? unit.mounts : []);
  const [command, setCommand] = useState(
    unit && unit.command ? unit.command : []
  );
  const [strength, setStrength] = useState(
    unit ? unit.strength || unit.minimum : null
  );
  const handleStrengthChange = (event) => {
    setStrength(Number(event.target.value));
  };
  const handleAdd = (unitId) => {
    const unit = units.find(({ id }) => unitId === id);

    dispatch(addUnit({ listId, type, unit }));
    onClose();
  };
  const handleRemove = (unitId) => {
    dispatch(removeUnit({ listId, type, unitId }));
    onClose();
  };
  const handleOptionsChange = (id) => {
    const newOptions = options.map((option) => {
      if (option.id === id) {
        return {
          ...option,
          active: option.active ? false : true,
        };
      }
      return option;
    });
    setOptions(newOptions);
  };
  const handleCommandChange = (id) => {
    const newOptions = command.map((option) => {
      if (option.id === id) {
        return {
          ...option,
          active: option.active ? false : true,
        };
      }
      return option;
    });
    setCommand(newOptions);
  };
  const handleEquipmentChange = (id) => {
    setEquipment(
      equipment.map((item) => ({
        ...item,
        active: item.id === id ? true : false,
      }))
    );
  };
  const handleMountsChange = (id) => {
    const newOptions = mounts.map((option) => {
      if (option.id === id) {
        return {
          ...option,
          active: option.active ? false : true,
        };
      }
      return option;
    });
    setMounts(newOptions);
  };
  const handleSubmit = (event) => {
    event && event.preventDefault();

    dispatch(
      editUnit({
        listId,
        type,
        strength,
        unit,
        options,
        equipment,
        command,
        mounts,
      })
    );
    onClose();
  };

  useEffect(() => {
    setAnimate(true);
  }, [unitData]);

  return (
    <aside className="add-unit-modal">
      <div
        className={classNames(
          "add-unit-modal__inner",
          animate && "add-unit-modal__inner--animate"
        )}
      >
        <div className="add-unit-modal__header">
          <h1>{units ? "Einheit auswählen" : unit.name_de}</h1>
          <Button
            onClick={unit ? handleSubmit : onClose}
            label="Schließen"
            type="text"
            icon="close"
          />
        </div>
        <div className="add-unit-modal__content">
          <ul>
            {units &&
              units.map(({ name_de, id, minimum, points }) => (
                <List key={id} onClick={() => handleAdd(id)}>
                  <span>
                    {minimum && `${minimum} `}
                    <b>{name_de}</b>
                  </span>
                  <i>{`${minimum ? points * minimum : points} Pkte.`}</i>
                </List>
              ))}
          </ul>
          {unit && (
            <>
              <form onSubmit={handleSubmit}>
                {unit.minimum && (
                  <>
                    <label htmlFor="strength">Einheitengröße:</label>
                    <input
                      type="number"
                      id="strength"
                      className="input"
                      min={unit.minimum}
                      value={strength}
                      onChange={handleStrengthChange}
                      required
                    />
                  </>
                )}
                {unit.command && unit.command.length > 0 && (
                  <>
                    <h2 className="add-unit-modal__subline">
                      Kommandoabteilung:
                    </h2>
                    {unit.command.map(
                      ({ name_de, points, perModel, id, active }) => (
                        <div className="checkbox" key={id}>
                          <input
                            type="checkbox"
                            id={id}
                            name={id}
                            value={id}
                            onChange={() => handleCommandChange(id)}
                            defaultChecked={active}
                            className="checkbox__input"
                          />
                          <label htmlFor={id} className="checkbox__label">
                            {name_de}
                            <i className="checkbox__points">
                              {`${points} ${points === 1 ? "Punkt" : "Punkte"}`}
                              {perModel && ` pro Modell`}
                            </i>
                          </label>
                        </div>
                      )
                    )}
                  </>
                )}
                {unit.equipment && unit.equipment.length > 0 && (
                  <>
                    <h2 className="add-unit-modal__subline">Ausrüstung:</h2>
                    {unit.equipment.map(
                      ({ name_de, points, perModel, id, active }) => (
                        <div className="radio" key={id}>
                          <input
                            type="radio"
                            id={id}
                            name="equipment"
                            value={id}
                            onChange={() => handleEquipmentChange(id)}
                            defaultChecked={active}
                            className="radio__input"
                          />
                          <label htmlFor={id} className="radio__label">
                            {name_de}
                            <i className="checkbox__points">
                              {`${points} ${points === 1 ? "Punkt" : "Punkte"}`}
                              {perModel && ` pro Modell`}
                            </i>
                          </label>
                        </div>
                      )
                    )}
                  </>
                )}
                {unit.mounts && unit.mounts.length > 0 && (
                  <>
                    <h2 className="add-unit-modal__subline">Reittier:</h2>
                    {unit.mounts.map(({ name_de, points, id, active }) => (
                      <div className="checkbox" key={id}>
                        <input
                          type="checkbox"
                          id={id}
                          name={id}
                          value={id}
                          onChange={() => handleMountsChange(id)}
                          defaultChecked={active}
                          className="checkbox__input"
                        />
                        <label htmlFor={id} className="checkbox__label">
                          {name_de}
                          <i className="checkbox__points">
                            {`${points} Punkte`}
                          </i>
                        </label>
                      </div>
                    ))}
                  </>
                )}
                {unit.options && unit.options.length > 0 && (
                  <>
                    <h2 className="add-unit-modal__subline">Optionen:</h2>
                    {unit.options.map(
                      ({ name_de, points, perModel, id, active }) => (
                        <div className="checkbox" key={id}>
                          <input
                            type="checkbox"
                            id={id}
                            name={id}
                            value={id}
                            onChange={() => handleOptionsChange(id)}
                            defaultChecked={active}
                            className="checkbox__input"
                          />
                          <label htmlFor={id} className="checkbox__label">
                            {name_de}
                            <i className="checkbox__points">
                              {`${points} ${points === 1 ? "Punkt" : "Punkte"}`}
                              {perModel && ` pro Modell`}
                            </i>
                          </label>
                        </div>
                      )
                    )}
                  </>
                )}
                <Button spaceBottom icon="check">
                  Fertig
                </Button>
              </form>
              <Button
                type="secondary"
                spaceBottom
                onClick={() => handleRemove(unit.id)}
                icon="remove"
              >
                Entfernen
              </Button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};

AddUnitModal.propTypes = {
  onClose: PropTypes.func,
  unitData: PropTypes.object,
};
