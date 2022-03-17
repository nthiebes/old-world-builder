import { useState } from "react";
import classNames from "classnames";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

import { Button } from "../../components/button";

import "./Page.css";

export const Header = ({
  className,
  headline,
  subheadline,
  moreButton,
  to,
  isSection,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const Component = isSection ? "section" : "header";
  const handleMenuClick = () => {
    setShowMenu(!showMenu);
  };

  return (
    <Component
      className={classNames(isSection ? "column-header" : "header", className)}
    >
      {to ? (
        <Button
          type="text"
          to={to}
          label={isSection ? "Schließen" : "Zurück"}
          color={isSection ? "dark" : "light"}
          icon={isSection ? "close" : "back"}
        />
      ) : (
        <>{moreButton && <div className="header__empty-icon" />}</>
      )}
      <div className="header__text">
        {headline && <h1 className="header__name">{headline}</h1>}
        {subheadline && <p className="header__points">{subheadline}</p>}
      </div>
      {moreButton ? (
        <Button
          type="text"
          color={isSection ? "dark" : "light"}
          label="Mehr Optionen"
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

export const Main = ({ className, children, isDesktop, compact }) => {
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
      </main>
      <footer className="footer">
        <nav>
          <Link to="/about">Über OWB</Link>
          <Link to="/help">Hilfe</Link>
          {/* <Link to="/news">Neues</Link> */}
          <a
            href="https://github.com/nthiebes/old-world-builder/issues"
            target="_blank"
            rel="noreferrer"
          >
            Fehler melden
          </a>
        </nav>
      </footer>
    </>
  );
};

Main.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  isDesktop: PropTypes.bool,
};
