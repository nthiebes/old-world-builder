import React from "react";
import classNames from "classnames";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { FormattedMessage } from "react-intl";

import { Spinner } from "../../components/spinner";
import { useLanguage } from "../../utils/useLanguage";
import germany from "../../assets/germany.svg";
import usa from "../../assets/usa.svg";
import spain from "../../assets/spain.svg";
import france from "../../assets/france.svg";
import italy from "../../assets/italy.svg";
import polen from "../../assets/polen.svg";

import "./Page.css";

export const Main = ({ className, children, isDesktop, compact, loading }) => {
  const { language } = useLanguage();
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
          <nav className="footer__navigation">
            <Link to="/about">
              <FormattedMessage id="footer.about" />
            </Link>
            <Link to="/help">
              <FormattedMessage id="footer.help" />
            </Link>
            <Link to="/datasets">
              <FormattedMessage id="footer.datasets" />
            </Link>
            <Link to="/changelog">
              <FormattedMessage id="footer.changelog" />
            </Link>
            <Link to="/privacy">
              <FormattedMessage id="footer.privacy" />
            </Link>
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
                <img
                  width="24"
                  height="19"
                  alt=""
                  src={usa}
                  className="footer__language-icon"
                />
                English
              </label>
            </div>
            <div className="radio">
              <input
                type="radio"
                id="spanish"
                name="languages"
                value="es"
                onChange={handleLanguageChange}
                defaultChecked={language === "es"}
                className="radio__input"
              />
              <label htmlFor="spanish" className="radio__label">
                <img
                  width="24"
                  height="19"
                  alt=""
                  src={spain}
                  className="footer__language-icon"
                />
                Español
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
