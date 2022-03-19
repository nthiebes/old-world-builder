export const getAllOptions = (
  { mounts, equipment, options, command, magic },
  asString
) => {
  const allCommand = command
    ? command.filter(({ active }) => active).map(({ name_de }) => name_de)
    : [];
  const allEquipment = equipment
    ? equipment.filter(({ active }) => active).map(({ name_de }) => name_de)
    : [];
  const allOptions = options
    ? options.filter(({ active }) => active).map(({ name_de }) => name_de)
    : [];
  const allStackableOptions = options
    ? options
        .filter(({ stackableCount }) => stackableCount > 0)
        .map(({ name_de, stackableCount }) => `${stackableCount} ${name_de}`)
    : [];
  const allMounts = mounts
    ? mounts.filter(({ active }) => active).map(({ name_de }) => name_de)
    : [];
  const allMagicItems = magic?.items
    ? magic.items.map(({ name_de }) => name_de)
    : [];
  const allOptionsArray = [
    ...allEquipment,
    ...allOptions,
    ...allStackableOptions,
    ...allCommand,
    ...allMounts,
    ...allMagicItems,
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
