import { useEffect } from "react";
import { useLocation } from "react-router-dom";

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
          Zur Startseite
        </Button>

        <h2>Was ist der "Old World Builder"?</h2>
        <p>
          Der <i>Old World Builder</i> ist ein Armeeplaner für die Games
          Workshop Tabletop Spiele Warhammer Fantasy und Warhammer: The Old
          World (sobald es erscheint).
        </p>
        <p>
          Das Projekt ist Open-Source und wird entwickelt von Nico Thiebes (
          <a
            href="https://twitter.com/_gscheid"
            target="_blank"
            rel="noreferrer"
          >
            @_gscheid
          </a>
          ).
        </p>

        <h2>Credits</h2>
        <p>
          Fantasy icons von{" "}
          <a href="https://game-icons.net" target="_blank" rel="noreferrer">
            game-icons.net
          </a>{" "}
          (
          <a
            href="https://creativecommons.org/licenses/by/3.0/"
            target="_blank"
            rel="noreferrer"
          >
            CC BY 3.0
          </a>
          ).
        </p>

        <h2>Eure Unterstützung</h2>
        <p>
          Der <i>Old World Builder</i> wird Open-Source entwickelt. Ihr könnt
          dabei helfen, fehlende bzw. unvollständige Datensets der Armeen zu
          vervollständigen. Details dazu Ihr findet ihr auf der{" "}
          <a
            href="https://github.com/nthiebes/old-world-builder"
            target="_blank"
            rel="noreferrer"
          >
            GitHub Projektseite
          </a>
          .
        </p>
      </Main>
    </>
  );
};
