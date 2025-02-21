import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import { Helmet } from "react-helmet-async";

import { Header, Main } from "../../components/page";
import { Button } from "../../components/button";

export const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>Warhammer Fantasy Builder | 404</title>
      </Helmet>

      <Header headline="Warhammer Fantasy Builder" />

      <Main compact>
        <Button to="/" icon="home" centered>
          <FormattedMessage id="misc.startpage" />
        </Button>

        <h2>
          <FormattedMessage id="404.title" />
        </h2>
        <p>
          <FormattedMessage id="404.title" />
        </p>
      </Main>
    </>
  );
};
