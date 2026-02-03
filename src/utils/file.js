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

export const getOwbFile = (owbObject) => {
  const fileName = "owb.json";
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
