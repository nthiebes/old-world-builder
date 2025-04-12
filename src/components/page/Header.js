import { useState, useEffect } from "react";
import classNames from "classnames";
import PropTypes from "prop-types";
import { useLocation, Link } from "react-router-dom";
import { useIntl } from "react-intl";

import { Button } from "../../components/button";
import { Icon } from "../../components/icon";

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
  const Component = isSection ? "section" : "header";
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
        id: "footer.custom-datasets",
      }),
      to: "/custom-datasets",
      icon: "datasets",
    },
    {
      name: intl.formatMessage({
        id: "footer.changelog",
      }),
      to: "/changelog",
      icon: "news",
    },
  ];
  const navigation = hasMainNavigation ? navigationLinks : moreButton;

  useEffect(() => {
    setShowMenu(false);
  }, [location.pathname]);

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
        />
      ) : (
        <>
          {hasHomeButton && (
            <Button
              type="text"
              to="/"
              label={intl.formatMessage({ id: "misc.startpage" })}
              color="light"
              icon="home"
            />
          )}
          {navigation && !hasHomeButton && (
            <div className="header__empty-icon" />
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
          </p>
        )}
      </div>
      {navigation ? (
        <Button
          type="text"
          className={classNames(showMenu && "header__more-button")}
          color={isSection ? "dark" : "light"}
          label={intl.formatMessage({ id: "header.more" })}
          icon={navigationIcon ? navigationIcon : "menu"}
          onClick={handleMenuClick}
        />
      ) : (
        <>{to && !filters && <div className="header__empty-icon" />}</>
      )}
      {filters && (
        <Button
          type="text"
          className={classNames(showMenu && "header__more-button")}
          color={isSection ? "dark" : "light"}
          label={intl.formatMessage({ id: "header.filter" })}
          icon="filter"
          onClick={handleMenuClick}
        />
      )}
      {showMenu && navigation && (
        <ul
          className={classNames(
            "header__more",
            !hasMainNavigation && "header__more--secondary-navigation"
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
            !hasMainNavigation && "header__more--secondary-navigation"
          )}
        >
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
