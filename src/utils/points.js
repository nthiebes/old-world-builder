export const getUnitPoints = (unit) => {
  const detachmentActive =
    unit?.options?.length > 0 &&
    Boolean(
      unit.options.find(
        (option) => option.name_en === "Detachment" && option.active
      )
    );
  let unitPoints = 0;

  if (unit.strength) {
    unitPoints = unit.strength * unit.points;
  } else {
    unitPoints = unit.points;
  }
  if (unit.options) {
    unit.options.forEach((option) => {
      if (option.stackable) {
        unitPoints +=
          (option.stackableCount || option.minimum || 0) * option.points;
      } else if (option.active && option.perModel) {
        unitPoints += (unit.strength || 1) * option.points;
      } else if (option.active && option.options && option.options.length > 0) {
        unitPoints += option.points;
        option.options.forEach((subOption) => {
          if (subOption.active) {
            unitPoints += subOption.points;
          }
        });
      } else if (option.active) {
        unitPoints += option.points;
      }
    });
  }
  if (unit.equipment) {
    unit.equipment.forEach((option) => {
      if (option.active && option.perModel) {
        unitPoints += (unit.strength || 1) * option.points;
      } else if (option.active) {
        unitPoints += option.points;
      }
    });
  }
  if (unit.armor) {
    unit.armor.forEach((option) => {
      if (option.active && option.perModel) {
        unitPoints += (unit.strength || 1) * option.points;
      } else if (option.active) {
        unitPoints += option.points;
      }
    });
  }
  if (unit.command && !detachmentActive) {
    unit.command.forEach((option) => {
      if (option.active) {
        unitPoints += option.points;
      }
      if (option.active && option.magic && option.magic?.selected?.length) {
        option.magic.selected.forEach((selected) => {
          unitPoints += selected.amount
            ? selected.amount * selected.points
            : selected.points;
        });
      }
      if (option.active && option.options && option.options.length > 0) {
        option.options.forEach((commandOption) => {
          if (commandOption.active) {
            unitPoints += commandOption.points;
          }
        });
      }
    });
  }
  if (unit.mounts) {
    unit.mounts.forEach((option) => {
      if (option.active) {
        unitPoints += option.points;
      }
      if (option.active && option.options && option.options.length > 0) {
        option.options.forEach((mountOption) => {
          if (mountOption.active) {
            unitPoints += mountOption.points;
          }
        });
      }
    });
  }
  if (unit?.items && unit?.items.length) {
    unit.items.forEach((item) => {
      (item.selected || []).forEach((selected) => {
        unitPoints += selected.amount
          ? selected.amount * selected.points
          : selected.points;
      });
    });
  }
  if (unit.detachments) {
    unit.detachments.forEach(
      ({ strength, points, equipment, armor, options }) => {
        unitPoints += strength * points;

        if (equipment && equipment.length) {
          equipment.forEach((option) => {
            if (option.active) {
              unitPoints += strength * option.points;
            }
          });
        }
        if (armor && armor.length) {
          armor.forEach((option) => {
            if (option.active) {
              unitPoints += strength * option.points;
            }
          });
        }
        if (options && options.length) {
          options.forEach((option) => {
            if (option.active) {
              unitPoints += strength * option.points;
            }
          });
        }
      }
    );
  }

  return unitPoints;
};

export const getUnitMagicPoints = ({ selected }) => {
  let unitPoints = 0;

  selected &&
    selected.forEach((option) => {
      unitPoints += option.amount
        ? option.amount * option.points
        : option.points;
    });

  return unitPoints;
};

export const getUnitCommandPoints = (items) => {
  let commandPoints = 0;

  if (items) {
    items.forEach((option) => {
      commandPoints += option.points;
    });
  }

  return commandPoints;
};

export const getPoints = ({ type, list }) => {
  let points = 0;

  list[type] &&
    list[type].forEach((unit) => {
      points += getUnitPoints(unit);
    });

  return points;
};

export const getAllPoints = (list) => {
  const lordsPoints = getPoints({ list, type: "lords" });
  const heroesPoints = getPoints({ list, type: "heroes" });
  const corePoints = getPoints({ list, type: "core" });
  const specialPoints = getPoints({ list, type: "special" });
  const rarePoints = getPoints({ list, type: "rare" });
  const charactersPoints = getPoints({ list, type: "characters" });
  const mercenariesPoints = getPoints({ list, type: "mercenaries" });
  const alliesPoints = getPoints({ list, type: "allies" });

  return (
    lordsPoints +
    heroesPoints +
    corePoints +
    specialPoints +
    rarePoints +
    charactersPoints +
    mercenariesPoints +
    alliesPoints
  );
};
