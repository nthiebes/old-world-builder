import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FormattedMessage } from "react-intl";

import { Header, Main } from "../../components/page";
import { Button } from "../../components/button";

export const Help = () => {
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
          <FormattedMessage id="help.title" />
        </h2>
        {/* <p>
          Falls du Fragen zum OWL hast, kannst du diese im OWL Thema des{" "}
          <a
            href="https://www.gw-fanworld.net"
            target="_blank"
            rel="noreferrer"
          >
            GW-Fanworld.net Forums
          </a>{" "}
          stellen.
        </p>
        <p>
          Alternativ kannst du auch direkt eine E-Mail schreiben an{" "}
          <a href="mailto:hello@old-world-builder.com">
            hello@old-world-builder.com
          </a>
          .
        </p> */}
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
            }}
          />
        </p>
      </Main>
    </>
  );
};
