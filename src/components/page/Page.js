import { useState, useEffect } from "react";
import classNames from "classnames";
import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";

import { Button } from "../../components/button";
import { Spinner } from "../../components/spinner";
import { Icon } from "../../components/icon";

import "./Page.css";

export const Header = ({
  className,
  headline,
  subheadline,
  moreButton,
  to,
  isSection,
  hasPointsError,
}) => {
  const intl = useIntl();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const Component = isSection ? "section" : "header";
  const handleMenuClick = () => {
    setShowMenu(!showMenu);
  };

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
        <>{moreButton && <div className="header__empty-icon" />}</>
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
      {moreButton ? (
        <Button
          type="text"
          color={isSection ? "dark" : "light"}
          label={intl.formatMessage({ id: "header.more" })}
          icon="more"
          onClick={handleMenuClick}
        />
      ) : (
        <>{to && <div className="header__empty-icon" />}</>
      )}
      {showMenu && (
        <ul className="header__more">
          {moreButton.map(({ callback, name_de, icon, to: moreButtonTo }) => (
            <li key={name_de}>
              <Button
                type="text"
                onClick={callback}
                to={moreButtonTo}
                icon={icon}
              >
                {name_de}
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
  subheadline: PropTypes.string,
  children: PropTypes.node,
  moreButton: PropTypes.array,
  isSection: PropTypes.bool,
};

export const Main = ({ className, children, isDesktop, compact, loading }) => {
  const language = localStorage.getItem("lang");
  const handleLanguageChange = (event) => {
    localStorage.setItem("lang", event.target.value);
    window.location.reload();
  };

  return (
    <>
      <main
        className={classNames(
          "main",
          isDesktop ? "main--desktop" : "main--mobile",
          compact && "main--compact",
          className
        )}
      >
        {children}
        {loading && <Spinner />}
      </main>
      {!loading && (
        <footer className="footer">
          <nav>
            <Link to="/about">
              <FormattedMessage id="footer.about" />
            </Link>
            <Link to="/help">
              <FormattedMessage id="footer.help" />
            </Link>
            {/* <Link to="/news">Neues</Link> */}
            <a
              href="https://github.com/nthiebes/old-world-builder/issues"
              target="_blank"
              rel="noreferrer"
            >
              <FormattedMessage id="footer.error" />
            </a>
          </nav>
          <div className="footer__languages">
            <div className="radio">
              <input
                type="radio"
                id="english"
                name="languages"
                value="en"
                onChange={handleLanguageChange}
                defaultChecked={language === "en"}
                className="radio__input"
              />
              <label htmlFor="english" className="radio__label">
                English
              </label>
            </div>
            <div className="radio">
              <input
                type="radio"
                id="deutsch"
                name="languages"
                value="de"
                onChange={handleLanguageChange}
                defaultChecked={language === "de"}
                className="radio__input"
              />
              <label htmlFor="deutsch" className="radio__label">
                Deutsch
              </label>
            </div>
          </div>
        </footer>
      )}
    </>
  );
};

Main.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  isDesktop: PropTypes.bool,
};
