export const getAllOptions = ({
  mounts,
  equipment,
  options,
  command,
  magic,
}) => {
  const allMounts = mounts
    ? mounts.filter(({ active }) => active).map(({ name_de }) => name_de)
    : [];
  const allEquipment = equipment
    ? equipment.filter(({ active }) => active).map(({ name_de }) => name_de)
    : [];
  const allOptions = options
    ? options.filter(({ active }) => active).map(({ name_de }) => name_de)
    : [];
  const allCommand = command
    ? command.filter(({ active }) => active).map(({ name_de }) => name_de)
    : [];
  const allMagicItems = magic?.items
    ? magic.items.map(({ name_de }) => name_de)
    : [];
  const allOptionsArray = [
    ...allCommand,
    ...allEquipment,
    ...allMounts,
    ...allOptions,
    ...allMagicItems,
  ];
  const allOptionsString = allOptionsArray.join(", ");

  if (allOptionsString) {
    return <p>{allOptionsString}</p>;
  }
  return null;
};
