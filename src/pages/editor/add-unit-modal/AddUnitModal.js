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
  const handleSubmit = (event) => {
    event.preventDefault();

    dispatch(editUnit({ listId, type, strength, unit }));
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
          <h2>{units ? "Einheit auswählen" : unit.name_de}</h2>
          <Button
            onClick={onClose}
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
                    <label htmlFor="points">Einheitengröße:</label>
                    <input
                      type="number"
                      id="size"
                      className="input"
                      min={unit.minimum}
                      value={strength}
                      onChange={handleStrengthChange}
                      required
                    />
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
