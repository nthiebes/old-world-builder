export const loadScript = (src, done) => {
  const js = document.createElement("script");

  js.src = src;
  js.onload = function () {
    done && done();
  };
  js.onerror = function () {
    done && done(new Error("Failed to load script " + src));
  };
  document.head.appendChild(js);
};
