import "abortcontroller-polyfill/dist/abortcontroller-polyfill-only";

const baseUrl = process.env.PUBLIC_URL || "/";
let controller;

const abortFetch = () => {
  controller && controller.abort();
};
export const fetcher = ({ url, onSuccess, onError }) => {
  controller = new AbortController();

  const urlPath = url.startsWith('/') ? url : `/${url}`;
  fetch(`${baseUrl}${urlPath}.json?v=${process.env.REACT_APP_VERSION}`, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    signal: controller.signal,
  })
    .then((response) => response.json())
    .then((data) => {
      if (onSuccess) {
        onSuccess(data);
      }
    })
    .catch((error) => {
      if (onError) {
        onError(error);
      }
    });
};

export { abortFetch };
