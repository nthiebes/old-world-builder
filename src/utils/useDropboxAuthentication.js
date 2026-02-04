import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { updateLogin } from "../state/login";
import { syncLists } from "../utils/synchronization";

const clientId = "7l38e9ahse786da";

const parseQueryString = (str) => {
  const ret = Object.create(null);

  if (typeof str !== "string") {
    return ret;
  }

  str = str.trim().replace(/^(\?|#|&)/, "");

  if (!str) {
    return ret;
  }

  str.split("&").forEach((param) => {
    const parts = param.replace(/\+/g, " ").split("=");
    // Firefox (pre 40) decodes `%3D` to `=`
    // https://github.com/sindresorhus/query-string/pull/37
    let key = parts.shift();
    let val = parts.length > 0 ? parts.join("=") : undefined;

    key = decodeURIComponent(key);

    // missing `=` should be `null`:
    // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
    val = val === undefined ? null : decodeURIComponent(val);

    if (ret[key] === undefined) {
      ret[key] = val;
    } else if (Array.isArray(ret[key])) {
      ret[key].push(val);
    } else {
      ret[key] = [ret[key], val];
    }
  });

  return ret;
};

// Parses the url and gets the access token if it is in the urls hash
const getAccessTokenFromUrl = () => {
  return parseQueryString(window.location.hash).access_token;
};

// If the user was just redirected from authenticating, the urls hash will
// contain the access token.
const isUserAuthenticated = () => {
  return !!getAccessTokenFromUrl();
};

export const useDropboxAuthentication = () => {
  const accessToken = localStorage.getItem("owb.token");
  const dispatch = useDispatch();

  useEffect(() => {
    if (accessToken) {
      console.log("local storage token found");

      dispatch(updateLogin({ loggedIn: true }));
    } else if (isUserAuthenticated()) {
      console.log("start loading with access token from url");

      dispatch(updateLogin({ loggedIn: true }));
      localStorage.setItem("owb.token", getAccessTokenFromUrl());
      window.location.hash = "";
      syncLists({
        dispatch,
      });
    } else {
      // Set the login anchors href using dbx.getAuthenticationUrl()
      const dbx = new Dropbox.Dropbox({ clientId: clientId });

      console.log("not logged in getting URL");

      dispatch(updateLogin({ loginLoading: true }));

      dbx.auth
        .getAuthenticationUrl(
          process.env.NODE_ENV === "development"
            ? "http://localhost:3000/"
            : "https://old-world-builder.com/",
        )
        .then((authUrl) => {
          dispatch(
            updateLogin({
              loginLoading: false,
              dpxAuthUrl: authUrl,
            }),
          );
        });
    }
  }, [accessToken, dispatch]);
};
