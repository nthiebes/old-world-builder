import classNames from "classnames";
import { useState, useEffect } from "react";

import { Button } from "../../../components/button";
import { Icon } from "../../../components/icon";

import "./AddUnitModal.css";

export const AddUnitModal = ({ unitData, onCancel }) => {
  const [animate, setAnimate] = useState(false);

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
          {unitData.map(({ name_de, id }) => (
            <li key={id}>{name_de}</li>
          ))}
        </ul>
      </div>
    </aside>
  );
};
