import { useState } from "react";
import { loadDropboxLists } from "./list";
import { useSelector, useDispatch } from "react-redux";

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

let dpxAuthUrl = "";

export const useDropboxAuthentication = () => {
  const accessToken = localStorage.getItem("owb.token");
  const lists = useSelector((state) => state.lists);
  // const { loginLoading } = useSelector((state) => state.settings);
  const dispatch = useDispatch();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  console.log("isLoginLoading", isLoginLoading);
  console.log("isLoggedIn", isLoggedIn);

  if (accessToken && !isLoggedIn && !isLoginLoading) {
    const dbx = new Dropbox.Dropbox({ accessToken });

    console.log("start loading with local access token");

    setIsLoginLoading(true);

    dbx
      .filesListFolder({ path: "" })
      .then(function (response) {
        loadDropboxLists({
          entries: response.result.entries,
          dbx,
          lists,
          dispatch,
        });
        setIsLoggedIn(true);
        setIsLoginLoading(false);
      })
      .catch(function (error) {
        console.log(error.error || error);
        setIsLoginLoading(false);
        setIsLoggedIn(false);
        localStorage.setItem("owb.token", "");
      });
  } else if (isUserAuthenticated() && !isLoggedIn && !isLoginLoading) {
    // Create an instance of Dropbox with the access token and use it to
    // fetch and render the files in the users root directory.
    const dbx = new Dropbox.Dropbox({ accessToken: getAccessTokenFromUrl() });

    console.log("start loading with access token from url");

    setIsLoginLoading(true);
    localStorage.setItem("owb.token", getAccessTokenFromUrl());
    window.location.hash = "";

    dbx
      .filesListFolder({ path: "" })
      .then(function (response) {
        if (response?.result?.entries) {
          loadDropboxLists({
            entries: response.result.entries,
            dbx,
            lists,
            dispatch,
          });
        }
        setIsLoggedIn(true);
        setIsLoginLoading(false);
      })
      .catch(function (error) {
        console.log(error.error || error);
        setIsLoginLoading(false);
        setIsLoggedIn(false);
        localStorage.setItem("owb.token", "");
      });
  } else if (!dpxAuthUrl && !isLoggedIn && !isLoginLoading) {
    // Set the login anchors href using dbx.getAuthenticationUrl()
    const dbx = new Dropbox.Dropbox({ clientId: clientId });

    console.log("not logged in getting URL");

    dbx.auth
      .getAuthenticationUrl(
        process.env.NODE_ENV === "development"
          ? "http://localhost:3000/"
          : "https://old-world-builder.com/"
      )
      .then((authUrl) => {
        dpxAuthUrl = authUrl;
      });
  }

  return {
    isLoggedIn,
    dpxAuthUrl,
    isLoginLoading,
  };
};
