import { useEffect } from "react";
import { useLocation } from "react-router-dom";

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
          Zur Startseite
        </Button>

        <h2>Hilfe</h2>
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
          Bei Fragen oder Problemen kannst du ein Issue auf{" "}
          <a
            href="https://github.com/nthiebes/old-world-builder"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>{" "}
          erstellen oder mir auf{" "}
          <a
            href="https://twitter.com/_gscheid"
            target="_blank"
            rel="noreferrer"
          >
            Twitter
          </a>{" "}
          schreiben.
        </p>
      </Main>
    </>
  );
};
