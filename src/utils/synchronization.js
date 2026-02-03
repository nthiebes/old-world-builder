import { getSyncFile, getDataFile } from "../utils/file";

import { updateLogin } from "../state/login";
import { setLists } from "../state/lists";
import { setSettings, updateSetting } from "../state/settings";

export const syncLists = ({ dispatch, settings }) => {
  const accessToken = localStorage.getItem("owb.token");
  const dbx = new Dropbox.Dropbox({ accessToken });
  const uploadSyncFile = (sync) => {
    return new Promise((resolve, reject) => {
      const { file } = getSyncFile(sync);

      dbx
        .filesUpload({
          path: "/owb-sync.txt",
          contents: file,
          mode: { ".tag": "overwrite" },
        })
        .then(() => resolve())
        .catch((err) => reject(err));
    });
  };
  const uploadDataFile = (data) => {
    return new Promise((resolve, reject) => {
      const { file } = getDataFile(data);

      dbx
        .filesUpload({
          path: "/owb-data.json",
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
        const syncFiles = entries.filter(({ name }) => name === "owb-sync.txt");
        const dataFiles = entries.filter(
          ({ name }) => name === "owb-data.json",
        );

        // Upload new files if none exist remotely
        if (syncFiles.length === 0) {
          console.log("no sync file found");
          const lastChanged = new Date().toString();

          uploadSyncFile(lastChanged)
            .then(() => {
              dispatch(updateLogin({ isSyncing: false }));
            })
            .catch((error) => {
              dispatch(updateLogin({ isSyncing: false }));
              console.log(error);
            });
          uploadDataFile({
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
          dispatch(updateSetting({ lastChanged, lastSynced: lastChanged }));
          localStorage.setItem(
            "owb.settings",
            JSON.stringify({
              ...settings,
              lastChanged,
              lastSynced: lastChanged,
            }),
          );
        }

        // Download existing file
        else {
          console.log("sync file found");
          const syncFile = syncFiles[0];
          const dataFile = dataFiles[0];

          dbx
            .filesDownload({ path: syncFile.path_display })
            .then(function (response) {
              const reader = new FileReader();

              reader.readAsText(response.result.fileBlob, "UTF-8");
              reader.onload = (event) => {
                const downloadedSyncFile = event.target.result;
                const remoteLastChanged = new Date(
                  downloadedSyncFile,
                ).getTime();
                const localLastChanged = new Date(
                  settings.lastChanged,
                ).getTime();

                console.log("file downloaded");

                // First time sync
                // if (!settings.lastSynced && localLists.length > 0) {
                //   console.log(
                //     "first time sync with remote sync file - ask user?",
                //   );
                // }

                // New local changes
                if (remoteLastChanged < localLastChanged) {
                  console.log("uploading files with local changes");

                  uploadSyncFile(settings.lastChanged)
                    .then(() => {
                      dispatch(updateLogin({ isSyncing: false }));
                    })
                    .catch((error) => {
                      dispatch(updateLogin({ isSyncing: false }));
                      console.log(error);
                    });
                  uploadDataFile({
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
                }

                // Remote changes
                else if (remoteLastChanged > localLastChanged) {
                  console.log("downloading remote data file");

                  dbx
                    .filesDownload({ path: dataFile.path_display })
                    .then(function (response) {
                      const reader = new FileReader();

                      reader.readAsText(response.result.fileBlob, "UTF-8");
                      reader.onload = (event) => {
                        const downloadedDataFile = JSON.parse(
                          event.target.result,
                        );

                        console.log("updating local data with remote file");

                        // Update local lists
                        dispatch(setLists(downloadedDataFile.lists));
                        dispatch(setSettings(downloadedDataFile.settings));
                        dispatch(updateLogin({ isSyncing: false }));
                        localStorage.setItem(
                          "owb.lists",
                          JSON.stringify(downloadedDataFile.lists),
                        );
                        localStorage.setItem(
                          "owb.settings",
                          JSON.stringify(downloadedDataFile.settings),
                        );
                      };
                    })
                    .catch(function (error) {
                      console.log(error);
                      dispatch(updateLogin({ isSyncing: false }));
                    });
                }

                // In sync
                else {
                  console.log("local and remote file are in sync");
                  dispatch(updateLogin({ isSyncing: false }));
                }
              };
            })
            .catch(function (error) {
              console.log(error);
              dispatch(updateLogin({ isSyncing: false }));
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
