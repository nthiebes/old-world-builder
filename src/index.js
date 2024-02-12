import React from "react";
import ReactDOM from "react-dom";
import { Provider as ReduxProvider } from "react-redux";
import { IntlProvider } from "react-intl";
import { HelmetProvider } from "react-helmet-async";
import * as Sentry from "@sentry/react";
// import PiwikPro from "@piwikpro/react-piwik-pro";

import reportWebVitals from "./reportWebVitals";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import { App } from "./App";
import store from "./store";

import English from "./i18n/en.json";
import German from "./i18n/de.json";
import Spanish from "./i18n/es.json";
import French from "./i18n/fr.json";
import Italian from "./i18n/it.json";

// Sentry error tracking
if (process.env.NODE_ENV !== "development") {
  Sentry.init({
    dsn: "https://3947feb62e2f5348c1759e8d4d9ed084@o314295.ingest.sentry.io/4506569636642816",
    integrations: [],
    environment: process.env.NODE_ENV,
    release: `owb@${process.env.REACT_APP_VERSION}`,
  });
}

// Analytics
// PiwikPro.initialize(
//   "b926228f-3567-4df1-b4e5-5ea40019bffb",
//   "https://owb.piwik.pro"
// );

const metaDescription = {
  de: "Armeebauer für Warhammer: The Old World und Warhammer Fantasy.",
  en: "Costruttore di eserciti per Warhammer: The Old World e Warhammer Fantasy Battles.",
  fr: "Un créateur de liste d'armée pour les jeux Games Workshop 'Warhammer: The Old World' et 'Warhammer Fantaisie'.",
  es: "Creador de listas de ejército para los juegos de mesa de Games Workshop, Warhammer: The Old World y Warhammer Fantasy.",
  it: "Creador de listas de ejército para los juegos de mesa de Games Workshop, Warhammer: The Old World y Warhammer Fantasy.",
};

// Language detection
const supportedLanguages = ["en", "de", "fr", "es", "it"];
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
} else if (language === "es") {
  messages = Spanish;
} else if (language === "fr") {
  messages = French;
} else if (language === "it") {
  messages = Italian;
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
