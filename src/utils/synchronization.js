import { getOwbFile } from "../utils/file";

import { updateLogin } from "../state/login";
import { setLists } from "../state/lists";
import { setSettings, updateSetting } from "../state/settings";

export const syncLists = ({ dispatch, settings }) => {
  const accessToken = localStorage.getItem("owb.token");
  const dbx = new Dropbox.Dropbox({ accessToken });
  const uploadOwbFile = (owbObject) => {
    return new Promise((resolve, reject) => {
      const { file } = getOwbFile(owbObject);

      dbx
        .filesUpload({
          path: "/owb.json",
          contents: file,
          mode: { ".tag": "overwrite" },
        })
        .then(() => resolve())
        .catch((err) => reject(err));
    });
  };

  console.log("SYNC LISTS");

  dispatch(updateLogin({ isSyncing: true }));

  dbx
    .filesListFolder({ path: "" })
    .then(function (response) {
      const entries = response?.result?.entries;
      const localLists = JSON.parse(localStorage.getItem("owb.lists")) || [];

      if (response) {
        const owbFiles = entries.filter(({ name }) => name === "owb.json");

        // Upload new file if none exist remotely
        if (owbFiles.length === 0) {
          console.log("no owb file found");
          const lastChanged = new Date().getTime();

          uploadOwbFile({
            lastChanged,
            lists: localLists,
            settings,
          })
            .then(() => {
              dispatch(updateLogin({ isSyncing: false }));
            })
            .catch((error) => {
              dispatch(updateLogin({ isSyncing: false }));
              console.log(error);
            });
          dispatch(updateSetting({ lastChanged }));
          localStorage.setItem(
            "owb.settings",
            JSON.stringify({
              ...settings,
              lastChanged,
            }),
          );
        }

        // Download existing file
        else {
          console.log("owb file found", settings.lastChanged);
          const owbFile = owbFiles[0];

          dbx
            .filesDownload({ path: owbFile.path_display })
            .then(function (response) {
              const reader = new FileReader();

              reader.readAsText(response.result.fileBlob, "UTF-8");
              reader.onload = (event) => {
                const downloadedOwbFile = JSON.parse(event.target.result);

                console.log("file downloaded");
                console.log(downloadedOwbFile);

                // First time sync
                if (!settings.lastChanged) {
                  console.log(
                    "first time sync with remote owb file - ask user?",
                  );
                }

                // New local changes
                else if (downloadedOwbFile.lastChanged < settings.lastChanged) {
                  console.log("uploading owb file with local changes");

                  uploadOwbFile({
                    lastChanged: settings.lastChanged,
                    lists: localLists,
                    settings,
                  });
                }

                // Remote changes
                else if (downloadedOwbFile.lastChanged > settings.lastChanged) {
                  console.log("updating local from remote owb file");

                  // Update local lists
                  dispatch(setLists(downloadedOwbFile.lists));
                  dispatch(setSettings(downloadedOwbFile.settings));
                  localStorage.setItem(
                    "owb.lists",
                    JSON.stringify(downloadedOwbFile.lists),
                  );
                  localStorage.setItem(
                    "owb.settings",
                    JSON.stringify(downloadedOwbFile.settings),
                  );
                }

                // In sync
                else {
                  console.log("local and remote owb file are in sync");
                }
              };
            })
            .catch(function (error) {
              console.log(error);
            });
        }
      }
    })
    .catch(function (error) {
      console.log(error);

      dispatch(
        updateLogin({ isSyncing: false, loggedIn: false, loginLoading: false }),
      );
      localStorage.setItem("owb.token", "");
    });
};
