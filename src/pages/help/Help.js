import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import { Helmet } from "react-helmet-async";

import { Header, Main } from "../../components/page";
import { Button } from "../../components/button";

export const Help = () => {
  const location = useLocation();
  const intl = useIntl();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>
          {`Old World Builder | ${intl.formatMessage({ id: "footer.help" })}`}
        </title>
      </Helmet>

      <Header headline="Old World Builder" />

      <Main compact>
        <Button to="/" icon="home" centered>
          <FormattedMessage id="misc.startpage" />
        </Button>

        <h2>
          <FormattedMessage id="help.title" />
        </h2>
        <p>
          <FormattedMessage
            id="help.text"
            values={{
              github: (
                <a
                  href="https://github.com/nthiebes/old-world-builder"
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub
                </a>
              ),
              twitter: (
                <a
                  href="https://twitter.com/_gscheid"
                  target="_blank"
                  rel="noreferrer"
                >
                  Twitter
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
      </Main>
    </>
  );
};
