import theOldWorld from "../assets/the-old-world.json";
import WarhammerFantasy6th from "../assets/warhammer-fantasy-6th.json";
import WarhammerFantasyMdn from "../assets/warhammer-fantasy-mdn.json";

export const OFFICIAL_GAME_SYSTEMS = ["the-old-world", "warhammer-fantasy-6th", "warhammer-fantasy-mdn"];

export const isOfficialSystem = (gameId) => {
  return OFFICIAL_GAME_SYSTEMS.includes(gameId);
};

export const getGameSystems = () => {
  const customSystems = JSON.parse(localStorage.getItem("whfb.systems")) || [];
  const allGameSystems = [theOldWorld, WarhammerFantasy6th, WarhammerFantasyMdn, ...customSystems];

  return allGameSystems;
};

export const getCustomDatasetData = (army) => {
  const localDatasets = JSON.parse(localStorage.getItem("whfb.datasets")) || [];
  const dataset = localDatasets.find((dataset) => dataset.id === army);
  const data = dataset?.data;

  return data;
};
