import { useEffect, useState, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import { Helmet } from "react-helmet-async";

import { Header, Main } from "../../components/page";
import { Button } from "../../components/button";

const DEFAULT_PORT = 47823;

const getPort = () => {
  const hash = window.location.hash.slice(1);
  if (!hash) return DEFAULT_PORT;
  const n = parseInt(hash, 36);
  return n >= 1 && n <= 65535 ? n : DEFAULT_PORT;
};

const getListCount = () => {
  const raw = localStorage.getItem("owb.lists");
  if (!raw) return 0;
  try {
    const lists = JSON.parse(raw);
    return Array.isArray(lists) ? lists.length : 0;
  } catch {
    return 0;
  }
};

export const BattleTavern = () => {
  const location = useLocation();
  const intl = useIntl();
  const [listCount, setListCount] = useState(getListCount);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const hideTimerRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const onFocus = () => setListCount(getListCount());
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  useEffect(() => {
    const onMessage = (event) => {
      const msg = event.data;
      if (!msg || !msg.status) return;
      setSending(false);
      if (msg.status === "success") {
        showResult(true, msg.message || intl.formatMessage({ id: "battleTavern.success" }));
      } else if (msg.status === "error") {
        showResult(false, msg.message || intl.formatMessage({ id: "battleTavern.error" }));
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showResult = useCallback((success, message) => {
    setResult({ success, message });
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (success) {
      hideTimerRef.current = setTimeout(() => setResult(null), 60000);
    }
  }, []);

  const handleSend = useCallback(() => {
    if (localStorage.length === 0) return;

    const data = Object.fromEntries(Object.entries(localStorage));
    const jsonString = JSON.stringify(data);
    const port = getPort();

    const popup = window.open(
      "about:blank",
      "bt_import",
      "width=1,height=1,left=-100,top=-100"
    );

    const form = document.createElement("form");
    form.method = "POST";
    form.action = `http://127.0.0.1:${port}/import`;
    form.target = "bt_import";

    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "data";
    input.value = jsonString;
    form.appendChild(input);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

    setSending(true);
    setResult(null);

    setTimeout(() => {
      if (popup && !popup.closed) popup.close();
      setSending((current) => {
        if (current) {
          showResult(
            false,
            intl.formatMessage({ id: "battleTavern.unreachable" })
          );
          return false;
        }
        return current;
      });
    }, 5000);
  }, [showResult]);

  const hasLists = listCount > 0;

  return (
    <>
      <Helmet>
        <title>
          {`Old World Builder | ${intl.formatMessage({ id: "battleTavern.title" })}`}
        </title>
        <link rel="canonical" href="https://old-world-builder.com/battletavern" />
      </Helmet>

      <Header headline="Old World Builder" hasMainNavigation hasHomeButton />

      <Main compact>
        <h2 className="page-headline">
          <FormattedMessage id="battleTavern.title" />
        </h2>
        {hasLists ? (
          <>
            <p>
              <b>
                <FormattedMessage
                  id="battleTavern.ready"
                  values={{ count: listCount }}
                />
              </b>
            </p>
            <p>
              <FormattedMessage id="battleTavern.description" />
            </p>
          </>
        ) : (
          <p>
            <FormattedMessage id="battleTavern.empty" />
          </p>
        )}

        {result && (
          <p>
            <b>{result.message}</b>
          </p>
        )}

        <Button
          centered
          size="large"
          spaceTop
          onClick={handleSend}
          disabled={!hasLists || sending}
        >
          {sending
            ? intl.formatMessage({ id: "battleTavern.sending" })
            : intl.formatMessage({ id: "battleTavern.send" })}
        </Button>

        <hr />

        <p>
          <i>
            <FormattedMessage id="battleTavern.footer" />
          </i>
        </p>
      </Main>
    </>
  );
};
