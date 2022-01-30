const rules = {
  lords: { maxPercent: 25 },
  heroes: { maxPercent: 25 },
  core: { minPercent: 25 },
  special: {
    maxPercent: 50,
    maxSame: 3,
    maxSameLarge: 6,
  },
  rare: {
    maxPercent: 25,
    maxSame: 2,
    maxSameLarge: 4,
  },
};

export const getMaxPercentData = ({ type, armyPoints, points }) => {
  const maxPercent = rules[type].maxPercent;
  const maxPoints = (armyPoints / 100) * maxPercent;

  return {
    points: maxPoints,
    overLimit: points > maxPoints,
    diff: points > maxPoints ? points - maxPoints : 0,
  };
};

export const getMinPercentData = ({ type, armyPoints, points }) => {
  const minPercent = rules[type].minPercent;
  const minPoints = (armyPoints / 100) * minPercent;

  return {
    points: minPoints,
    overLimit: points <= minPoints,
    diff: points <= minPoints ? minPoints - points : 0,
  };
};
