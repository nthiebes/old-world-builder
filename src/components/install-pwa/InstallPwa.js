import React, { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";

import { Dialog } from "../dialog/Dialog";

import "./InstallPwa.css";
import { Button } from "../button";

export const InstallPWA = () => {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState(null);
  const [showPrompt, setShowPrompt] = useState(
    localStorage.getItem("whfb.pwa") !== "true"
  );
  const handleClick = () => {
    if (!promptInstall) {
      return;
    }
    promptInstall.prompt();
  };

  useEffect(() => {
    const handler = (event) => {
      event.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(event);
    };
    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!supportsPWA) {
    return null;
  }

  return (
    <>
      <button className="install-pwa-button" onClick={handleClick}>
        <FormattedMessage id="pwa.button" />
      </button>

      <Dialog
        open={showPrompt}
        onClose={() => {
          setShowPrompt(false);
          localStorage.setItem("whfb.pwa", "true");
        }}
      >
        <p>
          <FormattedMessage id="pwa.prompt" />
        </p>
        <div className="editor__delete-dialog">
          <Button
            type="text"
            onClick={() => setShowPrompt(false)}
            icon="close"
            spaceTop
            color="dark"
          >
            <FormattedMessage id="misc.cancel" />
          </Button>
          <Button
            type="primary"
            submitButton
            onClick={handleClick}
            icon="download"
            spaceTop
          >
            <FormattedMessage id="pwa.button" />
          </Button>
        </div>
      </Dialog>
    </>
  );
};
