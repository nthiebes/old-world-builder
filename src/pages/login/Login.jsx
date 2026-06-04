import { useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";

import { Button } from "../../components/button";
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
        <title>{`Old World Builder | ${intl.formatMessage({
          id: "header.login",
        })}`}</title>
      </Helmet>

      <Header headline="Old World Builder" hasMainNavigation hasHomeButton />

      <Main compact>
        <h2 className="page-headline">
          <FormattedMessage id="header.login" />
        </h2>

        <h2>Dropbox</h2>
        <p>
          <FormattedMessage id="login.dropboxDescription" />
        </p>
        <Button
          centered
          icon="dropbox"
          spaceTop
          onClick={() => dropboxLogin({ dispatch })}
          size="large"
          type="dropbox"
        >
          <FormattedMessage id="login.connectDropbox" />
        </Button>

        <hr />

        <h2 className="login__option-name">Old World Rankings</h2>
        <ul className="login__benefits">
          <li>
            <FormattedMessage id="login.owrBenefit1" />
          </li>
          <li>
            <FormattedMessage id="login.owrBenefit2" />
          </li>
          <li>
            <FormattedMessage id="login.owrBenefit3" />
          </li>
          <li>
            <FormattedMessage id="login.owrBenefit4" />
          </li>
        </ul>
        <p className="login__pro-note">
          <FormattedMessage
            id="login.proNote"
            values={{
              pro: (
                <a
                  href="https://www.oldworldrankings.com/pricing/?utm_source=old-world-builder&utm_medium=login&utm_campaign=owr-integration"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  OWR Pro
                </a>
              ),
            }}
          />
        </p>
        <Button
          centered
          spaceTop
          onClick={() => owrLogin({ dispatch })}
          size="large"
          type="owr"
        >
          <img src={owrLogoWhite} alt="" className="login__button-logo" />
          <FormattedMessage id="login.connectOWR" />
        </Button>
      </Main>
    </>
  );
};
