import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import { Button } from "../../../components/button";
import { Icon } from "../../../components/icon";
import { List } from "../../../components/list";

import "./AddUnitModal.css";

export const AddUnitModal = ({ unitData, onClose, onAdd, onEdit }) => {
  const { units, type, unit } = unitData;
  const [animate, setAnimate] = useState(false);
  const [strength, setStrength] = useState(
    unit ? unit.strength || unit.minimum : null
  );

  useEffect(() => {
    setAnimate(true);
  }, [unitData]);

  // console.log(unitData);

  const handleStrengthChange = (event) => {
    setStrength(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onEdit({ strength, type, id: unit.id });
    onClose();
  };

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
          <Button onClick={onClose} label="Schließen">
            <Icon symbol="close" />
          </Button>
        </div>
        <ul>
          {units &&
            units.map(({ name_de, id }) => (
              <List key={id} onClick={() => onAdd(id, type)}>
                {name_de}
              </List>
            ))}
        </ul>
        {unit && (
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
            <Button>Schließen</Button>
          </form>
        )}
      </div>
    </aside>
  );
};

AddUnitModal.propTypes = {
  onClose: PropTypes.func,
  unitData: PropTypes.object,
};
