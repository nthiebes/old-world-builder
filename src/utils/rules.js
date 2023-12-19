const rules = {
  lords: { maxPercent: 25 },
  heroes: { maxPercent: 25 },
  characters: { maxPercent: 50 },
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
  mercenaries: { maxPercent: 20 },
  allies: { maxPercent: 25 },
};

export const getMaxPercentData = ({ type, armyPoints, points }) => {
  const maxPercent = rules[type].maxPercent;
  const maxPoints = (armyPoints / 100) * maxPercent;

  return {
    points: Math.floor(maxPoints),
    overLimit: points > maxPoints,
    diff: points > maxPoints ? Math.ceil(points - maxPoints) : 0,
  };
};

export const getMinPercentData = ({ type, armyPoints, points }) => {
  const minPercent = rules[type].minPercent;
  const minPoints = (armyPoints / 100) * minPercent;

  return {
    points: Math.floor(minPoints),
    overLimit: points <= minPoints,
    diff: points <= minPoints ? Math.ceil(minPoints - points) : 0,
  };
};
