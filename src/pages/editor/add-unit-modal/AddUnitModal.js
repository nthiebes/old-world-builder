import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import { Button } from "../../../components/button";
import { Icon } from "../../../components/icon";
import { List } from "../../../components/list";

import "./AddUnitModal.css";

export const AddUnitModal = ({ unitData, onCancel, onAdd }) => {
  const [animate, setAnimate] = useState(false);
  const { units, type } = unitData;

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
          <h2>Einheit auswählen</h2>
          <Button onClick={onCancel}>
            <Icon symbol="close" />
          </Button>
        </div>
        <ul>
          {units.map(({ name_de, id }) => (
            <List key={id} onClick={() => onAdd(id, type)}>
              {name_de}
            </List>
          ))}
        </ul>
      </div>
    </aside>
  );
};

AddUnitModal.propTypes = {
  onCancel: PropTypes.func,
  unitData: PropTypes.object,
};
