export const getUnitPoints = (unit) => {
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
        unitPoints += unit.strength * option.points;
      } else if (option.active) {
        unitPoints += option.points;
      }
    });
  }
  if (unit.equipment) {
    unit.equipment.forEach((option) => {
      if (option.active && option.perModel) {
        unitPoints += unit.strength * option.points;
      } else if (option.active) {
        unitPoints += option.points;
      }
    });
  }
  if (unit.command) {
    unit.command.forEach((option) => {
      if (option.active) {
        unitPoints += option.points;
      }
    });
  }
  if (unit.mounts) {
    unit.mounts.forEach((option) => {
      if (option.active) {
        unitPoints += option.points;
      }
    });
  }
  if (unit?.magic?.items) {
    unit.magic.items.forEach((option) => {
      unitPoints += option.points;
    });
  }
  if (unit.detachments) {
    unit.detachments.forEach((detachment) => {
      unitPoints += detachment.strength * detachment.points;
    });
  }

  return unitPoints;
};

export const getUnitMagicPoints = ({ unit, command }) => {
  const commandIndex = Number(command);
  let unitPoints = 0;

  if (unit?.magic?.items) {
    if (commandIndex >= 0) {
      unit.magic.items.forEach((option) => {
        if (option.command === commandIndex) {
          unitPoints += option.points;
        }
      });
    } else {
      unit.magic.items.forEach((option) => {
        unitPoints += option.points;
      });
    }
  }

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
