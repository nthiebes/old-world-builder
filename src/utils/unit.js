export const getAllOptions = (
  { mounts, equipment, options, command, magic },
  { asString, noMagic } = {}
) => {
  const language = localStorage.getItem("lang");
  const allCommand = command
    ? command
        .filter(({ active }) => active)
        .map(({ name_de, name_en }) => (language === "de" ? name_de : name_en))
    : [];
  const allEquipment = equipment
    ? equipment
        .filter(({ active }) => active)
        .map(({ name_de, name_en }) => (language === "de" ? name_de : name_en))
    : [];
  const allOptions = options
    ? options
        .filter(({ active }) => active)
        .map(({ name_de, name_en }) => (language === "de" ? name_de : name_en))
    : [];
  const allStackableOptions = options
    ? options
        .filter(({ stackableCount }) => stackableCount > 0)
        .map(
          ({ name_de, name_en, stackableCount }) =>
            `${stackableCount} ${language === "de" ? name_de : name_en}`
        )
    : [];
  const allMounts = mounts
    ? mounts
        .filter(({ active }) => active)
        .map(({ name_de, name_en }) => (language === "de" ? name_de : name_en))
    : [];
  const allMagicItems = magic?.items
    ? magic.items.map(({ name_de, name_en }) =>
        language === "de" ? name_de : name_en
      )
    : [];
  const allOptionsArray = [
    ...allEquipment,
    ...allOptions,
    ...allStackableOptions,
    ...allCommand,
    ...allMounts,
    ...(!noMagic ? allMagicItems : []),
  ];
  const allOptionsString = allOptionsArray.join(", ");

  if (allOptionsString) {
    if (asString) {
      return allOptionsString;
    }
    return <p>{allOptionsString}</p>;
  }
  return null;
};
