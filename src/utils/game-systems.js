import theOldWorld from "../assets/the-old-world.json";

export const getGameSystems = () => {
  const customSystems = JSON.parse(localStorage.getItem("whfb.systems")) || [];
  const allGameSystems = [theOldWorld, ...customSystems];

  return allGameSystems;
};

export const getCustomDatasetData = (army) => {
  const localDatasets = JSON.parse(localStorage.getItem("whfb.datasets")) || [];
  const dataset = localDatasets.find((dataset) => dataset.id === army);
  const data = dataset?.data;

  return data;
};
