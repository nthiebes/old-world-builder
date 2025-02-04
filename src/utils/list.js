import { addLists } from "../state/lists";

export const updateLocalList = (updatedList) => {
  const localLists = JSON.parse(localStorage.getItem("owb.lists"));
  const updatedLists =
    localLists &&
    localLists.map((list) => {
      if (list.id === updatedList.id) {
        return updatedList;
      } else {
        return list;
      }
    });

  try {
    localLists &&
      localStorage.setItem("owb.lists", JSON.stringify(updatedLists));
  } catch (error) {}
};

export const removeFromLocalList = (listId) => {
  const localLists = JSON.parse(localStorage.getItem("owb.lists"));
  const updatedLists = localLists.filter(({ id }) => listId !== id);

  localStorage.setItem("owb.lists", JSON.stringify(updatedLists));
};

export const loadDropboxLists = ({ entries, dbx, lists, dispatch }) => {
  console.log("loadDropboxLists");
  if (entries) {
    let newLists = lists;
    const owbFiles = entries.filter(({ name }) => name.includes(".owb.json"));

    owbFiles.forEach((entry) => {
      console.log("entry");

      dbx
        .filesDownload({ path: entry.path_display })
        .then(function (response) {
          // console.log(response.result.fileBlob);

          const reader = new FileReader();

          reader.readAsText(response.result.fileBlob, "UTF-8");
          reader.onload = (event) => {
            const importedList = JSON.parse(event.target.result);

            // console.log(importedList);
            newLists = [...newLists, importedList];

            // All lists loaded
            if (newLists.length === owbFiles.length + lists.length) {
              console.log("newLists", newLists);
              // dispatch(addLists(newLists));
            }

            // localStorage.setItem("owb.lists", JSON.stringify(newLists));
            // setRedirect(importedList.id);
          };
        })
        .catch(function (error) {
          console.error(error.error || error);
        });

      // const reader = new FileReader();

      // reader.readAsText(entry, "UTF-8");
      // reader.onload = (event) => {
      //   const importedList = JSON.parse(event.target.result);

      //   console.log(importedList);
      // const newLists = [...lists, importedList];

      // localStorage.setItem("owb.lists", JSON.stringify(newLists));
      // dispatch(setLists(newLists));
      // setRedirect(importedList.id);
      // };
    });
  }
};
