/**
 * Thin adapter that maps provider name to sync operations.
 * Eliminates if/else provider branching in UI components.
 */

import {
  syncLists as dropboxSyncLists,
  uploadLocalDataToDropbox,
  downloadRemoteDataFromDropbox,
} from "./dropbox-auth-and-synchronization";
import {
  owrSyncLists,
  uploadLocalDataToOWR,
  downloadRemoteDataFromOWR,
} from "./owr-sync";

const providers = {
  owr: {
    syncLists: owrSyncLists,
    uploadLocal: uploadLocalDataToOWR,
    downloadRemote: downloadRemoteDataFromOWR,
  },
  dropbox: {
    syncLists: dropboxSyncLists,
    uploadLocal: uploadLocalDataToDropbox,
    downloadRemote: downloadRemoteDataFromDropbox,
  },
};

export const getSyncProvider = (provider) =>
  providers[provider] || providers.dropbox;
