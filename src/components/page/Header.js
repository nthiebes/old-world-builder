import { useState, useEffect } from "react";
import classNames from "classnames";
import PropTypes from "prop-types";
import { useLocation, Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FormattedMessage, useIntl } from "react-intl";

import { Button } from "../../components/button";
import { Icon } from "../../components/icon";
import { Dialog } from "../../components/dialog";
import { updateLocalList } from "../../utils/list";
import {
  login,
  syncLists,
  uploadLocalDataToDropbox,
  downloadRemoteDataFromDropbox,
} from "../../utils/dropbox-auth-and-synchronization";
import { updateSetting } from "../../state/settings";
import { updateLogin } from "../../state/login";

import "./Header.css";

export const Header = ({
  className,
  headline,
  headlineIcon,
  subheadline,
  moreButton,
  to,
  isSection,
  hasPointsError,
  hasMainNavigation,
  navigationIcon,
  hasHomeButton,
  filters,
}) => {
  const intl = useIntl();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const dispatch = useDispatch();
  const { listId, unitId } = useParams();
  const { loginLoading, loggedIn, isSyncing, syncConflict, syncError } =
    useSelector((state) => state.login);
  const list = useSelector((state) =>
    state.lists.find(({ id }) => listId === id),
  );
  const settings = useSelector((state) => state.settings);
  const Component = isSection ? "section" : "header";
  const hasLocalChanges =
    new Date(settings.lastChanged).getTime() >
    new Date(settings.lastSynced).getTime();
  const handleMenuClick = () => {
    setShowMenu(!showMenu);
  };
  const navigationLinks = [
    {
      name: intl.formatMessage({
        id: "footer.about",
      }),
      to: "/about",
      icon: "about",
    },
    {
      name: intl.formatMessage({
        id: "footer.help",
      }),
      to: "/help",
      icon: "help",
    },
    {
      name: intl.formatMessage({
        id: "footer.settings",
      }),
      to: "/settings",
      icon: "settings",
    },
    {
      name: intl.formatMessage({
        id: "footer.changelog",
      }),
      to: "/changelog",
      icon: "news",
    },
    {
      name: intl.formatMessage({
        id: "footer.custom-datasets",
      }),
      to: "/custom-datasets",
      icon: "datasets",
    },
  ];
  const navigation = hasMainNavigation ? navigationLinks : moreButton;
  const logout = () => {
    localStorage.removeItem("owb.accessToken");
    localStorage.removeItem("owb.refreshToken");
    dispatch(updateLogin({ loggedIn: false }));
  };

  useEffect(() => {
    setShowMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    const updatedList = JSON.stringify(list);
    const localList = JSON.stringify(
      JSON.parse(localStorage.getItem("owb.lists") || "[]").find(
        (localList) => localList.id === listId,
      ),
    );

    if (list && updatedList !== localList) {
      updateLocalList(list);

      const newSettings = { ...settings, lastChanged: new Date().toString() };
      dispatch(updateSetting({ lastChanged: newSettings.lastChanged }));
      localStorage.setItem("owb.settings", JSON.stringify(newSettings));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list]);

  return (
    <Component
      className={classNames(isSection ? "column-header" : "header", className)}
    >
      {to ? (
        <Button
          type="text"
          to={to}
          label={
            isSection
              ? intl.formatMessage({ id: "header.close" })
              : intl.formatMessage({ id: "header.back" })
          }
          color={isSection ? "dark" : "light"}
          icon={isSection ? "close" : "back"}
          showLabelRight={!isSection}
        />
      ) : (
        <>
          {hasHomeButton ? (
            <Button
              type="text"
              to="/"
              label={intl.formatMessage({ id: "misc.startpage" })}
              color="light"
              icon="home"
              showLabelRight
            />
          ) : (
            <Button
              type="text"
              onClick={() => {
                if (loggedIn) {
                  logout();
                } else {
                  login({ dispatch });
                }
              }}
              label={
                loginLoading
                  ? ""
                  : intl.formatMessage({
                      id: loggedIn
                        ? "header.dropboxLogout"
                        : "header.dropboxLogin",
                    })
              }
              color="light"
              icon={loginLoading ? "spinner" : loggedIn ? "logout" : "dropbox"}
              showLabelRight
            />
          )}
        </>
      )}
      <div className="header__text">
        {headline && (
          <>
            {headline === "Old World Builder" ? (
              <h1 className="header__name">
                <Link className="header__name-link" to="/">
                  {headline}
                </Link>
                {!isSection && (
                  <>
                    {loggedIn ? (
                      <>
                        <Button
                          type="text"
                          color="light"
                          className="header__cloud-icon"
                          label={intl.formatMessage({ id: "header.sync" })}
                          icon={
                            isSyncing
                              ? "sync"
                              : hasLocalChanges
                              ? "cloud-upload"
                              : "cloud"
                          }
                          disabled={isSyncing}
                          onClick={() => {
                            syncLists({
                              dispatch,
                            });
                          }}
                        />
                        {syncError && (
                          <Icon
                            symbol="error"
                            color="red"
                            className="header__sync-error"
                          />
                        )}
                      </>
                    ) : (
                      <Button
                        type="text"
                        color="light"
                        className="header__cloud-icon"
                        disabled
                        icon="cloud-off"
                      />
                    )}
                  </>
                )}
              </h1>
            ) : (
              <h1 className="header__name">
                {headlineIcon && headlineIcon}
                <span className="header__name-text">{headline}</span>
              </h1>
            )}
          </>
        )}
        {subheadline && (
          <p className="header__points">
            {subheadline}{" "}
            {hasPointsError && <Icon symbol="error" color="red" />}
            {!isSection && (
              <>
                {loggedIn ? (
                  <Button
                    type="text"
                    color="light"
                    className="header__cloud-icon"
                    label={intl.formatMessage({ id: "header.sync" })}
                    icon={
                      isSyncing
                        ? "sync"
                        : hasLocalChanges
                        ? "cloud-upload"
                        : "cloud"
                    }
                    disabled={isSyncing}
                    onClick={() => {
                      syncLists({
                        dispatch,
                      });
                    }}
                  />
                ) : (
                  <Button
                    type="text"
                    color="light"
                    className="header__cloud-icon"
                    disabled
                    icon="cloud-off"
                  />
                )}
              </>
            )}
          </p>
        )}
      </div>
      {navigation ? (
        <Button
          type="text"
          className={classNames(showMenu && "header__more-button")}
          color={isSection ? "dark" : "light"}
          label={
            navigationIcon
              ? unitId
                ? intl.formatMessage({ id: "header.moreUnit" })
                : intl.formatMessage({ id: "header.moreList" })
              : intl.formatMessage({ id: "header.menu" })
          }
          icon={navigationIcon ? navigationIcon : "menu"}
          onClick={handleMenuClick}
          showLabelLeft={!isSection}
        />
      ) : (
        <>
          {to && !filters && (
            <div
              className={classNames(
                "header__empty-icon",
                isSection && "header__empty-icon--small",
              )}
            />
          )}
        </>
      )}
      {filters && (
        <Button
          type="text"
          className={classNames(showMenu && "header__more-button")}
          color={isSection ? "dark" : "light"}
          label={intl.formatMessage({ id: "header.filter" })}
          icon="filter"
          onClick={handleMenuClick}
          showLabelLeft
        />
      )}
      {showMenu && navigation && (
        <ul
          className={classNames(
            "header__more",
            !hasMainNavigation && "header__more--secondary-navigation",
          )}
        >
          {navigation.map(({ callback, name, icon, to: moreButtonTo }) => (
            <li key={name}>
              <Button
                type="text"
                onClick={callback}
                to={moreButtonTo}
                icon={icon}
              >
                {name}
              </Button>
            </li>
          ))}
        </ul>
      )}
      {showMenu && filters && (
        <ul
          className={classNames(
            "header__more",
            !hasMainNavigation && "header__more--secondary-navigation",
          )}
        >
          {/*
           * Can't add <InstallPwa /> here, as it needs to be rendered
           * on page load to catch the beforeinstallprompt event.
           */}
          {filters.map(({ callback, name, description, id, checked }) => (
            <li key={id}>
              <div className="checkbox header__checkbox">
                <input
                  type="checkbox"
                  id={id}
                  onChange={callback}
                  checked={checked}
                  className="checkbox__input"
                />
                <label htmlFor={id} className="checkbox__label">
                  {name}
                </label>
              </div>
              {description && (
                <i className="header__filter-description">{description}</i>
              )}
            </li>
          ))}
        </ul>
      )}
      {!isSection && syncConflict && (
        <Dialog open={syncConflict}>
          <p>
            <FormattedMessage id="header.syncConflict" />
          </p>
          <div className="header__sync-conflict-buttons">
            <Button
              type="primary"
              icon="cloud-upload"
              spaceTop
              onClick={() => {
                uploadLocalDataToDropbox({ dispatch, settings });
                dispatch(updateLogin({ isSyncing: true, syncConflict: false }));
              }}
            >
              <FormattedMessage id="header.useLocal" />
            </Button>
            <Button
              type="primary"
              icon="cloud-download"
              spaceTop
              onClick={() => {
                downloadRemoteDataFromDropbox({ dispatch });
                dispatch(updateLogin({ isSyncing: true, syncConflict: false }));
              }}
            >
              <FormattedMessage id="header.useRemote" />
            </Button>
            <Button
              type="text"
              icon="close"
              color="dark"
              spaceTop
              onClick={() => {
                dispatch(updateLogin({ syncConflict: false }));
              }}
            >
              <FormattedMessage id="misc.cancel" />
            </Button>
          </div>
        </Dialog>
      )}
    </Component>
  );
};

Header.propTypes = {
  className: PropTypes.string,
  to: PropTypes.string,
  headline: PropTypes.string,
  headlineIcon: PropTypes.node,
  subheadline: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  children: PropTypes.node,
  moreButton: PropTypes.array,
  filters: PropTypes.array,
  isSection: PropTypes.bool,
  hasPointsError: PropTypes.bool,
  hasMainNavigation: PropTypes.bool,
  hasHomeButton: PropTypes.bool,
  navigationIcon: PropTypes.string,
};
