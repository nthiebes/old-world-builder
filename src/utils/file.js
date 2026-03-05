export const getFile = ({ list, listText, asText, isLists }) => {
  const fileName = `${list?.name
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/,/g, "")}.${
    asText ? "txt" : isLists ? `owb.lists.json` : "owb.json"
  }`;
  const file = new File([asText ? listText : JSON.stringify(list)], fileName, {
    type: asText ? "text/plain" : "application/json",
  });
  const fileUrl = URL.createObjectURL(file);

  return {
    file,
    fileUrl,
    fileName,
  };
};

export const getSyncFile = (lastChanged) => {
  const fileName = "owb-sync.txt";
  const file = new File([lastChanged.toString()], fileName, {
    type: "text/plain",
  });
  const fileUrl = URL.createObjectURL(file);

  return {
    file,
    fileUrl,
    fileName,
  };
};

export const getDataFile = (owbObject) => {
  const fileName = "owb-data.json";
  const file = new File([JSON.stringify(owbObject)], fileName, {
    type: "application/json",
  });
  const fileUrl = URL.createObjectURL(file);

  return {
    file,
    fileUrl,
    fileName,
  };
};
