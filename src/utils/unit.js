export const getAllOptions = (
  { mounts, equipment, armor, options, command, items, detachments },
  { asString, noMagic } = {}
) => {
  const language = localStorage.getItem("lang");
  const allCommand = [];

  if (command) {
    command.forEach(({ name_de, name_en, active, magic }) => {
      if (active) {
        allCommand.push(language === "de" ? name_de : name_en);
      }
      if (magic && magic?.selected?.length) {
        magic.selected.forEach((selectedItem) => {
          allCommand.push(
            selectedItem.amount > 1
              ? `${selectedItem.amount}x ` + selectedItem[`name_${language}`]
              : selectedItem[`name_${language}`]
          );
        });
      }
    });
  }
  const allEquipment = equipment
    ? equipment
        .filter(({ active }) => active)
        .map(({ name_de, name_en }) => (language === "de" ? name_de : name_en))
    : [];
  const allArmor = armor
    ? armor
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
  const allItems = [];
  if (items?.length) {
    items.forEach((item) => {
      (item.selected || []).forEach((selectedItem) => {
        allItems.push(
          selectedItem.amount > 1
            ? `${selectedItem.amount}x ` + selectedItem[`name_${language}`]
            : selectedItem[`name_${language}`]
        );
      });
    });
  }
  const allDetachments = detachments
    ? detachments
        .filter(({ strength }) => strength > 0)
        .map(
          ({ name_de, name_en, strength }) =>
            `${strength} ${language === "de" ? name_de : name_en}`
        )
    : [];
  const allOptionsArray = [
    ...allEquipment,
    ...allArmor,
    ...allOptions,
    ...allStackableOptions,
    ...allCommand,
    ...allMounts,
    ...(!noMagic ? allItems : []),
    ...allDetachments,
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
