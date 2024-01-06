import { useState, useEffect } from "react";
import classNames from "classnames";
import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";
import { useIntl } from "react-intl";

import { Button } from "../../components/button";
import { Icon } from "../../components/icon";

import "./Header.css";

export const Header = ({
  className,
  headline,
  subheadline,
  moreButton,
  to,
  isSection,
  hasPointsError,
  hasMainNavigation,
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
    },
    {
      name: intl.formatMessage({
        id: "footer.help",
      }),
      to: "/help",
    },
    {
      name: intl.formatMessage({
        id: "footer.datasets",
      }),
      to: "/datasets",
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
        <>{navigation && <div className="header__empty-icon" />}</>
      )}
      <div className="header__text">
        {headline && <h1 className="header__name">{headline}</h1>}
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
          icon="more"
          onClick={handleMenuClick}
        />
      ) : (
        <>{to && <div className="header__empty-icon" />}</>
      )}
      {showMenu && (
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
    </Component>
  );
};

Header.propTypes = {
  className: PropTypes.string,
  to: PropTypes.string,
  headline: PropTypes.string,
  subheadline: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  children: PropTypes.node,
  moreButton: PropTypes.array,
  isSection: PropTypes.bool,
  hasPointsError: PropTypes.bool,
  hasMainNavigation: PropTypes.bool,
};
