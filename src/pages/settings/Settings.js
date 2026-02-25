import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FormattedMessage, useIntl } from "react-intl";
import { Helmet } from "react-helmet-async";

import { Header, Main } from "../../components/page";
import { updateSetting } from "../../state/settings";

import "./Settings.css";

export const Settings = () => {
  const location = useLocation();
  const intl = useIntl();
  const dispatch = useDispatch();
  const settings = useSelector((state) => state.settings);
  const updateLocalSettings = (newSettings) => {
    localStorage.setItem("owb.settings", JSON.stringify(newSettings));
  };
  const handleSettingChange = (settingKey, value) => () => {
    const newSettings = { ...settings, [settingKey]: value };

    dispatch(updateSetting(newSettings));
    updateLocalSettings(newSettings);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>
          {`Old World Builder | ${intl.formatMessage({
            id: "footer.settings",
          })}`}
        </title>
        <link rel="canonical" href="https://old-world-builder.com/settings" />
      </Helmet>

      <Header headline="Old World Builder" hasMainNavigation hasHomeButton />

      <Main compact>
        <h2 className="page-headline">
          <FormattedMessage id="settings.title" />
        </h2>

        <h3>
          <FormattedMessage id="settings.synchronization" />
        </h3>
        <div className="checkbox settings__checkbox">
          <input
            type="checkbox"
            id="auto-sync"
            value="auto-sync"
            onChange={handleSettingChange("autoSync", !settings.autoSync)}
            checked={settings.autoSync}
            className="checkbox__input"
          />
          <label htmlFor="auto-sync" className="checkbox__label">
            <FormattedMessage id="settings.autoSync" />
          </label>
        </div>
        <p className="settings__radio-description">
          <i>
            <FormattedMessage id="settings.autoSyncDescription" />
          </i>
        </p>

        <h3>
          <FormattedMessage id="settings.colorScheme" />
        </h3>
        <div className="radio settings__radio">
          <input
            type="radio"
            id="color-scheme-auto"
            value="auto"
            onChange={handleSettingChange("colorScheme", "auto")}
            checked={settings.colorScheme === "auto"}
            className="radio__input"
          />
          <label htmlFor="color-scheme-auto" className="radio__label">
            <FormattedMessage id="settings.colorSchemeAuto" />
          </label>
        </div>
        <p className="settings__radio-description">
          <i>
            <FormattedMessage id="settings.colorSchemeAutoDescription" />
          </i>
        </p>
        <div className="radio">
          <input
            type="radio"
            id="color-scheme-light"
            value="light"
            onChange={handleSettingChange("colorScheme", "light")}
            checked={settings.colorScheme === "light"}
            className="radio__input"
          />
          <label htmlFor="color-scheme-light" className="radio__label">
            <FormattedMessage id="settings.colorSchemeLight" />
          </label>
        </div>
        <div className="radio">
          <input
            type="radio"
            id="color-scheme-dark"
            value="dark"
            onChange={handleSettingChange("colorScheme", "dark")}
            checked={settings.colorScheme === "dark"}
            className="radio__input"
          />
          <label htmlFor="color-scheme-dark" className="radio__label">
            <FormattedMessage id="settings.colorSchemeDark" />
          </label>
        </div>
      </Main>
    </>
  );
};
