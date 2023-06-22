import React from "react";
import ReactDOM from "react-dom";
import { Provider as ReduxProvider } from "react-redux";
import { IntlProvider } from "react-intl";
import { HelmetProvider } from "react-helmet-async";

import reportWebVitals from "./reportWebVitals";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import { App } from "./App";
import store from "./store";

import English from "./i18n/en.json";
import German from "./i18n/de.json";

const metaDescription = {
  de: "Armeebauer für Warhammer: The Old World und Warhammer Fantasy.",
  en: "Army builder for Warhammer: The Old World and Warhammer Fantasy Battles.",
};

// Language detection
const supportedLanguages = ["en", "de"];
const localStorageLanguage = localStorage.getItem("lang");
const locale = (
  localStorageLanguage ||
  navigator.language ||
  navigator.userLanguage
).slice(0, 2);
const language = supportedLanguages.indexOf(locale) === -1 ? "en" : locale;

localStorage.setItem("lang", language);
document.documentElement.setAttribute("lang", language);
document
  .querySelector("meta[name=description]")
  .setAttribute("content", metaDescription[language]);

let messages;
if (language === "de") {
  messages = German;
} else {
  messages = English;
}

ReactDOM.render(
  <IntlProvider locale={locale} messages={messages}>
    <ReduxProvider store={store}>
      <React.StrictMode>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </React.StrictMode>
    </ReduxProvider>
  </IntlProvider>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

serviceWorkerRegistration.register();
