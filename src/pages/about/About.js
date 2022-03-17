import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

import { Header, Main } from "../../components/page";

export const About = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <Header headline="Old World Builder" />

      <Main compact>
        <Link to="/">Zurück zur Startseite</Link>

        <h2>Was ist der "Old World Builder"?</h2>
        <p>
          Der <i>Old World Builder</i> ist eine Armeebau-Hilfe für die Games
          Workshop Tabletop Spiele Warhammer Fantasy und Warhammer: The Old
          World.
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
          Der <i>Old World Builder</i> ist Open-Source. Ihr findet das Projekt
          auf GitHub:{" "}
          <a
            href="https://github.com/nthiebes/old-world-builder"
            target="_blank"
            rel="noreferrer"
          >
            github.com/nthiebes/old-world-builder
          </a>
        </p>
      </Main>
    </>
  );
};
