import { useState, useEffect, Fragment } from "react";
import { useParams, useLocation, Redirect } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";

import { fetcher } from "../../utils/fetcher";
import { getUnitPoints } from "../../utils/points";
import { List } from "../../components/list";
import { NumberInput } from "../../components/number-input";
import { Header, Main } from "../../components/page";
import {
  addUnit,
  editUnit,
  removeUnit,
  duplicateUnit,
} from "../../state/lists";
import { setArmy } from "../../state/army";

import "./Unit.css";

const updateIds = (type) => {
  return type.map((unit) => {
    return {
      ...unit,
      command: unit.command
        ? unit.command.map((commandData, index) => ({
            ...commandData,
            id: index,
          }))
        : null,
      equipment: unit.equipment
        ? unit.equipment.map((equipmentData, index) => ({
            ...equipmentData,
            id: index,
          }))
        : null,
      mounts: unit.mounts
        ? unit.mounts.map((mountsData, index) => ({
            ...mountsData,
            id: index,
          }))
        : null,
      options: unit.options
        ? unit.options.map((optionsData, index) => ({
            ...optionsData,
            id: index,
          }))
        : null,
    };
  });
};

export const Unit = ({ isMobile }) => {
  const MainComponent = isMobile ? Main : Fragment;
  const { listId, type, unitId } = useParams();
  const dispatch = useDispatch();
  const [redirect, setRedirect] = useState(null);
  const location = useLocation();
  const list = useSelector((state) =>
    state.lists.find(({ id }) => listId === id)
  );
  const army = useSelector((state) => state.army);
  const units = list ? list[type] : null;
  const unit = units && units.find(({ id }) => id === unitId);
  let magicPoints = 0;
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

  unit?.magic?.items &&
    unit?.magic?.items.forEach((option) => {
      magicPoints += option.points;
    });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    list &&
      !unit &&
      fetcher({
        url: `games/${list.game}/${list.army}`,
        onSuccess: (data) => {
          dispatch(
            setArmy({
              lords: updateIds(data.lords),
              heroes: updateIds(data.heroes),
              core: updateIds(data.core),
              special: updateIds(data.special),
              rare: updateIds(data.rare),
            })
          );
        },
      });
  }, [list, unit, dispatch]);

  if (redirect) {
    return <Redirect to={`/editor/${listId}`} />;
  }

  if (!unit && !army) {
    return <Main loading />;
  }

  if (unit) {
    return (
      <>
        {isMobile && (
          <Header
            to={`/editor/${listId}`}
            moreButton={[
              {
                name_de: "Duplizieren",
                icon: "duplicate",
                callback: () => handleDuplicate(unit.id),
              },
              {
                name_de: "Entfernen",
                icon: "delete",
                callback: () => handleRemove(unit.id),
              },
            ]}
            headline={unit.name_de}
            subheadline={`${getUnitPoints(unit)} Pkte.`}
          />
        )}

        <MainComponent>
          {!isMobile && (
            <Header
              isSection
              to={`/editor/${listId}`}
              headline={unit.name_de}
              subheadline={`${getUnitPoints(unit)} Pkte.`}
              moreButton={[
                {
                  name_de: "Duplizieren",
                  icon: "duplicate",
                  callback: () => handleDuplicate(unit.id),
                },
                {
                  name_de: "Entfernen",
                  icon: "delete",
                  callback: () => handleRemove(unit.id),
                },
              ]}
            />
          )}
          {!unit.minimum &&
            !unit.command &&
            !unit.equipment &&
            !unit.mounts &&
            !unit.options && (
              <i className="unit__empty">Keine Optionen verfügbar.</i>
            )}
          {unit.minimum && (
            <>
              <label htmlFor="strength" className="unit__strength">
                Einheitengröße:
              </label>
              <NumberInput
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
                    id={`command-${id}`}
                    value={id}
                    onChange={() => handleCommandChange(id)}
                    defaultChecked={active}
                    className="checkbox__input"
                  />
                  <label htmlFor={`command-${id}`} className="checkbox__label">
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
                      id={`equipment-${id}`}
                      name="equipment"
                      value={id}
                      onChange={() => handleEquipmentChange(id)}
                      defaultChecked={active}
                      className="radio__input"
                    />
                    <label htmlFor={`equipment-${id}`} className="radio__label">
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
                    id={`mounts-${id}`}
                    value={id}
                    onChange={() => handleMountsChange(id)}
                    defaultChecked={active}
                    className="checkbox__input"
                  />
                  <label htmlFor={`mounts-${id}`} className="checkbox__label">
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
                    id={`options-${id}`}
                    value={id}
                    onChange={() => handleOptionsChange(id)}
                    defaultChecked={active}
                    className="checkbox__input"
                  />
                  <label htmlFor={`options-${id}`} className="checkbox__label">
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
          {unit?.magic && (
            <List
              to={`/editor/${listId}/${type}/${unitId}/magic`}
              className="editor__list unit__link"
              active={location.pathname.includes(unit.id)}
            >
              <div className="editor__list-inner">
                <b>{"Magische Gegenstände"}</b>
                <i className="checkbox__points">{`${magicPoints} Pkte.`}</i>
              </div>
              {unit.magic.items && (
                <p>
                  {unit.magic.items.map(({ name_de }) => name_de).join(", ")}
                </p>
              )}
            </List>
          )}
        </MainComponent>
      </>
    );
  }

  return (
    <>
      {isMobile && (
        <Header to={`/editor/${listId}`} headline="Einheit auswählen" />
      )}

      <MainComponent>
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
      </MainComponent>
    </>
  );
};
