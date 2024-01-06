import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import { Helmet } from "react-helmet-async";

import { Header, Main } from "../../components/page";
import { Button } from "../../components/button";

export const About = () => {
  const location = useLocation();
  const intl = useIntl();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>
          {`Old World Builder | ${intl.formatMessage({ id: "footer.about" })}`}
        </title>
      </Helmet>

      <Header headline="Old World Builder" hasMainNavigation />

      <Main compact>
        <Button to="/" icon="home" centered>
          <FormattedMessage id="misc.startpage" />
        </Button>

        <h2 className="page-headline">
          <FormattedMessage id="about.title" />
        </h2>
        <p>
          <FormattedMessage
            id="about.text"
            values={{
              owb: <i>Old World Builder</i>,
            }}
          />
        </p>
        <p>
          <FormattedMessage id="about.text2" />
        </p>

        <h2>
          <FormattedMessage id="about.support" />
        </h2>
        <p>
          <FormattedMessage
            id="about.text3"
            values={{
              owb: <i>Old World Builder</i>,
              github: (
                <a
                  href="https://github.com/nthiebes/old-world-builder"
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub
                </a>
              ),
              discord: (
                <a
                  href="https://discord.gg/87nUyjUxTU"
                  target="_blank"
                  rel="noreferrer"
                >
                  Discord
                </a>
              ),
            }}
          />
        </p>

        <h2>Credits</h2>
        <p>
          <FormattedMessage
            id="about.credits"
            values={{
              gameIcons: (
                <a
                  href="https://game-icons.net"
                  target="_blank"
                  rel="noreferrer"
                >
                  game-icons.net
                </a>
              ),
              license: (
                <a
                  href="https://creativecommons.org/licenses/by/3.0/"
                  target="_blank"
                  rel="noreferrer"
                >
                  CC BY 3.0
                </a>
              ),
            }}
          />
        </p>
        <p>
          <FormattedMessage id="about.disclaimer" />
        </p>
      </Main>
    </>
  );
};
