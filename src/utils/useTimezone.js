export const useTimezone = () => {
  return { timezone: localStorage.getItem("owb.timezone") };
};
