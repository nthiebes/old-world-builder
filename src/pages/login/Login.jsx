import { useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";

import { Header, Main } from "../../components/page";
import { login as dropboxLogin } from "../../utils/dropbox-auth-and-synchronization";
import { owrLogin } from "../../utils/owr-auth-and-synchronization";
import owrLogoWhite from "../../assets/owr-logo-white.svg";

import "./Login.css";

export const Login = () => {
  const location = useLocation();
  const history = useHistory();
  const intl = useIntl();
  const dispatch = useDispatch();
  const { loggedIn } = useSelector((state) => state.login);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    if (loggedIn) {
      history.replace("/");
    }
  }, [loggedIn, history]);

  return (
    <>
      <Helmet>
        <title>{`Old World Builder | ${intl.formatMessage({ id: "header.login" })}`}</title>
      </Helmet>

      <Header headline="Old World Builder" hasMainNavigation hasHomeButton />

      <Main compact>
        <div className="login">
          <h2 className="login__headline">
            {intl.formatMessage({ id: "login.headline" })}
          </h2>
          <p className="login__subtext">
            {intl.formatMessage({ id: "login.subtext" })}
          </p>

          {/* Dropbox option */}
          <div className="login__option">
            <div className="login__option-header">
              <span className="login__option-name">Dropbox</span>
            </div>
            <p className="login__option-description">
              {intl.formatMessage({ id: "login.dropboxDescription" })}
            </p>
            <button
              className="login__connect-button login__connect-button--dropbox"
              onClick={() => dropboxLogin({ dispatch })}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                <path d="M17.25 0.75l-5.25 4.5 6.75 4.5 5.25-4.5z"/>
                <path d="M12 5.25l-5.25-4.5-6.75 4.5 5.25 4.5z"/>
                <path d="M18.75 9.75l5.25 4.5-6.75 3.75-5.25-4.5z"/>
                <path d="M12 13.5l-6.75-3.75-5.25 4.5 6.75 3.75z"/>
                <path d="M17.066 19.818l-5.066-4.342-5.066 4.342-3.184-1.769v2.201l8.25 3.75 8.25-3.75v-2.201z"/>
              </svg>
              {intl.formatMessage({ id: "login.connectDropbox" })}
            </button>
          </div>

          {/* OWR option */}
          <div className="login__option login__option--recommended">
            <div className="login__option-header">
              <span className="login__option-name">Old World Rankings</span>
              <span className="login__badge">
                {intl.formatMessage({ id: "login.recommended" })}
              </span>
            </div>
            <p className="login__option-description">
              {intl.formatMessage({ id: "login.owrDescription" })}
            </p>
            <ul className="login__benefits">
              <li>
                {intl.formatMessage({ id: "login.owrBenefit1" })}
              </li>
              <li>
                {intl.formatMessage({ id: "login.owrBenefit2" })}
              </li>
              <li>
                {intl.formatMessage({ id: "login.owrBenefit3" })}
              </li>
              <li>
                {intl.formatMessage({ id: "login.owrBenefit4" })}
              </li>
            </ul>
            <p className="login__pro-note">
              {"* "}
              <a
                href="https://www.oldworldrankings.com/pricing/?utm_source=old-world-builder&utm_medium=login&utm_campaign=owr-integration"
                target="_blank"
                rel="noopener noreferrer"
                className="login__pro-link"
              >
                OWR Pro
              </a>
              {" subscribers"}
            </p>
            <button
              className="login__connect-button login__connect-button--owr"
              onClick={() => owrLogin({ dispatch })}
            >
              <img src={owrLogoWhite} alt="" className="login__button-logo" />
              {intl.formatMessage({ id: "login.connectOWR" })}
            </button>
          </div>
        </div>
      </Main>
    </>
  );
};
