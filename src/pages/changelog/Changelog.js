import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { FormattedMessage, FormattedDate, useIntl } from "react-intl";
import { Helmet } from "react-helmet-async";

import { Header, Main } from "../../components/page";

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

      <Header headline="Old World Builder" hasMainNavigation hasHomeButton />

      <Main compact className="changelog">
        <h2 className="page-headline">
          <FormattedMessage id="changelog.title" />
        </h2>

        <hr />

        <h3>v1.25</h3>
        <p>
          <time>
            <i>
              <FormattedDate
                value={new Date("2025-11-21 11:11:11")}
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
              id="changelog.change68"
              values={{
                b: (msg) => <b>{msg}</b>,
              }}
            />
          </li>
        </ul>

        <hr />

        <h3>v1.24</h3>
        <p>
          <time>
            <i>
              <FormattedDate
                value={new Date("2025-10-26 11:11:11")}
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
              id="changelog.change67"
              values={{
                b: (msg) => <b>{msg}</b>,
              }}
            />
          </li>
        </ul>

        <hr />

        <h3>v1.23</h3>
        <p>
          <time>
            <i>
              <FormattedDate
                value={new Date("2025-10-10 11:11:11")}
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
              id="changelog.change66"
              values={{
                b: (msg) => <b>{msg}</b>,
              }}
            />
          </li>
        </ul>

        <hr />

        <h3>v1.22</h3>
        <p>
          <time>
            <i>
              <FormattedDate
                value={new Date("2025-08-27 11:11:11")}
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
              id="changelog.change65"
              values={{
                b: (msg) => <b>{msg}</b>,
              }}
            />
          </li>
        </ul>

        <hr />

        <h3>v1.21</h3>
        <p>
          <time>
            <i>
              <FormattedDate
                value={new Date("2025-08-16 11:11:11")}
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
              id="changelog.change64"
              values={{
                b: (msg) => <b>{msg}</b>,
              }}
            />
          </li>
        </ul>

        <hr />

        <h3>v1.20</h3>
        <p>
          <time>
            <i>
              <FormattedDate
                value={new Date("2025-08-12 11:11:11")}
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
              id="changelog.change63"
              values={{
                b: (msg) => <b>{msg}</b>,
              }}
            />
          </li>
        </ul>

        <hr />

        <h3>v1.19</h3>
        <p>
          <time>
            <i>
              <FormattedDate
                value={new Date("2025-06-26 11:11:11")}
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
              id="changelog.change62"
              values={{
                b: (msg) => <b>{msg}</b>,
              }}
            />
          </li>
        </ul>

        <hr />

        <h3>v1.18</h3>
        <p>
          <time>
            <i>
              <FormattedDate
                value={new Date("2025-06-19 11:11:11")}
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
              id="changelog.change61"
              values={{
                b: (msg) => <b>{msg}</b>,
              }}
            />
          </li>
        </ul>

        <hr />

        <h3>v1.17</h3>
        <p>
          <time>
            <i>
              <FormattedDate
                value={new Date("2025-05-31 11:11:11")}
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
              id="changelog.change60"
              values={{
                b: (msg) => <b>{msg}</b>,
              }}
            />
          </li>
        </ul>

        <hr />

        <h3>v1.16</h3>
        <p>
          <time>
            <i>
              <FormattedDate
                value={new Date("2025-05-26 11:11:11")}
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
              id="changelog.change59"
              values={{
                b: (msg) => <b>{msg}</b>,
              }}
            />
          </li>
        </ul>

        <hr />

        <h3>v1.15</h3>
        <p>
          <time>
            <i>
              <FormattedDate
                value={new Date("2025-04-12 11:11:11")}
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
              id="changelog.change58"
              values={{
                b: (msg) => <b>{msg}</b>,
                datasets: (
                  <Link to="/custom-datasets">
                    <FormattedMessage id="footer.custom-datasets" />
                  </Link>
                ),
              }}
            />
          </li>
        </ul>

        <hr />

        <h3>v1.14</h3>
        <p>
          <time>
            <i>
              <FormattedDate
                value={new Date("2025-03-25 11:11:11")}
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
              id="changelog.change57"
              values={{
                b: (msg) => <b>{msg}</b>,
              }}
            />
          </li>
        </ul>

        <hr />

        <h3>v1.13</h3>
        <p>
          <time>
            <i>
              <FormattedDate
                value={new Date("2025-03-24 11:11:11")}
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
              id="changelog.change56"
              values={{
                b: (msg) => <b>{msg}</b>,
              }}
            />
          </li>
        </ul>

        <hr />

        <h3>v1.12</h3>
        <p>
          <time>
            <i>
              <FormattedDate
                value={new Date("2025-03-24 11:11:11")}
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
              id="changelog.change55"
              values={{
                b: (msg) => <b>{msg}</b>,
              }}
            />
          </li>
        </ul>

        <hr />

        <h3>v1.11</h3>
        <p>
          <time>
            <i>
              <FormattedDate
                value={new Date("2025-02-15 11:11:11")}
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
              id="changelog.change54"
              values={{
                b: (msg) => <b>{msg}</b>,
              }}
            />
          </li>
        </ul>

        <hr />

        <h3>v1.10</h3>
        <p>
          <time>
            <i>
              <FormattedDate
                value={new Date("2024-12-19 11:11:11")}
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
              id="changelog.change53"
              values={{
                b: (msg) => <b>{msg}</b>,
              }}
            />
          </li>
        </ul>

        <hr />

        <h3>v1.9</h3>
        <p>
          <time>
            <i>
              <FormattedDate
                value={new Date("2024-11-18 11:11:11")}
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
              id="changelog.change52"
              values={{
                b: (msg) => <b>{msg}</b>,
              }}
            />
          </li>
        </ul>

        <hr />

        <h3>v1.8</h3>
        <p>
          <time>
            <i>
              <FormattedDate
                value={new Date("2024-09-17 11:11:11")}
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
              id="changelog.change50"
              values={{
                b: (msg) => <b>{msg}</b>,
              }}
            />
          </li>
          <li>
            <FormattedMessage
              id="changelog.change51"
              values={{
                b: (msg) => <b>{msg}</b>,
              }}
            />
          </li>
        </ul>

        <hr />

        <h3>v1.7</h3>
        <p>
          <time>
            <i>
              <FormattedDate
                value={new Date("2024-08-31 11:11:11")}
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
              id="changelog.change49"
              values={{
                b: (msg) => <b>{msg}</b>,
              }}
            />
          </li>
        </ul>

        <hr />

        <h3>v1.6</h3>
        <p>
          <time>
            <i>
              <FormattedDate
                value={new Date("2024-08-09 11:11:11")}
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
              id="changelog.change48"
              values={{
                b: (msg) => <b>{msg}</b>,
                i: (msg) => <i>{msg}</i>,
              }}
            />
          </li>
          <li>
            <FormattedMessage
              id="changelog.change47"
              values={{
                b: (msg) => <b>{msg}</b>,
                i: (msg) => <i>{msg}</i>,
              }}
            />
          </li>
        </ul>

        <hr />

        <h3>v1.5</h3>
        <p>
          <time>
            <i>
              <FormattedDate
                value={new Date("2024-07-26 11:11:11")}
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
              id="changelog.change45"
              values={{
                b: (msg) => <b>{msg}</b>,
              }}
            />
          </li>
          <li>
            <FormattedMessage
              id="changelog.change46"
              values={{
                b: (msg) => <b>{msg}</b>,
                i: (msg) => <i>{msg}</i>,
              }}
            />
          </li>
        </ul>

        <hr />

        <h3>v1.4</h3>
        <p>
          <time>
            <i>
              <FormattedDate
                value={new Date("2024-04-26 11:11:11")}
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
              id="changelog.change43"
              values={{
                b: (msg) => <b>{msg}</b>,
              }}
            />
          </li>
        </ul>

        <hr />

        <h3>v1.3</h3>
        <p>
          <time>
            <i>
              <FormattedDate
                value={new Date("2024-03-30 11:11:11")}
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
              id="changelog.change42"
              values={{
                b: (msg) => <b>{msg}</b>,
              }}
            />
          </li>
        </ul>

        <hr />

        <h3>v1.2</h3>
        <p>
          <time>
            <i>
              <FormattedDate
                value={new Date("2024-03-17 11:11:11")}
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
              id="changelog.change39"
              values={{
                b: (msg) => <b>{msg}</b>,
              }}
            />
          </li>
          <li>
            <FormattedMessage
              id="changelog.change40"
              values={{
                b: (msg) => <b>{msg}</b>,
              }}
            />
          </li>
          <li>
            <FormattedMessage
              id="changelog.change41"
              values={{
                b: (msg) => <b>{msg}</b>,
              }}
            />
          </li>
        </ul>

        <hr />

        <h3>v1.1</h3>
        <p>
          <time>
            <i>
              <FormattedDate
                value={new Date("2024-03-08 11:11:11")}
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
              id="changelog.change36"
              values={{
                b: (msg) => <b>{msg}</b>,
              }}
            />
          </li>
          <li>
            <FormattedMessage
              id="changelog.change37"
              values={{
                b: (msg) => <b>{msg}</b>,
              }}
            />
          </li>
          <li>
            <FormattedMessage
              id="changelog.change38"
              values={{
                b: (msg) => <b>{msg}</b>,
              }}
            />
          </li>
        </ul>

        <hr />

        <h3>v1.0</h3>
        <p>
          <time>
            <i>
              <FormattedDate
                value={new Date("2024-02-18 11:11:11")}
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
          <li>
            <FormattedMessage
              id="changelog.change34"
              values={{
                b: (msg) => <b>{msg}</b>,
              }}
            />
          </li>
          <li>
            <FormattedMessage
              id="changelog.change35"
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
                    <FormattedMessage id="footer.datasets-editor" />
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
