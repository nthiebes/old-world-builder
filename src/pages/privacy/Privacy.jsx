import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import { Helmet } from "react-helmet-async";

import { Header, Main } from "../../components/page";
// import { loadScript } from "../../utils/script";

export const Privacy = () => {
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
            id: "footer.privacy",
          })}`}
        </title>
        <link rel="canonical" href="https://old-world-builder.com/privacy" />
      </Helmet>

      <Header headline="Old World Builder" hasMainNavigation hasHomeButton />

      <Main compact>
        <h2 className="page-headline">
          <FormattedMessage id="footer.privacy" />
        </h2>
        <p>
          The "Old World Builder" is built as an Open Source app. This SERVICE
          is provided by at no cost and is intended for use as is.
        </p>
        <p>
          This page is used to inform visitors regarding my policies with the
          collection, use, and disclosure of Personal Information if anyone
          decided to use my Service.
        </p>
        <p>
          If you choose to use my Service, then you agree to the collection and
          use of information in relation to this policy. The Personal
          Information that I collect is used for providing and improving the
          Service. I will not use or share your information with anyone except
          as described in this Privacy Policy.
        </p>
        <h3>Information Collection and Use</h3>
        <p>This app does not collect or store personal data.</p>
        <p>
          The app does use third-party services that may collect information
          used to identify you.
        </p>
        <p>
          Links to the privacy policy of third-party service providers used by
          the app:
        </p>
        <ul>
          {/* <li>
            <a
              href="https://www.google.com/policies/privacy/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Play Services
            </a>{" "}
            (Android App)
          </li> */}
          <li>
            <a
              href="https://www.dropbox.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Dropbox
            </a>{" "}
            (file storage and synchronization)
          </li>
          <li>
            <a
              href="https://sentry.io/privacy/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Sentry
            </a>{" "}
            (error tracking)
          </li>
        </ul>
        <br />
        <h3>Log Data</h3>
        <p>
          I want to inform you that whenever you use my Service, in a case of an
          error in the app I collect data and information (through third-party
          products) on your phone called Log Data. This Log Data may include
          information such as your device Internet Protocol (“IP”) address,
          device name, operating system version, the configuration of the app
          when utilizing my Service, the time and date of your use of the
          Service, and other statistics.
        </p>
        <h3>Cookies</h3>
        <p>
          Cookies are files with a small amount of data that are commonly used
          as anonymous unique identifiers. These are sent to your browser from
          the websites that you visit and are stored on your device's internal
          memory.
        </p>
        <p>This Service does not use these “cookies”.</p>

        {/* <h3>Piwik PRO Analytics</h3>
        <p>
          We use Piwik PRO Analytics Suite as our website/app analytics
          software. The collected information may include an anonymized
          visitor's IP address, operating system, browser ID, browsing activity
          and other information. See the{" "}
          <a
            href="https://help.piwik.pro/support/getting-started/what-data-does-piwik-pro-collect/"
            target="_blank"
            rel="noopener noreferrer"
          >
            scope of data collected by Piwik PRO
          </a>
          .
        </p>
        <p>
          We calculate metrics like bounce rate, page views, sessions and the
          like to understand how our website/app is used.
        </p>
        <p>
          We host our solution on Microsoft Azure in Germany/Netherlands/United
          States/Hong Kong/ElastX in Sweden, and the data is stored for 14/25
          months.
        </p>
        <p>
          The purpose of data processing: analytics. Legal basis: Art. 6 (1)(a)
          GDPR.
        </p>
        <p>
          Piwik PRO does not send the data about you to any other sub-processors
          or third parties and does not use it for its own purposes. For more,
          read{" "}
          <a
            href="https://piwik.pro/privacy-policy/?pk_vid=b9514cbe42ac928e17075637164eac6f#product"
            target="_blank"
            rel="noopener noreferrer"
          >
            Piwik PRO's privacy policy
          </a>
          .
        </p> */}

        {/* <div id="_stg_opt_out_iframe_content" style={{ display: "none" }}>
          <p>
            Privacy on this site: We collect and process your data on this site
            to better understand how it is used. You can opt-in or opt-out at
            any time.
          </p>
          <div className="checkbox">
            <input
              id="_stg_optout_checkbox"
              onChange={handleOptOut}
              type="checkbox"
              className="checkbox__input"
            />
            <label
              className="checkbox__label"
              id="_stg_optout_checkbox_label"
              htmlFor="_stg_optout_checkbox"
            ></label>
          </div>
        </div> */}

        <h3>Links to Other Sites</h3>
        <p>
          This Service contains links to other sites. If you click on a
          third-party link, you will be directed to that site. Note that these
          external sites are not operated by me. Therefore, I strongly advise
          you to review the Privacy Policy of these websites. I have no control
          over and assume no responsibility for the content, privacy policies,
          or practices of any third-party sites or services.
        </p>
        <h3>Changes to This Privacy Policy</h3>
        <p>
          I may update our Privacy Policy from time to time. Thus, you are
          advised to review this page periodically for any changes. I will
          notify you of any changes by posting the new Privacy Policy on this
          page.
        </p>
        <p>This policy is effective as of 2026-03-01.</p>

        <h3>Contact Us</h3>
        <p>
          If you have any questions or suggestions about my Privacy Policy, do
          not hesitate to contact me at{" "}
          <Link to="/help">old-world-builder.com/help</Link>.
        </p>
      </Main>
    </>
  );
};
