import { getSyncFile, getDataFile } from "../utils/file";

import { updateLogin } from "../state/login";
import { setLists } from "../state/lists";
import { setSettings, updateSetting } from "../state/settings";

const DATA_FILE_PATH = "/owb-data.json";
const SYNC_FILE_PATH = "/owb-sync.txt";
const uploadSyncFile = (sync) => {
  const accessToken = localStorage.getItem("owb.token");
  const dbx = new Dropbox.Dropbox({ accessToken });

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
  const accessToken = localStorage.getItem("owb.token");
  const dbx = new Dropbox.Dropbox({ accessToken });

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

export const uploadLocalDataToDropbox = ({ dispatch, settings }) => {
  console.log("uploading files with local changes");

  const localLists = JSON.parse(localStorage.getItem("owb.lists")) || [];

  uploadSyncFile(settings.lastChanged)
    .then(() => {
      dispatch(updateLogin({ isSyncing: false, syncConflict: false }));
    })
    .catch((error) => {
      dispatch(updateLogin({ isSyncing: false, syncConflict: false }));
      console.log(error);
    });
  uploadDataFile({
    lists: localLists,
    settings,
  })
    .then(() => {
      dispatch(updateLogin({ isSyncing: false, syncConflict: false }));
    })
    .catch((error) => {
      dispatch(updateLogin({ isSyncing: false, syncConflict: false }));
      console.log(error);
    });
  dispatch(updateSetting({ lastSynced: settings.lastChanged }));
  localStorage.setItem(
    "owb.settings",
    JSON.stringify({
      ...settings,
      lastSynced: settings.lastChanged,
    }),
  );
};

export const downloadRemoteDataFromDropbox = ({ dispatch }) => {
  console.log("downloading remote data file");
  const accessToken = localStorage.getItem("owb.token");
  const dbx = new Dropbox.Dropbox({ accessToken });

  dbx
    .filesDownload({ path: DATA_FILE_PATH })
    .then(function (response) {
      const reader = new FileReader();

      reader.readAsText(response.result.fileBlob, "UTF-8");
      reader.onload = (event) => {
        const downloadedDataFile = JSON.parse(event.target.result);

        console.log("updating local data with remote file");

        // Update local lists
        dispatch(setLists(downloadedDataFile.lists));
        dispatch(setSettings(downloadedDataFile.settings));
        dispatch(updateLogin({ isSyncing: false, syncConflict: false }));
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
      dispatch(updateLogin({ isSyncing: false, syncConflict: false }));
    });
};

export const syncLists = ({ dispatch }) => {
  const accessToken = localStorage.getItem("owb.token");
  const settings = JSON.parse(localStorage.getItem("owb.settings")) || {};
  const dbx = new Dropbox.Dropbox({ accessToken });

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
        if (syncFiles.length === 0 || dataFiles.length === 0) {
          console.log("no sync file found");
          const lastChanged = new Date().toString();
          const newSettings = {
            ...settings,
            lastChanged,
            lastSynced: lastChanged,
          };

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
            settings: newSettings,
          })
            .then(() => {
              dispatch(updateLogin({ isSyncing: false }));
            })
            .catch((error) => {
              dispatch(updateLogin({ isSyncing: false }));
              console.log(error);
            });
          dispatch(
            updateSetting({
              lastChanged: newSettings.lastChanged,
              lastSynced: newSettings.lastSynced,
            }),
          );
          localStorage.setItem("owb.settings", JSON.stringify(newSettings));
        }

        // Download existing file
        else {
          console.log("sync file found");

          dbx
            .filesDownload({ path: SYNC_FILE_PATH })
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
                const lastSynced = settings.lastSynced
                  ? new Date(settings.lastSynced).getTime()
                  : 0;

                console.log("file downloaded");

                // First time sync or conflict
                if (lastSynced < remoteLastChanged) {
                  console.log("last sync is older than remote changes");

                  dispatch(updateLogin({ syncConflict: true }));
                }

                // New local changes
                else if (remoteLastChanged < localLastChanged) {
                  uploadLocalDataToDropbox({ dispatch, settings });
                }

                // Remote changes
                else if (remoteLastChanged > localLastChanged) {
                  downloadRemoteDataFromDropbox({ dispatch });
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
