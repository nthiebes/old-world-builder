export const useTimezone = () => {
  return { timezone: localStorage.getItem("timezone") };
};
