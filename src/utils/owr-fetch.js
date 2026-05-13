/**
 * Shared OWR authenticated fetch with automatic token refresh.
 * Used by both owr-auth and owr-sync modules.
 */

const owrBaseUrl =
  import.meta.env.VITE_OWR_BASE_URL || "https://oldworldrankings.com";
const clientId = import.meta.env.VITE_OWR_CLIENT_ID || "";

export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("owb.owrRefreshToken");
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${owrBaseUrl}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
      }),
    });

    if (!response.ok) return false;

    const data = await response.json();
    localStorage.setItem("owb.owrAccessToken", data.access_token);
    if (data.refresh_token) {
      localStorage.setItem("owb.owrRefreshToken", data.refresh_token);
    }
    return true;
  } catch {
    return false;
  }
};

export const owrFetch = async (url, options = {}) => {
  const accessToken = localStorage.getItem("owb.owrAccessToken");
  if (!accessToken) return null;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      const newToken = localStorage.getItem("owb.owrAccessToken");
      return fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${newToken}`,
          ...options.headers,
        },
      });
    }
    return null;
  }

  return response;
};
