import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { FormattedMessage, FormattedDate, useIntl } from "react-intl";
import { Helmet } from "react-helmet-async";

import { Header, Main } from "../../components/page";
import { Button } from "../../components/button";

import "./Changelog.css";

export const Changelog = () => {
  const location = useLocation();
  const intl = useIntl();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>
          {`Old World Builder | ${intl.formatMessage({
            id: "footer.changelog",
          })}`}
        </title>
      </Helmet>

      <Header headline="Old World Builder" hasMainNavigation />

      <Main compact className="changelog">
        <Button to="/" icon="home" centered>
          <FormattedMessage id="misc.startpage" />
        </Button>

        <h2 className="page-headline">
          <FormattedMessage id="changelog.title" />
        </h2>
        <h3>v0.4.1</h3>
        <p>
          <time>
            <i>
              <FormattedDate
                value={new Date("2024-01-07 11:11:11")}
                month="long"
                day="2-digit"
                year="numeric"
              />
            </i>
          </time>
        </p>
        <ul>
          <li>
            <FormattedMessage
              id="changelog.change0"
              values={{
                datasets: (
                  <Link to="/datasets">
                    <FormattedMessage id="footer.datasets" />
                  </Link>
                ),
              }}
            />
          </li>
          <li>
            <FormattedMessage id="changelog.change1" />
          </li>
          <li>
            <FormattedMessage
              id="changelog.change2"
              values={{
                privacy: (
                  <Link to="/privacy">
                    <FormattedMessage id="footer.privacy" />
                  </Link>
                ),
              }}
            />
          </li>
          <li>
            <FormattedMessage id="changelog.change3" />
          </li>
        </ul>
      </Main>
    </>
  );
};
