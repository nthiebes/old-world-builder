import { useState, useEffect } from "react";
import { useParams, Redirect } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";

import { fetcher } from "../../utils/fetcher";
import { getUnitPoints } from "../../utils/points";
import { List } from "../../components/list";
import { Header, Main } from "../../components/page";
import {
  addUnit,
  editUnit,
  removeUnit,
  duplicateUnit,
} from "../../state/lists";
import { setArmy } from "../../state/army";

import "./Unit.css";

export const Unit = () => {
  const { listId, type, unitId } = useParams();
  const dispatch = useDispatch();
  const [redirect, setRedirect] = useState(null);
  const list = useSelector((state) =>
    state.lists.find(({ id }) => listId === id)
  );
  const army = useSelector((state) => state.army);
  const units = list ? list[type] : null;
  const unit = units && units.find(({ id }) => id === unitId);
  const handleAdd = (unitId) => {
    const unit = army[type].find(({ id }) => unitId === id);

    dispatch(addUnit({ listId, type, unit }));
    setRedirect(true);
  };
  const handleRemove = (unitId) => {
    dispatch(removeUnit({ listId, type, unitId }));
    setRedirect(true);
  };
  const handleDuplicate = (unitId) => {
    dispatch(duplicateUnit({ listId, type, unitId }));
    setRedirect(true);
  };
  const handleStrengthChange = (event) => {
    dispatch(
      editUnit({
        listId,
        type,
        unitId,
        strength: event.target.value,
      })
    );
  };
  const handleOptionsChange = (id) => {
    const options = unit.options.map((option) => {
      if (option.id === id) {
        return {
          ...option,
          active: option.active ? false : true,
        };
      }
      return option;
    });

    dispatch(
      editUnit({
        listId,
        type,
        unitId,
        options,
      })
    );
  };
  const handleCommandChange = (id) => {
    const command = unit.command.map((option) => {
      if (option.id === id) {
        return {
          ...option,
          active: option.active ? false : true,
        };
      }
      return option;
    });

    dispatch(
      editUnit({
        listId,
        type,
        unitId,
        command,
      })
    );
  };
  const handleEquipmentChange = (id) => {
    const equipment = unit.equipment.map((item) => ({
      ...item,
      active: item.id === id ? true : false,
    }));

    dispatch(
      editUnit({
        listId,
        type,
        unitId,
        equipment,
      })
    );
  };
  const handleMountsChange = (id) => {
    const mounts = unit.mounts.map((option) => {
      if (option.id === id) {
        return {
          ...option,
          active: option.active ? false : true,
        };
      }
      return option;
    });

    dispatch(
      editUnit({
        listId,
        type,
        unitId,
        mounts,
      })
    );
  };

  useEffect(() => {
    list &&
      !unit &&
      fetcher({
        url: `armies/${list.game}/${list.army}`,
        onSuccess: (data) => {
          dispatch(setArmy(data));
        },
      });
  }, [list, unit, dispatch]);

  if (redirect) {
    return <Redirect to={`/editor/${listId}`} />;
  }

  if (!unit && !army) {
    return (
      <>
        <Header to={`/editor/${listId}`} />
        <Main></Main>
      </>
    );
  }

  if (unit) {
    return (
      <>
        <Header
          to={`/editor/${listId}`}
          moreButton={[
            {
              name_de: "Entfernen",
              callback: () => handleRemove(unit.id),
            },
            {
              name_de: "Duplizieren",
              callback: () => handleDuplicate(unit.id),
            },
          ]}
          headline={unit.name_de}
          subheadline={`${getUnitPoints(unit)} Pkte.`}
        />

        <Main>
          {unit.minimum && (
            <>
              <label htmlFor="strength">Einheitengröße:</label>
              <input
                type="number"
                id="strength"
                className="input"
                min={unit.minimum}
                value={unit.strength}
                onChange={handleStrengthChange}
                required
              />
            </>
          )}
          {unit.command && unit.command.length > 0 && (
            <>
              <h2 className="unit__subline">Kommandoabteilung:</h2>
              {unit.command.map(({ name_de, points, perModel, id, active }) => (
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
                      {`${points} ${points === 1 ? "Pkt." : "Pkte."}`}
                      {perModel && ` pro Modell`}
                    </i>
                  </label>
                </div>
              ))}
            </>
          )}
          {unit.equipment && unit.equipment.length > 0 && (
            <>
              <h2 className="unit__subline">Ausrüstung:</h2>
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
                        {`${points} ${points === 1 ? "Pkt." : "Pkte."}`}
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
              <h2 className="unit__subline">Reittier:</h2>
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
                    <i className="checkbox__points">{`${points} Pkte.`}</i>
                  </label>
                </div>
              ))}
            </>
          )}
          {unit.options && unit.options.length > 0 && (
            <>
              <h2 className="unit__subline">Optionen:</h2>
              {unit.options.map(({ name_de, points, perModel, id, active }) => (
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
                      {`${points} ${points === 1 ? "Pkt." : "Pkte."}`}
                      {perModel && ` pro Modell`}
                    </i>
                  </label>
                </div>
              ))}
            </>
          )}
        </Main>
      </>
    );
  }

  return (
    <>
      <Header to={`/editor/${listId}`} headline="Einheit auswählen" />

      <Main>
        <ul>
          {army[type].map(({ name_de, id, minimum, points }) => (
            <List key={id} onClick={() => handleAdd(id)}>
              <span className="unit__name">
                {minimum && `${minimum} `}
                <b>{name_de}</b>
              </span>
              <i className="unit__points">{`${
                minimum ? points * minimum : points
              } Pkte.`}</i>
            </List>
          ))}
        </ul>
      </Main>
    </>
  );
};

Unit.propTypes = {
  onClose: PropTypes.func,
  unitData: PropTypes.object,
};
