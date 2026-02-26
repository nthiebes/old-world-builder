import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { updateLogin } from "../state/login";
import { setSettings, updateSetting } from "../state/settings";
import { setLists } from "../state/lists";
import { getSyncFile, getDataFile } from "./file";
import { parseQueryString } from "../utils/query-string";

const clientId = "7l38e9ahse786da";
const dbxAuth = new Dropbox.DropboxAuth({
  clientId,
});
let dbx = null;
const DATA_FILE_PATH = "/owb-data.json";
const SYNC_FILE_PATH = "/owb-sync.txt";
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

// Parses the url and gets the access token if it is in the urls hash
const getCodeFromUrl = () => {
  return parseQueryString(window.location.search).code;
};

// If the user was just redirected from authenticating, the urls hash will
// contain the access token.
const hasRedirectedFromAuth = () => {
  return !!getCodeFromUrl();
};

export const useDropboxAuthentication = () => {
  const accessToken = localStorage.getItem("owb.accessToken");
  const refreshToken = localStorage.getItem("owb.refreshToken");
  const dispatch = useDispatch();

  useEffect(() => {
    if (refreshToken && accessToken) {
      dbxAuth.setAccessToken(accessToken);
      dbxAuth.setRefreshToken(refreshToken);
      dbx = new Dropbox.Dropbox({
        auth: dbxAuth,
      });

      dispatch(updateLogin({ loggedIn: true, loginLoading: false }));
    } else if (hasRedirectedFromAuth()) {
      const code = getCodeFromUrl();

      dbxAuth.setCodeVerifier(window.sessionStorage.getItem("codeVerifier"));
      dbxAuth
        .getAccessTokenFromCode(
          process.env.NODE_ENV === "development"
            ? "http://localhost:3000/"
            : "https://old-world-builder.com/",
          code,
        )
        .then((response) => {
          dbxAuth.setAccessToken(response.result.access_token);
          dbxAuth.setRefreshToken(response.result.refresh_token);
          localStorage.setItem("owb.accessToken", response.result.access_token);
          localStorage.setItem(
            "owb.refreshToken",
            response.result.refresh_token,
          );
          dbx = new Dropbox.Dropbox({
            auth: dbxAuth,
          });

          dispatch(updateLogin({ loggedIn: true, loginLoading: false }));

          syncLists({
            dispatch,
          });
        })
        .catch((error) => console.error(error));
    } else {
      dispatch(updateLogin({ loginLoading: false }));
    }
  }, [accessToken, refreshToken, dispatch]);
};

export const login = () => {
  dbxAuth
    .getAuthenticationUrl(
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000/"
        : "https://old-world-builder.com/",
      null,
      "code",
      "offline",
      null,
      "none",
      true,
    )
    .then((authUrl) => {
      window.sessionStorage.clear();
      window.sessionStorage.setItem("codeVerifier", dbxAuth.codeVerifier);
      window.location.href = authUrl;
    })
    .catch((error) => console.error(error));
};

export const uploadLocalDataToDropbox = ({ dispatch, settings }) => {
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
};

export const downloadRemoteDataFromDropbox = ({ dispatch }) => {
  dbx
    .filesDownload({ path: DATA_FILE_PATH })
    .then(function (response) {
      const reader = new FileReader();

      reader.readAsText(response.result.fileBlob, "UTF-8");
      reader.onload = (event) => {
        const downloadedDataFile = JSON.parse(event.target.result);

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
  const settings = JSON.parse(localStorage.getItem("owb.settings")) || {};

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

                // First time sync or conflict
                if (
                  lastSynced < remoteLastChanged &&
                  localLastChanged > remoteLastChanged
                ) {
                  dispatch(
                    updateLogin({ syncConflict: true, isSyncing: false }),
                  );
                }

                // New local changes
                else if (remoteLastChanged < localLastChanged) {
                  uploadLocalDataToDropbox({ dispatch, settings });
                }

                // Remote changes
                else if (remoteLastChanged > localLastChanged) {
                  downloadRemoteDataFromDropbox({ dispatch, settings });
                }

                // In sync
                else {
                  dispatch(updateLogin({ isSyncing: false }));
                }

                dispatch(
                  updateSetting({
                    lastSynced: settings.lastChanged,
                  }),
                );
                localStorage.setItem(
                  "owb.settings",
                  JSON.stringify({
                    ...settings,
                    lastSynced: settings.lastChanged,
                  }),
                );
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
      console.log("error", error);

      dispatch(
        updateLogin({ isSyncing: false, loggedIn: false, loginLoading: false }),
      );
      window.location.href =
        process.env.NODE_ENV === "development"
          ? "http://localhost:3000/"
          : "https://old-world-builder.com/";
      localStorage.setItem("owb.accessToken", "");
      localStorage.setItem("owb.refreshToken", "");
    });
};
