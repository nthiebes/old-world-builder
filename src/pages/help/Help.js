import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import { Helmet } from "react-helmet-async";

import { Header, Main } from "../../components/page";
import { Breadcrumbs } from "../../components/breadcrumbs";

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
        <link rel="canonical" href="https://old-world-builder.com/help" />
      </Helmet>

      <Header headline="Old World Builder" hasMainNavigation />

      <Main compact>
        <Breadcrumbs pagename="footer.help" />

        <h2 className="page-headline">
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
