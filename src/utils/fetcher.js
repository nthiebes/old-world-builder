import "abortcontroller-polyfill/dist/abortcontroller-polyfill-only";

let controller;

const abortFetch = () => {
  controller && controller.abort();
};
export const fetcher = ({
  url,
  baseUrl = "/",
  appendJson = true,
  version,
  onSuccess,
  onError,
}) => {
  controller = new AbortController();

  fetch(
    `${baseUrl}${url}${appendJson ? ".json" : ""}?v=${
      version || process.env.REACT_APP_VERSION
    }`,
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      signal: controller.signal,
    },
  )
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
