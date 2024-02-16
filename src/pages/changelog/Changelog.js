import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { FormattedMessage, FormattedDate, useIntl } from "react-intl";
import { Helmet } from "react-helmet-async";

import { Header, Main } from "../../components/page";
import { Breadcrumbs } from "../../components/breadcrumbs";

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
        <link rel="canonical" href="https://old-world-builder.com/changelog" />
      </Helmet>

      <Header headline="Old World Builder" hasMainNavigation />

      <Main compact className="changelog">
        <Breadcrumbs pagename="footer.changelog" />

        <h2 className="page-headline">
          <FormattedMessage id="changelog.title" />
        </h2>

        <hr />

        <h3>v1.0</h3>
        <p>
          <time>
            <i>
              <FormattedDate
                value={new Date("2024-02-16 11:11:11")}
                month="long"
                day="2-digit"
                year="numeric"
              />
            </i>
          </time>
        </p>
        <ul className="changelog__list">
          <li>
            <FormattedMessage
              id="changelog.change28"
              values={{
                b: (msg) => <b>{msg}</b>,
              }}
            />
          </li>
          <li>
            <FormattedMessage
              id="changelog.change29"
              values={{
                b: (msg) => <b>{msg}</b>,
              }}
            />
          </li>
          <li>
            <FormattedMessage
              id="changelog.change30"
              values={{
                b: (msg) => <b>{msg}</b>,
              }}
            />
          </li>
          <li>
            <FormattedMessage
              id="changelog.change31"
              values={{
                b: (msg) => <b>{msg}</b>,
              }}
            />
          </li>
          <li>
            <FormattedMessage
              id="changelog.change32"
              values={{
                b: (msg) => <b>{msg}</b>,
              }}
            />
          </li>
          <li>
            <FormattedMessage
              id="changelog.change33"
              values={{
                b: (msg) => <b>{msg}</b>,
              }}
            />
          </li>
        </ul>

        <hr />

        <h3>v0.14</h3>
        <p>
          <time>
            <i>
              <FormattedDate
                value={new Date("2024-02-04 11:11:11")}
                month="long"
                day="2-digit"
                year="numeric"
              />
            </i>
          </time>
        </p>
        <ul className="changelog__list">
          <li>
            <FormattedMessage
              id="changelog.change26"
              values={{
                b: (msg) => <b>{msg}</b>,
              }}
            />
          </li>
          <li>
            <FormattedMessage
              id="changelog.change27"
              values={{
                b: (msg) => <b>{msg}</b>,
              }}
            />
          </li>
        </ul>

        <hr />

        <h3>v0.13</h3>
        <p>
          <time>
            <i>
              <FormattedDate
                value={new Date("2024-02-02 11:11:11")}
                month="long"
                day="2-digit"
                year="numeric"
              />
            </i>
          </time>
        </p>
        <ul className="changelog__list">
          <li>
            <FormattedMessage
              id="changelog.change24"
              values={{
                b: (msg) => <b>{msg}</b>,
              }}
            />
          </li>
          <li>
            <FormattedMessage
              id="changelog.change25"
              values={{
                b: (msg) => <b>{msg}</b>,
              }}
            />
          </li>
        </ul>

        <hr />

        <h3>v0.12</h3>
        <p>
          <time>
            <i>
              <FormattedDate
                value={new Date("2024-01-31 11:11:11")}
                month="long"
                day="2-digit"
                year="numeric"
              />
            </i>
          </time>
        </p>
        <ul className="changelog__list">
          <li>
            <FormattedMessage
              id="changelog.change22"
              values={{
                b: (msg) => <b>{msg}</b>,
                rulesIndex: (
                  <a
                    href="https://www.whfb.app/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <b>Online Rules Index</b>
                  </a>
                ),
              }}
            />
          </li>
          <li>
            <FormattedMessage
              id="changelog.change23"
              values={{
                b: (msg) => <b>{msg}</b>,
              }}
            />
          </li>
        </ul>

        <hr />

        <h3>v0.11</h3>
        <p>
          <time>
            <i>
              <FormattedDate
                value={new Date("2024-01-28 11:11:11")}
                month="long"
                day="2-digit"
                year="numeric"
              />
            </i>
          </time>
        </p>
        <ul className="changelog__list">
          <li>
            <FormattedMessage id="changelog.change21" />
          </li>
        </ul>
        <p>
          <b>
            <FormattedMessage id="changelog.change17" />
          </b>
        </p>
        <ul className="changelog__list">
          <li>
            <FormattedMessage id="changelog.change18" />
          </li>
          <li>
            <FormattedMessage id="changelog.change19" />
          </li>
          <li>
            <FormattedMessage id="changelog.change20" />
          </li>
        </ul>

        <hr />

        <h3>v0.10</h3>
        <p>
          <time>
            <i>
              <FormattedDate
                value={new Date("2024-01-22 11:11:11")}
                month="long"
                day="2-digit"
                year="numeric"
              />
            </i>
          </time>
        </p>
        <ul className="changelog__list">
          <li>
            <FormattedMessage
              id="changelog.change12"
              values={{ b: (msg) => <b>{msg}</b> }}
            />
          </li>
          <li>
            <FormattedMessage
              id="changelog.change13"
              values={{ b: (msg) => <b>{msg}</b> }}
            />
          </li>
          <li>
            <FormattedMessage
              id="changelog.change14"
              values={{ b: (msg) => <b>{msg}</b> }}
            />
          </li>
          <li>
            <FormattedMessage
              id="changelog.change15"
              values={{ b: (msg) => <b>{msg}</b> }}
            />
          </li>
          <li>
            <FormattedMessage
              id="changelog.change16"
              values={{ b: (msg) => <b>{msg}</b> }}
            />
          </li>
        </ul>

        <hr />

        <h3>v0.8</h3>
        <p>
          <time>
            <i>
              <FormattedDate
                value={new Date("2024-01-18 11:11:11")}
                month="long"
                day="2-digit"
                year="numeric"
              />
            </i>
          </time>
        </p>
        <ul className="changelog__list">
          <li>
            <FormattedMessage
              id="changelog.change11"
              values={{ b: (msg) => <b>{msg}</b> }}
            />
          </li>
        </ul>

        <hr />

        <h3>v0.7</h3>
        <p>
          <time>
            <i>
              <FormattedDate
                value={new Date("2024-01-17 11:11:11")}
                month="long"
                day="2-digit"
                year="numeric"
              />
            </i>
          </time>
        </p>
        <ul className="changelog__list">
          <li>
            <FormattedMessage
              id="changelog.change9"
              values={{ b: (msg) => <b>{msg}</b> }}
            />
          </li>
          <li>
            <FormattedMessage
              id="changelog.change10"
              values={{
                b: (msg) => <b>{msg}</b>,
                about: (
                  <Link to="/about">
                    <FormattedMessage id="footer.about" />
                  </Link>
                ),
              }}
            />
          </li>
        </ul>

        <hr />

        <h3>v0.6</h3>
        <p>
          <time>
            <i>
              <FormattedDate
                value={new Date("2024-01-14 11:11:11")}
                month="long"
                day="2-digit"
                year="numeric"
              />
            </i>
          </time>
        </p>
        <ul className="changelog__list">
          <li>
            <FormattedMessage
              id="changelog.change8"
              values={{ b: (msg) => <b>{msg}</b> }}
            />
          </li>
        </ul>

        <hr />

        <h3>v0.5</h3>
        <p>
          <time>
            <i>
              <FormattedDate
                value={new Date("2024-01-13 11:11:11")}
                month="long"
                day="2-digit"
                year="numeric"
              />
            </i>
          </time>
        </p>
        <ul className="changelog__list">
          <li>
            <FormattedMessage
              id="changelog.change4"
              values={{ b: (msg) => <b>{msg}</b> }}
            />
          </li>
          <li>
            <FormattedMessage
              id="changelog.change5"
              values={{ b: (msg) => <b>{msg}</b> }}
            />
          </li>
          <li>
            <FormattedMessage
              id="changelog.change6"
              values={{
                b: (msg) => <b>{msg}</b>,
              }}
            />
          </li>
        </ul>
        <p>
          <i>
            <FormattedMessage
              id="changelog.change7"
              values={{
                discord: (
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href="https://discord.gg/87nUyjUxTU"
                  >
                    Discord
                  </a>
                ),
              }}
            />
          </i>
        </p>

        <hr />

        <h3>v0.4</h3>
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
        <ul className="changelog__list">
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
        </ul>
      </Main>
    </>
  );
};
