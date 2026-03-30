import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { updateLogin } from "../state/login";
import { parseQueryString } from "./query-string";

const clientId = import.meta.env.VITE_OWR_CLIENT_ID || "";
const owrBaseUrl =
  import.meta.env.VITE_OWR_BASE_URL || "https://oldworldrankings.com";

const generateRandomString = (length) => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(36).padStart(2, "0"))
    .join("")
    .slice(0, length);
};

const sha256 = async (plain) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return crypto.subtle.digest("SHA-256", data);
};

const base64UrlEncode = (arrayBuffer) => {
  const bytes = new Uint8Array(arrayBuffer);
  let str = "";
  bytes.forEach((byte) => {
    str += String.fromCharCode(byte);
  });
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const generateCodeChallenge = async (codeVerifier) => {
  const digest = await sha256(codeVerifier);
  return base64UrlEncode(digest);
};

const getRedirectUri = () => {
  return import.meta.env.DEV
    ? `${window.location.origin}/`
    : "https://old-world-builder.com/";
};

const getCodeFromUrl = () => {
  return parseQueryString(window.location.search).code;
};

const hasRedirectedFromAuth = () => {
  return !!getCodeFromUrl() && sessionStorage.getItem("owrCodeVerifier");
};

export const useOWRAuthentication = () => {
  const accessToken = localStorage.getItem("owb.owrAccessToken");
  const refreshToken = localStorage.getItem("owb.owrRefreshToken");
  const dispatch = useDispatch();

  useEffect(() => {
    if (refreshToken && accessToken) {
      dispatch(
        updateLogin({
          loggedIn: true,
          loginLoading: false,
          loginError: false,
          provider: "owr",
        }),
      );
    } else if (hasRedirectedFromAuth()) {
      const code = getCodeFromUrl();
      const codeVerifier = sessionStorage.getItem("owrCodeVerifier");

      fetch(`${owrBaseUrl}/oauth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grant_type: "authorization_code",
          code,
          redirect_uri: getRedirectUri(),
          client_id: clientId,
          code_verifier: codeVerifier,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          localStorage.setItem("owb.owrAccessToken", data.access_token);
          localStorage.setItem("owb.owrRefreshToken", data.refresh_token);
          sessionStorage.removeItem("owrCodeVerifier");

          window.history.replaceState({}, document.title, "/");

          dispatch(
            updateLogin({
              loggedIn: true,
              loginLoading: false,
              loginError: false,
              provider: "owr",
            }),
          );
        })
        .catch(() => {
          sessionStorage.removeItem("owrCodeVerifier");
          dispatch(updateLogin({ loginError: true, loginLoading: false }));
        });
    }
  }, [accessToken, refreshToken, dispatch]);
};

export const owrLogin = async ({ dispatch }) => {
  const codeVerifier = generateRandomString(64);
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  sessionStorage.setItem("owrCodeVerifier", codeVerifier);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getRedirectUri(),
    response_type: "code",
    scope: "profile lists",
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  window.location.href = `${owrBaseUrl}/oauth/authorize?${params.toString()}`;
};

export const owrLogout = ({ dispatch }) => {
  localStorage.removeItem("owb.owrAccessToken");
  localStorage.removeItem("owb.owrRefreshToken");
  dispatch(updateLogin({ loggedIn: false, provider: null }));
};
