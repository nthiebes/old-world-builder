import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FormattedMessage } from "react-intl";

import { Header, Main } from "../../components/page";
import { Button } from "../../components/button";

export const About = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <Header headline="Old World Builder" />

      <Main compact>
        <Button to="/" icon="home" centered>
          <FormattedMessage id="misc.startpage" />
        </Button>

        <h2>
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
          <FormattedMessage
            id="about.text2"
            values={{
              twitter: (
                <a
                  href="https://twitter.com/_gscheid"
                  target="_blank"
                  rel="noreferrer"
                >
                  @_gscheid
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
            }}
          />
        </p>
      </Main>
    </>
  );
};
