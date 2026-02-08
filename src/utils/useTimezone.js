export const useTimezone = () => {
  return { timezone: localStorage.getItem("whfb.timezone") };
};
