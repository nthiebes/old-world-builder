export const getUnitPoints = (unit) => {
  let unitPoints = 0;

  if (unit.strength) {
    unitPoints = unit.strength * unit.points;
  } else {
    unitPoints = unit.points;
  }
  if (unit.options) {
    unit.options.forEach((option) => {
      if (option.active && option.perModel) {
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

  return unitPoints;
};
